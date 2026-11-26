import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';
import { buildBaseUrl } from '../services/mobileApi';

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

function SettingsTab({
  theme,
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
  onToggleTheme
}) {
  return (
    <View style={styles.stack}>
      {/* CẤU HÌNH SERVER C# */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          Kết nối Backend C# qua Wi-Fi LAN
        </Text>
        <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
          Nhập địa chỉ IPv4 của máy tính đang chạy SmartHome.Api (cổng 5000).
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              TABULAR_NUMS,
              {
                backgroundColor: theme.bgMain,
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
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Áp dụng và kết nối IP Server"
            style={[
              styles.saveBtn,
              { backgroundColor: theme.accent, opacity: connecting ? 0.7 : 1 }
            ]}
          >
            {connecting ? (
              <ActivityIndicator size="small" color={theme.accentTextOn} />
            ) : (
              <Text style={[styles.saveBtnText, { color: theme.accentTextOn }]}>Kết nối</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.presetRow}>
          {IP_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              onPress={() => onSelectPresetIp(preset.value)}
              activeOpacity={0.75}
              accessibilityRole="button"
              style={[
                styles.presetChip,
                {
                  backgroundColor: theme.bgElevated,
                  borderColor: activeIp === preset.value ? theme.accent : theme.border
                }
              ]}
            >
              <Text style={[styles.presetText, TABULAR_NUMS, { color: theme.textPrimary }]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TRẠNG THÁI SIGNALR & MQTT BROKER */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          Chẩn đoán SignalR &amp; MQTT Broker
        </Text>

        <View style={styles.infoList}>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Endpoint API</Text>
            <Text style={[styles.infoVal, TABULAR_NUMS, { color: theme.textPrimary }]}>
              {buildBaseUrl(activeIp)}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>SignalR Hub</Text>
            <Text
              style={[
                styles.infoVal,
                { color: hubConnected ? theme.success : theme.warning }
              ]}
            >
              {hubConnected ? 'Đã kết nối thời gian thực' : 'Chưa kết nối'}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>MQTT Broker</Text>
            <Text style={[styles.infoVal, TABULAR_NUMS, { color: theme.textPrimary }]}>
              {connMeta.brokerHost}:{connMeta.brokerPort}{' '}
              {connMeta.brokerConnected ? '(Online)' : '(Chờ)'}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Topic Telemetry</Text>
            <Text style={[styles.infoVal, TABULAR_NUMS, { color: theme.textSecondary }]}>
              {connMeta.telemetryTopic}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Topic Command</Text>
            <Text style={[styles.infoVal, TABULAR_NUMS, { color: theme.textSecondary }]}>
              {connMeta.commandTopic}
            </Text>
          </View>
        </View>
      </View>

      {/* TÙY CHỌN ỨNG DỤNG */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          Tùy chọn giao diện &amp; cảnh báo
        </Text>

        <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
          <View style={styles.switchTextBlock}>
            <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
              Rung điện thoại khi báo cháy
            </Text>
            <Text style={[styles.switchSub, { color: theme.textSecondary }]}>
              Kích hoạt Vibration.vibrate liên tục khi fireAlert = true
            </Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={onToggleVibration}
            trackColor={{ false: theme.border, true: theme.danger }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.switchRow, { borderBottomColor: 'transparent' }]}>
          <View style={styles.switchTextBlock}>
            <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
              Giao diện tối (Dark Mode)
            </Text>
            <Text style={[styles.switchSub, { color: theme.textSecondary }]}>
              Dễ nhìn ban đêm hoặc ngoài trời khi chuyển sang chế độ sáng
            </Text>
          </View>
          <Switch
            value={theme.mode === 'dark'}
            onValueChange={onToggleTheme}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* TRA CỨU NHANH CHÂN CẮM PHẦN CỨNG */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          Sơ đồ chân Vietduino ESP32 (Tra cứu nhanh)
        </Text>
        <View style={styles.pinList}>
          {PINOUT_SUMMARY.map((row) => (
            <View
              key={row.device}
              style={[styles.pinRow, { backgroundColor: theme.bgElevated }]}
            >
              <Text style={[styles.pinDevice, { color: theme.textPrimary }]}>{row.device}</Text>
              <Text style={[styles.pinCode, TABULAR_NUMS, { color: theme.accentStrong }]}>
                {row.pin}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  cardSub: {
    fontSize: 12,
    lineHeight: 18
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600'
  },
  saveBtn: {
    minHeight: 46,
    minWidth: 92,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800'
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  presetChip: {
    minHeight: 36,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center'
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700'
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
    fontWeight: '600'
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right'
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 12
  },
  switchTextBlock: {
    flex: 1,
    gap: 2
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700'
  },
  switchSub: {
    fontSize: 12,
    lineHeight: 17
  },
  pinList: {
    gap: 6
  },
  pinRow: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  pinDevice: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  pinCode: {
    fontSize: 11,
    fontWeight: '800'
  }
});

export default memo(SettingsTab);

