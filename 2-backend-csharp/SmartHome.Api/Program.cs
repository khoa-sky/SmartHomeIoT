using SmartHome.Api.Data;
using SmartHome.Api.Hubs;
using SmartHome.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Controllers & SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 2. Đăng ký CORS mở cho cả localhost lẫn IP mạng LAN (để Điện thoại quét QR truy cập được)
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
app.MapGet("/", () => Results.Ok(new
{
    system = "Smart Home & Smart Garden IoT Backend (C# ASP.NET Core 3-Layer)",
    status = "RUNNING",
    endpoints = new[]
    {
        "GET  /api/device/status",
        "POST /api/device/command",
        "GET  /api/analytics/summary",
        "GET  /api/analytics/history",
        "GET  /api/analytics/logs",
        "GET  /api/analytics/export-csv",
        "WS   /hubs/smarthome (SignalR Real-time Hub)"
    }
}));

app.Run();
