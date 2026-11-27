import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Linking,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';
import {
  buildBaseUrl,
  getMobileExportCsvUrl
} from '../services/mobileApi';

const IP_PRESETS = [
  { label: 'LAN mặc định (192.168.1.31)', value: '192.168.1.31' },
  { label: 'Android Emulator (10.0.2.2)', value: '10.0.2.2' },
  { label: 'Localhost (127.0.0.1)', value: '127.0.0.1' }
];

const PINOUT_SUMMARY = [
  { device: 'DHT20 & LCD1602 (I2C)', pin: 'IO21 (SDA) • IO22 (SCL)' },
  { device: 'Đèn Trắng phòng khách', pin: 'IO32' },
  { device: 'Cảm biến PIR & Nút vật lý', pin: 'IO27 (PIR) • IO25 (Nút)' },
  { device: 'Giàn phơi Servo & Mưa', pin: 'IO33 (Servo) • IO23 (Mưa)' },
  { device: 'Máy bơm & Độ ẩm đất', pin: 'IO26 (Relay) • IO35 (Đất)' },
  { device: 'Cảm biến Lửa, Còi & 2 Đèn Đỏ', pin: 'IO34 (Lửa) • IO19 • IO14' }
];

/**
 * SettingsTab — Apple-Settings-style Grouped Configuration Page
 * Synchronized 100% with 3-frontend-react/src/components/SettingsView.jsx
 */
