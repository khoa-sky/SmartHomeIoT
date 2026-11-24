# 👥 QUY TẮC LÀM VIỆC NHÓM, PHÂN CÔNG FILE & HƯỚNG DẪN GIT COMMIT (4 THÀNH VIÊN)

> [!IMPORTANT]
> Tài liệu này quy định rõ **phạm vi file được phép sửa**, **quy trình tạo nhánh (`branch`)**, **quy tắc `commit` / `push`** và **nhiệm vụ cụ thể của từng thành viên** trong nhóm 4 người.
> Mục tiêu hiện tại của nhóm: **Hoàn thành Giai đoạn Kết nối Wi-Fi với mạch Vietduino ESP32 & Điều khiển 2 chiều trên Web / Điện thoại (Mobile)** trước khi chuyển sang giai đoạn làm Dashboard Quản lý & Thống kê.

---

## 1. BẢNG PHÂN CÔNG VAI TRÒ & PHẠM VI FILE ĐƯỢC PHÉP SỬA

Để **không bao giờ xảy ra lỗi đụng code (`Merge Conflict`)** khi 4 người cùng làm việc và đảm bảo trên GitHub (`Insights -> Contributors`) hiển thị đầy đủ lịch sử đóng góp của cả 4 thành viên, mỗi người chỉ sửa đúng các file trong khu vực được giao:

| Thành viên | Vai trò đảm nhiệm | Nhánh Git (`Branch`) | Các File / Thư mục ĐƯỢC PHÉP SỬA | Các File KHÔNG ĐƯỢC SỬA |
| :--- | :--- | :--- | :--- | :--- |
| **1. Nhóm trưởng (Bạn)** | **Quản lý Git + Backend C# (`.NET` 3-Layer, MQTT Worker, SignalR Hub & REST API)** | `master`, `develop`, `feat/backend-csharp` | - Toàn bộ `2-backend-csharp/` (`Program.cs`, `Controllers/`, `Services/MqttWorkerService.cs`, `Hubs/SmartHomeHub.cs`, `Data/`, `DTOs/`)<br>- `SmartHomeIoT.sln`, `.gitignore`, `README.md`, `docs/` | Không sửa trực tiếp trên nhánh của 3 thành viên kia (chỉ duyệt & Merge PR). |
| **2. Thành viên 2** | **Nhúng ESP32 (C/C++), Kết nối Wi-Fi / MQTT & Kiểm thử `MQTTX`** | `feat/esp32-wifi-mqtt` | - `1-firmware-esp32/SmartHome_ESP32_WiFi_MQTT/SmartHome_ESP32_WiFi_MQTT.ino`<br>- `1-firmware-esp32/SmartHome_ESP32_Offline/SmartHome_ESP32_Offline.ino`<br>- `docs/HARDWARE_PINOUT.md`, `docs/MQTT_API_CONTRACT.md` | Không sửa vào `2-backend-csharp/` và `3-frontend-react/`. |
| **3. Thành viên 3** | **Frontend React — Kết nối SignalR, Header Trạng thái Mạch, 4 Thẻ Cảm biến Live & Báo cháy** | `feat/frontend-live-sensors` | - `3-frontend-react/src/services/apiClient.js`<br>- `3-frontend-react/src/App.jsx` *(Phần kết nối SignalR, Header Online/Offline, Modal Báo cháy khẩn cấp & Cụm 4 Thẻ cảm biến thời gian thực)*<br>- Có thể tạo file mới trong `3-frontend-react/src/components/sensors/` | Không sửa vào `1-firmware-esp32/`, `2-backend-csharp/` và phần khối nút bấm điều khiển của TV4. |
| **4. Thành viên 4** | **Frontend React — Bảng Điều khiển 2 Chiều 5 Cụm Thiết bị trên Web & Điện thoại (Mobile UI)** | `feat/frontend-device-controls` | - `3-frontend-react/src/App.jsx` *(Phần 4 Khối điều khiển thiết bị: Đèn Trắng + Khóa PIR, Giàn phơi Servo 3 chế độ, Máy bơm tưới cây, Test Còi & 2 Đèn Đỏ)*<br>- Có thể tạo file mới trong `3-frontend-react/src/components/controls/`<br>- `3-frontend-react/vite.config.js` | Không sửa vào `1-firmware-esp32/`, `2-backend-csharp/` và `apiClient.js` của TV3. |

---

## 2. NHIỆM VỤ CỤ THỂ CỦA TỪNG THÀNH VIÊN TRONG GIAI ĐOẠN HIỆN TẠI

