# 📊 BÁO CÁO TIẾN ĐỘ CÔNG VIỆC & ĐẶC TẢ YÊU CẦU CHỨC NĂNG SẢN PHẨM
**Dự án:** Hệ thống Ngôi nhà & Khu vườn Thông minh (Smart Home & Smart Garden IoT)  
**Nền tảng công nghệ:** Vietduino ESP32 (C/C++) • MQTT (EMQX / MQTTX) • C# ASP.NET Core (3-Layer + SignalR) • React + Vite + Tailwind CSS

---

## PHẦN 1: TIẾN ĐỘ CÔNG VIỆC TOÀN DỰ ÁN (PROJECT PROGRESS TRACKER)

### 1.1. Bảng Tổng hợp Tiến độ theo 5 Giai đoạn

| Giai đoạn | Hạng mục chính | Phụ trách | Trạng thái | Tiến độ | Ghi chú hiện trạng |
| :-: | :--- | :---: | :---: | :-: | :--- |
| **Giai đoạn 1** | **Phần cứng (13 thiết bị) & Firmware Offline tại mạch** | Mảng Nhúng (ESP32) | ✅ **Hoàn thành** | **100%** | Đã lắp mạch chuẩn trên Breadboard 830 lỗ, xử lý xong 100% nhiễu EMI máy bơm, rung Servo, lọc nhiễu mưa & nút bấm 2 chế độ. |
| **Giai đoạn 2** | **Khởi tạo Git Monorepo & Backend C# (Kiến trúc 3 Lớp)** | Mảng Backend (C#) | 🟢 **Đã dựng khung & Chạy tốt** | **85%** | Đã dựng xong `Controllers`, `SignalR Hub`, `MqttWorkerService`, `Repository`. Cần nhóm test mở rộng & tinh chỉnh trong tuần này. |
| **Giai đoạn 3** | **Giao diện Web / Mobile Điều khiển từ xa &Kết nối Wi-Fi** | Mảng Frontend (React) + Nhúng | 🟡 **Đang triển khai (Mục tiêu Tuần này)** | **80%** | Đã có giao diện điều khiển & code ESP32 Wi-Fi MQTT. Trong tuần này cần nạp Wi-Fi thực tế, test qua `MQTTX` và đồng bộ 2 chiều. |
| **Giai đoạn 4** | **Dashboard Thống kê, Biểu đồ Lịch sử & Xuất Báo cáo Excel** | Mảng Frontend + Backend | ⏳ **Kế hoạch Tuần tiếp theo** | **70%** | Đã có khung KPI, biểu đồ cột và xuất file `.CSV`. Sẽ nâng cấp thêm bộ lọc theo thời gian & biểu đồ chuyên sâu sau khi xong GĐ 3. |
| **Giai đoạn 5** | **Kiểm thử Tích hợp Toàn diện & Chuẩn bị Bảo vệ Đồ án** | Cả nhóm | 📅 **Sắp tới** | **0%** | Chạy thử 5 kịch bản demo thực tế, quay video dự phòng, hoàn thiện slide & báo cáo Word. |

---

### 1.2. Chi tiết Các Công việc ĐÃ HOÀN THÀNH (`[x]`) và CẦN LÀM (`[ ]`)

#### ✅ A. Hạng mục Đã Hoàn Thành 100%
- [x] **Lắp đặt & Quy hoạch Breadboard (14 mục dây cắm):** Phân chia 3 khu vực nguồn `5V / GND`, cầu nối dọc cột âm `(-)` từ Hàng 25 xuống Hàng 55, tách nguồn máy bơm sang `3V3` chống sụt áp màn hình LCD.
- [x] **Hiệu chuẩn 6 Cảm biến thực tế:**
  - [x] Cảm biến Nhiệt/Ẩm `DHT20` (`0x38`) & Màn hình `LCD1602` (`0x27`) trên bus I2C `50kHz`.
  - [x] Cảm biến Lửa `MKE-S04` (`IO34`, Active-LOW): Chốt ngưỡng cháy `< 15`, xác nhận lửa liên tục `1 giây`, giữ báo động `3 giây`.
  - [x] Cảm biến Độ ẩm đất `LM393` (`IO35`): Khô `< 30%` (xác nhận 3 lần liên tiếp) bật bơm, ẩm `>= 40%` reset bộ đếm.
  - [x] Cảm biến Nước mưa `HS0217V` (`IO23`): Đã chỉnh biến trở nhạy nước + bộ lọc xác nhận mưa `3 lần đọc liên tiếp (0.6 giây)` chống nhiễu khi đụng tay vào dây, chờ khô `2 giây` mới đưa đồ ra.
  - [x] Cảm biến Chuyển động `PIR HC-SR501` (`IO27`): Phát hiện người bước vào tự bật Đèn Trắng và giữ sáng liên tục.
