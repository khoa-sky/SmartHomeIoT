# 🏠 HỆ THỐNG NGÔI NHÀ & KHU VƯỜN THÔNG MINH (SMART HOME & SMART GARDEN IOT)

Dự án IoT toàn diện điều khiển và giám sát thời gian thực hệ thống **13 thiết bị phần cứng trên bo mạch Vietduino ESP32 N16**, kết nối đồng bộ 2 chiều qua **MQTT + SignalR** với **Backend C# ASP.NET Core (Kiến trúc 3 Lớp)** và **Giao diện Web / Mobile React + Tailwind CSS**.

---

## 📂 Cấu trúc Mã nguồn Dự án (`Monorepo`)

```text
C:\SmartHomeIoT\
├── docs/                                  # Tài liệu thiết kế chung cho cả nhóm
│   ├── SYSTEM_SPECIFICATION.md            # Đặc tả chi tiết chức năng & luồng dữ liệu
│   ├── HARDWARE_PINOUT.md                 # Bảng sơ đồ cắm dây 14 mục trên Breadboard & ESP32
│   └── MQTT_API_CONTRACT.md               # Chuẩn gói tin JSON MQTT, SignalR & REST API
│
├── 1-firmware-esp32/                      # [Mảng 1] Code C++ cho mạch Vietduino ESP32
│   ├── SmartHome_ESP32_Offline/           # Bản chạy độc lập 100% (không cần Wi-Fi)
│   └── SmartHome_ESP32_WiFi_MQTT/         # Bản tích hợp Wi-Fi + MQTT đồng bộ 2 chiều
│
├── 2-backend-csharp/                      # [Mảng 2] Backend C# ASP.NET Core (3-Layer Architecture)
│   ├── SmartHome.Api.sln                  # File Solution mở bằng Visual Studio 2022 (Tím) hoặc VS Code
│   └── SmartHome.Api/
│       ├── Controllers/                   # Lớp 1 (Presentation): REST API Điều khiển & Thống kê
│       ├── Hubs/                          # Lớp 1 (Presentation): SignalR Hub thời gian thực
│       ├── Services/                      # Lớp 2 (Business): MqttWorkerService & AnalyticsService
│       ├── DTOs/                          # Lớp 2 (Business): TelemetryDto, CommandDto, SummaryDto
│       └── Data/                          # Lớp 3 (Data Access): AppDbContext & SQLite Entities
│
└── 3-frontend-react/                      # [Mảng 3] Giao diện Web/Mobile (React + Vite + Tailwind CSS)
    ├── package.json
    └── src/
        ├── components/                    # Các khối giao diện Điều khiển & Biểu đồ Thống kê
        ├── services/                      # Kết nối SignalR & gọi REST API C#
        └── App.jsx
```

---

## 🚀 Hướng dẫn Chạy Nhanh Cho Các Thành Viên Trong Nhóm

### 1. Chạy Backend C# (`2-backend-csharp`)
* **Cách 1 (Dùng Visual Studio 2022 màu tím):**
  * Mở file `C:\SmartHomeIoT\2-backend-csharp\SmartHome.Api.sln` và bấm nút **Run (`F5` / `Ctrl + F5`)**.
* **Cách 2 (Dùng Terminal / VS Code màu xanh):**
  ```powershell
  cd C:\SmartHomeIoT\2-backend-csharp\SmartHome.Api
  dotnet run
  ```
* Server C# sẽ chạy tại: `http://localhost:5000` (Trang kiểm thử Swagger UI: `http://localhost:5000/swagger`).

### 2. Chạy Giao diện Frontend React (`3-frontend-react`)
```powershell
cd C:\SmartHomeIoT\3-frontend-react
npm install
npm run dev
```
* Mở trình duyệt tại: `http://localhost:5173` (Hoặc quét mã QR trên góc màn hình để mở trên Điện thoại).

### 3. Nạp Code Mạch Phần Cứng (`1-firmware-esp32`)
* Mở file `1-firmware-esp32/SmartHome_ESP32_WiFi_MQTT/SmartHome_ESP32_WiFi_MQTT.ino` bằng **Arduino IDE**.
* Sửa `WIFI_SSID` và `WIFI_PASSWORD` theo tên Wi-Fi (2.4GHz) của bạn.
* Trong Arduino IDE, cài thư viện **`PubSubClient`** (by Nick O'Leary) và **`ArduinoJson`** (by Benoit Blanchon) nếu chưa có, chọn cổng `COM7` (Board: `ESP32 Dev Module`) và bấm **Upload**.

### 4. Kiểm thử Gói tin bằng Phần mềm `MQTTX` (Không cần mạch thật vẫn test được Web & C#)
* Mở **MQTTX** $\rightarrow$ Kết nối tới Broker đang cấu hình trong `appsettings.json` (mặc định `broker.emqx.io`, Port `1883`).
* **Subscribe** vào Topic: `smarthome/khoa2026/#` để xem trực tiếp gói tin từ mạch ESP32 và lệnh từ Web.
* **Publish** vào Topic: `smarthome/khoa2026/telemetry` gói tin JSON mẫu trong `docs/MQTT_API_CONTRACT.md` để giả lập mạch ESP32 gửi dữ liệu lên C# và React!

---

## 🌿 Quy ước Làm việc Nhóm với Git
* Nhánh `main`: Bản ổn định dùng để demo/báo cáo.
* Nhánh `develop`: Nhánh tích hợp chung của nhóm.
* Mỗi thành viên tạo nhánh riêng theo mảng của mình:
  * `git checkout -b feat/esp32-firmware` (chỉ sửa trong `1-firmware-esp32/`)
  * `git checkout -b feat/backend-csharp` (chỉ sửa trong `2-backend-csharp/`)
  * `git checkout -b feat/frontend-react` (chỉ sửa trong `3-frontend-react/`)