function SettingsTab({
  theme,
  telemetry,
  serverIp,
  activeIp,
  hubConnected,
  connecting,
  connMeta,
  vibrationEnabled,
  onChangeServerIp,
  onSelectPresetIp,
  onSubmitIp,
  onToggleVibration,
  onToggleTheme,
  onRequestClearLogs
}) {
  const handleDownloadCsv = () => {
    const url = getMobileExportCsvUrl(activeIp);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.stack}>
      {/* TOP BANNER: AURA SMART HOME 2.0 — LUXURY EDITION */}
      <View
        style={[
          styles.card,
          CARD_SHADOW,
          { backgroundColor: theme.bgCard, borderColor: theme.border }
        ]}
      >
        <View style={styles.bannerTop}>
          <View
            style={[
              styles.cpuIconBox,
              { backgroundColor: theme.oliveSoft }
            ]}
          >
            <Text style={[styles.cpuIconText, { color: theme.oliveGreen }]}>
              AH
            </Text>
          </View>
          <View style={styles.bannerTitleWrap}>
            <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>
              AURA SMART HOME 2.0 — LUXURY EDITION
            </Text>
            <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
              Vietduino ESP32 (N16) • ASP.NET Core 8.0 SignalR • React Native Expo
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.onlineBannerPill,
            {
              backgroundColor: telemetry?.online
                ? theme.successSoft
                : theme.softGreen
            }
          ]}
        >
          <View
            style={[
              styles.onlineDot,
              {
                backgroundColor: telemetry?.online
                  ? theme.oliveGreen
                  : theme.textSecondary
              }
            ]}
          />
          <Text
            style={[
              styles.onlineBannerText,
              {
                color: telemetry?.online
                  ? theme.oliveGreen
                  : theme.textPrimary
              }
            ]}
          >
            {telemetry?.online ? 'ESP32 Trực tuyến' : 'Chế độ chờ MQTT'}
          </Text>
        </View>
      </View>

      {/* GROUP 1: GIAO DIỆN & TRẢI NGHIỆM CẢNH BÁO */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupEyebrow, { color: theme.textSecondary }]}>
          Giao diện &amp; Trải nghiệm cảnh báo
        </Text>

        <View
          style={[
            styles.card,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          {/* Row 1: Light / Dark Mode */}
          <View
            style={[
              styles.settingRow,
              { borderBottomWidth: 1, borderBottomColor: theme.border }
            ]}
          >
            <View style={styles.settingTextBlock}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Chủ đề hiển thị (Luxury Light / Dark Mode)
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Bảng màu nội thất kiến trúc ấm áp ban ngày hoặc xanh rừng sâu ban đêm
              </Text>
            </View>
            <Switch
              value={theme.mode === 'dark'}
              onValueChange={onToggleTheme}
              trackColor={{ false: theme.border, true: theme.oliveGreen }}
              thumbColor="#FAFCF9"
            />
          </View>

          {/* Row 2: Phone Vibration Alert */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextBlock}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Rung điện thoại khi báo cháy khẩn cấp
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Tự động kích hoạt Vibration.vibrate khi cảm biến lửa IO34 báo cháy (ADC &lt; 15)
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={onToggleVibration}
              trackColor={{ false: theme.border, true: theme.danger }}
              thumbColor="#FAFCF9"
            />
          </View>
        </View>
      </View>

      {/* GROUP 2: KẾT NỐI MẠNG NỘI BỘ LAN & BACKEND C# */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupEyebrow, { color: theme.textSecondary }]}>
          Kết nối mạng nội bộ (LAN) &amp; Backend C#
        </Text>

        <View
          style={[
            styles.card,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Địa chỉ IPv4 Server C# (Cổng 5000)
          </Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            Nhập địa chỉ IP Wi-Fi của máy tính đang chạy SmartHome.Api để đồng bộ thời gian thực qua SignalR.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                TABULAR_NUMS,
                {
                  backgroundColor: theme.bgSubtle,
                  borderColor: theme.border,
                  color: theme.textPrimary
                }
              ]}
              value={serverIp}
              onChangeText={onChangeServerIp}
              placeholder="VD: 192.168.1.31…"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Địa chỉ IP Server Backend C#"
            />
            <TouchableOpacity
              onPress={onSubmitIp}
              disabled={connecting}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Áp dụng và kết nối IP Server"
              style={[
                styles.saveBtn,
                {
                  backgroundColor: theme.oliveGreen,
                  opacity: connecting ? 0.7 : 1
                }
              ]}
            >
              {connecting ? (
                <ActivityIndicator size="small" color="#FAFCF9" />
              ) : (
                <Text style={styles.saveBtnText}>Kết nối</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.presetRow}>
            {IP_PRESETS.map((preset) => {
              const selected = activeIp === preset.value;
              return (
                <TouchableOpacity
                  key={preset.value}
                  onPress={() => onSelectPresetIp(preset.value)}
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: selected
                        ? theme.softGreen
                        : theme.bgElevated,
                      borderColor: selected ? theme.oliveGreen : theme.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      TABULAR_NUMS,
                      {
                        color: selected ? theme.oliveGreen : theme.textPrimary
                      }
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* GROUP 3: CHẨN ĐOÁN SIGNALR & MQTT BROKER */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupEyebrow, { color: theme.textSecondary }]}>
          Chẩn đoán SignalR Hub &amp; MQTT Broker
        </Text>

        <View
          style={[
            styles.card,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <View style={styles.infoList}>
            <View
              style={[styles.infoRow, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.infoKey, { color: theme.textSecondary }]}>
                Backend REST &amp; Hub
              </Text>
              <Text
                style={[
                  styles.infoVal,
                  TABULAR_NUMS,
                  { color: theme.textPrimary }
                ]}
              >
                {buildBaseUrl(activeIp)}
              </Text>
            </View>

            <View
              style={[styles.infoRow, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.infoKey, { color: theme.textSecondary }]}>
                Trạng thái SignalR
              </Text>
              <Text
                style={[
                  styles.infoVal,
                  { color: hubConnected ? theme.success : theme.warning }
                ]}
              >
                {hubConnected ? 'Đã kết nối thời gian thực' : 'Chưa kết nối'}
              </Text>
            </View>

            <View
              style={[styles.infoRow, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.infoKey, { color: theme.textSecondary }]}>
                MQTT Broker
              </Text>
              <Text
                style={[
                  styles.infoVal,
                  TABULAR_NUMS,
                  { color: theme.textPrimary }
                ]}
              >
                {connMeta.brokerHost}:{connMeta.brokerPort}{' '}
                {connMeta.brokerConnected ? '(Connected)' : '(Standby)'}
              </Text>
            </View>

            <View
              style={[styles.infoRow, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.infoKey, { color: theme.textSecondary }]}>
                Topic Telemetry
              </Text>
              <Text
                style={[
                  styles.infoVal,
                  TABULAR_NUMS,
                  { color: theme.textSecondary }
                ]}
              >
                {connMeta.telemetryTopic}
              </Text>
            </View>

            <View
              style={[styles.infoRow, { borderBottomColor: 'transparent' }]}
            >
              <Text style={[styles.infoKey, { color: theme.textSecondary }]}>
                Topic Command
              </Text>
              <Text
                style={[
                  styles.infoVal,
                  TABULAR_NUMS,
                  { color: theme.textSecondary }
                ]}
              >
                {connMeta.commandTopic}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* GROUP 4: SƠ ĐỒ CHÂN VIETDUINO ESP32 */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupEyebrow, { color: theme.textSecondary }]}>
          Sơ đồ chân phần cứng Vietduino ESP32
        </Text>

        <View
          style={[
            styles.card,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <View style={styles.pinList}>
            {PINOUT_SUMMARY.map((row) => (
              <View
                key={row.device}
                style={[
                  styles.pinRow,
                  { backgroundColor: theme.bgElevated }
                ]}
              >
                <Text
                  style={[styles.pinDevice, { color: theme.textPrimary }]}
                >
                  {row.device}
                </Text>
                <Text
                  style={[
                    styles.pinCode,
                    TABULAR_NUMS,
                    { color: theme.oliveGreen }
                  ]}
                >
                  {row.pin}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* GROUP 5: QUẢN TRỊ DỮ LIỆU & XUẤT BÁO CÁO */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupEyebrow, { color: theme.textSecondary }]}>
          Quản trị dữ liệu &amp; Xuất báo cáo
        </Text>

        <View
          style={[
            styles.card,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Báo cáo CSV &amp; Nhật ký hoạt động
          </Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            Tải về toàn bộ lịch sử đo đạc định dạng Excel (.CSV UTF-8) hoặc đặt lại bộ đếm sự kiện.
          </Text>

          <View style={styles.dataBtnRow}>
            <TouchableOpacity
              onPress={handleDownloadCsv}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Tải báo cáo CSV"
              style={[
                styles.csvBtn,
                { backgroundColor: theme.oliveGreen }
              ]}
            >
              <Text style={styles.csvBtnText}>Tải báo cáo (.CSV)</Text>
            </TouchableOpacity>

            {onRequestClearLogs ? (
              <TouchableOpacity
                onPress={onRequestClearLogs}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Đặt lại nhật ký"
                style={[
                  styles.resetLogsBtn,
                  { backgroundColor: theme.dangerSoft }
                ]}
              >
                <Text
                  style={[styles.resetLogsBtnText, { color: theme.danger }]}
                >
                  Đặt lại nhật ký
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16
  },
  groupSection: {
    gap: 8
  },
  groupEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cpuIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cpuIconText: {
    fontSize: 15,
    fontWeight: '800'
  },
  bannerTitleWrap: {
    flex: 1,
    minWidth: 0
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  bannerSub: {
    fontSize: 11.5,
    marginTop: 2
  },
  onlineBannerPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  onlineBannerText: {
    fontSize: 12,
    fontWeight: '600'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12
  },
  settingTextBlock: {
    flex: 1,
    gap: 2
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  settingSub: {
    fontSize: 12,
    lineHeight: 17
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  cardSub: {
    fontSize: 12,
    lineHeight: 17
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13.5,
    fontWeight: '600'
  },
  saveBtn: {
    minHeight: 44,
    minWidth: 92,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FAFCF9'
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  presetChip: {
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center'
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600'
  },
  infoList: {
    gap: 2
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 12
  },
  infoKey: {
    fontSize: 12,
    fontWeight: '500'
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right'
  },
  pinList: {
    gap: 6
  },
  pinRow: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  pinDevice: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  pinCode: {
    fontSize: 11,
    fontWeight: '700'
  },
  dataBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  csvBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  csvBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FAFCF9'
  },
  resetLogsBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  resetLogsBtnText: {
    fontSize: 12.5,
    fontWeight: '600'
  }
});

export default memo(SettingsTab);