- [x] **Hoàn thiện 5 Cơ cấu Chấp hành & Nút bấm thông minh:**
  - [x] Đèn Trắng `MKE-M01` (`IO32`): Bật/tắt hoàn toàn không bị sáng mờ.
  - [x] Nút bấm vật lý 4 chân (`IO25`): **Bấm nhả ngắn (`< 1.2s`)** để Bật/Tắt Đèn Trắng (khóa tạm PIR 5s khi tắt); **Ấn đè giữ (`>= 1.2s`)** kêu còi Bíp để Khóa/Mở cảm biến tự động PIR.
  - [x] Cụm 2 Đèn LED Đỏ 2 chân (`IO14`) + Còi `Buzzer` (`IO19`): Chớp đôi rực rỡ theo nhịp còi khi báo cháy và chớp mỗi `0.25s` khi máy bơm đang chạy.
  - [x] Động cơ `Servo SG90` (`IO33`): Góc phơi đồ `15°`, góc thu đồ `165°` (lùi khỏi chốt chặn cơ khí) và tự ngắt xung PWM sau `0.6 giây` chống rung rè.
  - [x] `Relay MKE-M05` (`IO26`) + Máy bơm chìm: Tưới theo đợt (`2.5s` bơm / `12s` chờ ngấm), khóa bơm an toàn sau tối đa `5 lần` tưới mà đất chưa ẩm, khóa chống nhiễu EMI trong lúc bơm và `1.5s` sau khi tắt bơm.
- [x] **Khởi tạo Codebase Git Monorepo (`C:\SmartHomeIoT`):** Đã tạo đầy đủ tài liệu `docs/`, `1-firmware-esp32/`, `2-backend-csharp/` (3-Layer), `3-frontend-react/` và file `SmartHomeIoT.sln`.

---

#### 🎯 B. Mục tiêu Cần Hoàn Thành Ngay Trong Tuần Này (Sprint 1: Kết nối Wi-Fi + Giai đoạn 2 & 3)
- [ ] **Công việc 1 (Quản lý Git - Trưởng nhóm):** Push kho mã nguồn `C:\SmartHomeIoT` lên GitHub, phân quyền cho các thành viên trong nhóm `git clone` về máy và tạo nhánh làm việc (`feat/esp32-firmware`, `feat/backend-csharp`, `feat/frontend-react`).
- [ ] **Công việc 2 (Mảng Nhúng ESP32 & MQTTX):**
  - [ ] Điền thông tin `WIFI_SSID` và `WIFI_PASSWORD` (băng tần 2.4GHz) vào file `SmartHome_ESP32_WiFi_MQTT.ino` và nạp xuống bo mạch Vietduino ESP32.
  - [ ] Mở phần mềm **`MQTTX`** kết nối tới `broker.emqx.io:1883`, kiểm tra gói tin JSON tại Topic `smarthome/khoa2026/telemetry` gửi lên mỗi giây.
  - [ ] Dùng **`MQTTX`** bắn thử 5 lệnh JSON vào Topic `smarthome/khoa2026/command` để xác nhận mạch thật bật/tắt Đèn, Khóa PIR kêu Bíp, quay Servo và bật Máy bơm chính xác.
