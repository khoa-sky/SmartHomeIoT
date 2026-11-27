using System.Text;
using Microsoft.AspNetCore.Mvc;
using SmartHome.Api.Data;
using SmartHome.Api.DTOs;

namespace SmartHome.Api.Controllers;

/// <summary>
/// Lớp 1 (Presentation Layer): API Thống kê Dashboard, Lịch sử biểu đồ, Nhật ký sự kiện & Xuất báo cáo Excel (.CSV).
/// </summary>
[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly SmartHomeRepository _repo;

    public AnalyticsController(SmartHomeRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("summary")]
    public ActionResult<SummaryDto> GetSummary()
    {
        return Ok(_repo.GetSummary());
    }

    [HttpGet("history")]
    public IActionResult GetHistory([FromQuery] int limit = 40)
    {
        return Ok(_repo.GetReadings(limit));
    }

    [HttpGet("logs")]
    public IActionResult GetLogs([FromQuery] string category = "ALL", [FromQuery] int limit = 100, [FromQuery] string? keyword = null)
    {
        return Ok(_repo.GetLogs(category, limit, keyword));
    }

    [HttpDelete("logs")]
    public IActionResult ClearLogs()
    {
        _repo.ClearLogsAndResetCounters();
        return Ok(new
        {
            success = true,
            message = "Đã xóa lịch sử nhật ký và đặt lại bộ đếm sự kiện.",
            logs = _repo.GetLogs("ALL", 50),
            summary = _repo.GetSummary()
        });
    }

    [HttpGet("export-csv")]
    public IActionResult ExportCsv()
    {
        var summary = _repo.GetSummary();
        var logs = _repo.GetLogs("ALL", 500);
        var readings = _repo.GetReadings(500);

        var sb = new StringBuilder();
        sb.AppendLine("BÁO CÁO THỐNG KÊ & NHẬT KÝ HỆ THỐNG SMART HOME - VIETDUINO ESP32");
        sb.AppendLine($"Thời gian xuất báo cáo:,{DateTime.Now:dd/MM/yyyy HH:mm:ss}");
        sb.AppendLine();

        sb.AppendLine("--- 0. TỔNG HỢP CHỈ SỐ VẬN HÀNH (KPI SUMMARY) ---");
        sb.AppendLine("Chỉ Số Thống Kê,Giá Trị,Đơn Vị");
        sb.AppendLine($"Nhiệt độ trung bình,{summary.AvgTemp:F1},°C");
        sb.AppendLine($"Nhiệt độ cao nhất (Max),{summary.MaxTemp:F1},°C");
        sb.AppendLine($"Nhiệt độ thấp nhất (Min),{summary.MinTemp:F1},°C");
        sb.AppendLine($"Độ ẩm không khí trung bình,{summary.AvgHum:F1},%");
        sb.AppendLine($"Độ ẩm đất trung bình,{summary.AvgSoil:F1},%");
        sb.AppendLine($"Tổng số đợt bơm tưới,{summary.TotalPumpRuns},đợt");
        sb.AppendLine($"Lượng nước tưới ước tính,{summary.EstimatedWaterMl},ml");
        sb.AppendLine($"Số lần phát hiện chuyển động (PIR),{summary.TotalPirDetections},lần");
        sb.AppendLine($"Số lần mưa tự thu giàn phơi,{summary.TotalRainEvents},lần");
        sb.AppendLine($"Số lần cảnh báo cháy khẩn cấp,{summary.TotalFireAlerts},lần");
        sb.AppendLine();

        sb.AppendLine("--- 1. NHẬT KÝ SỰ KIỆN HỆ THỐNG ---");
        sb.AppendLine("ID,Thời Gian,Phân Loại,Nguồn Kích Hoạt,Nội Dung Chi Tiết");
        foreach (var l in logs)
        {
            string safeMsg = l.Message.Replace("\"", "\"\"");
            sb.AppendLine($"{l.Id},{l.Timestamp:yyyy-MM-dd HH:mm:ss},{l.Category},{l.Source},\"{safeMsg}\"");
        }

        sb.AppendLine();
        sb.AppendLine("--- 2. LỊCH SỬ ĐO ĐẠC CẢM BIẾN ---");
        sb.AppendLine("ID,Thời Gian,Nhiệt Độ (°C),Độ Ẩm Không Khí (%),Độ Ẩm Đất (%),Chỉ Số Lửa (ADC),Báo Cháy,Trời Mưa,Máy Bơm");
        foreach (var r in readings)
        {
            sb.AppendLine($"{r.Id},{r.Timestamp:yyyy-MM-dd HH:mm:ss},{r.Temp:F1},{r.Hum:F0},{r.Soil},{r.Flame},{(r.FireAlert ? "CÓ LỬA" : "An toàn")},{(r.Rain ? "Có mưa" : "Khô")},{(r.PumpOn ? "ON" : "OFF")}");
        }

        // Thêm UTF-8 BOM để mở trực tiếp trên Microsoft Excel không bị lỗi font tiếng Việt
        byte[] bom = new byte[] { 0xEF, 0xBB, 0xBF };
        byte[] content = Encoding.UTF8.GetBytes(sb.ToString());
        byte[] fullBytes = new byte[bom.Length + content.Length];
        Buffer.BlockCopy(bom, 0, fullBytes, 0, bom.Length);
        Buffer.BlockCopy(content, 0, fullBytes, bom.Length, content.Length);

        return File(fullBytes, "text/csv; charset=utf-8", $"BaoCao_SmartHome_{DateTime.Now:yyyyMMdd_HHmm}.csv");
    }
}
