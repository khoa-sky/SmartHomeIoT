using System.Text.Json.Serialization;

namespace SmartHome.Api.DTOs;

public class TelemetryDto
{
    [JsonPropertyName("temp")]
    public double Temp { get; set; } = 32.0;

    [JsonPropertyName("hum")]
    public double Hum { get; set; } = 65.0;

    [JsonPropertyName("soil")]
    public int Soil { get; set; } = 40;

    [JsonPropertyName("flame")]
    public int Flame { get; set; } = 55;

    [JsonPropertyName("fireAlert")]
    public bool FireAlert { get; set; } = false;

    [JsonPropertyName("pir")]
    public bool Pir { get; set; } = false;

    [JsonPropertyName("pirLocked")]
    public bool PirLocked { get; set; } = false;

    [JsonPropertyName("rain")]
    public bool Rain { get; set; } = false;

    [JsonPropertyName("servoAngle")]
    public int ServoAngle { get; set; } = 15;

    [JsonPropertyName("servoMode")]
    public string ServoMode { get; set; } = "AUTO";

    [JsonPropertyName("lightOn")]
    public bool LightOn { get; set; } = false;

    [JsonPropertyName("redLedOn")]
    public bool RedLedOn { get; set; } = false;

    [JsonPropertyName("pumpOn")]
    public bool PumpOn { get; set; } = false;

    [JsonPropertyName("pumpLocked")]
    public bool PumpLocked { get; set; } = false;

    [JsonPropertyName("pumpCount")]
    public int PumpCount { get; set; } = 0;

    [JsonPropertyName("online")]
    public bool Online { get; set; } = false;

    [JsonPropertyName("lastUpdated")]
    public DateTime LastUpdated { get; set; } = DateTime.Now;
}

public class CommandDto
{
    [JsonPropertyName("cmd")]
    public string Cmd { get; set; } = string.Empty; // LIGHT, PIR_LOCK, SERVO, PUMP, ALARM_TEST

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty; // ON/OFF, LOCK/UNLOCK, AUTO/OUT/IN, START/STOP/UNLOCK
}

public class SummaryDto
{
    public double MaxTemp { get; set; }
    public double MinTemp { get; set; }
    public double AvgTemp { get; set; }
    public double AvgHum { get; set; }
    public double AvgSoil { get; set; }
    public int TotalPumpRuns { get; set; }
    public int EstimatedWaterMl { get; set; }
    public int TotalPirDetections { get; set; }
    public int TotalRainEvents { get; set; }
    public int TotalFireAlerts { get; set; }
}
