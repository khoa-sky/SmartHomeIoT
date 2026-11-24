# 👥 QUY TẮC LÀM VIỆC NHÓM, PHÂN CÔNG FILE & HƯỚNG DẪN GIT COMMIT (4 THÀNH VIÊN)

> [!IMPORTANT]
> Tài liệu này quy định rõ **phạm vi thư mục được phép sửa**, **quy trình tạo nhánh (`branch`)**, **quy tắc `commit` / `push`** và **nhiệm vụ cụ thể của từng thành viên** trong nhóm 4 người.
> Mỗi thành viên phụ trách **1 thư mục riêng biệt 100%** để không bao giờ xảy ra xung đột code (`Merge Conflict`).
> Mục tiêu hiện tại: **Hoàn thành Giai đoạn Kết nối Wi-Fi/MQTT, Điều khiển 2 chiều trên Web (`3-frontend-react`) và App Di động (`4-mobile-react-native`)**, sau đó nâng cấp dần lên Dashboard Quản lý & Thống kê.

---

## 1. BẢNG PHÂN CÔNG 4 THÀNH VIÊN — 4 THƯ MỤC ĐỘC LẬP

| Thành viên | Vai trò đảm nhiệm | Nhánh Git (`Branch`) | Thư mục ĐƯỢC PHÉP SỬA | Thư mục KHÔNG ĐƯỢC SỬA |
| :--- | :--- | :--- | :--- | :--- |
| **1. Nhóm trưởng (Bạn)** | **Quản lý Git + Backend C# (`.NET` 3-Layer, MQTT Worker, SignalR Hub & REST API)** | `master`, `feat/backend-csharp` | - Toàn bộ `2-backend-csharp/`<br>- `SmartHomeIoT.sln`, `.gitignore`, `README.md`, `docs/` | Không sửa trực tiếp trên nhánh của 3 thành viên kia (chỉ duyệt & Merge PR). |
| **2. Thành viên 2** | **Nhúng ESP32 (C/C++), Kết nối Wi-Fi / MQTT & Kiểm thử `MQTTX`** | `feat/esp32-wifi-mqtt` | - Toàn bộ `1-firmware-esp32/`<br>- `docs/HARDWARE_PINOUT.md`, `docs/MQTT_API_CONTRACT.md` | Không sửa vào `2-backend-csharp/`, `3-frontend-react/`, `4-mobile-react-native/`. |
| **3. Thành viên 3** | **Giao diện Web trên Máy tính (`React + Vite + Tailwind CSS`)** | `feat/frontend-web-react` | - Toàn bộ `3-frontend-react/` (`src/App.jsx`, `src/services/apiClient.js`, `src/components/`) | Không sửa vào `1-firmware-esp32/`, `2-backend-csharp/`, `4-mobile-react-native/`. |
| **4. Thành viên 4** | **Ứng dụng Di động Mobile (`React Native + Expo`)** | `feat/mobile-react-native` | - Toàn bộ `4-mobile-react-native/` (`App.js`, `src/services/mobileApi.js`, `src/components/`) | Không sửa vào `1-firmware-esp32/`, `2-backend-csharp/`, `3-frontend-react/`. |

---

## 2. NHIỆM VỤ CỤ THỂ CỦA TỪNG THÀNH VIÊN (THEO TỪNG COMMIT)

### 👑 Thành viên 1 — Nhóm trưởng & Phụ trách Backend C# (`2-backend-csharp/`)
1. **Quản lý kho mã nguồn GitHub:**
   - Đẩy khung dự án lên GitHub (`https://github.com/khoa-sky/SmartHomeIoT.git`) và tạo sẵn các nhánh cho nhóm.
   - Vào **Settings -> Collaborators** trên GitHub thêm tài khoản của 3 bạn thành viên.
   - Kiểm tra và bấm **Merge Pull Request** khi các bạn hoàn thành từng đầu việc.
