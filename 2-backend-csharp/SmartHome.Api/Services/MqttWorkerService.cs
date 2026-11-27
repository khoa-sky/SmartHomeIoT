using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using SmartHome.Api.Data;
using SmartHome.Api.DTOs;
using SmartHome.Api.Hubs;

namespace SmartHome.Api.Services;

/// <summary>
/// Lớp 2 (Business / Service Layer): Dịch vụ chạy ngầm kết nối MQTT Broker (chuẩn MQTT 3.1.1),
/// nhận gói tin JSON từ Vietduino ESP32 / MQTTX, đẩy SignalR thời gian thực lên React và lưu lịch sử.
/// </summary>
public class MqttWorkerService : BackgroundService
{
    private readonly ILogger<MqttWorkerService> _logger;
    private readonly IConfiguration _config;
    private readonly SmartHomeRepository _repo;
    private readonly IHubContext<SmartHomeHub> _hub;

    private TcpClient? _tcpClient;
    private NetworkStream? _stream;
    private readonly SemaphoreSlim _writeLock = new(1, 1);

    private TelemetryDto? _prevState;
    private DateTime _lastDbSample = DateTime.MinValue;
    private DateTime _lastPacketReceived = DateTime.MinValue;

    public bool IsBrokerConnected => _tcpClient?.Connected == true;
    public DateTime LastPacketReceived => _lastPacketReceived;
    public string BrokerHost => _config["MqttSettings:Host"] ?? "broker.emqx.io";
    public int BrokerPort => int.TryParse(_config["MqttSettings:Port"], out var p) ? p : 1883;
    public string TelemetryTopic => _config["MqttSettings:TelemetryTopic"] ?? "smarthome/khoa2026/telemetry";
    public string CommandTopic => _config["MqttSettings:CommandTopic"] ?? "smarthome/khoa2026/command";

