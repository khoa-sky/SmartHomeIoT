# 📱 ỨNG DỤNG DI ĐỘNG ĐIỀU KHIỂN TỪ XA (`4-mobile-react-native`)

Phân hệ Ứng dụng Di động (**Mobile App**) viết bằng **React Native (Expo SDK 51)** kết nối thời gian thực (`SignalR` + `REST API`) với **Backend C# ASP.NET Core (`2-backend-csharp`)** để giám sát 4 nhóm cảm biến, điều khiển 2 chiều 13 thiết bị trên mạch **Vietduino ESP32**, xem thống kê/nhật ký sự kiện và nhận rung cảnh báo cháy khẩn cấp.

---

## ✨ Các Tính năng Đã Hoàn thiện

1. **Kết nối Wi-Fi LAN & SignalR Thời gian thực (`src/services/mobileApi.js`, `src/components/HeaderBar.js`):**
   - Nhập IP Wi-Fi của máy tính chạy Server C# (ví dụ `192.168.1.31` hoặc `10.0.2.2` cho Android Emulator), có bộ chọn nhanh IP và kiểm tra timeout 5 giây.
   - Hiển thị huy hiệu **`ESP32 ONLINE / CHỜ MQTT`**, đồng hồ đếm thời gian cập nhật gần nhất và tự chuyển sang Offline nếu quá 6 giây không nhận gói tin mới.
2. **Giám sát 4 Thẻ Cảm biến Trực tiếp (`src/components/SensorOverviewGrid.js`):**
   - Nhiệt độ phòng (`DHT20`), Độ ẩm không khí (`DHT20`), Độ ẩm đất vườn (`LM393 IO35` kèm thanh ngưỡng `< 30%` / `>= 40%`), An ninh & Thời tiết (Lửa `IO34`, Mưa `IO23`, Chuyển động `PIR IO27`).
3. **Bảng Điều khiển Cảm ứng 2 Chiều (`src/components/DeviceControlPanels.js`):**
   - **Đèn Trắng (`IO32`) & Khóa PIR (`IO27`):** Bật/Tắt đèn, Khóa/Mở chế độ đi ngủ (còi trên mạch kêu Bíp đồng bộ) kèm Toast thông báo khi tác động nút vật lý `IO25` tại mạch.
   - **Giàn phơi Thông minh (`Servo IO33`):** Thanh trực quan góc `15° / 165°` và 3 nút chế độ `Tự Động` / `Phơi 15°` / `Thu 165°`.
   - **Máy bơm Tưới cây (`Relay IO26`):** Thanh đếm 5 đợt tưới (`pumpCount/5`), cảnh báo khi khóa bảo vệ bơm và 3 nút `Tưới 2.5s` / `Dừng bơm` / `Mở khóa`.
   - **Còi (`IO19`) & 2 Đèn Đỏ (`IO14`):** Nút `Test còi & đèn (2s)` và `Tắt test`.
4. **Cảnh báo Cháy Khẩn cấp & Rung Điện Thoại (`src/components/FireAlertModal.js`):**
   - Tự động bật Modal cảnh báo đỏ và kích hoạt **Rung điện thoại (`Vibration.vibrate`)** liên hồi khi `fireAlert == true`, cho phép tạm tắt rung hoặc xác nhận đóng cảnh báo.
5. **Tab Thống Kê, Biểu Đồ & Nhật Ký (`src/components/AnalyticsTab.js`) & Tab Kết Nối (`src/components/SettingsTab.js`):**
   - Hiển thị 4 thẻ KPI tổng hợp, biểu đồ 18 mẫu cảm biến gần nhất, bộ lọc Nhật ký sự kiện (`EventLogs`), kéo để làm mới (`Pull-to-Refresh`), chuyển đổi Dark/Light mode và tra cứu nhanh sơ đồ chân ESP32.

---

## 🚀 Hướng dẫn Chạy Nhanh Trên Điện Thoại Thật (iPhone & Android)

1. **Trên Điện thoại (iOS / Android):**
   - Tải ứng dụng **Expo Go** từ App Store hoặc Google Play.
   - Kết nối Điện thoại vào **cùng mạng Wi-Fi** với máy tính đang chạy Backend C# (`2-backend-csharp/SmartHome.Api` tại cổng `5000`).

2. **Trên Máy tính:**
   ```powershell
   cd C:\SmartHomeIoT\4-mobile-react-native
   npm install
   npx expo start
   ```

3. **Quét mã QR & Kết nối Server C#:**
   - Mở Camera (iPhone) hoặc app **Expo Go** (Android) quét mã QR hiện trên Terminal.
   - Trên màn hình đầu tiên của App Mobile, nhập địa chỉ **IPv4 Wi-Fi của máy tính chạy Backend C#** (ví dụ: `192.168.1.31`) rồi bấm **`Kết Nối`**.