### 👑 Thành viên 1 — Nhóm trưởng & Phụ trách Backend C# (`2-backend-csharp/`)
1. **Quản lý kho mã nguồn Git:**
   - Khởi tạo Remote Repository trên GitHub, push bộ khung dự án lên nhánh `master` (hoặc `main`) và tạo nhánh tích hợp `develop`.
   - Thêm 3 thành viên vào mục **Settings -> Collaborators** trên GitHub.
   - Kiểm tra và bấm **Merge Pull Request** khi các thành viên hoàn thành từng đầu việc.
2. **Phát triển & Vận hành Backend C# (`SmartHome.Api`):**
   - **Kết nối MQTT 2 chiều (`MqttWorkerService.cs`):** Duy trì kết nối TCP tới Broker (`broker.emqx.io:1883`), nhận gói tin `smarthome/khoa2026/telemetry` từ mạch ESP32 mỗi giây, tự động kiểm tra trạng thái mạch `Online / Offline` (quá 6 giây không có tin thì báo Offline).
   - **Đồng bộ thời gian thực (`SmartHomeHub.cs`):** Đẩy dữ liệu cảm biến và trạng thái thiết bị qua WebSocket SignalR (`/hubs/smarthome`) xuống Web và Điện thoại với độ trễ `< 100ms`.
   - **REST API Điều khiển (`DeviceController.cs`):** Cung cấp và kiểm tra tính hợp lệ cho API `GET /api/device/status` và `POST /api/device/command` (5 nhóm lệnh: `LIGHT`, `PIR_LOCK`, `SERVO`, `PUMP`, `ALARM_TEST`), phát lệnh xuống Topic `smarthome/khoa2026/command`.
   - **Mở kết nối mạng LAN cho Điện thoại (`Program.cs` & `launchSettings.json`):** Cấu hình CORS và địa chỉ IP LAN (`0.0.0.0:5000`) để điện thoại bắt cùng Wi-Fi gọi được API C#.
   - *(Giai đoạn tiếp theo)*: Phụ trách hoàn thiện `AnalyticsController.cs` và `SmartHomeRepository.cs` cho Dashboard thống kê & xuất báo cáo Excel (`.CSV`).

---

### 🔌 Thành viên 2 — Phụ trách Mạch Nhúng ESP32, Kết nối Wi-Fi/MQTT & Kiểm thử `MQTTX` (`1-firmware-esp32/`)
1. **Công việc 1 (Commit 1 — Cấu hình Wi-Fi & Kết nối MQTT Không chặn):**
   - Mở `1-firmware-esp32/SmartHome_ESP32_WiFi_MQTT/SmartHome_ESP32_WiFi_MQTT.ino`.
   - Cập nhật thông tin Wi-Fi 2.4GHz (`WIFI_SSID`, `WIFI_PASSWORD`) và kiểm tra cơ chế `Offline-First` (khi mất Wi-Fi hoặc Broker断 kết nối, 13 thiết bị và nút bấm vật lý `IO25` trên mạch vẫn phải phản hồi tức thì, tuyệt đối không bị đơ).
2. **Công việc 2 (Commit 2 — Hoàn thiện đóng gói JSON Telemetry & Giải mã 5 lệnh Command):**
   - Kiểm tra hàm `guiTelemetryJson()` gửi đầy đủ 15 trường thông số cảm biến và trạng thái thiết bị mỗi `1000ms` (hoặc ngay lập tức khi bấm nút vật lý `IO25`).
   - Kiểm tra hàm `xuLyLenhJson()` nhận lệnh từ Backend C# của Nhóm trưởng:
     - `LIGHT` (`ON` / `OFF` / `TOGGLE`): Bật/tắt Đèn Trắng `IO32` (tắt đèn thì khóa tạm PIR 5 giây).
     - `PIR_LOCK` (`LOCK` / `UNLOCK` / `TOGGLE`): Khóa PIR đi ngủ kêu 1 tiếng Bíp dài `300ms` (LCD hiện `PIR:OFF`); mở lại PIR kêu 2 tiếng Bíp ngắn.
     - `SERVO` (`AUTO` / `OUT` / `IN`): Điều khiển giàn phơi `IO33` tự động theo mưa hoặc cưỡng bức ra `15°` / thu vào `165°` (tự ngắt xung PWM sau `0.6s`).
     - `PUMP` (`START` / `STOP` / `UNLOCK`): Bật bơm tưới `2.5s` kèm chớp 2 Đèn Đỏ `IO14`, dừng bơm khẩn cấp, hoặc mở khóa bơm từ xa khi lỗi quá 5 lần tưới (`LOI:DAT`).
     - `ALARM_TEST` (`ON` / `OFF`): Kích hoạt thử Còi `IO19` và Cụm 2 Đèn Đỏ `IO14` trong 2 giây.