2. **Phát triển & Vận hành Backend C# (`SmartHome.Api` - Cổng `5000`):**
   - **Commit 1 (`feat(backend): configure LAN 0.0.0.0:5000 and CORS for web and mobile app`):** Cấu hình `launchSettings.json` và `Program.cs` mở cổng `0.0.0.0:5000` để cả Web React trên máy tính lẫn App Mobile React Native trên điện thoại kết nối được.
   - **Commit 2 (`feat(mqtt): implement MqttWorkerService 2-way sync and online detection`):** Duy trì kết nối TCP tới Broker `broker.emqx.io:1883`, nhận JSON `telemetry` mỗi giây, tự động kiểm tra trạng thái `ESP32 ONLINE / OFFLINE` (timeout 6 giây) và đẩy qua SignalR (`/hubs/smarthome`).
   - **Commit 3 (`feat(api): validate 5 remote device commands in DeviceController`):** Kiểm tra tính hợp lệ và xử lý API `GET /api/device/status` & `POST /api/device/command` cho 5 nhóm thiết bị (`LIGHT`, `PIR_LOCK`, `SERVO`, `PUMP`, `ALARM_TEST`).
   - *(Giai đoạn tiếp theo — Dashboard Quản lý)*: Hoàn thiện `AnalyticsController.cs` và `SmartHomeRepository.cs` (tính Max/Min/Avg, lọc nhật ký sự kiện và xuất báo cáo Excel `.CSV`).

---

### 🔌 Thành viên 2 — Phụ trách Mạch Nhúng ESP32, Kết nối Wi-Fi/MQTT & `MQTTX` (`1-firmware-esp32/`)
1. **Commit 1 (`feat(esp32): configure non-blocking Wi-Fi and MQTT 3.1.1 connection`):**
   - Cập nhật `WIFI_SSID`, `WIFI_PASSWORD` và cấu hình Broker trong `1-firmware-esp32/SmartHome_ESP32_WiFi_MQTT/SmartHome_ESP32_WiFi_MQTT.ino`.
   - Đảm bảo cơ chế `Offline-First`: Khi mất Wi-Fi, 13 thiết bị và nút bấm vật lý `IO25` vẫn hoạt động tức thì 100%, không bị đơ mạch.
2. **Commit 2 (`feat(esp32): implement JSON telemetry publish and 5 remote commands handler`):**
   - Hoàn thiện hàm `guiTelemetryJson()` gửi 15 thông số cảm biến/trạng thái mỗi 1 giây (hoặc ngay khi bấm nút vật lý `IO25`).
   - Hoàn thiện hàm `xuLyLenhJson()` thực thi 5 lệnh điều khiển từ Backend C# (`LIGHT`, `PIR_LOCK` kêu Bíp, `SERVO` góc 15°/165° tự ngắt xung, `PUMP` tưới 2.5s + mở khóa bơm, `ALARM_TEST` còi & 2 đèn đỏ).
3. **Commit 3 (`docs(mqtt): add MQTTX test payloads and verification guide`):**
   - Bổ sung bộ gói tin JSON mẫu vào `docs/MQTT_API_CONTRACT.md` để nhóm dùng phần mềm `MQTTX` giả lập mạch ESP32 khi test với C#, Web và App Mobile.

---

### 💻 Thành viên 3 — Phụ trách Giao diện Web trên Máy tính (`3-frontend-react/`)
1. **Commit 1 (`feat(web): connect SignalR real-time hub and display 4 live sensor cards`):**
   - Trong `3-frontend-react/src/services/apiClient.js` và `src/App.jsx`, kết nối SignalR nhận sự kiện `ReceiveTelemetry`.
   - Hiển thị huy hiệu `ESP32 ONLINE / CHỜ DỮ LIỆU MQTT` và 4 thẻ thông số cảm biến thời gian thực (Nhiệt độ `DHT20`, Độ ẩm không khí, Độ ẩm đất kèm thanh tiến trình, Cảm biến Lửa & Thời tiết Mưa).
2. **Commit 2 (`feat(web): build 4 interactive 2-way device control panels and fire alert modal`):**
   - Hoàn thiện 4 cụm nút bấm điều khiển 2 chiều trên Web (Đèn Trắng + Khóa PIR, Giàn phơi Servo 3 chế độ, Máy bơm tưới cây, Test Còi & 2 Đèn Đỏ) và Màn hình Cảnh báo cháy khẩn cấp đỏ toàn màn hình.
3. **Commit 3 (`feat(web-dashboard): build analytics KPI cards, history chart and CSV export table`):**
   - *(Khi chuyển sang Giai đoạn Dashboard)*: Hoàn thiện Tab `Dashboard Thống Kê` trên Web gồm 4 thẻ KPI tổng hợp, biểu đồ cột biến thiên 25 mẫu gần nhất, bộ lọc bảng Nhật ký sự kiện và nút tải báo cáo Excel (`.CSV`).

