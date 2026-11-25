using System.Net;
using System.Net.Sockets;
using SmartHome.Api.Data;
using SmartHome.Api.Hubs;
using SmartHome.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Controllers & SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 2. Đăng ký CORS mở cho cả localhost lẫn IP mạng LAN (để Web & App Mobile React Native truy cập được)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllLan", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 3. Đăng ký Kiến trúc 3 Lớp (Data Access Layer & Business Service Layer)
builder.Services.AddSingleton<SmartHomeRepository>();
builder.Services.AddSingleton<MqttWorkerService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<MqttWorkerService>());

var app = builder.Build();

app.UseCors("AllowAllLan");
app.UseRouting();

app.MapControllers();
app.MapHub<SmartHomeHub>("/hubs/smarthome");

// Tự động tìm địa chỉ IPv4 mạng LAN hiện tại của Laptop để kết nối từ Điện thoại
string lanIp = GetLocalLanIp();

app.MapGet("/", () => Results.Ok(new
{
    system = "Smart Home & Smart Garden IoT Backend (C# ASP.NET Core 3-Layer)",
    status = "RUNNING",
    lanIpAddress = lanIp,
    localUrl = "http://localhost:5000",
    mobileLanUrl = $"http://{lanIp}:5000",
    endpoints = new[]
    {
        "GET  /api/device/status",
        "GET  /api/device/connection",
        "POST /api/device/command",
        "GET  /api/analytics/summary",
        "GET  /api/analytics/history",
        "GET  /api/analytics/logs",
        "GET  /api/analytics/export-csv",
        "WS   /hubs/smarthome (SignalR Real-time Hub)"
    }
}));

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine();
    Console.WriteLine("==================================================================");
    Console.WriteLine("  [SMART HOME & GARDEN IOT - BACKEND C# ASP.NET CORE 3-LAYER]");
    Console.WriteLine($"  - Truy cap tren Laptop:     http://localhost:5000");
    Console.WriteLine($"  - Truy cap tren Dien thoai: http://{lanIp}:5000");
    Console.WriteLine($"  - SignalR Real-time Hub:    http://{lanIp}:5000/hubs/smarthome");
    Console.WriteLine($"  => Nhap IP '{lanIp}' vao o Server IP tren App Mobile React Native");
    Console.WriteLine("==================================================================");
    Console.WriteLine();
});

app.Run();

static string GetLocalLanIp()
{
    try
    {
        using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
        socket.Connect("8.8.8.8", 65530);
        if (socket.LocalEndPoint is IPEndPoint endPoint)
        {
            return endPoint.Address.ToString();
        }
    }
    catch
    {
        // Fallback nếu không có Internet
    }

    try
    {
        foreach (var ip in Dns.GetHostEntry(Dns.GetHostName()).AddressList)
        {
            if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
            {
                return ip.ToString();
            }
        }
    }
    catch { }

    return "127.0.0.1";
}