3. **Công việc 3 (Commit 3 — Bộ kịch bản kiểm thử bằng phần mềm `MQTTX`):**
   - Cập nhật các mẫu gói tin JSON thực tế và hướng dẫn test bằng phần mềm `MQTTX` vào `docs/MQTT_API_CONTRACT.md`.

---

### 📡 Thành viên 3 — Phụ trách Frontend React: Kết nối SignalR, Trạng thái Mạch & 4 Thẻ Cảm Biến (`3-frontend-react/`)
1. **Công việc 1 (Commit 1 — Cấu hình `apiClient.js` hỗ trợ cả Laptop & Điện thoại qua Wi-Fi):**
   - Kiểm tra và hoàn thiện `3-frontend-react/src/services/apiClient.js` tự động nhận diện địa chỉ IP mạng LAN (`window.location.hostname:5000`) để khi mở trang web trên Điện thoại di động vẫn kết nối đúng vào Server C# của Nhóm trưởng.
2. **Công việc 2 (Commit 2 — Thanh Header Trạng thái `ESP32 ONLINE / OFFLINE` & Cụm 4 Thẻ Cảm Biến Thời Gian Thực):**
   - Hoàn thiện phần Header hiển thị rõ huy hiệu `ESP32 ONLINE` (Xanh lá) khi có dữ liệu MQTT và `CHỜ DỮ LIỆU MQTT / OFFLINE` (Vàng/Đỏ) kèm thời gian cập nhật gần nhất.
   - Tách hoặc hoàn thiện giao diện 4 Thẻ cảm biến nhảy số trực tiếp qua sự kiện SignalR `ReceiveTelemetry`:
     1. **Nhiệt độ Phòng (`DHT20`)** kèm nhãn đánh giá (*Ổn định / Khá nóng*).
     2. **Độ ẩm Không khí (`DHT20`)**.
     3. **Độ ẩm Đất Vườn (`IO35`)** kèm thanh tiến trình đổi màu khi đất khô `< 30%`.
     4. **An toàn Lửa (`IO34`) & Thời tiết Mưa (`IO23`)**.
3. **Công việc 3 (Commit 3 — Màn hình Cảnh báo Cháy Khẩn cấp Toàn màn hình):**
   - Hoàn thiện Modal Cảnh báo cháy (`fireAlert == true`) bung đỏ nhấp nháy toàn màn hình trên cả Laptop và Điện thoại, hiển thị chỉ số ADC lửa và nút xác nhận tắt cảnh báo trên màn hình.

---

### 🎛️ Thành viên 4 — Phụ trách Frontend React: Bảng Điều khiển Thiết bị 2 Chiều trên Web & Mobile (`3-frontend-react/`)
1. **Công việc 1 (Commit 1 — Khối Điều khiển Đèn Phòng Khách, Khóa PIR & Giàn Phơi Thông Minh):**
   - Hoàn thiện giao diện và trạng thái đồng bộ 2 chiều cho:
     - **Khối 1 (Đèn Trắng `IO32` & Cảm biến `PIR IO27`):** Nút Bật/Tắt đèn, nút Khóa/Mở PIR (chế độ đi ngủ), tự động đổi màu nút trên Web/Điện thoại khi người dùng bấm nút vật lý `IO25` trên mạch.
     - **Khối 2 (Giàn phơi `Servo IO33`):** 3 nút chế độ (`Tự Động Theo Mưa`, `Đưa Đồ Ra 15°`, `Thu Đồ Vào 165°`) và hiển thị góc Servo hiện tại.
2. **Công việc 2 (Commit 2 — Khối Điều khiển Máy Bơm Tưới Cây & Test Báo Động Còi/Đèn Đỏ):**
   - Hoàn thiện giao diện và xử lý nút bấm cho:
     - **Khối 3 (Hệ thống Tưới cây `Relay IO26`):** Hiển thị trạng thái bơm (`ĐANG TƯỚI...`, `BƠM NGHỈ`, `ĐÃ KHÓA BƠM`), số đợt tưới `0/5`, cùng 3 nút `Tưới Ngay (2.5s)`, `Dừng Bơm`, `Mở Khóa Bơm`.
     - **Khối 4 (Còi `IO19` & 2 Đèn Đỏ `IO14`):** Hiển thị trạng thái nháy đèn đỏ và nút `Test Còi & 2 Đèn Đỏ (2s)`.
3. **Công việc 3 (Commit 3 — Tối ưu Giao diện Cảm ứng Mobile & Hộp thoại Kết nối Điện thoại):**
   - Kiểm tra độ tương thích Responsive trên màn hình dọc của điện thoại di động và bổ sung hướng dẫn/hiển thị địa chỉ IP LAN (`http://<IP-Laptop>:5173`) để quét mở nhanh trên điện thoại.

---

