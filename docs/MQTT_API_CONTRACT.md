# 📡 HỢP ĐỒNG GIAO TIẾP DỮ LIỆU: MQTT, SIGNALR & REST API (`MQTT_API_CONTRACT.md`)

Tài liệu này quy định chuẩn gói tin `JSON` thống nhất giữa **4 mảng**:
1. **Firmware ESP32 (`1-firmware-esp32`)** & công cụ test **`MQTTX`** *(Thành viên 2)*
2. **Backend C# ASP.NET Core (`2-backend-csharp`)** *(Nhóm trưởng)*
3. **Giao diện Web React + Tailwind CSS (`3-frontend-react`)** *(Thành viên 3)*
4. **Ứng dụng Di động React Native Expo (`4-mobile-react-native`)** *(Thành viên 4)*

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

---

## 5. Hướng dẫn Cấu hình & Kiểm thử bằng Phần mềm `MQTTX`

Công cụ **`MQTTX`** cho phép kiểm thử toàn bộ luồng dữ liệu **Backend C# ↔ Web React ↔ App Mobile** ngay cả khi chưa cắm mạch thật, và kiểm thử trực tiếp **Mạch Vietduino ESP32** khi đã nạp firmware.

### 5.1. Tạo kết nối mới trong MQTTX
1. Mở **MQTTX** → bấm **`+` (New Connection)**.
2. Điền thông số:
   - **Name:** `SmartHomeIoT`
   - **Client ID:** *(giữ mặc định hoặc đặt `MQTTX-Test-TV2`)*
   - **Host:** `mqtt://` `broker.emqx.io`
   - **Port:** `1883`
   - **MQTT Version:** `3.1.1`
3. Bấm **Connect** (góc trên bên phải).
4. Bấm **`+ New Subscription`** → nhập Topic: `smarthome/khoa2026/#` → **Confirm** để theo dõi đồng thời cả `telemetry` và `command`.

---

## 6. Bộ Gói Tin JSON Mẫu Giả Lập `Telemetry` (6 Kịch bản)

> **Cách dùng:** Ở khung gửi phía dưới của `MQTTX`, chọn định dạng **JSON**, nhập Topic `smarthome/khoa2026/telemetry`, dán từng gói tin dưới đây và bấm **Send** để kiểm tra phản hồi trên Backend C#, Web React và App Mobile.

### Kịch bản 1: Trạng thái bình thường (An toàn, khô ráo, đất đủ ẩm)
```json
{
  "temp": 30.5,
  "hum": 65.0,
  "soil": 52,
  "flame": 4095,
  "fireAlert": false,
  "pir": false,
  "pirLocked": false,
  "rain": false,
  "servoAngle": 15,
  "servoMode": "AUTO",
  "lightOn": false,
  "redLedOn": false,
  "pumpOn": false,
  "pumpLocked": false,
  "pumpCount": 0
}
```

