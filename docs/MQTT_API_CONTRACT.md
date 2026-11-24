# 📡 HỢP ĐỒNG GIAO TIẾP DỮ LIỆU: MQTT, SIGNALR & REST API (`MQTT_API_CONTRACT.md`)

Tài liệu này quy định chuẩn gói tin `JSON` thống nhất giữa **3 mảng**:
1. **Firmware ESP32 (`1-firmware-esp32`)** & công cụ test **`MQTTX`**
2. **Backend C# ASP.NET Core (`2-backend-csharp`)**
3. **Frontend React + Tailwind CSS (`3-frontend-react`)**

---

## 1. Cấu hình Kết nối MQTT Broker Mặc định

- **Host:** `broker.emqx.io` *(hoặc `127.0.0.1` nếu chạy Local Broker)*
- **Port TCP:** `1883`
- **Topic ESP32 gửi dữ liệu lên (Publish mỗi 1 giây):** `smarthome/khoa2026/telemetry`
- **Topic gửi lệnh điều khiển xuống ESP32 (Subscribe):** `smarthome/khoa2026/command`

---

## 2. Chuẩn Gói Tin 1: Dữ liệu Cảm biến & Trạng thái (`Telemetry JSON`)

- **Topic MQTT:** `smarthome/khoa2026/telemetry`
- **Sự kiện SignalR (C# bắn lên React):** `ReceiveTelemetry`
- **API lấy trạng thái mới nhất:** `GET /api/device/status`

```json
{
  "temp": 32.4,
  "hum": 67.0,
  "soil": 38,
  "flame": 45,
  "fireAlert": false,
  "pir": false,
  "pirLocked": false,
  "rain": false,
  "servoAngle": 15,
  "servoMode": "AUTO",
  "lightOn": true,
  "redLedOn": false,
  "pumpOn": false,
  "pumpLocked": false,
  "pumpCount": 0
}
```

### Giải thích ý nghĩa từng trường:
| Trường | Kiểu | Mô tả |
| :--- | :---: | :--- |
| `temp` | `float` | Nhiệt độ môi trường (`°C`) từ cảm biến `DHT20` (`0x38`). |
| `hum` | `float` | Độ ẩm không khí (`%`) từ cảm biến `DHT20` (`0x38`). |
| `soil` | `int` | Độ ẩm đất (`0 - 100%`) từ cảm biến `LM393` (`IO35`). `< 30%` là khô, `>= 40%` là đủ ẩm. |
| `flame` | `int` | Giá trị ADC cảm biến lửa `MKE-S04` (`IO34`, Active-LOW: `< 15` là có lửa). |
| `fireAlert` | `bool` | `true` khi đang trong trạng thái Báo cháy khẩn cấp (`coLua`). |
| `pir` | `bool` | `true` khi cảm biến `PIR HC-SR501` (`IO27`) phát hiện chuyển động. |
| `pirLocked` | `bool` | `true` khi đã Khóa cảm biến tự động PIR (Chế độ Đi ngủ - `khoaPIR`). |
| `rain` | `bool` | `true` khi cảm biến nước mưa `HS0217V` (`IO23`) xác nhận có mưa (`coMua`). |
| `servoAngle` | `int` | Góc hiện tại của động cơ Servo `SG90` (`IO33`): `15` (Phơi đồ) hoặc `165` (Thu đồ). |
| `servoMode` | `string` | `"AUTO"` (Tự động theo mưa), `"OUT"` (Cưỡng bức phơi ra `15°`), `"IN"` (Cưỡng bức thu vào `165°`). |
| `lightOn` | `bool` | `true` khi Đèn Trắng phòng khách `MKE-M01` (`IO32`) đang sáng. |
| `redLedOn` | `bool` | `true` khi Cụm 2 Đèn Đỏ cảnh báo (`IO14`) đang chớp sáng. |
| `pumpOn` | `bool` | `true` khi Relay Máy bơm (`IO26`) đang chạy tưới nước. |
| `pumpLocked` | `bool` | `true` khi Máy bơm bị khóa an toàn sau 5 lần tưới mà đất chưa ẩm (`[KHOA BOM]`). |
| `pumpCount` | `int` | Số đợt tưới liên tiếp hiện tại (`0 - 5`). |

---

## 3. Chuẩn Gói Tin 2: Lệnh Điều Khiển Từ Xa (`Command JSON`)

- **Topic MQTT:** `smarthome/khoa2026/command`
- **API gửi lệnh từ React lên C#:** `POST /api/device/command`

```json
{
  "cmd": "LIGHT",
  "value": "ON"
}
```

### Danh sách 5 lệnh điều khiển hợp lệ:

| STT | Thiết bị | Giá trị `cmd` | Các giá trị `value` hỗ trợ | Hành vi thực hiện tại mạch ESP32 |
| :-: | :--- | :---: | :---: | :--- |
| **1** | **Đèn Trắng (`IO32`)** | `"LIGHT"` | `"ON"` / `"OFF"` / `"TOGGLE"` | Bật hoặc Tắt Đèn Trắng phòng khách (khi tắt sẽ khóa tạm PIR 5 giây). |
| **2** | **Chế độ PIR (`IO27`)** | `"PIR_LOCK"` | `"LOCK"` / `"UNLOCK"` / `"TOGGLE"` | Khóa PIR (tắt đèn + kêu 1 tiếng Bíp dài `300ms`) hoặc Mở lại PIR (kêu 2 tiếng Bíp ngắn). |
| **3** | **Giàn phơi (`IO33`)** | `"SERVO"` | `"AUTO"` / `"OUT"` / `"IN"` | `"AUTO"`: Tự động theo cảm biến mưa; `"OUT"`: Quay ra `15°`; `"IN"`: Quay thu vào `165°`. |
| **4** | **Máy bơm (`IO26`)** | `"PUMP"` | `"START"` / `"STOP"` / `"UNLOCK"` | `"START"`: Bơm tưới ngay 1 đợt `2.5s`; `"STOP"`: Ngắt bơm ngay; `"UNLOCK"`: Mở khóa lỗi `[KHOA BOM]`. |
| **5** | **Còi & 2 Đèn Đỏ** | `"ALARM_TEST"` | `"ON"` / `"OFF"` | Kêu còi Bíp + Chớp 2 Đèn Đỏ trong 2 giây để kiểm tra hệ thống báo động từ xa. |

---

## 4. Danh sách REST API trên Backend C# (`http://localhost:5000`)

1. **`GET /api/device/status`**: Lấy gói tin trạng thái `Telemetry` mới nhất của mạch ESP32.
2. **`POST /api/device/command`**: Gửi lệnh điều khiển xuống mạch ESP32 (Body: `{"cmd": "...", "value": "..."}`).
3. **`GET /api/analytics/summary`**: Lấy các chỉ số thống kê tổng hợp (Nhiệt độ/Độ ẩm Max-Min-Avg, tổng số lần bơm, số lần phát hiện người, số lần mưa, số lần báo cháy).
4. **`GET /api/analytics/history?limit=50`**: Lấy danh sách lịch sử thông số cảm biến để vẽ biểu đồ.
5. **`GET /api/analytics/logs?category=ALL&limit=100`**: Lấy danh sách nhật ký sự kiện (`EventLogs`).
6. **`GET /api/analytics/export-csv`**: Tải file báo cáo thống kê định dạng Excel (`.CSV` có hỗ trợ tiếng Việt `UTF-8 BOM`).
