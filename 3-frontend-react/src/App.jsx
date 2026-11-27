import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import {
  SIGNALR_HUB_URL,
  fetchServerRootInfo,
  fetchDeviceStatus,
  fetchConnectionInfo,
  sendDeviceCommand,
  fetchAnalyticsSummary,
  fetchSensorHistory,
  fetchEventLogs,
  clearEventLogs
} from './services/apiClient';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SensorOverviewGrid from './components/SensorOverviewGrid';
import {
  LightingControlCard,
  ClotheslineControlCard,
  GardenControlCard,
  SecurityControlCard
} from './components/DeviceControlPanels';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  X
} from 'lucide-react';

// Phát tiếng còi cảnh báo cháy qua Web Audio API
function playBrowserAlarmBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(860, ctx.currentTime);
    osc.frequency.setValueAtTime(640, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
    setTimeout(() => ctx.close().catch(() => {}), 350);
  } catch {
    // Trình duyệt chưa tương tác âm thanh
  }
}

export default function App() {
  // Quản lý Light / Dark Mode lưu trong localStorage (mặc định Light Mode theo Aura Home)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem('smarthome_theme');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#151613' : '#F6F5F0');
    }
    try {
      window.localStorage.setItem('smarthome_theme', theme);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [lanIp, setLanIp] = useState('192.168.1.31');
  const [connMeta, setConnMeta] = useState({
    brokerConnected: false,
    brokerHost: 'broker.emqx.io',
    brokerPort: 1883,
    telemetryTopic: 'smarthome/khoa2026/telemetry',
    commandTopic: 'smarthome/khoa2026/command',
    lastPacketReceived: null
  });

  const [telemetry, setTelemetry] = useState({
    temp: 32.2,
    hum: 66,
    soil: 38,
    flame: 52,
    fireAlert: false,
    pir: false,
    pirLocked: false,
    rain: false,
    servoAngle: 15,
    servoMode: 'AUTO',
    lightOn: false,
    redLedOn: false,
    pumpOn: false,
    pumpLocked: false,
    pumpCount: 0,
    online: false,
    lastUpdated: null
  });

  const [summary, setSummary] = useState({
    maxTemp: 33.1,
    minTemp: 31.5,
    avgTemp: 32.3,
    avgHum: 66.5,
    avgSoil: 39.0,
    totalPumpRuns: 0,
    estimatedWaterMl: 0,
    totalPirDetections: 0,
    totalRainEvents: 0,
    totalFireAlerts: 0
  });

  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);

  const [fireDismissed, setFireDismissed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pendingCmd, setPendingCmd] = useState(null);
  const [toast, setToast] = useState(null);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [confirmClearModal, setConfirmClearModal] = useState(false);

  const prevTelemetryRef = useRef(null);
  const toastTimerRef = useRef(null);

  function showToast(message, tone = 'default') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, tone, id: Date.now() });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  useEffect(() => {
    loadInitialData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveTelemetry', (data) => {
      const prev = prevTelemetryRef.current;
      if (prev) {
        if (prev.lightOn !== data.lightOn) {
          showToast(
            data.lightOn
              ? 'Đèn phòng khách (IO32) đã bật sáng'
              : 'Đèn phòng khách (IO32) đã tắt',
            'accent'
          );
        } else if (prev.pirLocked !== data.pirLocked) {
          showToast(
            data.pirLocked
              ? 'Đã khóa cảm biến PIR (Chế độ ngủ)'
              : 'Đã mở khóa cảm biến PIR tự động',
            'success'
          );
        } else if (prev.rain !== data.rain) {
          showToast(
            data.rain
              ? 'Phát hiện trời mưa — Giàn phơi tự động thu vào (165°)'
              : 'Trời đã khô ráo — Giàn phơi đưa ra ngoài (15°)',
            'warning'
          );
        }
      }
      prevTelemetryRef.current = data;

      setTelemetry(data);
      setConnMeta((c) => ({
        ...c,
        brokerConnected: true,
        lastPacketReceived: data.lastUpdated || new Date().toISOString()
      }));

      if (!data.fireAlert) {
        setFireDismissed(false);
      }

      setHistory((prevHist) => {
        const next = [
          ...prevHist,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            temp: data.temp,
            hum: data.hum,
            soil: data.soil
          }
        ];
        return next.slice(-30);
      });
    });

    connection.on('NewEventLog', (logItem) => {
      setLogs((prevLogs) => [logItem, ...prevLogs.slice(0, 149)]);
      fetchAnalyticsSummary().then(setSummary).catch(() => {});
    });

    connection.start().catch(() => {});
    return () => {
      connection.stop();
    };
  }, []);

  // Phát chuông báo cháy trên trình duyệt khi fireAlert === true
  useEffect(() => {
    if (!telemetry.fireAlert || fireDismissed || !soundEnabled) return;
    playBrowserAlarmBeep();
    const timer = setInterval(() => {
      playBrowserAlarmBeep();
    }, 950);
    return () => clearInterval(timer);
  }, [telemetry.fireAlert, fireDismissed, soundEnabled]);

  async function loadInitialData() {
    try {
      const [rootInfo, st, conn, sum, hist, evLogs] = await Promise.all([
        fetchServerRootInfo(),
        fetchDeviceStatus().catch(() => null),
        fetchConnectionInfo().catch(() => null),
        fetchAnalyticsSummary().catch(() => null),
        fetchSensorHistory(30).catch(() => []),
        fetchEventLogs('ALL', 120).catch(() => [])
      ]);

      if (rootInfo?.lanIpAddress && rootInfo.lanIpAddress !== '127.0.0.1') {
        setLanIp(rootInfo.lanIpAddress);
      } else if (
        typeof window !== 'undefined' &&
        window.location.hostname &&
        window.location.hostname !== 'localhost'
      ) {
        setLanIp(window.location.hostname);
      }

      if (st) {
        prevTelemetryRef.current = st;
        setTelemetry(st);
      }
      if (conn) setConnMeta((prev) => ({ ...prev, ...conn }));
      if (sum) setSummary(sum);
      if (Array.isArray(hist)) setHistory(hist);
      if (Array.isArray(evLogs)) setLogs(evLogs);
    } catch {
      // Đợi Backend C# khởi động
    }
  }

  async function handleCommand(cmd, value, label) {
    const key = `${cmd}:${value}`;
    setPendingCmd(key);
    try {
      const res = await sendDeviceCommand(cmd, value);
      if (res?.latestState) {
        prevTelemetryRef.current = res.latestState;
        setTelemetry(res.latestState);
      }
      showToast(label || `Đã thực thi ${cmd}: ${value}`, 'success');
    } catch (err) {
      showToast(
        err.message ||
          'Chưa kết nối được Backend C# (cổng 5000). Hãy khởi động Server C# trước.',
        'danger'
      );
    } finally {
      setPendingCmd(null);
    }
  }

  async function handleConfirmClearLogs() {
    try {
      const res = await clearEventLogs();
      if (Array.isArray(res?.logs)) setLogs(res.logs);
      if (res?.summary) setSummary(res.summary);
      setConfirmClearModal(false);
      showToast('Đã đặt lại nhật ký sự kiện và bộ đếm thống kê.', 'success');
    } catch {
      showToast('Không thể đặt lại nhật ký. Hãy kiểm tra kết nối Server C#.', 'danger');
    }
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
      className="min-h-screen flex transition-colors duration-200"
    >
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(id) => {
          setActiveNav(id);
          if (id === 'analytics') loadInitialData();
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        online={telemetry.online}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeNav={activeNav}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNetworkModal={() => setNetworkModalOpen(true)}
          telemetry={telemetry}
          lanIp={lanIp}
          recentLogs={logs}
          onSelectNav={(id) => {
            setActiveNav(id);
            if (id === 'analytics') loadInitialData();
          }}
        />

        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* OVERVIEW VIEW: 4 SENSOR CARDS + ALL 4 DEVICE CONTROL PANELS */}
          {activeNav === 'overview' ? (
            <>
              <SensorOverviewGrid telemetry={telemetry} />
              <section
                aria-label="Điều khiển thiết bị thông minh"
                className="grid grid-cols-1 lg:grid-cols-2 gap-5"
              >
                <LightingControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
                <ClotheslineControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
                <GardenControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
                <SecurityControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled((s) => !s)}
                />
              </section>
            </>
          ) : null}

          {/* DEVICES VIEW: FOCUSED ON LIGHTING, PIR & SMART CLOTHESLINE */}
          {activeNav === 'devices' ? (
            <div className="space-y-6">
              <SensorOverviewGrid telemetry={telemetry} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <LightingControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
                <ClotheslineControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
              </div>
            </div>
          ) : null}

          {/* GARDEN VIEW: FOCUSED ON SOIL MOISTURE & IRRIGATION PUMP */}
          {activeNav === 'garden' ? (
            <div className="space-y-6">
              <SensorOverviewGrid telemetry={telemetry} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <GardenControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
                <ClotheslineControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
              </div>
            </div>
          ) : null}

          {/* SECURITY VIEW: FOCUSED ON FIRE DETECTION, ALARM & PIR MOTION */}
          {activeNav === 'security' ? (
            <div className="space-y-6">
              <SensorOverviewGrid telemetry={telemetry} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SecurityControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled((s) => !s)}
                />
                <LightingControlCard
                  telemetry={telemetry}
                  pendingCmd={pendingCmd}
                  onCommand={handleCommand}
                />
              </div>
            </div>
          ) : null}

          {/* ANALYTICS VIEW: CHARTS, ACTIVITY LOGS & CSV EXPORT */}
          {activeNav === 'analytics' ? (
            <AnalyticsView
              summary={summary}
              history={history}
              logs={logs}
              onRefresh={loadInitialData}
              onRequestClearLogs={() => setConfirmClearModal(true)}
            />
          ) : null}

          {/* SETTINGS VIEW */}
          {activeNav === 'settings' ? (
            <SettingsView
              theme={theme}
              onToggleTheme={toggleTheme}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              lanIp={lanIp}
              connMeta={connMeta}
              telemetry={telemetry}
              onRequestClearLogs={() => setConfirmClearModal(true)}
            />
          ) : null}
        </main>
      </div>

      {/* TOAST FEEDBACK (ARIA-LIVE) */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-40 max-w-sm pointer-events-none"
      >
        {toast ? (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor:
                toast.tone === 'danger'
                  ? 'var(--danger)'
                  : toast.tone === 'warning'
                  ? 'var(--warning)'
                  : 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-[12px] border shadow-lg text-[12px] font-medium"
          >
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              strokeWidth={1.8}
              style={{
                color:
                  toast.tone === 'danger'
                    ? 'var(--danger)'
                    : toast.tone === 'warning'
                    ? 'var(--warning)'
                    : 'var(--success)'
              }}
              aria-hidden="true"
            />
            <span>{toast.message}</span>
          </div>
        ) : null}
      </div>

      {/* EMERGENCY FIRE ALERT MODAL */}
      {telemetry.fireAlert && !fireDismissed ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="emergency-fire-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--danger)'
            }}
            className="border-2 rounded-[16px] max-w-md w-full p-6 text-center shadow-2xl space-y-4"
          >
            <div
              style={{
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)'
              }}
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            >
              <ShieldAlert className="w-7 h-7" strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div className="space-y-1.5">
              <p
                style={{ color: 'var(--danger)' }}
                className="text-[11px] font-semibold uppercase tracking-wider"
              >
                Cảnh báo an ninh khẩn cấp
              </p>
              <h2
                id="emergency-fire-title"
                style={{ color: 'var(--text-primary)' }}
                className="text-[20px] font-semibold"
              >
                Phát hiện nguồn nhiệt / lửa tại mạch
              </h2>
              <p
                style={{ color: 'var(--text-secondary)' }}
                className="text-[13px] leading-relaxed"
              >
                Cảm biến lửa hồng ngoại (IO34) ghi nhận chỉ số ADC{' '}
                <strong style={{ color: 'var(--danger)' }} className="tabular-nums">
                  {telemetry.flame} (&lt; 15)
                </strong>
                . Còi báo động (IO19) và cụm 2 đèn đỏ (IO14) đang kích hoạt, máy bơm đã tự động ngắt.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)'
                }}
                className="flex-1 py-2.5 px-4 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-2"
              >
                {soundEnabled ? (
                  <>
                    <VolumeX className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                    <span>Tắt âm báo trình duyệt</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                    <span>Bật âm báo trình duyệt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFireDismissed(true)}
                style={{
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF'
                }}
                className="flex-1 py-2.5 px-4 rounded-[10px] text-[12px] font-semibold"
              >
                Đã xác nhận cảnh báo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* LAN & MQTT CONNECTION INFO MODAL */}
      {networkModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="network-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 overscroll-contain"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="border rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone
                  className="w-5 h-5"
                  strokeWidth={1.75}
                  style={{ color: 'var(--accent-strong)' }}
                  aria-hidden="true"
                />
                <h2
                  id="network-modal-title"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[16px] font-semibold"
                >
                  Thông tin kết nối mạng nội bộ &amp; MQTT
                </h2>
              </div>
              <button
                type="button"
                aria-label="Đóng hộp thoại"
                onClick={() => setNetworkModalOpen(false)}
                style={{ color: 'var(--text-secondary)' }}
                className="p-1.5 rounded-[8px] hover:opacity-80"
              >
                <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="aura-subcard p-3.5">
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  Địa chỉ truy cập Web trên Điện thoại (cùng Wi-Fi)
                </p>
                <p
                  translate="no"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[14px] font-semibold tabular-nums mt-0.5 select-all"
                >
                  http://{lanIp}:5173
                </p>
              </div>

              <div className="aura-subcard p-3.5">
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  Địa chỉ IP Server C# (nhập vào App Mobile React Native)
                </p>
                <p
                  translate="no"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[14px] font-semibold tabular-nums mt-0.5 select-all"
                >
                  {lanIp} (Cổng 5000)
                </p>
              </div>

              <div className="aura-subcard p-3.5">
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  Cấu hình MQTT Broker &amp; Topic
                </p>
                <p
                  translate="no"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[12px] font-medium tabular-nums mt-0.5"
                >
                  {connMeta.brokerHost}:{connMeta.brokerPort}
                </p>
                <p
                  translate="no"
                  style={{ color: 'var(--text-secondary)' }}
                  className="text-[11px] tabular-nums mt-0.5"
                >
                  {connMeta.telemetryTopic}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNetworkModalOpen(false)}
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-card)'
              }}
              className="w-full py-2.5 rounded-[10px] text-[12px] font-medium"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      ) : null}

      {/* CONFIRM RESET AUDIT LOGS MODAL */}
      {confirmClearModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-logs-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 overscroll-contain"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="border rounded-[16px] max-w-sm w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle
                className="w-5 h-5 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--warning)' }}
                aria-hidden="true"
              />
              <h2
                id="reset-logs-title"
                style={{ color: 'var(--text-primary)' }}
                className="text-[15px] font-semibold"
              >
                Đặt lại nhật ký hoạt động?
              </h2>
            </div>
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px] leading-relaxed"
            >
              Thao tác này sẽ xóa các dòng nhật ký cũ và đặt lại bộ đếm số lần tưới, mưa, PIR và báo cháy về 0.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmClearModal(false)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)'
                }}
                className="flex-1 py-2 rounded-[10px] text-[12px] font-medium"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClearLogs}
                style={{
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF'
                }}
                className="flex-1 py-2 rounded-[10px] text-[12px] font-medium"
              >
                Xác nhận đặt lại
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
