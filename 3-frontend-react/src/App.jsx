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
import LivingRoomCard from './components/LivingRoomCard';
import AnalyticsCard from './components/AnalyticsCard';
import CircularGauge from './components/CircularGauge';
import SmartDeviceList from './components/SmartDeviceList';
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
  ShieldCheck,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Sprout,
  Cpu,
  Clock,
  X
} from 'lucide-react';

const timeShortFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

function formatShortTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : timeShortFormatter.format(d);
}

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
  // Quản lý Light / Dark Mode lưu trong localStorage (mặc định Light Mode theo Aura Signature Edition)
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
      metaTheme.setAttribute('content', theme === 'dark' ? '#1C221C' : '#F3F5F1');
    }
    try {
      window.localStorage.setItem('smarthome_theme', theme);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  const [activeNav, setActiveNav] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hubStatus, setHubStatus] = useState('connecting');

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
    temp: null,
    hum: null,
    soil: null,
    flame: null,
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
    let disposed = false;
    let retryTimer = null;
    loadInitialData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connection.on('ReceiveTelemetry', (data) => {
      if (disposed || !data) return;
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
            timestamp: data.lastUpdated || new Date().toISOString(),
            temp: data.temp,
            hum: data.hum,
            soil: data.soil
          }
        ];
        return next.slice(-30);
      });
    });

    connection.on('NewEventLog', (logItem) => {
      if (disposed || !logItem) return;
      setLogs((prevLogs) => [logItem, ...prevLogs.slice(0, 149)]);
      fetchAnalyticsSummary().then(setSummary).catch(() => {});
    });

    connection.onreconnecting(() => {
      if (!disposed) setHubStatus('reconnecting');
    });
    connection.onreconnected(() => {
      if (!disposed) {
        setHubStatus('connected');
        loadInitialData();
      }
    });
    connection.onclose(() => {
      if (!disposed) {
        setHubStatus('disconnected');
        retryTimer = setTimeout(startHub, 5000);
      }
    });

    let startPromise = Promise.resolve();
    function startHub() {
      if (disposed) return;
      startPromise = connection
        .start()
        .then(() => {
          if (!disposed) setHubStatus('connected');
        })
        .catch(() => {
          if (!disposed) {
            setHubStatus('disconnected');
            retryTimer = setTimeout(startHub, 5000);
          }
        });
    }

    startHub();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      startPromise.finally(() => connection.stop());
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
      if (res?.brokerDelivered === false) {
        showToast(
          `Chưa gửi được lệnh ${cmd}:${value} tới MQTT Broker. Hãy kiểm tra kết nối Broker / ESP32.`,
          'warning'
        );
        return;
      }
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
      if (res?.supported) {
        if (Array.isArray(res?.logs)) setLogs(res.logs);
        else setLogs([]);
        if (res?.summary) setSummary(res.summary);
        setConfirmClearModal(false);
        showToast('Đã đặt lại nhật ký sự kiện và bộ đếm thống kê.', 'success');
      } else {
        setLogs([]);
        setConfirmClearModal(false);
        showToast(
          'Đã làm mới danh sách nhật ký hiển thị trên phiên trình duyệt hiện tại.',
          'warning'
        );
      }
    } catch {
      showToast('Không thể đặt lại nhật ký. Hãy kiểm tra kết nối Server C#.', 'danger');
    }
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function handleSelectNav(id) {
    setActiveNav(id);
    if (id === 'analytics') loadInitialData();
  }

  const securityLogs = logs
    .filter((l) => l.category === 'BAO_CHAY' || l.category === 'PIR')
    .slice(0, 6);

  const gardenLogs = logs
    .filter((l) => l.category === 'TUOI_CAY' || l.category === 'GIAN_PHOI')
    .slice(0, 5);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
      className="min-h-screen flex transition-colors duration-300"
    >
      {/* COMPACT 88PX ICON SIDEBAR NAVIGATION */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        online={telemetry.online}
        hubStatus={hubStatus}
        lanIp={lanIp}
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
          hubStatus={hubStatus}
          lanIp={lanIp}
          recentLogs={logs}
          onSelectNav={handleSelectNav}
        />

        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-10 space-y-4">
          {/* ================================================================
              1. OVERVIEW DASHBOARD — REFERENCE 12-COLUMN ASYMMETRIC BENTO GRID
                 - Top Row: 4 Clean SensorSummaryCards
                 - Main 12-Col Bento Grid:
                     * Left (5 cols): Scandinavian LivingRoomCard + Sage AnalyticsCard
                     * Center (4 cols): 270° CircularGauge (Soil Moisture & Pump)
                     * Right (3 cols): SmartDeviceList ("Smart Devices" + "View all devices")
                 - Bottom Row: 4 Studio 3D Matte Clay Device Visual Cards
              ================================================================ */}
          {activeNav === 'overview' ? (
            <div className="space-y-4 aura-page-enter">
              {/* Row 1: 4 Sensor Summary Cards */}
              <SensorOverviewGrid telemetry={telemetry} history={history} />

              {/* Row 2: 12-Column Asymmetric Bento Grid (5 - 4 - 3) */}
              <section
                aria-label="Không gian điều phối trung tâm Bento Grid"
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
              >
                {/* Left 5 Columns: Living Room Interior + Sage Bar Chart */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <LivingRoomCard
                    telemetry={telemetry}
                    pendingCmd={pendingCmd}
                    onCommand={handleCommand}
                  />
                  <AnalyticsCard
                    history={history}
                    summary={summary}
                    onOpenFullAnalytics={() => handleSelectNav('analytics')}
                  />
                </div>

                {/* Center 4 Columns: 270-Degree Circular Gauge */}
                <div className="lg:col-span-4">
                  <CircularGauge
                    telemetry={telemetry}
                    pendingCmd={pendingCmd}
                    onCommand={handleCommand}
                  />
                </div>

                {/* Right 3 Columns: Smart Devices Directory */}
                <div className="lg:col-span-3">
                  <SmartDeviceList
                    telemetry={telemetry}
                    onSelectNav={handleSelectNav}
                  />
                </div>
              </section>

              {/* Row 3: 4 Studio 3D Matte Product Device Cards */}
              <section
                aria-label="Điều khiển nhanh thiết bị 3D"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
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
            </div>
          ) : null}

          {/* ================================================================
              2. DEVICES VIEW: 3D SMART DEVICE CARDS + LIVING ROOM VISUAL
              ================================================================ */}
          {activeNav === 'devices' ? (
            <div className="space-y-4 aura-page-enter">
              <div className="aura-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    style={{
                      backgroundColor: 'var(--soft-green)',
                      color: 'var(--olive-green)'
                    }}
                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                  >
                    <Cpu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div>
                    <h2
                      style={{ color: 'var(--text-primary)' }}
                      className="text-[16px] font-semibold"
                    >
                      Danh mục thiết bị thông minh (Smart Devices)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                      Đồng bộ hai chiều qua MQTT Topic{' '}
                      <span translate="no" className="font-medium">
                        {connMeta.commandTopic}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="aura-subcard px-3 py-1.5 font-semibold" translate="no">
                    IO32 Light: {telemetry.lightOn ? 'ON' : 'OFF'}
                  </span>
                  <span className="aura-subcard px-3 py-1.5 font-semibold" translate="no">
                    IO27 PIR: {telemetry.pirLocked ? 'LOCKED' : 'AUTO'}
                  </span>
                  <span className="aura-subcard px-3 py-1.5 font-semibold" translate="no">
                    IO33 Servo: {telemetry.servoAngle}° ({telemetry.servoMode})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                  <LivingRoomCard
                    telemetry={telemetry}
                    pendingCmd={pendingCmd}
                    onCommand={handleCommand}
                  />
                </div>
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>
          ) : null}

          {/* ================================================================
              3. GARDEN VIEW: 270° CIRCULAR GAUGE + 3D IRRIGATION & CLOTHESLINE
              ================================================================ */}
          {activeNav === 'garden' ? (
            <div className="space-y-4 aura-page-enter">
              <SensorOverviewGrid telemetry={telemetry} history={history} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5">
                  <CircularGauge
                    telemetry={telemetry}
                    pendingCmd={pendingCmd}
                    onCommand={handleCommand}
                  />
                </div>

                <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  {/* Botanical Irrigation Summary & Recent Activity */}
                  <div className="aura-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Sprout
                          className="w-4 h-4"
                          style={{ color: 'var(--olive-green)' }}
                          aria-hidden="true"
                        />
                        <h3
                          style={{ color: 'var(--text-primary)' }}
                          className="text-[14px] font-semibold"
                        >
                          Nhật ký tưới tiêu &amp; thời tiết gần nhất
                        </h3>
                      </div>
                      <span
                        style={{ color: 'var(--text-secondary)' }}
                        className="text-[11px] tabular-nums"
                      >
                        Đã tưới: {summary.totalPumpRuns} đợt (~{summary.estimatedWaterMl} ml)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {gardenLogs.length === 0 ? (
                        <p
                          style={{ color: 'var(--text-secondary)' }}
                          className="text-[12px] py-3"
                        >
                          Chưa có sự kiện tưới cây hoặc mưa thu giàn phơi trong phiên này.
                        </p>
                      ) : (
                        gardenLogs.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="aura-subcard px-3 py-2 flex items-center justify-between gap-2 text-[12px]"
                          >
                            <span
                              style={{ color: 'var(--text-primary)' }}
                              className="font-medium truncate"
                            >
                              {item.message}
                            </span>
                            <span
                              style={{ color: 'var(--text-secondary)' }}
                              className="text-[11px] tabular-nums shrink-0"
                            >
                              {formatShortTime(item.timestamp)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ================================================================
              4. SECURITY VIEW: SECURITY CENTER & PIR MOTION TIMELINE
              ================================================================ */}
          {activeNav === 'security' ? (
            <div className="space-y-4 aura-page-enter">
              <SensorOverviewGrid telemetry={telemetry} history={history} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4">
                  <SecurityControlCard
                    telemetry={telemetry}
                    pendingCmd={pendingCmd}
                    onCommand={handleCommand}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled((s) => !s)}
                  />
                </div>
                <div className="lg:col-span-4">
                  <LightingControlCard
                    telemetry={telemetry}
                    pendingCmd={pendingCmd}
                    onCommand={handleCommand}
                  />
                </div>
                <div className="lg:col-span-4">
                  <SmartDeviceList
                    telemetry={telemetry}
                    onSelectNav={handleSelectNav}
                  />
                </div>
              </div>

              {/* Security Event Timeline */}
              <div className="aura-card p-5 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: telemetry.fireAlert
                        ? 'var(--danger-soft)'
                        : 'var(--soft-green)',
                      color: telemetry.fireAlert
                        ? 'var(--danger)'
                        : 'var(--olive-green)'
                    }}
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                  >
                    <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div>
                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="text-[15px] font-semibold"
                    >
                      Nhật ký giám sát an ninh &amp; cảm biến PIR
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                      Phát hiện PIR: {summary.totalPirDetections} lần • Cảnh báo cháy:{' '}
                      {summary.totalFireAlerts} lần
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {securityLogs.length === 0 ? (
                    <p
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[12px] py-3 md:col-span-2"
                    >
                      Hệ thống an ninh ổn định — Chưa ghi nhận cảnh báo cháy hoặc chuyển động bất thường.
                    </p>
                  ) : (
                    securityLogs.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="aura-subcard p-3 flex items-start justify-between gap-3 text-[12px]"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p
                            style={{ color: 'var(--text-primary)' }}
                            className="font-medium truncate"
                          >
                            {item.message}
                          </p>
                          <p
                            style={{ color: 'var(--text-secondary)' }}
                            className="text-[11px]"
                          >
                            {item.category} • {item.source}
                          </p>
                        </div>
                        <span
                          style={{ color: 'var(--text-muted)' }}
                          className="text-[11px] tabular-nums shrink-0 flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatShortTime(item.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* ================================================================
              5. ANALYTICS VIEW: CHARTS, ACTIVITY LOGS & CSV EXPORT
              ================================================================ */}
          {activeNav === 'analytics' ? (
            <div className="aura-page-enter">
              <AnalyticsView
                summary={summary}
                history={history}
                logs={logs}
                onRefresh={loadInitialData}
                onRequestClearLogs={() => setConfirmClearModal(true)}
              />
            </div>
          ) : null}

          {/* ================================================================
              6. SETTINGS VIEW: APPLE-SETTINGS GROUPED CONFIGURATION
              ================================================================ */}
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
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3.5 rounded-[16px] border shadow-xl text-[12px] font-medium aura-page-enter"
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
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--danger)'
            }}
            className="border-2 rounded-[24px] max-w-md w-full p-7 text-center shadow-2xl space-y-4 aura-danger-pulse"
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
                className="flex-1 py-3 px-4 aura-btn text-[12px] font-semibold flex items-center justify-center gap-2"
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
                className="flex-1 py-3 px-4 aura-btn text-[12px] font-semibold"
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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 overscroll-contain"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="border rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl aura-page-enter"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone
                  className="w-5 h-5"
                  strokeWidth={1.75}
                  style={{ color: 'var(--olive-green)' }}
                  aria-hidden="true"
                />
                <h2
                  id="network-modal-title"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[16px] font-semibold"
                >
                  Kết nối mạng nội bộ &amp; MQTT Broker
                </h2>
              </div>
              <button
                type="button"
                aria-label="Đóng hộp thoại"
                onClick={() => setNetworkModalOpen(false)}
                style={{ color: 'var(--text-secondary)' }}
                className="p-1.5 rounded-[10px] hover:opacity-80"
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
                  className="text-[12px] font-semibold tabular-nums mt-0.5"
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
                backgroundColor: 'var(--olive-green)',
                color: '#FAFCF9'
              }}
              className="w-full py-3 aura-btn text-[12px] font-semibold"
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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 overscroll-contain"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="border rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl aura-page-enter"
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
                className="flex-1 py-2.5 aura-btn text-[12px] font-semibold"
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
                className="flex-1 py-2.5 aura-btn text-[12px] font-semibold"
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