- [ ] **Công việc 3 (Mảng Backend C# - Giai đoạn 2):**
  - [ ] Chạy kiểm thử `SmartHome.Api` (`http://localhost:5000`), kiểm tra `MqttWorkerService` tự động bắt gói tin từ ESP32 / `MQTTX`.
  - [ ] Kiểm tra việc tự động sinh Nhật ký sự kiện (`EventLogs`) khi có thay đổi trạng thái (Bật đèn, Khóa PIR, Có mưa, Bật bơm, Báo cháy).
  - [ ] Kiểm thử toàn bộ REST API điều khiển (`POST /api/device/command`) và SignalR Hub (`/hubs/smarthome`).
- [ ] **Công việc 4 (Mảng Frontend React & Tailwind - Giai đoạn 3):**
  - [ ] Chạy giao diện React (`http://localhost:5173`), kết nối SignalR nhận thông số cảm biến nhảy số theo thời gian thực.
  - [ ] Hoàn thiện và kiểm thử **Đồng bộ 2 chiều (`2-Way Sync`)** trên cả Laptop và Điện thoại (cùng mạng Wi-Fi): Bấm nút trên mạch $\rightarrow$ Web nhảy theo; bấm nút trên Web $\rightarrow$ Mạch thực thi ngay.

---

#### 📈 C. Mục tiêu Tuần Tiếp Theo (Sprint 2: Hoàn thiện Giai đoạn 4 & Giai đoạn 5)
- [ ] **Hoàn thiện Dashboard Thống kê & Quản lý (Giai đoạn 4):**
  - [ ] Nâng cấp biểu đồ biến thiên thời gian thực (Nhiệt độ, Độ ẩm không khí, Độ ẩm đất) và các thẻ chỉ số KPI (`Max`, `Min`, `Trung bình`, lượng nước tưới ước tính).
  - [ ] Hoàn thiện bộ lọc Nhật ký sự kiện theo từng nhóm (`Báo cháy`, `Tưới cây`, `Giàn phơi`, `PIR`, `Điều khiển từ xa`) và kiểm tra tính năng xuất file báo cáo Excel (`.CSV`).
- [ ] **Kiểm thử Tổng thể & Đóng gói Báo cáo (Giai đoạn 5):**
  - [ ] Chạy nghiệm thu 5 kịch bản demo liên hoàn trước ngày bảo vệ.

---

## PHẦN 2: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CỦA SẢN PHẨM (FUNCTIONAL REQUIREMENTS)

Bảng dưới đây liệt kê toàn bộ các **Yêu cầu Chức năng (`FR`)** mà sản phẩm cuối cùng phải đáp ứng. Đây là tiêu chuẩn để các thành viên trong nhóm code và kiểm thử nghiệm thu:

### 2.1. Nhóm FR-01: Yêu cầu Chức năng tại Bo mạch Phần cứng (`ESP32 Embedded Firmware`)

| Mã YC | Tên Chức năng | Mô tả Chi tiết Yêu cầu Kỹ thuật | Tiêu chí Nghiệm thu (Pass/Fail) |
| :-: | :--- | :--- | :--- |
| **FR-01.1** | **Giám sát môi trường & Hiển thị LCD tại chỗ** | Đọc nhiệt độ (`°C`), độ ẩm khí (`%`) từ `DHT20` mỗi `1.5s` và độ ẩm đất (`%`) mỗi `0.5s`. Hiển thị trực tiếp lên màn hình `LCD1602` dòng 1 (`T:..C Am:..%`) và dòng 2 (`Dat:..% TT`). | Màn hình LCD hiển thị rõ nét, không bị rác chữ hay treo khi máy bơm đóng/ngắt. |
| **FR-01.2** | **Báo cháy khẩn cấp đa kênh tại mạch** | Khi cảm biến lửa `IO34 < 15` liên tục trong `1.0s`: Kích hoạt Còi `IO19` kêu ngắt quãng nhanh, Cụm 2 Đèn Đỏ `IO14` chớp đồng bộ theo còi, LCD hiện `"!! CANH BAO !! / PHAT HIEN LUA!"`, ngắt máy bơm ngay nếu đang bơm. | Ban ngày không báo giả; khi dí bật lửa/đèn sát cảm biến 1 giây thì hú còi + chớp 2 đèn đỏ ngay lập tức. |
| **FR-01.3** | **Chiếu sáng thông minh & Nút bấm 2 chế độ** | - Khi `!khoaPIR`: Có người đi qua (`PIR:CO`) -> Đèn Trắng `IO32` tự bật sáng và giữ sáng luôn.<br>- **Bấm nhả ngắn nút `IO25` (`< 1.2s`):** Bật/Tắt Đèn Trắng (khi tắt sẽ khóa tạm PIR 5 giây).<br>- **Ấn đè giữ nút `IO25` (`>= 1.2s`):** Đảo chế độ `khoaPIR` (Khóa PIR: tắt đèn + kêu 1 tiếng Bíp dài `300ms`; Mở lại PIR: kêu 2 tiếng Bíp ngắn). | Quơ tay đèn tự sáng giữ nguyên; bấm nhả tắt đèn; đè giữ 1.2s nghe tiếng Bíp rõ ràng và LCD đổi sang `PIR:OFF`. |
| **FR-01.4** | **Giàn phơi tự động theo mưa chống giật** | - Khi cảm biến mưa `IO23 == LOW` liên tục `3 lần đọc (0.6s)` -> Xác nhận mưa, quay Servo `IO33` về `165°` (Thu đồ).<br>- Khi khô ráo liên tục `2.0s` -> Quay Servo ra `15°` (Phơi đồ).<br>- Sau khi quay `0.6s` phải ngắt xung giữ PWM (`ledcWrite(0)`). | Đụng nhẹ vào dây Servo không quay nhầm; nhỏ nước lên tấm kẽm 0.6s Servo thu đồ êm, không kêu rè rè. |
| **FR-01.5** | **Tưới cây tự động theo đợt & Bảo vệ bơm** | - Khi đất khô `< 30%` trong 3 lần đo liên tiếp -> Bật Relay Bơm `IO26` trong `2.5s` + Chớp 2 Đèn Đỏ `IO14` mỗi `0.25s`, sau đó nghỉ `12s` chờ nước ngấm.<br>- Nếu tưới đủ `5 đợt` mà đất chưa lên `>= 40%` -> Tự động khóa bơm (`khoaBom = true`, LCD hiện `LOI:DAT`). | Máy bơm chạy đúng 2.5s rồi nghỉ 12s; chớp 2 đèn đỏ khi bơm; tự khóa sau 5 lần nếu rút cảm biến đất ra ngoài. |
| **FR-01.6** | **Kết nối Wi-Fi / MQTT Không chặn (`Offline-First`)** | Kết nối Wi-Fi và MQTT Broker ở chế độ chạy ngầm. Gửi gói tin JSON `telemetry` mỗi `1s` (hoặc ngay khi có sự kiện đổi trạng thái) và nhận lệnh tại `command`. | Khi tắt Wi-Fi hoặc mất mạng, nút bấm vật lý và mọi cảm biến trên mạch vẫn phản hồi tức thì 100%, không bị đơ. |

---

### 2.2. Nhóm FR-02: Yêu cầu Chức năng Giao diện Điều khiển Từ xa (`Web & Mobile Remote Control`)

| Mã YC | Tên Chức năng | Mô tả Chi tiết Yêu cầu Kỹ thuật | Tiêu chí Nghiệm thu (Pass/Fail) |
| :-: | :--- | :--- | :--- |
| **FR-02.1** | **Hiển thị Trạng thái Kết nối Mạch (`Online/Offline`)** | Hiển thị huy hiệu `ESP32 ONLINE` (Xanh) khi nhận được gói tin MQTT đều đặn, và tự chuyển sang `CHỜ DỮ LIỆU / OFFLINE` (Cam/Đỏ) nếu quá 6 giây mạch không phản hồi. | Rút nguồn ESP32 sau 6s Web báo Offline; cắm nguồn lại Web tự báo Online màu xanh. |
| **FR-02.2** | **Giám sát 4 Thẻ Cảm biến Thời gian thực** | Hiển thị trực tiếp Nhiệt độ (`°C`), Độ ẩm không khí (`%`), Độ ẩm đất (`%` kèm thanh tiến trình màu) và Trạng thái Lửa / Thời tiết mưa qua `SignalR`. | Nhiệt độ, độ ẩm, đất, mưa trên Web khớp 100% với màn hình LCD1602 và Serial Monitor. |
| **FR-02.3** | **Điều khiển Đèn Trắng & Khóa/Mở PIR 2 Chiều** | - Có nút `Bật Đèn Trắng` / `Tắt Đèn Trắng` từ xa.<br>- Có nút `Khóa PIR (Chế độ Đi ngủ)` / `Mở Lại PIR` từ xa.<br>- Đồng bộ 2 chiều: Bấm nút vật lý `IO25` trên mạch thì trạng thái trên Web/Mobile tự nhảy theo ngay lập tức. | Bấm Khóa PIR trên Web/Điện thoại -> Còi trên mạch kêu Bíp dài và LCD hiện `PIR:OFF`. Bấm nút trên mạch -> Web tự đổi màu nút. |
| **FR-02.4** | **Điều khiển Giàn phơi Servo 3 Chế độ** | Cung cấp 3 nút chế độ: `Tự Động Theo Mưa (AUTO)`, `Cưỡng Bức Đưa Đồ Ra (15°)`, `Cưỡng Bức Thu Đồ Vào (165°)`. Hiển thị góc hiện tại của Servo trên giao diện. | Bấm `Thu Đồ Vào (165°)` trên Web -> Servo trên mạch quay ngay về 165°; bấm `Tự Động` -> Servo quay lại theo cảm biến mưa. |
| **FR-02.5** | **Điều khiển Máy bơm & Mở khóa Lỗi từ xa** | Cung cấp 3 nút: `Tưới Ngay (2.5s)`, `Dừng Bơm`, và `Mở Khóa Bơm` (để reset trạng thái `khoaBom` từ xa sau khi châm thêm nước). Hiển thị số đợt tưới hiện tại (`0/5`). | Bấm `Tưới Ngay` trên Web -> Máy bơm trên mạch chạy 2.5s và 2 Đèn Đỏ chớp nháy. |
| **FR-02.6** | **Cảnh báo Cháy Khẩn cấp & Test Báo động từ xa** | - Khi `fireAlert == true`: Tự động bung hộp thoại Đỏ chớp nháy toàn màn hình trên Web & Điện thoại.<br>- Có nút `Test Còi & 2 Đèn Đỏ (2s)` để kiểm tra hệ thống báo động từ xa. | Khi đốt lửa gần cảm biến -> Màn hình Web đỏ rực cảnh báo ngay. Khi bấm nút `Test Còi & 2 Đèn Đỏ` -> Mạch kêu bíp và chớp đèn đỏ 2 giây. |

---

### 2.3. Nhóm FR-03: Yêu cầu Chức năng Dashboard Quản lý & Thống kê (`Analytics Dashboard`)

| Mã YC | Tên Chức năng | Mô tả Chi tiết Yêu cầu Kỹ thuật | Tiêu chí Nghiệm thu (Pass/Fail) |
| :-: | :--- | :--- | :--- |
| **FR-03.1** | **Thẻ Thống kê Tổng hợp (`KPI Summary Cards`)** | Tính toán và hiển thị: Nhiệt độ `Cao nhất (Max) / Thấp nhất (Min) / Trung bình (Avg)`, Độ ẩm khí & đất trung bình, Tổng số đợt máy bơm đã tưới, Lượng nước ước tính (`ml`), Số lần phát hiện người (`PIR`), Số lần mưa, Số lần báo cháy. | Các con số thống kê tự động tăng lên chính xác mỗi khi có sự kiện phát sinh. |
| **FR-03.2** | **Biểu đồ Biến thiên Môi trường Thời gian thực** | Vẽ biểu đồ trực quan so sánh sự biến thiên của Nhiệt độ (`°C`), Độ ẩm không khí (`%`) và Độ ẩm đất (`%`) qua các mốc thời gian gần nhất. | Biểu đồ tự động cập nhật thêm cột/điểm mới khi dữ liệu từ mạch gửi về mà không cần tải lại trang. |
| **FR-03.3** | **Bảng Nhật ký Hoạt động (`System Audit Logs`) & Bộ lọc** | Tự động ghi lại thời gian, phân loại (`[BAO_CHAY]`, `[TUOI_CAY]`, `[GIAN_PHOI]`, `[PIR]`, `[DIEU_KHIEN]`), nguồn kích hoạt và nội dung chi tiết. Có thanh nút lọc nhanh theo từng loại sự kiện. | Mọi thao tác bấm nút trên Web hoặc cảm biến kích hoạt trên mạch đều xuất hiện thành dòng lịch sử mới trên đầu bảng. |
| **FR-03.4** | **Xuất Báo cáo Thống kê ra File Excel (`.CSV`)** | Cung cấp nút `Xuất Báo Cáo Excel (.CSV)` tải về file tổng hợp toàn bộ Nhật ký sự kiện và Lịch sử đo đạc cảm biến (định dạng `UTF-8 with BOM`). | Tải file `.csv` về mở bằng Microsoft Excel hiển thị rõ ràng, không bị lỗi font chữ tiếng Việt có dấu. |

---

## PHẦN 3: YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

1. **Hiệu năng & Độ trễ Thời gian thực (`Real-time Latency`):**
   - Thời gian từ lúc bấm nút trên giao diện Web/Mobile đến khi thiết bị trên mạch ESP32 thực thi phải đạt **`< 200ms`** (trong mạng nội bộ / Broker ổn định).
2. **Độ tin cậy & Hoạt động Độc lập (`Offline-First Reliability`):**
   - Mạch ESP32 không được phép sử dụng vòng lặp chặn (`blocking while`) khi chờ Wi-Fi hoặc MQTT. Khi mất kết nối Server, 100% tính năng tự động tại mạch (Báo cháy, Tưới cây, Thu đồ, Nút bấm, PIR, LCD) phải hoạt động bình thường.
3. **Tương thích Đa thiết bị (`Responsive Web & Mobile UI`):**
   - Giao diện React + Tailwind CSS phải hiển thị tốt trên cả màn hình rộng của **Laptop (`1920x1080`)** lẫn màn hình dọc của **Điện thoại di động (`375x812`)** để điều khiển cầm tay từ xa.
4. **Tính Dễ Cài Đặt & Làm Việc Nhóm (`Zero-Config Portability`):**
   - Bất kỳ thành viên nào trong nhóm `git clone` dự án về máy chỉ cần chạy `dotnet run` và `npm install && npm run dev` là hệ thống tự động tạo kho dữ liệu cục bộ (`App_Data/smarthome_store.json`) và chạy ngay mà không cần cấu hình SQL Server phức tạp.

