import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import * as signalR from '@microsoft/signalr';
import {
  DEFAULT_SERVER_IP,
  buildSignalRUrl,
  clearMobileEventLogs,
  fetchMobileAnalyticsSummary,
  fetchMobileConnectionInfo,
  fetchMobileDeviceStatus,
  fetchMobileEventLogs,
  fetchMobileSensorHistory,
  fetchServerRootInfo,
  normalizeServerInput,
  sendMobileCommand
} from './src/services/mobileApi';
import {
  CARD_SHADOW,
  DARK_THEME,
  LIGHT_THEME,
  TABULAR_NUMS
} from './src/theme/tokens';
import HeaderBar from './src/components/HeaderBar';
import SensorOverviewGrid from './src/components/SensorOverviewGrid';
import LivingRoomCard from './src/components/LivingRoomCard';
import CircularGauge from './src/components/CircularGauge';
import AnalyticsCard from './src/components/AnalyticsCard';
import SmartDeviceList from './src/components/SmartDeviceList';
import {
  LightingControlCard,
  ClotheslineControlCard,
  GardenControlCard,
  SecurityControlCard
} from './src/components/DeviceControlPanels';
import AnalyticsTab from './src/components/AnalyticsTab';
import SettingsTab from './src/components/SettingsTab';
import FireAlertModal from './src/components/FireAlertModal';

// Đồng bộ commit 6960190: Không dùng giá trị cảm biến giả lập ban đầu
const INITIAL_TELEMETRY = {
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
};

const INITIAL_SUMMARY = {
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
};

const INITIAL_CONN_META = {
  brokerConnected: false,
  brokerHost: 'broker.emqx.io',
  brokerPort: 1883,
  telemetryTopic: 'smarthome/khoa2026/telemetry',
  commandTopic: 'smarthome/khoa2026/command',
  lastPacketReceived: null
};

// 6 phân trang đồng bộ 100% với Sidebar.jsx của 3-frontend-react
const NAV_TABS = [
  { id: 'overview', label: 'Tổng quan', shortLabel: 'Tổng quan' },
  { id: 'devices', label: 'Thiết bị', shortLabel: 'Thiết bị' },
  { id: 'garden', label: 'Sân vườn', shortLabel: 'Sân vườn' },
  { id: 'security', label: 'An ninh', shortLabel: 'An ninh' },
  { id: 'analytics', label: 'Phân tích', shortLabel: 'Phân tích' },
  { id: 'settings', label: 'Cấu hình', shortLabel: 'Cấu hình' }
];

function formatShortTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function App() {
  // Mặc định Signature Light Mode theo 3-frontend-react Aura Smart Home Signature Edition
  const [themeMode, setThemeMode] = useState('light');
  const theme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const [activeTab, setActiveTab] = useState('overview');
  const [serverIp, setServerIp] = useState(DEFAULT_SERVER_IP);
  const [activeIp, setActiveIp] = useState(DEFAULT_SERVER_IP);
  const [reconnectTick, setReconnectTick] = useState(0);
  const [ipEditorOpen, setIpEditorOpen] = useState(false);
  const [hubConnected, setHubConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [connMeta, setConnMeta] = useState(INITIAL_CONN_META);

  const [pendingCmd, setPendingCmd] = useState(null);
  const [fireDismissed, setFireDismissed] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(null);
  const [toast, setToast] = useState(null);

  const connectionRef = useRef(null);
  const prevTelemetryRef = useRef(null);
  const lastPacketAtRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, tone = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, tone, id: Date.now() });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  const loadSnapshotData = useCallback(async (targetIp) => {
    const [rootRes, statusRes, connRes, summaryRes, historyRes, logsRes] =
      await Promise.allSettled([
        fetchServerRootInfo(targetIp),
        fetchMobileDeviceStatus(targetIp),
        fetchMobileConnectionInfo(targetIp),
        fetchMobileAnalyticsSummary(targetIp),
        fetchMobileSensorHistory(targetIp, 30),
        fetchMobileEventLogs(targetIp, 'ALL', 100)
      ]);

    let anySuccess = false;

    if (rootRes.status === 'fulfilled' && rootRes.value) {
      anySuccess = true;
    }

    if (statusRes.status === 'fulfilled' && statusRes.value) {
      anySuccess = true;
      prevTelemetryRef.current = statusRes.value;
      setTelemetry(statusRes.value);
      if (statusRes.value.online) {
        lastPacketAtRef.current = Date.now();
        setSecondsAgo(0);
      }
    }

    if (connRes.status === 'fulfilled' && connRes.value) {
      anySuccess = true;
      setConnMeta((prev) => ({ ...prev, ...connRes.value }));
    }

    if (summaryRes.status === 'fulfilled' && summaryRes.value) {
      setSummary(summaryRes.value);
    }

    if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
      setHistory(historyRes.value);
    }

    if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value)) {
      setLogs(logsRes.value);
    }

    return anySuccess;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;

    async function connectToBackend(ip) {
      setConnecting(true);
      try {
        if (connectionRef.current) {
          await connectionRef.current.stop().catch(() => {});
          connectionRef.current = null;
        }

        const reachable = await loadSnapshotData(ip);
        if (cancelled) return;

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(buildSignalRUrl(ip), {
            withCredentials: false
          })
          .withAutomaticReconnect([0, 1500, 3000, 5000])
          .configureLogging(signalR.LogLevel.None)
          .build();

        connection.on('ReceiveTelemetry', (data) => {
          if (cancelled || !data) return;

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
            } else if (!prev.pumpOn && data.pumpOn) {
              showToast('Máy bơm tưới cây (IO26) đang chạy 2.5 giây', 'success');
            }
          }

          prevTelemetryRef.current = data;
          setTelemetry(data);
          setConnMeta((c) => ({
            ...c,
            brokerConnected: true,
            lastPacketReceived: data.lastUpdated || new Date().toISOString()
          }));

          if (data.online) {
            lastPacketAtRef.current = Date.now();
            setSecondsAgo(0);
          }

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

        connection.on('ReceiveSummary', (sum) => {
          if (!cancelled && sum) setSummary(sum);
        });

        connection.on('NewEventLog', (logItem) => {
          if (cancelled || !logItem) return;
          setLogs((prevLogs) => [logItem, ...prevLogs.slice(0, 119)]);
          fetchMobileAnalyticsSummary(ip)
            .then((sum) => {
              if (!cancelled && sum) setSummary(sum);
            })
            .catch(() => {});
        });

        connection.onreconnecting(() => {
          if (!cancelled) setHubConnected(false);
        });

        connection.onreconnected(() => {
          if (!cancelled) {
            setHubConnected(true);
            loadSnapshotData(ip).catch(() => {});
          }
        });

        connection.onclose(() => {
          if (!cancelled) {
            setHubConnected(false);
            retryTimer = setTimeout(() => {
              if (!cancelled) setReconnectTick((t) => t + 1);
            }, 3500);
          }
        });

        await connection.start();
        if (cancelled) {
          await connection.stop().catch(() => {});
          return;
        }

        connectionRef.current = connection;
        setHubConnected(true);
        setIpEditorOpen(false);
        if (reachable) {
          showToast(
            `Đã kết nối Aura Home Server (${normalizeServerInput(ip)})`,
            'success'
          );
        }
      } catch {
        if (!cancelled) {
          setHubConnected(false);
          retryTimer = setTimeout(() => {
            if (!cancelled) setReconnectTick((t) => t + 1);
          }, 4000);
        }
      } finally {
        if (!cancelled) setConnecting(false);
      }
    }

    connectToBackend(activeIp);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [activeIp, reconnectTick, loadSnapshotData, showToast]);

  // Đồng bộ thời gian thực dự phòng mỗi 1.8 giây (đảm bảo trên Expo Go luôn nhảy số tức thì kể cả khi WebSocket bị nghẽn)
  useEffect(() => {
    let active = true;
    const pollTimer = setInterval(async () => {
      try {
        const latest = await fetchMobileDeviceStatus(activeIp);
        if (!active || !latest) return;

        const prev = prevTelemetryRef.current;
        const hasNewTimestamp =
          latest.lastUpdated && (!prev || prev.lastUpdated !== latest.lastUpdated);
        const hasValueDiff =
          !prev ||
          prev.temp !== latest.temp ||
          prev.hum !== latest.hum ||
          prev.soil !== latest.soil ||
          prev.flame !== latest.flame ||
          prev.fireAlert !== latest.fireAlert ||
          prev.rain !== latest.rain ||
          prev.pir !== latest.pir ||
          prev.pirLocked !== latest.pirLocked ||
          prev.lightOn !== latest.lightOn ||
          prev.servoAngle !== latest.servoAngle ||
          prev.servoMode !== latest.servoMode ||
          prev.pumpOn !== latest.pumpOn ||
          prev.pumpLocked !== latest.pumpLocked ||
          prev.online !== latest.online;

        if (hasNewTimestamp || hasValueDiff) {
          prevTelemetryRef.current = latest;
          setTelemetry(latest);
          if (latest.online) {
            lastPacketAtRef.current = Date.now();
            setSecondsAgo(0);
          }
          if (hasValueDiff) {
            setHistory((prevHist) =>
              [
                ...prevHist,
                {
                  id: Date.now(),
                  timestamp: latest.lastUpdated || new Date().toISOString(),
                  temp: latest.temp,
                  hum: latest.hum,
                  soil: latest.soil
                }
              ].slice(-30)
            );
          }
        }
      } catch {
        // Server C# tạm thời chưa phản hồi
      }
    }, 1800);

    return () => {
      active = false;
      clearInterval(pollTimer);
    };
  }, [activeIp]);

  // Đồng hồ đếm thời gian cập nhật & kiểm tra timeout 6 giây mất kết nối ESP32
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastPacketAtRef.current) return;
      const diffSec = Math.floor((Date.now() - lastPacketAtRef.current) / 1000);
      setSecondsAgo(diffSec);
      if (diffSec > 6) {
        setTelemetry((prev) =>
          prev.online ? { ...prev, online: false } : prev
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rung điện thoại liên hồi khi phát hiện cháy (FR-02.6)
  useEffect(() => {
    if (!telemetry.fireAlert || fireDismissed || !vibrationEnabled) {
      Vibration.cancel();
      return;
    }

    Vibration.vibrate([0, 450, 220, 450]);
    const vibTimer = setInterval(() => {
      Vibration.vibrate([0, 450, 220, 450]);
    }, 1600);

    return () => {
      clearInterval(vibTimer);
      Vibration.cancel();
    };
  }, [telemetry.fireAlert, fireDismissed, vibrationEnabled]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      Vibration.cancel();
    };
  }, []);

  const handleSubmitIp = useCallback(() => {
    const normalized = normalizeServerInput(serverIp);
    setServerIp(normalized);
    if (normalized === activeIp) {
      setReconnectTick((t) => t + 1);
    } else {
      setActiveIp(normalized);
    }
  }, [serverIp, activeIp]);

  const handleSelectPresetIp = useCallback((ip) => {
    setServerIp(ip);
    setActiveIp(ip);
  }, []);

  // Đồng bộ commit 6960190: Kiểm tra brokerDelivered === false
  const handleCommand = useCallback(
    async (cmd, value, successLabel) => {
      const key = `${cmd}:${value}`;
      setPendingCmd(key);
      try {
        const res = await sendMobileCommand(activeIp, cmd, value);
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
        showToast(successLabel || `Đã thực thi ${cmd}: ${value}`, 'success');
      } catch (err) {
        showToast(
          err?.message ||
            'Chưa kết nối được Backend C# (cổng 5000). Hãy kiểm tra IP LAN và Server C#.',
          'danger'
        );
      } finally {
        setPendingCmd(null);
      }
    },
    [activeIp, showToast]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const ok = await loadSnapshotData(activeIp);
      if (ok) {
        showToast('Đã đồng bộ dữ liệu mới nhất từ Server C#', 'success');
      } else {
        showToast('Chưa kết nối được Server C# để làm mới dữ liệu', 'warning');
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeIp, loadSnapshotData, showToast]);

  // Đồng bộ commit 6960190: Xử lý fallback khi Backend trên master chưa mở DELETE /api/analytics/logs
  const handleRequestClearLogs = useCallback(() => {
    Alert.alert(
      'Đặt lại nhật ký hoạt động?',
      'Thao tác này sẽ xóa các dòng nhật ký cũ và đặt lại bộ đếm số lần tưới, mưa, PIR và báo cháy về 0.',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xác nhận đặt lại',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await clearMobileEventLogs(activeIp);
              if (res?.supported) {
                if (Array.isArray(res?.logs)) setLogs(res.logs);
                else setLogs([]);
                if (res?.summary) setSummary(res.summary);
                showToast(
                  'Đã đặt lại nhật ký sự kiện và bộ đếm thống kê.',
                  'success'
                );
              } else {
                setLogs([]);
                showToast(
                  'Đã làm mới danh sách nhật ký hiển thị trên phiên ứng dụng hiện tại.',
                  'warning'
                );
              }
            } catch {
              showToast(
                'Không thể đặt lại nhật ký. Hãy kiểm tra kết nối Server C#.',
                'danger'
              );
            }
          }
        }
      ]
    );
  }, [activeIp, showToast]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleSelectTab = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      if (tabId === 'analytics') {
        loadSnapshotData(activeIp).catch(() => {});
      }
    },
    [activeIp, loadSnapshotData]
  );

  const gardenLogs = useMemo(
    () =>
      logs
        .filter((l) => l.category === 'TUOI_CAY' || l.category === 'GIAN_PHOI')
        .slice(0, 4),
    [logs]
  );

  const securityLogs = useMemo(
    () =>
      logs
        .filter((l) => l.category === 'BAO_CHAY' || l.category === 'PIR')
        .slice(0, 6),
    [logs]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgMain}
      />

      {/* DẢI NHẮC NHỞ KHẨN CẤP NẾU ĐÃ TẠM ĐÓNG MODAL MÀ LỬA VẪN ĐANG BÁO */}
      {telemetry.fireAlert && fireDismissed ? (
        <TouchableOpacity
          onPress={() => setFireDismissed(false)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Mở lại hộp thoại cảnh báo cháy khẩn cấp"
          style={[styles.stickyFireStrip, { backgroundColor: theme.danger }]}
        >
          <Text style={[styles.stickyFireText, { color: theme.dangerTextOn }]}>
            CẢNH BÁO CHÁY ĐANG KÍCH HOẠT (ADC {telemetry.flame ?? '—'}) — Chạm để mở lại chi tiết
          </Text>
        </TouchableOpacity>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.oliveGreen}
              colors={[theme.oliveGreen]}
            />
          }
        >
          {/* HEADER AURA SMART HOME SIGNATURE EDITION */}
          <HeaderBar
            theme={theme}
            activeTab={activeTab}
            telemetry={telemetry}
            telemetryOnline={Boolean(telemetry.online)}
            hubConnected={hubConnected}
            connecting={connecting}
            secondsAgo={secondsAgo}
            serverIp={serverIp}
            activeIp={activeIp}
            ipEditorOpen={ipEditorOpen}
            recentLogs={logs}
            onToggleIpEditor={() => setIpEditorOpen((open) => !open)}
            onChangeServerIp={setServerIp}
            onSubmitIp={handleSubmitIp}
            onToggleTheme={handleToggleTheme}
            onSelectTab={handleSelectTab}
          />

          {/* ================================================================
              1. OVERVIEW VIEW — ASYMMETRIC BENTO DASHBOARD (SYNCHRONIZED WITH WEB)
                 - 4 SensorSummaryCards with real delta badges
                 - Scandinavian LivingRoomCard
                 - 270° CircularGauge (Soil Moisture & Pump)
                 - Sage Green AnalyticsCard
                 - SmartDeviceList (6 Hardware Subsystems)
                 - 4 Studio 3D Matte Clay Device Cards
              ================================================================ */}
          {activeTab === 'overview' ? (
            <View style={styles.viewStack}>
              <SensorOverviewGrid
                theme={theme}
                telemetry={telemetry}
                history={history}
              />

              <LivingRoomCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <CircularGauge
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <AnalyticsCard
                theme={theme}
                history={history}
                summary={summary}
                onOpenFullAnalytics={() => handleSelectTab('analytics')}
              />

              <SmartDeviceList
                theme={theme}
                telemetry={telemetry}
                onSelectTab={handleSelectTab}
              />

              <LightingControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <ClotheslineControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <GardenControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <SecurityControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
                vibrationEnabled={vibrationEnabled}
                onToggleVibration={() => setVibrationEnabled((v) => !v)}
              />
            </View>
          ) : null}

          {/* ================================================================
              2. DEVICES VIEW — 3D SMART DEVICE CARDS + LIVING ROOM SANCTUARY
              ================================================================ */}
          {activeTab === 'devices' ? (
            <View style={styles.viewStack}>
              <View
                style={[
                  styles.infoBannerCard,
                  CARD_SHADOW,
                  { backgroundColor: theme.bgCard, borderColor: theme.border }
                ]}
              >
                <View style={styles.infoBannerTop}>
                  <View
                    style={[
                      styles.infoBannerIcon,
                      { backgroundColor: theme.softGreen }
                    ]}
                  >
                    <Text
                      style={[
                        styles.infoBannerIconText,
                        { color: theme.oliveGreen }
                      ]}
                    >
                      IO
                    </Text>
                  </View>
                  <View style={styles.infoBannerTextWrap}>
                    <Text
                      style={[
                        styles.infoBannerTitle,
                        { color: theme.textPrimary }
                      ]}
                    >
                      Danh mục thiết bị thông minh (Smart Devices)
                    </Text>
                    <Text
                      style={[
                        styles.infoBannerSub,
                        { color: theme.textSecondary }
                      ]}
                    >
                      Đồng bộ hai chiều qua MQTT Topic {connMeta.commandTopic}
                    </Text>
                  </View>
                </View>

                <View style={styles.hwPillsRow}>
                  <View
                    style={[
                      styles.hwPill,
                      { backgroundColor: theme.bgElevated }
                    ]}
                  >
                    <Text
                      style={[styles.hwPillText, { color: theme.textPrimary }]}
                    >
                      IO32 Light: {telemetry.lightOn ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.hwPill,
                      { backgroundColor: theme.bgElevated }
                    ]}
                  >
                    <Text
                      style={[styles.hwPillText, { color: theme.textPrimary }]}
                    >
                      IO27 PIR: {telemetry.pirLocked ? 'LOCKED' : 'AUTO'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.hwPill,
                      { backgroundColor: theme.bgElevated }
                    ]}
                  >
                    <Text
                      style={[
                        styles.hwPillText,
                        TABULAR_NUMS,
                        { color: theme.textPrimary }
                      ]}
                    >
                      IO33 Servo: {telemetry.servoAngle}° ({telemetry.servoMode})
                    </Text>
                  </View>
                </View>
              </View>

              <LivingRoomCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <LightingControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <ClotheslineControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <GardenControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <SecurityControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
                vibrationEnabled={vibrationEnabled}
                onToggleVibration={() => setVibrationEnabled((v) => !v)}
              />
            </View>
          ) : null}

          {/* ================================================================
              3. GARDEN VIEW — 270° CIRCULAR GAUGE + 3D IRRIGATION & CLOTHESLINE
              ================================================================ */}
          {activeTab === 'garden' ? (
            <View style={styles.viewStack}>
              <SensorOverviewGrid
                theme={theme}
                telemetry={telemetry}
                history={history}
              />

              <CircularGauge
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <GardenControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <ClotheslineControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              {/* Botanical Irrigation Summary & Recent Activity */}
              <View
                style={[
                  styles.timelineCard,
                  CARD_SHADOW,
                  { backgroundColor: theme.bgCard, borderColor: theme.border }
                ]}
              >
                <View style={styles.timelineHeader}>
                  <Text
                    style={[styles.timelineTitle, { color: theme.textPrimary }]}
                  >
                    Nhật ký tưới tiêu &amp; thời tiết gần nhất
                  </Text>
                  <Text
                    style={[
                      styles.timelineCount,
                      TABULAR_NUMS,
                      { color: theme.textSecondary }
                    ]}
                  >
                    Đã tưới: {summary.totalPumpRuns ?? 0} đợt (~
                    {summary.estimatedWaterMl ?? 0} ml)
                  </Text>
                </View>

                {gardenLogs.length === 0 ? (
                  <Text
                    style={[
                      styles.timelineEmpty,
                      { color: theme.textSecondary }
                    ]}
                  >
                    Chưa có sự kiện tưới cây hoặc mưa thu giàn phơi trong phiên này.
                  </Text>
                ) : (
                  <View style={styles.timelineList}>
                    {gardenLogs.map((item, idx) => (
                      <View
                        key={item.id || idx}
                        style={[
                          styles.timelineItem,
                          { backgroundColor: theme.bgElevated }
                        ]}
                      >
                        <Text
                          style={[
                            styles.timelineMsg,
                            { color: theme.textPrimary }
                          ]}
                          numberOfLines={1}
                        >
                          {item.message}
                        </Text>
                        <Text
                          style={[
                            styles.timelineTime,
                            TABULAR_NUMS,
                            { color: theme.textSecondary }
                          ]}
                        >
                          {formatShortTime(item.timestamp)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : null}

          {/* ================================================================
              4. SECURITY VIEW — SECURITY CENTER & PIR MOTION TIMELINE
              ================================================================ */}
          {activeTab === 'security' ? (
            <View style={styles.viewStack}>
              <SensorOverviewGrid
                theme={theme}
                telemetry={telemetry}
                history={history}
              />

              <SecurityControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
                vibrationEnabled={vibrationEnabled}
                onToggleVibration={() => setVibrationEnabled((v) => !v)}
              />

              <LightingControlCard
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />

              <SmartDeviceList
                theme={theme}
                telemetry={telemetry}
                onSelectTab={handleSelectTab}
              />

              {/* Security Event Timeline */}
              <View
                style={[
                  styles.timelineCard,
                  CARD_SHADOW,
                  { backgroundColor: theme.bgCard, borderColor: theme.border }
                ]}
              >
                <View style={styles.timelineHeader}>
                  <Text
                    style={[styles.timelineTitle, { color: theme.textPrimary }]}
                  >
                    Nhật ký giám sát an ninh &amp; cảm biến PIR
                  </Text>
                  <Text
                    style={[
                      styles.timelineCount,
                      TABULAR_NUMS,
                      { color: theme.textSecondary }
                    ]}
                  >
                    Phát hiện PIR: {summary.totalPirDetections ?? 0} lần • Cảnh báo cháy:{' '}
                    {summary.totalFireAlerts ?? 0} lần
                  </Text>
                </View>

                {securityLogs.length === 0 ? (
                  <Text
                    style={[
                      styles.timelineEmpty,
                      { color: theme.textSecondary }
                    ]}
                  >
                    Hệ thống an ninh ổn định — Chưa ghi nhận cảnh báo cháy hoặc chuyển động bất thường.
                  </Text>
                ) : (
                  <View style={styles.timelineList}>
                    {securityLogs.map((item, idx) => (
                      <View
                        key={item.id || idx}
                        style={[
                          styles.timelineItem,
                          { backgroundColor: theme.bgElevated }
                        ]}
                      >
                        <View style={styles.timelineItemLeft}>
                          <Text
                            style={[
                              styles.timelineMsg,
                              { color: theme.textPrimary }
                            ]}
                            numberOfLines={1}
                          >
                            {item.message}
                          </Text>
                          <Text
                            style={[
                              styles.timelineMeta,
                              { color: theme.textSecondary }
                            ]}
                          >
                            {item.category} • {item.source}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.timelineTime,
                            TABULAR_NUMS,
                            { color: theme.textSecondary }
                          ]}
                        >
                          {formatShortTime(item.timestamp)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : null}

          {/* ================================================================
              5. ANALYTICS VIEW — CHARTS, ACTIVITY LOGS & CSV EXPORT
              ================================================================ */}
          {activeTab === 'analytics' ? (
            <AnalyticsTab
              theme={theme}
              activeIp={activeIp}
              summary={summary}
              history={history}
              logs={logs}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onRequestClearLogs={handleRequestClearLogs}
            />
          ) : null}

          {/* ================================================================
              6. SETTINGS VIEW — APPLE-SETTINGS GROUPED CONFIGURATION
              ================================================================ */}
          {activeTab === 'settings' ? (
            <SettingsTab
              theme={theme}
              telemetry={telemetry}
              serverIp={serverIp}
              activeIp={activeIp}
              hubConnected={hubConnected}
              connecting={connecting}
              connMeta={connMeta}
              vibrationEnabled={vibrationEnabled}
              onChangeServerIp={setServerIp}
              onSelectPresetIp={handleSelectPresetIp}
              onSubmitIp={handleSubmitIp}
              onToggleVibration={setVibrationEnabled}
              onToggleTheme={handleToggleTheme}
              onRequestClearLogs={handleRequestClearLogs}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* TOAST PHẢN HỒI ĐỒNG BỘ 2 CHIỀU */}
      {toast ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View
            style={[
              styles.toastBox,
              CARD_SHADOW,
              {
                backgroundColor: theme.bgCard,
                borderColor:
                  toast.tone === 'danger'
                    ? theme.danger
                    : toast.tone === 'warning'
                    ? theme.warning
                    : theme.border
              }
            ]}
          >
            <View
              style={[
                styles.toastDot,
                {
                  backgroundColor:
                    toast.tone === 'danger'
                      ? theme.danger
                      : toast.tone === 'warning'
                      ? theme.warning
                      : theme.success
                }
              ]}
            />
            <Text style={[styles.toastText, { color: theme.textPrimary }]}>
              {toast.message}
            </Text>
          </View>
        </View>
      ) : null}

      {/* THANH ĐIỀU HƯỚNG 6 PHÂN TRANG DƯỚI ĐÁY (ĐỒNG BỘ VỚI SIDEBAR WEB) */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.bgSidebar,
            borderTopColor: theme.border
          }
        ]}
      >
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleSelectTab(tab.id)}
              activeOpacity={0.78}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[
                styles.tabBtn,
                active ? { backgroundColor: theme.softGreen } : null
              ]}
            >
              <View
                style={[
                  styles.tabIndicator,
                  {
                    backgroundColor: active ? theme.oliveGreen : 'transparent'
                  }
                ]}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: active ? theme.oliveGreen : theme.textSecondary,
                    fontWeight: active ? '700' : '600'
                  }
                ]}
                numberOfLines={1}
              >
                {tab.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MODAL CẢNH BÁO CHÁY KHẨN CẤP */}
      <FireAlertModal
        visible={Boolean(telemetry.fireAlert) && !fireDismissed}
        theme={theme}
        flame={telemetry.flame}
        vibrationEnabled={vibrationEnabled}
        onToggleVibration={() => setVibrationEnabled((v) => !v)}
        onDismiss={() => setFireDismissed(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 28,
    gap: 14
  },
  viewStack: {
    gap: 14
  },
  stickyFireStrip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center'
  },
  stickyFireText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  infoBannerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 12
  },
  infoBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  infoBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoBannerIconText: {
    fontSize: 13,
    fontWeight: '800'
  },
  infoBannerTextWrap: {
    flex: 1,
    minWidth: 0
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  infoBannerSub: {
    fontSize: 11.5,
    marginTop: 2
  },
  hwPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  hwPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  hwPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  timelineCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 10
  },
  timelineHeader: {
    gap: 2
  },
  timelineTitle: {
    fontSize: 14.5,
    fontWeight: '600'
  },
  timelineCount: {
    fontSize: 11.5
  },
  timelineEmpty: {
    fontSize: 12,
    paddingVertical: 6
  },
  timelineList: {
    gap: 6
  },
  timelineItem: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  timelineItemLeft: {
    flex: 1,
    minWidth: 0
  },
  timelineMsg: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  timelineMeta: {
    fontSize: 10.5,
    marginTop: 2
  },
  timelineTime: {
    fontSize: 11
  },
  toastWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 72,
    alignItems: 'center'
  },
  toastBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1
  },
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4
  },
  tabBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    gap: 4
  },
  tabIndicator: {
    width: 18,
    height: 3,
    borderRadius: 999
  },
  tabLabel: {
    fontSize: 10.5
  }
});
