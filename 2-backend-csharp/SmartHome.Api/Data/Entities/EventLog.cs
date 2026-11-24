namespace SmartHome.Api.Data.Entities;

public class EventLog
{
    public long Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public string Category { get; set; } = "SYSTEM"; // PIR, GIAN_PHOI, TUOI_CAY, BAO_CHAY, DIEU_KHIEN
    public string Source { get; set; } = "ESP32";    // ESP32, WEB_MOBILE, NUT_VAT_LY
    public string Message { get; set; } = string.Empty;
}