---

### 📱 Thành viên 4 — Phụ trách Ứng dụng Di động Mobile React Native (`4-mobile-react-native/`)
1. **Commit 1 (`feat(mobile): configure LAN server IP connection and SignalR client in Expo app`):**
   - Trong `4-mobile-react-native/src/services/mobileApi.js` và `App.js`, hoàn thiện thanh nhập địa chỉ IP Wi-Fi của máy tính chạy Server C# (ví dụ `192.168.1.31:5000`), hiển thị trạng thái kết nối `ESP32 ONLINE / CHỜ MQTT` và 4 ô cảm biến thời gian thực trên màn hình điện thoại.
2. **Commit 2 (`feat(mobile): build touch control panels for light, PIR lock, servo and pump`):**
   - Hoàn thiện giao diện cảm ứng trên điện thoại cho 4 khối điều khiển từ xa:
     1. Bật/Tắt Đèn Trắng + Chạm Khóa/Mở PIR (chế độ đi ngủ).
     2. Chỉnh Giàn phơi (`Tự Động` / `Phơi 15°` / `Thu 165°`).
     3. Máy bơm tưới cây (`Tưới 2.5s` / `Dừng Bơm` / `Mở Khóa`).
     4. Test Còi & 2 Đèn Đỏ (`2s`).
3. **Commit 3 (`feat(mobile): add emergency fire alert banner with phone vibration`):**
   - Khi nhận `fireAlert == true` từ mạch ESP32/MQTTX, tự động kích hoạt **Rung điện thoại (`Vibration.vibrate`)** kèm hộp thoại Cảnh báo cháy màu đỏ trên đầu màn hình di động.

---

## 3. HƯỚNG DẪN LỆNH GIT TỪNG BƯỚC CHO CÁC THÀNH VIÊN

### Bước 1: Tải dự án từ GitHub về máy (`Clone`)
Mở **Terminal / PowerShell / Git Bash** và chạy:
```powershell
git clone https://github.com/khoa-sky/SmartHomeIoT.git
cd SmartHomeIoT
```

### Bước 2: Chuyển sang đúng nhánh (`Branch`) của mình
> [!WARNING]
> **Không code trực tiếp trên nhánh `master`!** Mỗi thành viên chạy đúng câu lệnh của mình dưới đây để chuyển sang nhánh riêng:

- **Nhóm trưởng (Backend C#):**
  ```powershell
  git checkout feat/backend-csharp
  ```
- **Thành viên 2 (Nhúng ESP32 & MQTTX):**
  ```powershell
  git checkout feat/esp32-wifi-mqtt
  ```
- **Thành viên 3 (Web React `3-frontend-react`):**
  ```powershell
  git checkout feat/frontend-web-react
  ```
- **Thành viên 4 (App Mobile React Native `4-mobile-react-native`):**
  ```powershell
  git checkout feat/mobile-react-native
  ```
*(Nếu máy báo chưa có nhánh ở local thì gõ `git fetch origin` rồi `git checkout <ten-nhanh>`).*

### Bước 3: Sửa code trong thư mục của mình, `Commit` và `Push`
Sau khi hoàn thành mỗi đầu việc:
```powershell
# 1. Kiểm tra các file đã sửa (chỉ sửa trong thư mục được giao ở Bảng 1)
git status

# 2. Thêm đúng thư mục của mình:
# - Thành viên 2 gõ: git add 1-firmware-esp32/
# - Thành viên 3 gõ: git add 3-frontend-react/
# - Thành viên 4 gõ: git add 4-mobile-react-native/

# 3. Lưu commit với nội dung rõ ràng:
git commit -m "feat: mo ta ngan gon cong viec vua hoan thanh"

# 4. Đẩy code lên nhánh của mình trên GitHub:
git push origin <ten-nhanh-cua-ban>
```

### Bước 4: Tạo Pull Request (`PR`) trên GitHub
1. Sau khi `git push`, mở trang GitHub `https://github.com/khoa-sky/SmartHomeIoT`.
2. Bấm nút màu xanh **`Compare & pull request`**.
3. Ghi tóm tắt công việc đã làm rồi bấm **`Create pull request`**.
4. Báo cho **Nhóm trưởng** vào kiểm tra và bấm **`Merge pull request`**.
5. Trước khi làm việc tiếp, luôn lấy code mới nhất về bằng lệnh:
   ```powershell
   git pull origin master
   ```