    public MqttWorkerService(
        ILogger<MqttWorkerService> logger,
        IConfiguration config,
        SmartHomeRepository repo,
        IHubContext<SmartHomeHub> hub)
    {
        _logger = logger;
        _config = config;
        _repo = repo;
        _hub = hub;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var host = _config["MqttSettings:Host"] ?? "broker.emqx.io";
        var port = int.TryParse(_config["MqttSettings:Port"], out var p) ? p : 1883;
        var telemetryTopic = _config["MqttSettings:TelemetryTopic"] ?? "smarthome/khoa2026/telemetry";

        _logger.LogInformation("[MQTT Service] Khoi dong ket noi toi {Host}:{Port} | Topic: {Topic}", host, port, telemetryTopic);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (_tcpClient == null || !_tcpClient.Connected)
                {
                    await ConnectMqttAsync(host, port, telemetryTopic, stoppingToken);
                }

                if (_stream != null && _tcpClient?.Connected == true)
                {
                    await ReadMqttLoopAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[MQTT Service] Mat ket noi MQTT ({Message}). Thu ket noi lai sau 4 giay...", ex.Message);
                CleanupConnection();
            }

            await Task.Delay(4000, stoppingToken);
        }
    }

    private async Task ConnectMqttAsync(string host, int port, string subscribeTopic, CancellationToken ct)
    {
        CleanupConnection();
        _tcpClient = new TcpClient();
        await _tcpClient.ConnectAsync(host, port, ct);
        _stream = _tcpClient.GetStream();

        string clientId = $"SmartHomeCSharp-{Guid.NewGuid().ToString("N")[..8]}";
        byte[] idBytes = Encoding.UTF8.GetBytes(clientId);
        int remLen = 10 + 2 + idBytes.Length;

        using var ms = new MemoryStream();
        ms.WriteByte(0x10); // CONNECT
        WriteVariableLength(ms, remLen);
        ms.Write(new byte[] { 0x00, 0x04, (byte)'M', (byte)'Q', (byte)'T', (byte)'T', 0x04, 0x02, 0x00, 30 });
        ms.WriteByte((byte)((idBytes.Length >> 8) & 0xFF));
        ms.WriteByte((byte)(idBytes.Length & 0xFF));
        ms.Write(idBytes);

        await _stream.WriteAsync(ms.ToArray(), ct);
        await _stream.FlushAsync(ct);

        byte[] connAck = new byte[4];
        int read = await _stream.ReadAsync(connAck.AsMemory(0, 4), ct);
        if (read < 4 || connAck[0] != 0x20 || connAck[3] != 0x00)
            throw new Exception("MQTT CONNACK failed");

        // SUBSCRIBE vao kenh telemetry
        byte[] topicBytes = Encoding.UTF8.GetBytes(subscribeTopic);
        using var subMs = new MemoryStream();
        subMs.WriteByte(0x82); // SUBSCRIBE
        WriteVariableLength(subMs, 2 + 2 + topicBytes.Length + 1);
        subMs.Write(new byte[] { 0x00, 0x01 });
        subMs.WriteByte((byte)((topicBytes.Length >> 8) & 0xFF));
        subMs.WriteByte((byte)(topicBytes.Length & 0xFF));
        subMs.Write(topicBytes);
        subMs.WriteByte(0x00); // QoS 0

        await _stream.WriteAsync(subMs.ToArray(), ct);
        await _stream.FlushAsync(ct);

        _logger.LogInformation("[MQTT OK] Da ket noi MQTT Broker ({Host}:{Port}) va Subscribe: {Topic}", host, port, subscribeTopic);
    }

    private async Task ReadMqttLoopAsync(CancellationToken ct)
    {
        var lastPing = DateTime.UtcNow;

        while (!ct.IsCancellationRequested && _tcpClient?.Connected == true && _stream != null)
        {
            if (_tcpClient.Available > 0)
            {
                int type = _stream.ReadByte();
                if (type < 0) break;

                int mult = 1, remLen = 0;
                int enc;
                do
                {
                    enc = _stream.ReadByte();
                    if (enc < 0) return;
                    remLen += (enc & 127) * mult;
                    mult *= 128;
                } while ((enc & 128) != 0);

                byte[] payloadBuf = new byte[remLen];
                int totalRead = 0;
                while (totalRead < remLen)
                {
                    int r = await _stream.ReadAsync(payloadBuf.AsMemory(totalRead, remLen - totalRead), ct);
                    if (r <= 0) break;
                    totalRead += r;
                }

                // Kiem tra goi PUBLISH (0x30..0x3F)
                if ((type & 0xF0) == 0x30 && totalRead >= 2)
                {
                    int topicLen = (payloadBuf[0] << 8) | payloadBuf[1];
                    int offset = 2 + topicLen;
                    int qos = (type >> 1) & 0x03;
                    if (qos > 0) offset += 2;

                    if (offset < totalRead)
                    {
                        string json = Encoding.UTF8.GetString(payloadBuf, offset, totalRead - offset);
                        await ProcessIncomingTelemetryAsync(json);
                    }
                }
            }
            else
            {
                // Kiem tra trang thai Online cua ESP32 (neu qua 6s khong co goi tin -> Offline)
                if (_repo.LatestTelemetry.Online && (DateTime.Now - _lastPacketReceived).TotalSeconds > 6)
                {
                    _repo.LatestTelemetry.Online = false;
                    await _hub.Clients.All.SendAsync("ReceiveTelemetry", _repo.LatestTelemetry, ct);
                }

                // Gui MQTT PINGREQ moi 20s giu ket noi
                if ((DateTime.UtcNow - lastPing).TotalSeconds >= 20)
                {
                    lastPing = DateTime.UtcNow;
                    await _writeLock.WaitAsync(ct);
                    try
                    {
                        await _stream.WriteAsync(new byte[] { 0xC0, 0x00 }, ct);
                    }
                    finally
                    {
                        _writeLock.Release();
                    }
                }

                await Task.Delay(40, ct);
            }
        }
    }

    public async Task ProcessIncomingTelemetryAsync(string json)
    {
        try
        {
            var data = JsonSerializer.Deserialize<TelemetryDto>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (data == null) return;

            _lastPacketReceived = DateTime.Now;
            data.Online = true;
            data.LastUpdated = DateTime.Now;

            bool valueChanged = _prevState == null
                || Math.Abs(_prevState.Temp - data.Temp) >= 0.1
                || Math.Abs(_prevState.Hum - data.Hum) >= 1.0
                || _prevState.Soil != data.Soil
                || _prevState.Flame != data.Flame
                || _prevState.FireAlert != data.FireAlert
                || _prevState.Rain != data.Rain
                || _prevState.PumpOn != data.PumpOn;

            await DetectAndLogEventsAsync(_prevState, data);
            _prevState = data;
            _repo.LatestTelemetry = data;

            // Luu mau bieu do ngay khi thong so thay doi hoac dinh ky moi 5 giay
            if (valueChanged || (DateTime.Now - _lastDbSample).TotalSeconds >= 5)
            {
                _lastDbSample = DateTime.Now;
                _repo.AddReading(data);
            }

            // Day ngay lap tuc len React Web & Mobile qua SignalR
            await _hub.Clients.All.SendAsync("ReceiveTelemetry", data);
            await _hub.Clients.All.SendAsync("ReceiveSummary", _repo.GetSummary());
        }
        catch (Exception ex)
        {
            _logger.LogDebug("Loi parse JSON telemetry: {Message}", ex.Message);
        }
    }

    private async Task DetectAndLogEventsAsync(TelemetryDto? prev, TelemetryDto curr)
    {
        if (prev == null) return;

        // 1. Phat hien Bao chay
        if (!prev.FireAlert && curr.FireAlert)
        {
            _repo.TotalFireAlerts++;
            var log = _repo.AddLog("BAO_CHAY", "CAM_BIEN_LUA", $"KHẨN CẤP: Phát hiện LỬA (Chỉ số ADC: {curr.Flame} < 15) -> Kích hoạt Còi & 2 Đèn Đỏ!");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }
        else if (prev.FireAlert && !curr.FireAlert)
        {
            var log = _repo.AddLog("BAO_CHAY", "CAM_BIEN_LUA", "Đám cháy đã được dập tắt -> Hệ thống trở lại trạng thái an toàn.");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }

        // 2. Phat hien chuyen dong PIR
        if (!prev.Pir && curr.Pir)
        {
            _repo.TotalPirDetections++;
            string action = curr.PirLocked ? "(Đang khóa PIR - Đèn không tự bật)" : "-> Tự động bật sáng Đèn Trắng";
            var log = _repo.AddLog("PIR", "CAM_BIEN_PIR", $"Phát hiện chuyển động của người (PIR: CO) {action}");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }

        // 3. Khoa / Mo PIR
        if (prev.PirLocked != curr.PirLocked)
        {
            var msg = curr.PirLocked
                ? "Đã KHÓA cảm biến chuyển động PIR (Chế độ Đi ngủ - Còi kêu Bíp dài)."
                : "Đã MỞ LẠI cảm biến chuyển động PIR tự động (Còi kêu 2 tiếng Bíp-Bíp).";
            var log = _repo.AddLog("PIR", "HE_THONG", msg);
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }

        // 4. Bat / Tat Den Trang
        if (prev.LightOn != curr.LightOn)
        {
            var msg = curr.LightOn ? "Đèn Trắng phòng khách (IO32) đã BẬT SÁNG." : "Đèn Trắng phòng khách (IO32) đã TẮT.";
            var log = _repo.AddLog("DEN", "HE_THONG", msg);
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }

        // 5. Cam bien Mua & Gian phoi Servo
        if (!prev.Rain && curr.Rain)
        {
            _repo.TotalRainEvents++;
            var log = _repo.AddLog("GIAN_PHOI", "CAM_BIEN_MUA", $"Phát hiện TRỜI MƯA -> Động cơ Servo thu giàn phơi vào mái hiên ({curr.ServoAngle}°).");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }
        else if (prev.Rain && !curr.Rain)
        {
            var log = _repo.AddLog("GIAN_PHOI", "CAM_BIEN_MUA", $"Trời đã TẠNH MƯA (khô ráo sau 2s) -> Động cơ Servo đưa giàn phơi ra ({curr.ServoAngle}°).");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }
        else if (prev.ServoAngle != curr.ServoAngle || !string.Equals(prev.ServoMode, curr.ServoMode, StringComparison.OrdinalIgnoreCase))
        {
            string trangThaiPhoi = curr.ServoAngle > 90 ? "THU ĐỒ VÀO MÁI HIÊN" : "ĐƯA ĐỒ RA PHƠI";
            var log = _repo.AddLog("GIAN_PHOI", "SERVO_SG90", $"Giàn phơi chuyển sang chế độ [{curr.ServoMode}] -> {trangThaiPhoi} (Góc Servo: {curr.ServoAngle}°).");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }

        // 6. May bom tuoi cay
        if (!prev.PumpOn && curr.PumpOn)
        {
            _repo.TotalPumpRuns++;
            var log = _repo.AddLog("TUOI_CAY", "MAY_BOM", $"Đất khô ({curr.Soil}%) -> Bật Máy bơm tưới cây (Đợt {curr.PumpCount}/5 - 2.5 giây) + Chớp 2 Đèn Đỏ.");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }
        if (!prev.PumpLocked && curr.PumpLocked)
        {
            var log = _repo.AddLog("TUOI_CAY", "BAO_VE_BOM", "CẢNH BÁO: Đã tưới 5 lần liên tiếp nhưng đất chưa ẩm -> TỰ ĐỘNG KHÓA BƠM chống cháy bơm!");
            await _hub.Clients.All.SendAsync("NewEventLog", log);
        }
    }

    public async Task<bool> PublishCommandAsync(CommandDto command)
    {
        var commandTopic = _config["MqttSettings:CommandTopic"] ?? "smarthome/khoa2026/command";
        string jsonPayload = JsonSerializer.Serialize(command);

        // Ghi nhat ky dieu khien tu xa
        var log = _repo.AddLog("DIEU_KHIEN", "WEB_MOBILE", $"Gửi lệnh điều khiển từ xa: [{command.Cmd} = {command.Value}]");
        await _hub.Clients.All.SendAsync("NewEventLog", log);

        // Cap nhat trang thai tam thoi ngay tren Server de UI phan hoi tuc thi (ke ca khi test khong cam mach)
        ApplyOptimisticStateUpdate(command);
        await _hub.Clients.All.SendAsync("ReceiveTelemetry", _repo.LatestTelemetry);

        if (_stream == null || _tcpClient?.Connected != true)
            return false;

        await _writeLock.WaitAsync();
        try
        {
            byte[] topicBytes = Encoding.UTF8.GetBytes(commandTopic);
            byte[] payloadBytes = Encoding.UTF8.GetBytes(jsonPayload);
            int remLen = 2 + topicBytes.Length + payloadBytes.Length;

            using var ms = new MemoryStream();
            ms.WriteByte(0x30); // PUBLISH QoS 0
            WriteVariableLength(ms, remLen);
            ms.WriteByte((byte)((topicBytes.Length >> 8) & 0xFF));
            ms.WriteByte((byte)(topicBytes.Length & 0xFF));
            ms.Write(topicBytes);
            ms.Write(payloadBytes);

            await _stream.WriteAsync(ms.ToArray());
            await _stream.FlushAsync();
            return true;
        }
        catch
        {
            return false;
        }
        finally
        {
            _writeLock.Release();
        }
    }

    private void ApplyOptimisticStateUpdate(CommandDto cmd)
    {
        var s = _repo.LatestTelemetry;
        switch (cmd.Cmd.ToUpperInvariant())
        {
            case "LIGHT":
                s.LightOn = cmd.Value.Equals("ON", StringComparison.OrdinalIgnoreCase)
                            || (cmd.Value.Equals("TOGGLE", StringComparison.OrdinalIgnoreCase) && !s.LightOn);
                break;
            case "PIR_LOCK":
                s.PirLocked = cmd.Value.Equals("LOCK", StringComparison.OrdinalIgnoreCase)
                              || (cmd.Value.Equals("TOGGLE", StringComparison.OrdinalIgnoreCase) && !s.PirLocked);
                if (s.PirLocked) s.LightOn = false;
                break;
            case "SERVO":
                s.ServoMode = cmd.Value.ToUpperInvariant();
                if (s.ServoMode == "OUT") s.ServoAngle = 15;
                else if (s.ServoMode == "IN") s.ServoAngle = 165;
                else s.ServoAngle = s.Rain ? 165 : 15;
                break;
            case "PUMP":
                if (cmd.Value.Equals("START", StringComparison.OrdinalIgnoreCase))
                {
                    s.PumpLocked = false;
                    s.PumpOn = true;
                    s.RedLedOn = true;
                }
                else if (cmd.Value.Equals("STOP", StringComparison.OrdinalIgnoreCase))
                {
                    s.PumpOn = false;
                    s.RedLedOn = false;
                }
                else if (cmd.Value.Equals("UNLOCK", StringComparison.OrdinalIgnoreCase))
                {
                    s.PumpLocked = false;
                    s.PumpCount = 0;
                }
                break;
            case "ALARM_TEST":
                s.RedLedOn = cmd.Value.Equals("ON", StringComparison.OrdinalIgnoreCase);
                break;
        }
    }

    private static void WriteVariableLength(Stream s, int len)
    {
        do
        {
            byte d = (byte)(len % 128);
            len /= 128;
            if (len > 0) d |= 0x80;
            s.WriteByte(d);
        } while (len > 0);
    }

    private void CleanupConnection()
    {
        try { _stream?.Dispose(); } catch { }
        try { _tcpClient?.Dispose(); } catch { }
        _stream = null;
        _tcpClient = null;
    }
}