### Kịch bản 2: Phát hiện chuyển động PIR → Tự bật Đèn Trắng
```json
{
  "temp": 30.8,
  "hum": 64.0,
  "soil": 50,
  "flame": 4095,
  "fireAlert": false,
  "pir": true,
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

### Kịch bản 3: Đã khóa cảm biến PIR (Chế độ Đi ngủ — đèn tắt)
```json
{
  "temp": 29.2,
  "hum": 68.0,
  "soil": 48,
  "flame": 4095,
  "fireAlert": false,
  "pir": false,
  "pirLocked": true,
  "rain": false,
  "servoAngle": 15,
  "servoMode": "AUTO",
  "lightOn": false,
  "redLedOn": false,
  "pumpOn": false,
  "pumpLocked": false,
  "pumpCount": 0
}
```

### Kịch bản 4: Phát hiện trời mưa → Servo tự thu giàn phơi vào `165°`
```json
{
  "temp": 26.4,
  "hum": 82.0,
  "soil": 60,
  "flame": 4095,
  "fireAlert": false,
  "pir": false,
  "pirLocked": false,
  "rain": true,
  "servoAngle": 165,
  "servoMode": "AUTO",
  "lightOn": false,
  "redLedOn": false,
  "pumpOn": false,
  "pumpLocked": false,
  "pumpCount": 0
}
```

### Kịch bản 5A: Đất khô (`< 30%`) → Máy bơm đang tưới đợt `1/5` + 2 Đèn Đỏ nháy
```json
{
  "temp": 34.2,
  "hum": 50.0,
  "soil": 22,
  "flame": 4095,
  "fireAlert": false,
  "pir": false,
  "pirLocked": false,
  "rain": false,
  "servoAngle": 15,
  "servoMode": "AUTO",
  "lightOn": false,
  "redLedOn": true,
  "pumpOn": true,
  "pumpLocked": false,
  "pumpCount": 1
}
```

### Kịch bản 5B: Bảo vệ máy bơm → Khóa bơm an toàn sau `5/5` đợt tưới
```json
{
  "temp": 34.5,
  "hum": 49.0,
  "soil": 18,
  "flame": 4095,
  "fireAlert": false,
  "pir": false,
  "pirLocked": false,
  "rain": false,
  "servoAngle": 15,
  "servoMode": "AUTO",
  "lightOn": false,
  "redLedOn": false,
  "pumpOn": false,
  "pumpLocked": true,
  "pumpCount": 5
}
```

### Kịch bản 6: Cảnh báo cháy khẩn cấp (`flame < 15`, `fireAlert: true`)
```json
{
  "temp": 42.0,
  "hum": 38.0,
  "soil": 40,
  "flame": 4,
  "fireAlert": true,
  "pir": false,
  "pirLocked": false,
  "rain": false,
  "servoAngle": 15,
  "servoMode": "AUTO",
  "lightOn": true,
  "redLedOn": true,
  "pumpOn": false,
  "pumpLocked": false,
  "pumpCount": 0
}
```

---

## 7. Bộ Gói Tin JSON Mẫu cho 5 Lệnh Điều Khiển (`Command`)

> **Cách dùng:** Nhập Topic `smarthome/khoa2026/command`, chọn **JSON**, gửi lần lượt các gói tin dưới đây để kiểm thử mạch ESP32 thật (hoặc kiểm tra khi Web/Mobile bấm nút).

1. **Điều khiển Đèn Trắng (`LIGHT`):**
   - Bật đèn: `{"cmd": "LIGHT", "value": "ON"}`
   - Tắt đèn (khóa tạm PIR 5s): `{"cmd": "LIGHT", "value": "OFF"}`
   - Đảo trạng thái: `{"cmd": "LIGHT", "value": "TOGGLE"}`

2. **Khóa / Mở cảm biến chuyển động PIR (`PIR_LOCK`):**
   - Khóa PIR (tắt đèn + kêu 1 tiếng Bíp dài 300ms): `{"cmd": "PIR_LOCK", "value": "LOCK"}`
   - Mở lại PIR (kêu 2 tiếng Bíp ngắn): `{"cmd": "PIR_LOCK", "value": "UNLOCK"}`
   - Đảo trạng thái: `{"cmd": "PIR_LOCK", "value": "TOGGLE"}`

3. **Điều khiển Giàn phơi Servo SG90 (`SERVO`):**
   - Tự động theo cảm biến mưa: `{"cmd": "SERVO", "value": "AUTO"}`
   - Cưỡng bức đưa đồ ra (`15°`): `{"cmd": "SERVO", "value": "OUT"}`
   - Cưỡng bức thu đồ vào (`165°`): `{"cmd": "SERVO", "value": "IN"}`

4. **Điều khiển Máy bơm tưới cây (`PUMP`):**
   - Tưới ngay 1 đợt (`2.5s`): `{"cmd": "PUMP", "value": "START"}`
   - Dừng bơm khẩn cấp: `{"cmd": "PUMP", "value": "STOP"}`
   - Mở khóa lỗi `[KHOA BOM]` & reset số đợt về `0`: `{"cmd": "PUMP", "value": "UNLOCK"}`

5. **Kiểm tra Còi & Cụm 2 Đèn Đỏ (`ALARM_TEST`):**
   - Bật test báo động (`2s`): `{"cmd": "ALARM_TEST", "value": "ON"}`
   - Tắt test báo động ngay: `{"cmd": "ALARM_TEST", "value": "OFF"}`

---

## 8. Bảng Checklist Nghiệm Thu Kiểm Thử 2 Chiều (Thành viên 2)

| STT | Kịch bản kiểm thử | Hành động thực hiện | Kết quả mong đợi (Pass) |
| :-: | :--- | :--- | :--- |
| **1** | **ESP32 → MQTTX (`Telemetry`)** | Cấp nguồn ESP32 đã điền Wi-Fi 2.4GHz, mở Serial Monitor `115200 baud` & MQTTX | Serial hiện `[MQTT OK]`, MQTTX nhận gói JSON đủ 15 trường mỗi `1s` tại `smarthome/khoa2026/telemetry`. |
| **2** | **Offline-First khi mất Wi-Fi** | Tắt bộ phát Wi-Fi / điền sai mật khẩu Wi-Fi, bấm nút vật lý `IO25` | Đèn sáng/tắt ngay lập tức, đè giữ `1.2s` kêu Bíp khóa PIR, cảm biến mưa/lửa/đất vẫn chạy bình thường. |
| **3** | **MQTTX → ESP32 (`LIGHT` & `PIR_LOCK`)** | Publish `LIGHT ON/OFF` và `PIR_LOCK LOCK/UNLOCK` vào `command` | Đèn bật/tắt ngay; khóa PIR kêu 1 Bíp dài, mở PIR kêu 2 Bíp ngắn; LCD cập nhật `PIR:OFF`; gửi lại `telemetry` ngay. |
| **4** | **MQTTX → ESP32 (`SERVO`)** | Publish `SERVO IN`, `SERVO OUT`, `SERVO AUTO` | Servo quay êm đến `165°`/`15°`, ngắt xung PWM sau `0.6s` không rung rè; `telemetry` cập nhật đúng `servoAngle` & `servoMode`. |
| **5** | **MQTTX → ESP32 (`PUMP` & `ALARM_TEST`)** | Publish `PUMP START`, `PUMP STOP`, `PUMP UNLOCK`, `ALARM_TEST ON` | Bơm chạy `2.5s` kèm nháy 2 đèn đỏ (không bật nếu đang báo cháy); `ALARM_TEST ON` hú còi + chớp đèn đỏ `2s` rồi tự tắt. |
| **6** | **MQTTX → C# → Web/Mobile (Giả lập không cần mạch)** | Publish lần lượt Kịch bản 1 → 6 vào `telemetry` | Backend C# tự chuyển `Online = true`, ghi `EventLogs`, Web hiện Modal báo cháy ở Kịch bản 6, Mobile rung điện thoại. |
