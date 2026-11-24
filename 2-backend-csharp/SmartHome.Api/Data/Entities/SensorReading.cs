namespace SmartHome.Api.Data.Entities;

public class SensorReading
{
    public long Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public double Temp { get; set; }
    public double Hum { get; set; }
    public int Soil { get; set; }
    public int Flame { get; set; }
    public bool FireAlert { get; set; }
    public bool Rain { get; set; }
    public bool PumpOn { get; set; }
}
