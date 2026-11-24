# 🏠 HỆ THỐNG NGÔI NHÀ & KHU VƯỜN THÔNG MINH (SMART HOME & SMART GARDEN IOT)

Dự án IoT toàn diện điều khiển và giám sát thời gian thực hệ thống **13 thiết bị phần cứng trên bo mạch Vietduino ESP32 N16**, kết nối đồng bộ 2 chiều qua **MQTT + SignalR** với **Backend C# ASP.NET Core (Kiến trúc 3 Lớp)**, **Giao diện Web React + Tailwind CSS** và **Ứng dụng Di động Mobile React Native (Expo)**.

---

## 📂 Cấu trúc Mã nguồn Dự án (`Monorepo` — 4 Phân hệ cho 4 Thành viên)

```text
C:\SmartHomeIoT\
├── docs/                                  # Tài liệu thiết kế, tiến độ & quy tắc Git cho cả nhóm
│   ├── TEAM_WORKFLOW_AND_GIT_RULES.md     # Quy tắc phân công 4 thành viên, phạm vi sửa file & lệnh Git
│   ├── PROJECT_PROGRESS_AND_REQUIREMENTS.md # Báo cáo tiến độ & Đặc tả yêu cầu chức năng (FR)
│   ├── SYSTEM_SPECIFICATION.md            # Đặc tả chi tiết chức năng & luồng dữ liệu
│   ├── HARDWARE_PINOUT.md                 # Bảng sơ đồ cắm dây 14 mục trên Breadboard & ESP32
│   └── MQTT_API_CONTRACT.md               # Chuẩn gói tin JSON MQTT, SignalR & REST API
│
├── 1-firmware-esp32/                      # [Mảng 1 - TV2] Code C++ cho mạch Vietduino ESP32
│   ├── SmartHome_ESP32_Offline/           # Bản chạy độc lập 100% (không cần Wi-Fi)
│   └── SmartHome_ESP32_WiFi_MQTT/         # Bản tích hợp Wi-Fi + MQTT đồng bộ 2 chiều
│
├── 2-backend-csharp/                      # [Mảng 2 - Nhóm trưởng] Backend C# ASP.NET Core (3-Layer)
│   ├── SmartHome.Api.sln
│   └── SmartHome.Api/
│       ├── Controllers/                   # Lớp 1 (Presentation): REST API Điều khiển & Thống kê
│       ├── Hubs/                          # Lớp 1 (Presentation): SignalR Hub thời gian thực
│       ├── Services/                      # Lớp 2 (Business): MqttWorkerService
│       ├── DTOs/                          # Lớp 2 (Business): TelemetryDto, CommandDto, SummaryDto
│       └── Data/                          # Lớp 3 (Data Access): SmartHomeRepository & Entities
│
├── 3-frontend-react/                      # [Mảng 3 - TV3] Giao diện Web trên Máy tính (React + Vite + Tailwind)
│   ├── package.json
│   └── src/
│       ├── services/                      # Kết nối SignalR & gọi REST API C#
│       └── App.jsx                        # Giao diện Điều khiển Web & Dashboard Thống kê
│
└── 4-mobile-react-native/                 # [Mảng 4 - TV4] App Di động Mobile (React Native + Expo)
    ├── package.json
    ├── app.json
    ├── App.js                             # Giao diện cảm ứng điều khiển từ xa & rung cảnh báo cháy
    └── src/
        └── services/
            └── mobileApi.js               # Kết nối SignalR & REST API C# qua IP Wi-Fi LAN
```

---

## 🚀 Hướng dẫn Chạy Nhanh Cho Các Thành Viên Trong Nhóm

### 1. Chạy Backend C# (`2-backend-csharp` — Nhóm trưởng phụ trách)
* **Cách 1 (Dùng Visual Studio 2022):**
  * Mở file `C:\SmartHomeIoT\SmartHomeIoT.sln` và bấm nút **Run (`F5` / `Ctrl + F5`)**.
* **Cách 2 (Dùng Terminal / VS Code):**
  ```powershell
  cd C:\SmartHomeIoT\2-backend-csharp\SmartHome.Api
  dotnet run
  ```
* Server C# sẽ lắng nghe tại: `http://0.0.0.0:5000` (truy cập trên Laptop qua `http://localhost:5000` hoặc từ Điện thoại qua `http://<IP-LAN-Laptop>:5000`).

### 2. Chạy Giao diện Web trên Máy tính (`3-frontend-react` — Thành viên 3 phụ trách)
```powershell
cd C:\SmartHomeIoT\3-frontend-react
npm install
npm run dev
```
* Mở trình duyệt tại: `http://localhost:5173`.

### 3. Chạy Ứng dụng Di động React Native (`4-mobile-react-native` — Thành viên 4 phụ trách)
```powershell
cd C:\SmartHomeIoT\4-mobile-react-native
npm install
npx expo start
```
* Tải ứng dụng **Expo Go** trên điện thoại (iPhone / Android), bắt cùng mạng Wi-Fi với máy tính, quét mã QR trên Terminal và nhập IP Wi-Fi của máy tính chạy Backend C# (ví dụ: `192.168.1.31`).

### 4. Nạp Code Mạch Phần Cứng (`1-firmware-esp32` — Thành viên 2 phụ trách)
* Mở file `1-firmware-esp32/SmartHome_ESP32_WiFi_MQTT/SmartHome_ESP32_WiFi_MQTT.ino` bằng **Arduino IDE**.
* Sửa `WIFI_SSID` và `WIFI_PASSWORD` theo tên Wi-Fi (2.4GHz), chọn cổng COM (Board: `ESP32 Dev Module`) và bấm **Upload**.

### 5. Kiểm thử Gói tin bằng Phần mềm `MQTTX` (Không cần mạch thật vẫn test được C#, Web & App Mobile)
* Mở **MQTTX** $\rightarrow$ Kết nối tới Broker `broker.emqx.io`, Port `1883` (MQTT v3.1.1).
* **Subscribe** vào Topic: `smarthome/khoa2026/#` để xem trực tiếp gói tin từ mạch ESP32 và lệnh điều khiển từ Web / App Mobile.
* **Publish** vào Topic: `smarthome/khoa2026/telemetry` gói tin JSON mẫu trong `docs/MQTT_API_CONTRACT.md` để giả lập mạch ESP32 gửi dữ liệu lên C#, Web React và App Mobile React Native!

---

## 🌿 Quy ước Làm việc Nhóm với Git (4 Thành viên — 4 Nhánh riêng)
Xem hướng dẫn chi tiết từng bước tại: [`docs/TEAM_WORKFLOW_AND_GIT_RULES.md`](docs/TEAM_WORKFLOW_AND_GIT_RULES.md)

* **Nhóm trưởng (Backend C# & Quản lý Git):** Nhánh `master` / `feat/backend-csharp` (sửa trong `2-backend-csharp/` và `docs/`).
* **Thành viên 2 (Nhúng ESP32 & MQTTX):** Nhánh `feat/esp32-wifi-mqtt` (chỉ sửa trong `1-firmware-esp32/`).
* **Thành viên 3 (Web React + Tailwind):** Nhánh `feat/frontend-web-react` (chỉ sửa trong `3-frontend-react/`).
* **Thành viên 4 (App Mobile React Native):** Nhánh `feat/mobile-react-native` (chỉ sửa trong `4-mobile-react-native/`).
