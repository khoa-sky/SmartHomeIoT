using Microsoft.AspNetCore.Mvc;
using SmartHome.Api.Data;
using SmartHome.Api.DTOs;
using SmartHome.Api.Services;

namespace SmartHome.Api.Controllers;

/// <summary>
/// Lớp 1 (Presentation Layer): API Điều khiển thiết bị & lấy trạng thái thời gian thực.
/// </summary>
[ApiController]
[Route("api/device")]
public class DeviceController : ControllerBase
{
    private readonly SmartHomeRepository _repo;
    private readonly MqttWorkerService _mqtt;

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

    [HttpPost("command")]
    public async Task<IActionResult> SendCommand([FromBody] CommandDto command)
    {
        if (string.IsNullOrWhiteSpace(command.Cmd))
            return BadRequest(new { error = "Thiếu tên lệnh điều khiển (cmd)." });

        bool sentToBroker = await _mqtt.PublishCommandAsync(command);
        return Ok(new
        {
            success = true,
            brokerDelivered = sentToBroker,
            command,
            latestState = _repo.LatestTelemetry
        });
    }
}
