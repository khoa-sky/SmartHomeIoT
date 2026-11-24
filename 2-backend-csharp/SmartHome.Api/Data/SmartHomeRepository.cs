using System.Text.Json;
using SmartHome.Api.Data.Entities;
using SmartHome.Api.DTOs;

namespace SmartHome.Api.Data;

/// <summary>
/// Lớp 3 (Data Access Layer): Quản lý lưu trữ dữ liệu lịch sử cảm biến và nhật ký sự kiện.
/// Tự động lưu bền vững xuống file JSON/Database cục bộ (không cần cài đặt SQL Server rời).
/// </summary>
public class SmartHomeRepository
{
    private readonly string _dbFilePath;
    private readonly object _lock = new();

    private List<SensorReading> _readings = new();
    private List<EventLog> _logs = new();
    public TelemetryDto LatestTelemetry { get; set; } = new();

    public int TotalPumpRuns { get; set; } = 0;
    public int TotalPirDetections { get; set; } = 0;
    public int TotalRainEvents { get; set; } = 0;
    public int TotalFireAlerts { get; set; } = 0;

    public SmartHomeRepository(IWebHostEnvironment env)
    {
        var dataDir = Path.Combine(env.ContentRootPath, "App_Data");
        Directory.CreateDirectory(dataDir);
        _dbFilePath = Path.Combine(dataDir, "smarthome_store.json");
        LoadFromDisk();
    }

    public void AddReading(TelemetryDto dto)
    {
        lock (_lock)
        {
            var item = new SensorReading
            {
                Id = _readings.Count > 0 ? _readings[^1].Id + 1 : 1,
                Timestamp = DateTime.Now,
                Temp = dto.Temp,
                Hum = dto.Hum,
                Soil = dto.Soil,
                Flame = dto.Flame,
                FireAlert = dto.FireAlert,
                Rain = dto.Rain,
                PumpOn = dto.PumpOn
            };
            _readings.Add(item);
            if (_readings.Count > 500)
                _readings.RemoveAt(0);
            SaveToDisk();
        }
    }

    public EventLog AddLog(string category, string source, string message)
    {
        lock (_lock)
        {
            var log = new EventLog
            {
                Id = _logs.Count > 0 ? _logs[^1].Id + 1 : 1,
                Timestamp = DateTime.Now,
                Category = category,
                Source = source,
                Message = message
            };
            _logs.Insert(0, log); // Mới nhất lên đầu
            if (_logs.Count > 500)
                _logs.RemoveAt(_logs.Count - 1);
            SaveToDisk();
            return log;
        }
    }

    public List<SensorReading> GetReadings(int limit = 40)
    {
        lock (_lock)
        {
            return _readings.TakeLast(limit).ToList();
        }
    }

    public List<EventLog> GetLogs(string category = "ALL", int limit = 100)
    {
        lock (_lock)
        {
            var query = _logs.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(category) && category != "ALL")
                query = query.Where(x => x.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            return query.Take(limit).ToList();
        }
    }

    public SummaryDto GetSummary()
    {
        lock (_lock)
        {
            if (_readings.Count == 0)
            {
                return new SummaryDto
                {
                    MaxTemp = LatestTelemetry.Temp,
                    MinTemp = LatestTelemetry.Temp,
                    AvgTemp = LatestTelemetry.Temp,
                    AvgHum = LatestTelemetry.Hum,
                    AvgSoil = LatestTelemetry.Soil
                };
            }

            return new SummaryDto
            {
                MaxTemp = Math.Round(_readings.Max(x => x.Temp), 1),
                MinTemp = Math.Round(_readings.Min(x => x.Temp), 1),
                AvgTemp = Math.Round(_readings.Average(x => x.Temp), 1),
                AvgHum = Math.Round(_readings.Average(x => x.Hum), 1),
                AvgSoil = Math.Round(_readings.Average(x => x.Soil), 1),
                TotalPumpRuns = TotalPumpRuns,
                EstimatedWaterMl = TotalPumpRuns * 65, // ~65ml mỗi đợt bơm 2.5s
                TotalPirDetections = TotalPirDetections,
                TotalRainEvents = TotalRainEvents,
                TotalFireAlerts = TotalFireAlerts
            };
        }
    }

    private class DiskModel
    {
        public List<SensorReading> Readings { get; set; } = new();
        public List<EventLog> Logs { get; set; } = new();
        public int TotalPumpRuns { get; set; }
        public int TotalPirDetections { get; set; }
        public int TotalRainEvents { get; set; }
        public int TotalFireAlerts { get; set; }
    }

    private void LoadFromDisk()
    {
        try
        {
            if (!File.Exists(_dbFilePath))
            {
                SeedInitialData();
                return;
            }
            var json = File.ReadAllText(_dbFilePath);
            var data = JsonSerializer.Deserialize<DiskModel>(json);
            if (data != null)
            {
                _readings = data.Readings ?? new();
                _logs = data.Logs ?? new();
                TotalPumpRuns = data.TotalPumpRuns;
                TotalPirDetections = data.TotalPirDetections;
                TotalRainEvents = data.TotalRainEvents;
                TotalFireAlerts = data.TotalFireAlerts;
            }
        }
        catch
        {
            SeedInitialData();
        }
    }

    private void SeedInitialData()
    {
        var now = DateTime.Now;
        for (int i = 10; i >= 1; i--)
        {
            _readings.Add(new SensorReading
            {
                Id = 11 - i,
                Timestamp = now.AddMinutes(-i),
                Temp = 31.8 + (i % 3) * 0.3,
                Hum = 66 + (i % 4),
                Soil = 38 + (i % 5),
                Flame = 52
            });
        }
        _logs.Add(new EventLog
        {
            Id = 1,
            Timestamp = now,
            Category = "HE_THONG",
            Source = "SERVER_C#",
            Message = "Khởi động hệ thống Backend C# (.NET) & sẵn sàng kết nối MQTT Vietduino ESP32."
        });
    }

    private void SaveToDisk()
    {
        try
        {
            var model = new DiskModel
            {
                Readings = _readings,
                Logs = _logs,
                TotalPumpRuns = TotalPumpRuns,
                TotalPirDetections = TotalPirDetections,
                TotalRainEvents = TotalRainEvents,
                TotalFireAlerts = TotalFireAlerts
            };
            File.WriteAllText(_dbFilePath, JsonSerializer.Serialize(model));
        }
        catch { }
    }
}
