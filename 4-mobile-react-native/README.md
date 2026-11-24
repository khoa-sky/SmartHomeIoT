# 📱 ỨNG DỤNG DI ĐỘNG ĐIỀU KHIỂN TỪ XA (`4-mobile-react-native`)

Phân hệ Ứng dụng Di động (**Mobile App**) viết bằng **React Native (Expo)** kết nối trực tiếp thời gian thực (`SignalR` + `REST API`) với **Backend C# ASP.NET Core (`2-backend-csharp`)** để giám sát 4 cảm biến và điều khiển 2 chiều 13 thiết bị trên mạch **Vietduino ESP32**.

---

## 🚀 Hướng dẫn Chạy Nhanh Trên Điện Thoại Thật (iPhone & Android)

1. **Trên Điện thoại (iOS / Android):**
   - Tải ứng dụng **Expo Go** từ App Store hoặc Google Play.
   - Kết nối Điện thoại vào **cùng mạng Wi-Fi** với máy tính đang chạy Backend C#.

2. **Trên Máy tính:**
   ```powershell
   cd C:\SmartHomeIoT\4-mobile-react-native
   npm install
   npx expo start
   ```

3. **Quét mã QR & Kết nối Server C#:**
   - Mở Camera (iPhone) hoặc app **Expo Go** (Android) quét mã QR hiện trên Terminal.
   - Trên màn hình đầu tiên của App Mobile, nhập địa chỉ **IPv4 Wi-Fi của máy tính chạy Backend C#** (ví dụ: `192.168.1.31`) rồi bấm **`Kết Nối`**.
