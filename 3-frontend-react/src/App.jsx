import React, { useCallback, useEffect, useState } from 'react';
import {
  sendDeviceCommand,
  fetchDeviceStatus,
  fetchAnalyticsSummary,
  fetchSensorHistory,
  fetchEventLogs,
  getExportCsvUrl
} from './services/apiClient';
import { useSmartHomeHub } from './hooks/useSmartHomeHub';
import ConnectionBadge from './components/ConnectionBadge';
import SensorCards from './components/SensorCards';
import {
  Sprout,
  Flame,
  Lightbulb,
  ShieldAlert,
  CloudRain,
  Sun,
  Power,
  Activity,
  Download,
  Bell,
  Lock,
  Unlock,
  BarChart3,
  Sliders
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('control'); // 'control' | 'dashboard'

  const [summary, setSummary] = useState({
    maxTemp: 0,
    minTemp: 0,
    avgTemp: 0,
    avgHum: 0,
    avgSoil: 0,
    totalPumpRuns: 0,
    estimatedWaterMl: 0,
    totalPirDetections: 0,
    totalRainEvents: 0,
    totalFireAlerts: 0
  });

  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [fireDismissed, setFireDismissed] = useState(false);

  // Nhật ký sự kiện mới từ SignalR -> thêm vào bảng và làm mới thống kê
  const handleEventLog = useCallback((logItem) => {
    setLogs((prev) => [logItem, ...prev.slice(0, 99)]);
    fetchAnalyticsSummary().then(setSummary).catch(() => {});
  }, []);

  // Kết nối SignalR Real-time với Backend C# (sự kiện ReceiveTelemetry mỗi 1 giây)
  const { telemetry, setTelemetry, history, setHistory, hubStatus } = useSmartHomeHub({
    onEventLog: handleEventLog
  });

  // Hết cháy thì cho phép modal cảnh báo hiện lại ở lần cháy kế tiếp
  useEffect(() => {
    if (!telemetry.fireAlert) setFireDismissed(false);
  }, [telemetry.fireAlert]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [st, sum, hist, evLogs] = await Promise.allSettled([
      fetchDeviceStatus(),
      fetchAnalyticsSummary(),
      fetchSensorHistory(25),
      fetchEventLogs('ALL', 100)
    ]);
    if (st.status === 'fulfilled' && st.value) setTelemetry((prev) => ({ ...prev, ...st.value }));
    if (sum.status === 'fulfilled' && sum.value) setSummary(sum.value);
    if (hist.status === 'fulfilled' && Array.isArray(hist.value)) setHistory(hist.value);
    if (evLogs.status === 'fulfilled' && Array.isArray(evLogs.value)) setLogs(evLogs.value);
  }

  async function handleCommand(cmd, value) {
    try {
      const res = await sendDeviceCommand(cmd, value);
      if (res?.latestState) setTelemetry((prev) => ({ ...prev, ...res.latestState }));
    } catch (e) {
      alert('Không thể gửi lệnh! Hãy kiểm tra Backend C# (cổng 5000) đã chạy chưa.');
    }
  }

  const filteredLogs =
    logFilter === 'ALL' ? logs : logs.filter((l) => l.category === logFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* MODAL CẢNH BÁO CHÁY KHẨN CẤP TOÀN MÀN HÌNH */}
      {telemetry.fireAlert && !fireDismissed && (
        <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-pulse">
          <div className="bg-slate-900 border-2 border-red-500 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto mb-4">
              <Flame className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-red-400 mb-2">
              !! CẢNH BÁO PHÁT HIỆN LỬA !!
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Cảm biến lửa hồng ngoại (IO34) ghi nhận chỉ số{' '}
              <span className="font-bold text-red-400">{telemetry.flame} (&lt; 15)</span>.
              Còi báo động (IO19) và Cụm 2 Đèn Đỏ (IO14) đang kích hoạt khẩn cấp!
            </p>
            <button
              onClick={() => setFireDismissed(true)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white transition"
            >
              Đã Xác Nhận Cảnh Báo Trên Màn Hình
            </button>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight">
                Smart Home &amp; Garden IoT
              </h1>
              <p className="text-xs text-slate-400">
                Vietduino ESP32 N16 &bull; C# (.NET 3-Layer) &bull; React &amp; Tailwind
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* HUY HIỆU TRẠNG THÁI MẠCH ESP32 */}
            <ConnectionBadge
              hubStatus={hubStatus}
              online={telemetry.online}
              lastUpdated={telemetry.lastUpdated}
            />

            {/* CHUYỂN TAB ĐIỀU KHIỂN / DASHBOARD */}
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setActiveTab('control')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'control'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Điều Khiển</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  loadInitialData();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Dashboard Thống Kê</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* CỤM 4 THẺ CẢM BIẾN THỜI GIAN THỰC (SignalR ReceiveTelemetry) */}
        <SensorCards
          temp={telemetry.temp}
          hum={telemetry.hum}
          soil={telemetry.soil}
          flame={telemetry.flame}
          fireAlert={telemetry.fireAlert}
          rain={telemetry.rain}
        />

        {/* PHÂN HỆ 1: TAB ĐIỀU KHIỂN TỪ XA */}
        {activeTab === 'control' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* KHỐI 1: ĐÈN TRẮNG PHÒNG KHÁCH & CẢM BIẾN CHUYỂN ĐỘNG PIR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      telemetry.lightOn
                        ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">
                      Đèn Phòng Khách (IO32) &amp; PIR (IO27)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Đồng bộ 2 chiều với Nút bấm vật lý (IO25)
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    telemetry.lightOn
                      ? 'bg-yellow-400/20 text-yellow-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {telemetry.lightOn ? 'ĐÈN ĐANG SÁNG' : 'ĐÈN ĐANG TẮT'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCommand('LIGHT', 'ON')}
                  className={`py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    telemetry.lightOn
                      ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>Bật Đèn Trắng</span>
                </button>
                <button
                  onClick={() => handleCommand('LIGHT', 'OFF')}
                  className={`py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    !telemetry.lightOn
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>Tắt Đèn (Khóa PIR 5s)</span>
                </button>
              </div>

              {/* CHẾ ĐỘ KHÓA / MỞ CẢM BIẾN PIR (KÊU BÍP) */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Cảm biến chuyển động PIR:{' '}
                    <span
                      className={
                        telemetry.pirLocked ? 'text-amber-400' : 'text-emerald-400'
                      }
                    >
                      {telemetry.pirLocked
                        ? 'ĐÃ KHÓA (Chế độ Đi ngủ)'
                        : telemetry.pir
                        ? 'ĐANG CÓ NGƯỜI (PIR: CO)'
                        : 'TỰ ĐỘNG BẬT ĐÈN (AUTO)'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tương đương thao tác đè giữ nút vật lý 1.2 giây (Còi kêu Bíp)
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCommand('PIR_LOCK', telemetry.pirLocked ? 'UNLOCK' : 'LOCK')
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition ${
                    telemetry.pirLocked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {telemetry.pirLocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Mở Lại PIR</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Khóa PIR</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* KHỐI 2: GIÀN PHƠI QUẦN ÁO THÔNG MINH (SERVO SG90 & CẢM BIẾN MƯA) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                    {telemetry.rain ? (
                      <CloudRain className="w-6 h-6" />
                    ) : (
                      <Sun className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-base">
                      Giàn Phơi Thông Minh (Servo IO33)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Góc hiện tại: <b className="text-sky-300">{telemetry.servoAngle}°</b>{' '}
                      ({telemetry.servoAngle > 90 ? 'Đã Thu Đồ' : 'Đang Phơi Đồ'})
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-300">
                  Chế độ: {telemetry.servoMode || 'AUTO'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleCommand('SERVO', 'AUTO')}
                  className={`py-3 px-2 rounded-xl font-bold text-xs transition ${
                    telemetry.servoMode === 'AUTO'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  🤖 Tự Động Theo Mưa
                </button>
                <button
                  onClick={() => handleCommand('SERVO', 'OUT')}
                  className={`py-3 px-2 rounded-xl font-bold text-xs transition ${
                    telemetry.servoMode === 'OUT'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  ☀️ Đưa Đồ Ra (15°)
                </button>
                <button
                  onClick={() => handleCommand('SERVO', 'IN')}
                  className={`py-3 px-2 rounded-xl font-bold text-xs transition ${
                    telemetry.servoMode === 'IN'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  🏠 Thu Đồ Vào (165°)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                Khi ở chế độ <b>Tự Động</b>: Có mưa thật liên tục <b>0.6 giây</b> tự thu vào{' '}
                <b>165°</b>; sau khi lau khô <b>2 giây</b> tự đưa đồ ra <b>15°</b> (tự ngắt xung
                chống rung).
              </div>
            </div>

            {/* KHỐI 3: MÁY BƠM TƯỚI CÂY TỰ ĐỘNG (RELAY IO26 & ĐẤT IO35) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      telemetry.pumpOn
                        ? 'bg-emerald-500/20 text-emerald-300 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">
                      Hệ Thống Tưới Cây (Relay Bơm IO26)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tự tưới khi đất &lt; 30% &bull; Đợt tưới: {telemetry.pumpCount || 0}/5
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    telemetry.pumpLocked
                      ? 'bg-red-500/20 text-red-300'
                      : telemetry.pumpOn
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {telemetry.pumpLocked
                    ? 'ĐÃ KHÓA BƠM'
                    : telemetry.pumpOn
                    ? 'ĐANG TƯỚI...'
                    : 'BƠM NGHỈ'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleCommand('PUMP', 'START')}
                  className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  🚿 Tưới Ngay (2.5s)
                </button>
                <button
                  onClick={() => handleCommand('PUMP', 'STOP')}
                  className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                >
                  🛑 Dừng Bơm
                </button>
                <button
                  onClick={() => handleCommand('PUMP', 'UNLOCK')}
                  className="py-3 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition"
                >
                  🔓 Mở Khóa Bơm
                </button>
              </div>
            </div>

            {/* KHỐI 4: CỤM 2 ĐÈN ĐỎ CẢNH BÁO (IO14) & CÒI BÁO CHÁY (IO19) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      telemetry.redLedOn || telemetry.fireAlert
                        ? 'bg-red-500/25 text-red-400 animate-ping'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">
                      Còi Báo Động (IO19) &amp; 2 Đèn Đỏ (IO14)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Chớp đỏ khi Báo cháy hoặc khi Máy bơm đang chạy
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    telemetry.redLedOn
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {telemetry.redLedOn ? 'ĐÈN ĐỎ: NHÁY' : 'ĐÈN ĐỎ: TẮT'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCommand('ALARM_TEST', 'ON')}
                  className="py-3 rounded-xl bg-red-600/25 hover:bg-red-600/35 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Bell className="w-4 h-4" />
                  <span>Test Còi &amp; 2 Đèn Đỏ (2s)</span>
                </button>
                <button
                  onClick={() => handleCommand('ALARM_TEST', 'OFF')}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Tắt Test Báo Động
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PHÂN HỆ 2: TAB DASHBOARD THỐNG KÊ & NHẬT KÝ */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6">
            {/* 4 THẺ KPI THỐNG KÊ TỔNG HỢP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Thống Kê Nhiệt Độ (°C)</p>
                <p className="text-2xl font-extrabold text-orange-400 mt-1">
                  TB: {summary.avgTemp} °C
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Cao nhất: <b className="text-slate-200">{summary.maxTemp}°C</b> &bull; Thấp
                  nhất: <b className="text-slate-200">{summary.minTemp}°C</b>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Độ Ẩm Trung Bình</p>
                <p className="text-2xl font-extrabold text-sky-400 mt-1">
                  Khí: {summary.avgHum}% &bull; Đất: {summary.avgSoil}%
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Ngưỡng tưới tự động: &lt; 30%
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Tổng Số Lần Bơm Tưới</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {summary.totalPumpRuns} đợt tưới
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Lượng nước ước tính: ~{summary.estimatedWaterMl} ml
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Sự Kiện Tự Động Hóa</p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                  PIR: {summary.totalPirDetections} &bull; Mưa: {summary.totalRainEvents}
                </p>
                <p className="text-xs text-red-400 mt-2">
                  Số lần cảnh báo cháy: {summary.totalFireAlerts}
                </p>
              </div>
            </div>

            {/* BIỂU ĐỒ BIẾN THIÊN THEO THỜI GIAN THỰC */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-base">
                    Biểu Đồ Biến Thiên Nhiệt Độ, Độ Ẩm Khí &amp; Độ Ẩm Đất (25 mẫu gần nhất)
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-orange-400 font-semibold">● Nhiệt độ (°C)</span>
                  <span className="text-sky-400 font-semibold">● Độ ẩm khí (%)</span>
                  <span className="text-emerald-400 font-semibold">● Độ ẩm đất (%)</span>
                </div>
              </div>

              <div className="grid grid-cols-25 gap-1.5 items-end h-44 pt-4 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {history.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                    title={`Nhiệt: ${pt.temp}°C | Khí: ${pt.hum}% | Đất: ${pt.soil}%`}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-32">
                      <div
                        className="w-1.5 bg-orange-400 rounded-t"
                        style={{ height: `${Math.min(100, pt.temp * 2)}%` }}
                      />
                      <div
                        className="w-1.5 bg-sky-400 rounded-t"
                        style={{ height: `${Math.min(100, pt.hum)}%` }}
                      />
                      <div
                        className="w-1.5 bg-emerald-400 rounded-t"
                        style={{ height: `${Math.min(100, pt.soil)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BẢNG NHẬT KÝ HOẠT ĐỘNG & XUẤT FILE EXCEL CSV */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base">
                    Nhật Ký Sự Kiện Hệ Thống (System Audit Logs)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tự động lưu lại mọi thao tác điều khiển và kích hoạt cảm biến
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'BAO_CHAY', 'TUOI_CAY', 'GIAN_PHOI', 'PIR', 'DIEU_KHIEN'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setLogFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          logFilter === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}

                  <a
                    href={getExportCsvUrl()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Báo Cáo Excel (.CSV)</span>
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Thời Gian</th>
                      <th className="py-2.5 px-3">Phân Loại</th>
                      <th className="py-2.5 px-3">Nguồn</th>
                      <th className="py-2.5 px-3">Nội Dung Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLogs.map((item, i) => (
                      <tr key={item.id || i} className="hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-blue-400">
                          [{item.category}]
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{item.source}</td>
                        <td className="py-2.5 px-3 text-slate-100">{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