## 3. HƯỚNG DẪN CÁC BƯỚC LÀM VIỆC VỚI GIT CHO TẤT CẢ THÀNH VIÊN

### Bước 1: Tải dự án về máy lần đầu tiên (`Clone`)
Mỗi thành viên mở **Terminal / PowerShell / Git Bash** trên máy tính của mình và chạy:
```powershell
git clone <URL_GITHUB_REPO_CUA_NHOM_TRUONG>
cd SmartHomeIoT
```

### Bước 2: Chuyển sang nhánh (`Branch`) được phân công
> [!WARNING]
> **Tuyệt đối không code trực tiếp trên nhánh `master` / `main`!** Ai phụ trách mảng nào thì tạo và chuyển sang đúng nhánh của mình theo lệnh dưới đây:

- **Nhóm trưởng (Backend C#):**
  ```powershell
  git checkout -b feat/backend-csharp
  ```
- **Thành viên 2 (Nhúng ESP32 & MQTT):**
  ```powershell
  git checkout -b feat/esp32-wifi-mqtt
  ```
- **Thành viên 3 (React Sensors & SignalR):**
  ```powershell
  git checkout -b feat/frontend-live-sensors
  ```
- **Thành viên 4 (React Device Controls & Mobile UI):**
  ```powershell
  git checkout -b feat/frontend-device-controls
  ```

### Bước 3: Chạy thử dự án trên máy trước khi sửa code
1. **Chạy Backend C# (Cổng `5000`):**
   ```powershell
   cd 2-backend-csharp/SmartHome.Api
   dotnet run
   ```
2. **Chạy Frontend React (Cổng `5173`):**
   ```powershell
   cd 3-frontend-react
   npm install
   npm run dev
   ```

### Bước 4: Quy tắc Lưu lịch sử (`Commit`) và Đẩy code lên GitHub (`Push`)
Sau khi hoàn thành mỗi đầu việc nhỏ, hãy kiểm tra những file mình đã sửa bằng lệnh:
```powershell
git status
```
> [!CAUTION]
> Khi chạy `git status`, hãy nhìn kỹ danh sách file màu đỏ: **Chỉ `git add` đúng những file thuộc phạm vi được giao ở Mục 1**. Không add các file rác hoặc file của thành viên khác.

Sau đó commit theo chuẩn thông điệp rõ ràng và push lên nhánh của mình:
```powershell
# 1. Chỉ thêm đúng file mình phụ trách (Ví dụ cho Thành viên 2):
git add 1-firmware-esp32/ docs/MQTT_API_CONTRACT.md

# 2. Đặt tên commit rõ ràng theo cấu trúc: <loại>(<mảng>): <nội dung ngắn gọn>
git commit -m "feat(esp32): cap nhat ket noi wifi va xu ly 5 lenh dieu khien mqtt"

# 3. Đẩy nhánh của mình lên GitHub:
git push -u origin <ten-nhanh-cua-ban>
```

**Mẫu tên Commit chuẩn cho từng người để lịch sử Git chuyên nghiệp:**
- **Nhóm trưởng (Backend C#):**
  - `feat(backend): add command validation for 5 device types in DeviceController`
  - `feat(mqtt): handle esp32 online timeout and optimistic state sync`
  - `chore(api): configure LAN CORS for mobile remote control`
- **Thành viên 2 (ESP32):**
  - `feat(esp32): configure non-blocking wifi and mqtt 3.1.1 client`
  - `feat(esp32): implement 2-way sync for physical button and remote commands`
  - `docs(mqtt): add MQTTX test payloads for telemetry and 5 commands`
- **Thành viên 3 (React Sensors):**
  - `feat(frontend): configure dynamic LAN host in apiClient for mobile access`
  - `feat(ui): build real-time 4 sensor cards and esp32 connection badge`
  - `feat(ui): implement full-screen emergency fire alert modal`
- **Thành viên 4 (React Controls):**
  - `feat(ui): implement 2-way control panels for lighting, PIR lock and servo`
  - `feat(ui): add garden pump control and fire alarm test panel`
  - `style(mobile): optimize responsive touch layout for smartphone view`

### Bước 5: Tạo Pull Request (`PR`) để Nhóm trưởng gộp code
1. Sau khi `git push` thành công, thành viên mở trang GitHub của nhóm.
2. Bấm nút màu xanh **`Compare & pull request`**.
3. Ghi tóm tắt những gì mình đã làm rồi bấm **`Create pull request`**.
4. Báo cho **Nhóm trưởng** vào kiểm tra và bấm **`Merge pull request`**.
5. Trước khi làm đầu việc tiếp theo, luôn cập nhật code mới nhất từ nhánh chính về máy bằng lệnh:
   ```powershell
   git pull origin master
   ```

