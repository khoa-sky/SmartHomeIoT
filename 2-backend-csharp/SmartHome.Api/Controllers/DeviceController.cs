using Microsoft.AspNetCore.Mvc;
using SmartHome.Api.Data;
using SmartHome.Api.DTOs;
using SmartHome.Api.Services;

namespace SmartHome.Api.Controllers;

/// <summary>
/// Lớp 1 (Presentation Layer): API Điều khiển thiết bị, kiểm tra kết nối MQTT & lấy trạng thái thời gian thực.
/// </summary>
[ApiController]
[Route("api/device")]
public class DeviceController : ControllerBase
{
    private readonly SmartHomeRepository _repo;
    private readonly MqttWorkerService _mqtt;

    private static readonly Dictionary<string, HashSet<string>> ValidCommands = new(StringComparer.OrdinalIgnoreCase)
    {
        ["LIGHT"] = new(StringComparer.OrdinalIgnoreCase) { "ON", "OFF", "TOGGLE" },
        ["PIR_LOCK"] = new(StringComparer.OrdinalIgnoreCase) { "LOCK", "UNLOCK", "TOGGLE" },
        ["SERVO"] = new(StringComparer.OrdinalIgnoreCase) { "AUTO", "OUT", "IN" },
        ["PUMP"] = new(StringComparer.OrdinalIgnoreCase) { "START", "STOP", "UNLOCK" },
        ["ALARM_TEST"] = new(StringComparer.OrdinalIgnoreCase) { "ON", "OFF" }
    };

    public DeviceController(SmartHomeRepository repo, MqttWorkerService mqtt)
    {
        _repo = repo;
        _mqtt = mqtt;
    }

    [HttpGet("status")]
    public ActionResult<TelemetryDto> GetStatus()
    {
        return Ok(_repo.LatestTelemetry);
    }

    [HttpGet("connection")]
    public IActionResult GetConnectionInfo()
    {
        return Ok(new
        {
            brokerConnected = _mqtt.IsBrokerConnected,
            brokerHost = _mqtt.BrokerHost,
            brokerPort = _mqtt.BrokerPort,
            telemetryTopic = _mqtt.TelemetryTopic,
            commandTopic = _mqtt.CommandTopic,
            esp32Online = _repo.LatestTelemetry.Online,
            lastPacketReceived = _mqtt.LastPacketReceived == DateTime.MinValue
                ? (DateTime?)null
                : _mqtt.LastPacketReceived
        });
    }

    [HttpPost("command")]
    public async Task<IActionResult> SendCommand([FromBody] CommandDto command)
    {
        if (command == null || string.IsNullOrWhiteSpace(command.Cmd))
        {
            return BadRequest(new
            {
                success = false,
                error = "Thiếu tên lệnh điều khiển (cmd).",
                supportedCommands = ValidCommands.Keys
            });
        }

        string normalizedCmd = command.Cmd.Trim().ToUpperInvariant();
        string normalizedVal = (command.Value ?? string.Empty).Trim().ToUpperInvariant();

        if (!ValidCommands.TryGetValue(normalizedCmd, out var allowedValues))
        {
            return BadRequest(new
            {
                success = false,
                error = $"Lệnh '{command.Cmd}' không hợp lệ.",
                supportedCommands = ValidCommands.Keys
            });
        }

        if (!allowedValues.Contains(normalizedVal))
        {
            return BadRequest(new
            {
                success = false,
                error = $"Giá trị '{command.Value}' không hợp lệ cho lệnh '{normalizedCmd}'.",
                allowedValues
            });
        }

        var cleanCommand = new CommandDto
        {
            Cmd = normalizedCmd,
            Value = normalizedVal
        };

        bool sentToBroker = await _mqtt.PublishCommandAsync(cleanCommand);
        return Ok(new
        {
            success = true,
            brokerDelivered = sentToBroker,
            command = cleanCommand,
            latestState = _repo.LatestTelemetry
        });
    }
}
