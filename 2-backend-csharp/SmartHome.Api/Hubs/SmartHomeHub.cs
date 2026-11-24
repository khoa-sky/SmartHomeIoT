using Microsoft.AspNetCore.SignalR;

namespace SmartHome.Api.Hubs;

/// <summary>
/// Lớp 1 (Presentation Layer): SignalR Hub kết nối thời gian thực 2 chiều với giao diện React (Web & Mobile).
/// </summary>
public class SmartHomeHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }
}
