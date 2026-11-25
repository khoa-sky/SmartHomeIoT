# 🤖 QUY TẮC BẮT BUỘC CHO AI AGENT TRONG DỰ ÁN SMART HOME & GARDEN IOT (`AGENTS.md`)

File `AGENTS.md` này là **Workspace Rule tự động kích hoạt (`Always-On Rule`)** cho mọi AI Agent (Antigravity, Cursor, Copilot, Claude Code) khi bất kỳ thành viên nào trong nhóm mở thư mục dự án `SmartHomeIoT`.

---

## 1. BẮT BUỘC ĐỌC VÀ ÁP DỤNG CÁC SKILL TRONG `.agents/skills/`

Khi thành viên trong nhóm yêu cầu code, chỉnh sửa, thiết kế hoặc tối ưu giao diện ở **`3-frontend-react/` (Web React + Tailwind CSS)** hoặc **`4-mobile-react-native/` (App Mobile React Native Expo)**, AI Agent **BẮT BUỘC** phải đọc (`read_file`) các file `SKILL.md` sau trước khi viết code:

1. **Thiết kế thẩm mỹ & Bố cục UI (`frontend-design`):**
   - Đường dẫn: `.agents/skills/frontend-design/SKILL.md`
   - Áp dụng khi: Tạo mới hoặc làm đẹp các thẻ cảm biến, bảng điều khiển thiết bị, biểu đồ thống kê Dashboard, Modal cảnh báo cháy khẩn cấp.
2. **Tiêu chuẩn Trải nghiệm Người dùng & Giao diện Web/Mobile (`web-design-guidelines`):**
   - Đường dẫn: `.agents/skills/web-design-guidelines/SKILL.md`
   - Áp dụng khi: Kiểm tra khả năng bấm cảm ứng (Touch targets), độ tương phản màu sắc, trạng thái Loading/Active/Online/Offline và bố cục Responsive.
3. **Tối ưu Hiệu năng React (`vercel-react-best-practices`):**
   - Đường dẫn: `.agents/skills/vercel-react-best-practices/SKILL.md`
   - Áp dụng khi: Viết hoặc tối ưu React Hooks (`useEffect`, `useState`, `useRef`), xử lý luồng dữ liệu thời gian thực `SignalR` mỗi 1 giây mà không gây re-render dư thừa.

---

## 2. BẮT BUỘC TUÂN THỦ PHẠM VI FILE CỦA TỪNG THÀNH VIÊN & HỢP ĐỒNG DỮ LIỆU

Trước khi sửa bất kỳ file nào hoặc chạy lệnh `git commit`, AI Agent phải kiểm tra `docs/TEAM_WORKFLOW_AND_GIT_RULES.md` và `docs/MQTT_API_CONTRACT.md`:

- **Nhóm trưởng (Nhánh `feat/backend-csharp` / `master`):** Phụ trách `2-backend-csharp/`, `docs/`, `SmartHomeIoT.sln`.
- **Thành viên 2 (Nhánh `feat/esp32-wifi-mqtt`):** Chỉ sửa trong `1-firmware-esp32/` và tài liệu phần cứng/MQTT.
- **Thành viên 3 (Nhánh `feat/frontend-web-react`):** Chỉ sửa trong `3-frontend-react/`.
- **Thành viên 4 (Nhánh `feat/mobile-react-native`):** Chỉ sửa trong `4-mobile-react-native/`.
- **Giữ nguyên tên 15 trường JSON `Telemetry` và 5 lệnh `Command` (`LIGHT`, `PIR_LOCK`, `SERVO`, `PUMP`, `ALARM_TEST`)** theo đúng `docs/MQTT_API_CONTRACT.md` để 4 phân hệ luôn đồng bộ 100%.
