import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  normalizeServerInput,
  sendMobileCommand
} from './src/services/mobileApi';
import { DARK_THEME, LIGHT_THEME } from './src/theme/tokens';
import HeaderBar from './src/components/HeaderBar';
import SensorOverviewGrid from './src/components/SensorOverviewGrid';
import DeviceControlPanels from './src/components/DeviceControlPanels';
import AnalyticsTab from './src/components/AnalyticsTab';
import SettingsTab from './src/components/SettingsTab';
import FireAlertModal from './src/components/FireAlertModal';

const INITIAL_TELEMETRY = {
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

const TABS = [
  { id: 'control', label: 'Điều Khiển' },
  { id: 'analytics', label: 'Thống Kê' },
  { id: 'settings', label: 'Kết Nối' }
];

export default function App() {
  const [themeMode, setThemeMode] = useState('dark');
  const theme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const [activeTab, setActiveTab] = useState('control');
  const [serverIp, setServerIp] = useState(DEFAULT_SERVER_IP);
  const [activeIp, setActiveIp] = useState(DEFAULT_SERVER_IP);
  const [ipEditorOpen, setIpEditorOpen] = useState(true);
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
  const lastChartSampleAtRef = useRef(0);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, tone = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, tone, id: Date.now() });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  const loadSnapshotData = useCallback(async (targetIp) => {
    const [statusRes, connRes, summaryRes, historyRes, logsRes] = await Promise.allSettled([
      fetchMobileDeviceStatus(targetIp),
      fetchMobileConnectionInfo(targetIp),
      fetchMobileAnalyticsSummary(targetIp),
      fetchMobileSensorHistory(targetIp, 24),
      fetchMobileEventLogs(targetIp, 'ALL', 60)
    ]);

    let anySuccess = false;

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
          .withUrl(buildSignalRUrl(ip))
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Warning)
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
                  ? 'Phát hiện mưa — Giàn phơi tự thu vào (165°)'
                  : 'Trời khô ráo — Giàn phơi đưa ra ngoài (15°)',
                'warning'
              );
            } else if (!prev.pumpOn && data.pumpOn) {
              showToast('Máy bơm tưới cây (IO26) đang chạy 2.5 giây', 'success');
            }
          }

          prevTelemetryRef.current = data;
          setTelemetry(data);

          if (data.online) {
            lastPacketAtRef.current = Date.now();
            setSecondsAgo(0);
          }

          if (!data.fireAlert) {
            setFireDismissed(false);
          }

          const now = Date.now();
          if (now - lastChartSampleAtRef.current >= 4500) {
            lastChartSampleAtRef.current = now;
            setHistory((prevHist) => {
              const next = [
                ...prevHist,
                {
                  id: now,
                  timestamp: new Date(now).toISOString(),
                  temp: data.temp,
                  hum: data.hum,
                  soil: data.soil
                }
              ];
              return next.slice(-24);
            });
          }
        });

        connection.on('NewEventLog', (logItem) => {
          if (cancelled || !logItem) return;
          setLogs((prevLogs) => [logItem, ...prevLogs.slice(0, 79)]);
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
          if (!cancelled) setHubConnected(false);
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
          showToast(`Đã kết nối Server C# (${normalizeServerInput(ip)})`, 'success');
        }
      } catch {
        if (!cancelled) {
          setHubConnected(false);
          setIpEditorOpen(true);
        }
      } finally {
        if (!cancelled) setConnecting(false);
      }
    }

    connectToBackend(activeIp);

    return () => {
      cancelled = true;
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [activeIp, loadSnapshotData, showToast]);

  // Đồng hồ đếm thời gian cập nhật & kiểm tra timeout 6 giây mất kết nối ESP32
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastPacketAtRef.current) return;
      const diffSec = Math.floor((Date.now() - lastPacketAtRef.current) / 1000);
      setSecondsAgo(diffSec);
      if (diffSec > 6) {
        setTelemetry((prev) => (prev.online ? { ...prev, online: false } : prev));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rung điện thoại liên hồi khi phát hiện cháy (FR-02.6 + Commit 3)
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
      loadSnapshotData(normalized).then((ok) => {
        if (ok) {
          showToast(`Đã làm mới kết nối tới ${normalized}`, 'success');
        } else {
          showToast(`Không phản hồi từ ${normalized}. Kiểm tra Server C# cổng 5000.`, 'danger');
        }
      });
    } else {
      setActiveIp(normalized);
    }
  }, [serverIp, activeIp, loadSnapshotData, showToast]);

  const handleSelectPresetIp = useCallback((ip) => {
    setServerIp(ip);
    setActiveIp(ip);
  }, []);

  const handleCommand = useCallback(
    async (cmd, value, successLabel) => {
      const key = `${cmd}:${value}`;
      setPendingCmd(key);
      try {
        const res = await sendMobileCommand(activeIp, cmd, value);
        if (res?.latestState) {
          prevTelemetryRef.current = res.latestState;
          setTelemetry(res.latestState);
        }
        showToast(successLabel || `Đã gửi lệnh ${cmd}: ${value}`, 'success');
      } catch (err) {
        Alert.alert(
          'Lỗi Kết Nối Server C#',
          `${err?.message || 'Không gửi được lệnh'}.\n\nHãy kiểm tra địa chỉ ${normalizeServerInput(
            activeIp
          )}, Wi-Fi chung mạng và chắc chắn Backend C# đang chạy.`
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

  const handleRequestClearLogs = useCallback(() => {
    Alert.alert(
      'Đặt lại nhật ký hoạt động?',
      'Thao tác này sẽ xóa các dòng nhật ký cũ trên Backend C# và đưa bộ đếm thống kê về 0.',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xác nhận xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await clearMobileEventLogs(activeIp);
              if (Array.isArray(res?.logs)) setLogs(res.logs);
              if (res?.summary) setSummary(res.summary);
              showToast('Đã đặt lại nhật ký sự kiện và bộ đếm', 'success');
            } catch {
              showToast('Không thể xóa nhật ký. Kiểm tra kết nối Server C#.', 'danger');
            }
          }
        }
      ]
    );
  }, [activeIp, showToast]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

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
            CẢNH BÁO CHÁY ĐANG KÍCH HOẠT (ADC {telemetry.flame}) — Chạm để mở lại chi tiết
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
              tintColor={theme.accent}
              colors={[theme.accent]}
            />
          }
        >
          <HeaderBar
            theme={theme}
            telemetryOnline={Boolean(telemetry.online)}
            hubConnected={hubConnected}
            connecting={connecting}
            secondsAgo={secondsAgo}
            serverIp={serverIp}
            activeIp={activeIp}
            ipEditorOpen={ipEditorOpen}
            onToggleIpEditor={() => setIpEditorOpen((open) => !open)}
            onChangeServerIp={setServerIp}
            onSubmitIp={handleSubmitIp}
            onToggleTheme={handleToggleTheme}
          />

          {activeTab === 'control' ? (
            <View style={styles.tabBody}>
              <SensorOverviewGrid theme={theme} telemetry={telemetry} />
              <DeviceControlPanels
                theme={theme}
                telemetry={telemetry}
                pendingCmd={pendingCmd}
                onCommand={handleCommand}
              />
            </View>
          ) : null}

          {activeTab === 'analytics' ? (
            <AnalyticsTab
              theme={theme}
              summary={summary}
              history={history}
              logs={logs}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onRequestClearLogs={handleRequestClearLogs}
            />
          ) : null}

          {activeTab === 'settings' ? (
            <SettingsTab
              theme={theme}
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
              {
                backgroundColor: theme.bgCard,
                borderColor:
                  toast.tone === 'danger'
                    ? theme.danger
                    : toast.tone === 'warning'
                    ? theme.warning
                    : toast.tone === 'success'
                    ? theme.success
                    : theme.accent
              }
            ]}
          >
            <Text style={[styles.toastText, { color: theme.textPrimary }]}>{toast.message}</Text>
          </View>
        </View>
      ) : null}

      {/* THANH ĐIỀU HƯỚNG 3 TAB DƯỚI ĐÁY */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.bgCard,
            borderTopColor: theme.border
          }
        ]}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                setActiveTab(tab.id);
                if (tab.id === 'analytics') {
                  loadSnapshotData(activeIp).catch(() => {});
                }
              }}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[
                styles.tabBtn,
                active ? { backgroundColor: theme.accentSoft } : null
              ]}
            >
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: active ? theme.accent : 'transparent' }
                ]}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? theme.accentStrong : theme.textSecondary }
                ]}
              >
                {tab.label}
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
    gap: 12
  },
  tabBody: {
    gap: 12
  },
  stickyFireStrip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center'
  },
  stickyFireText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center'
  },
  toastWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 74,
    alignItems: 'center'
  },
  toastBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%'
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8
  },
  tabBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  tabIndicator: {
    width: 24,
    height: 3,
    borderRadius: 999
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '800'
  }
});
