import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Vibration,
  Alert,
  StatusBar
} from 'react-native';
import * as signalR from '@microsoft/signalr';
import {
  DEFAULT_SERVER_IP,
  buildSignalRUrl,
  fetchMobileDeviceStatus,
  sendMobileCommand
} from './src/services/mobileApi';

export default function App() {
  const [serverIp, setServerIp] = useState(DEFAULT_SERVER_IP);
  const [activeIp, setActiveIp] = useState(DEFAULT_SERVER_IP);
  const [hubConnected, setHubConnected] = useState(false);
  const [fireDismissed, setFireDismissed] = useState(false);
  const connectionRef = useRef(null);

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
    online: false
  });

  useEffect(() => {
    connectToBackend(activeIp);
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [activeIp]);

  async function connectToBackend(ip) {
    try {
      if (connectionRef.current) {
        await connectionRef.current.stop();
      }

      const initial = await fetchMobileDeviceStatus(ip);
      if (initial) setTelemetry(initial);

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(buildSignalRUrl(ip))
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveTelemetry', (data) => {
        setTelemetry(data);
        if (data.fireAlert) {
          Vibration.vibrate([0, 400, 200, 400]);
        } else {
          setFireDismissed(false);
        }
      });

      await connection.start();
      connectionRef.current = connection;
      setHubConnected(true);
    } catch (err) {
      setHubConnected(false);
    }
  }

  async function handleCommand(cmd, value) {
    try {
      const res = await sendMobileCommand(activeIp, cmd, value);
      if (res?.latestState) {
        setTelemetry(res.latestState);
      }
    } catch (err) {
      Alert.alert(
        'Lỗi Kết Nối Server C#',
        `Không thể gửi lệnh tới http://${activeIp}:5000. Hãy kiểm tra IP Wi-Fi của Laptop và cổng 5000 đã bật chưa!`
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* CẢNH BÁO CHÁY KHẨN CẤP TRÊN ĐIỆN THOẠI */}
      {telemetry.fireAlert && !fireDismissed && (
        <View style={styles.fireBanner}>
          <Text style={styles.fireTitle}>🚨 !! CẢNH BÁO PHÁT HIỆN LỬA !!</Text>
          <Text style={styles.fireDesc}>
            Cảm biến lửa (IO34) báo chỉ số {telemetry.flame} (&lt; 15). Còi và 2 Đèn Đỏ đang hú!
          </Text>
          <TouchableOpacity
            style={styles.fireBtn}
            onPress={() => setFireDismissed(true)}
          >
            <Text style={styles.fireBtnText}>Đã Xác Nhận Trên Điện Thoại</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER & CẤU HÌNH IP SERVER C# */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appTitle}>📱 Smart Home &amp; Garden</Text>
              <Text style={styles.appSub}>React Native Mobile • Vietduino ESP32</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                telemetry.online ? styles.badgeOnline : styles.badgeOffline
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  telemetry.online ? styles.textOnline : styles.textOffline
                ]}
              >
                {telemetry.online ? '🟢 ESP32 ONLINE' : '🟡 CHỜ MQTT'}
              </Text>
            </View>
          </View>

          <View style={styles.ipRow}>
            <TextInput
              style={styles.ipInput}
              value={serverIp}
              onChangeText={setServerIp}
              placeholder="IP Laptop chạy C# (VD: 192.168.1.31)"
              placeholderTextColor="#64748b"
            />
            <TouchableOpacity
              style={styles.ipBtn}
              onPress={() => setActiveIp(serverIp)}
            >
              <Text style={styles.ipBtnText}>
                {hubConnected ? 'Đã Nối C#' : 'Kết Nối'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CỤM 4 THẺ CẢM BIẾN THỜI GIAN THỰC */}
        <View style={styles.sensorGrid}>
          <View style={styles.sensorCard}>
            <Text style={styles.sensorLabel}>🌡️ Nhiệt Độ (DHT20)</Text>
            <Text style={[styles.sensorValue, { color: '#fb923c' }]}>
              {Number(telemetry.temp).toFixed(1)} °C
            </Text>
          </View>

          <View style={styles.sensorCard}>
            <Text style={styles.sensorLabel}>💧 Độ Ẩm Khí</Text>
            <Text style={[styles.sensorValue, { color: '#38bdf8' }]}>
              {Number(telemetry.hum).toFixed(0)} %
            </Text>
          </View>

          <View style={styles.sensorCard}>
            <Text style={styles.sensorLabel}>🌱 Độ Ẩm Đất (IO35)</Text>
            <Text style={[styles.sensorValue, { color: '#34d399' }]}>
              {telemetry.soil} %
            </Text>
          </View>

          <View style={styles.sensorCard}>
            <Text style={styles.sensorLabel}>🔥 Lửa &amp; 🌧️ Thời Tiết</Text>
            <Text
              style={[
                styles.sensorValueSmall,
                { color: telemetry.fireAlert ? '#f87171' : '#34d399' }
              ]}
            >
              {telemetry.fireAlert ? 'BÁO CHÁY!' : `Lửa ADC: ${telemetry.flame}`}
            </Text>
            <Text style={styles.weatherSub}>
              {telemetry.rain ? '🌧️ ĐANG MƯA' : '☀️ KHÔ RÁO'}
            </Text>
          </View>
        </View>

        {/* KHỐI 1: ĐÈN TRẮNG & KHÓA CẢM BIẾN PIR */}
        <View style={styles.controlCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💡 Đèn Phòng Khách (IO32) &amp; PIR</Text>
            <Text style={styles.cardBadge}>
              {telemetry.lightOn ? 'ĐANG SÁNG' : 'ĐANG TẮT'}
            </Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                telemetry.lightOn ? styles.btnYellowActive : styles.btnDark
              ]}
              onPress={() => handleCommand('LIGHT', 'ON')}
            >
              <Text
                style={[
                  styles.ctrlBtnText,
                  telemetry.lightOn && { color: '#020617' }
                ]}
              >
                Bật Đèn Trắng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                !telemetry.lightOn ? styles.btnSlateActive : styles.btnDark
              ]}
              onPress={() => handleCommand('LIGHT', 'OFF')}
            >
              <Text style={styles.ctrlBtnText}>Tắt Đèn (Khóa 5s)</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.fullBtn,
              telemetry.pirLocked ? styles.btnAmberOutline : styles.btnGreenOutline
            ]}
            onPress={() =>
              handleCommand('PIR_LOCK', telemetry.pirLocked ? 'UNLOCK' : 'LOCK')
            }
          >
            <Text style={styles.fullBtnText}>
              {telemetry.pirLocked
                ? '🔓 Đang Khóa PIR (Đi Ngủ) — Chạm Để Mở Lại'
                : '🔒 PIR Đang Tự Động — Chạm Để Khóa PIR (Kêu Bíp)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* KHỐI 2: GIÀN PHƠI QUẦN ÁO SERVO SG90 */}
        <View style={styles.controlCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👕 Giàn Phơi Thông Minh (IO33)</Text>
            <Text style={styles.cardBadge}>
              Góc: {telemetry.servoAngle}° ({telemetry.servoMode})
            </Text>
          </View>
          <View style={styles.btnRow3}>
            <TouchableOpacity
              style={[
                styles.ctrlBtn3,
                telemetry.servoMode === 'AUTO' ? styles.btnBlueActive : styles.btnDark
              ]}
              onPress={() => handleCommand('SERVO', 'AUTO')}
            >
              <Text style={styles.ctrlBtnText}>🤖 Tự Động</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ctrlBtn3,
                telemetry.servoMode === 'OUT' ? styles.btnYellowActive : styles.btnDark
              ]}
              onPress={() => handleCommand('SERVO', 'OUT')}
            >
              <Text
                style={[
                  styles.ctrlBtnText,
                  telemetry.servoMode === 'OUT' && { color: '#020617' }
                ]}
              >
                ☀️ Phơi (15°)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ctrlBtn3,
                telemetry.servoMode === 'IN' ? styles.btnIndigoActive : styles.btnDark
              ]}
              onPress={() => handleCommand('SERVO', 'IN')}
            >
              <Text style={styles.ctrlBtnText}>🏠 Thu (165°)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KHỐI 3: MÁY BƠM TƯỚI CÂY TỰ ĐỘNG */}
        <View style={styles.controlCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💦 Máy Bơm Tưới Cây (Relay IO26)</Text>
            <Text style={styles.cardBadge}>
              Đợt: {telemetry.pumpCount || 0}/5 •{' '}
              {telemetry.pumpLocked
                ? 'KHÓA BƠM'
                : telemetry.pumpOn
                ? 'ĐANG BƠM'
                : 'NGHỈ'}
            </Text>
          </View>
          <View style={styles.btnRow3}>
            <TouchableOpacity
              style={[styles.ctrlBtn3, styles.btnGreenActive]}
              onPress={() => handleCommand('PUMP', 'START')}
            >
              <Text style={styles.ctrlBtnText}>🚿 Tưới (2.5s)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctrlBtn3, styles.btnDark]}
              onPress={() => handleCommand('PUMP', 'STOP')}
            >
              <Text style={styles.ctrlBtnText}>🛑 Dừng Bơm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctrlBtn3, styles.btnAmberOutline]}
              onPress={() => handleCommand('PUMP', 'UNLOCK')}
            >
              <Text style={styles.ctrlBtnText}>🔓 Mở Khóa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KHỐI 4: CÒI BÁO ĐỘNG & 2 ĐÈN ĐỎ */}
        <View style={styles.controlCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🚨 Còi (IO19) &amp; 2 Đèn Đỏ (IO14)</Text>
            <Text style={styles.cardBadge}>
              {telemetry.redLedOn ? 'ĐANG NHÁY' : 'TẮT'}
            </Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.ctrlBtn, styles.btnRedOutline]}
              onPress={() => handleCommand('ALARM_TEST', 'ON')}
            >
              <Text style={styles.ctrlBtnText}>🔔 Test Còi &amp; Đèn (2s)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctrlBtn, styles.btnDark]}
              onPress={() => handleCommand('ALARM_TEST', 'OFF')}
            >
              <Text style={styles.ctrlBtnText}>Tắt Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 14, paddingBottom: 36, gap: 14 },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  appTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '800' },
  appSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  badgeOnline: { backgroundColor: '#064e3b', borderColor: '#10b981' },
  badgeOffline: { backgroundColor: '#451a03', borderColor: '#f59e0b' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textOnline: { color: '#6ee7b7' },
  textOffline: { color: '#fcd34d' },
  ipRow: { flexDirection: 'row', gap: 8 },
  ipInput: {
    flex: 1,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 13
  },
  ipBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10
  },
  ipBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  sensorCard: {
    width: '48.5%',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sensorLabel: { color: '#94a3b8', fontSize: 11 },
  sensorValue: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  sensorValueSmall: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  weatherSub: { color: '#cbd5e1', fontSize: 11, marginTop: 4 },
  controlCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { color: '#f8fafc', fontSize: 14, fontWeight: '700' },
  cardBadge: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 8 },
  btnRow3: { flexDirection: 'row', gap: 8 },
  ctrlBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctrlBtn3: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctrlBtnText: { color: '#f8fafc', fontWeight: '700', fontSize: 12 },
  btnDark: { backgroundColor: '#1e293b' },
  btnYellowActive: { backgroundColor: '#eab308' },
  btnSlateActive: { backgroundColor: '#475569' },
  btnBlueActive: { backgroundColor: '#0284c7' },
  btnIndigoActive: { backgroundColor: '#4f46e5' },
  btnGreenActive: { backgroundColor: '#059669' },
  btnAmberOutline: {
    backgroundColor: '#451a03',
    borderWidth: 1,
    borderColor: '#f59e0b'
  },
  btnGreenOutline: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981'
  },
  btnRedOutline: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  fullBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center'
  },
  fullBtnText: { color: '#f8fafc', fontSize: 12, fontWeight: '700' },
  fireBanner: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderBottomWidth: 2,
    borderColor: '#ef4444',
    gap: 6
  },
  fireTitle: { color: '#fecaca', fontSize: 16, fontWeight: '900' },
  fireDesc: { color: '#fee2e2', fontSize: 12 },
  fireBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4
  },
  fireBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 }
});
