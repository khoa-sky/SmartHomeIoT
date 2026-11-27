import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';
import { normalizeServerInput } from '../services/mobileApi';

function formatElapsed(secondsAgo) {
  if (secondsAgo === null || secondsAgo === undefined) return 'Chưa có gói tin';
  if (secondsAgo < 2) return 'Vừa cập nhật';
  if (secondsAgo < 60) return `${secondsAgo} giây trước`;
  const mins = Math.floor(secondsAgo / 60);
  return `${mins} phút trước`;
}

function HeaderBar({
  theme,
  telemetryOnline,
  hubConnected,
  connecting,
  secondsAgo,
  serverIp,
  activeIp,
  ipEditorOpen,
  onToggleIpEditor,
  onChangeServerIp,
  onSubmitIp,
  onToggleTheme
}) {
  const activeAddress = normalizeServerInput(activeIp);

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border
        }
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.brandBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            Smart Home &amp; Garden
          </Text>
          <View style={styles.subRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: hubConnected ? theme.success : theme.warning }
              ]}
            />
            <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {hubConnected ? 'SignalR đã nối C#' : 'Chưa nối Server C#'} •{' '}
              <Text style={TABULAR_NUMS}>{formatElapsed(secondsAgo)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: telemetryOnline ? theme.successSoft : theme.warningSoft,
                borderColor: telemetryOnline ? theme.success : theme.warning
              }
            ]}
            accessibilityLabel={
              telemetryOnline ? 'Mạch ESP32 đang trực tuyến' : 'Đang chờ dữ liệu MQTT từ ESP32'
            }
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: telemetryOnline ? theme.success : theme.warning }
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: telemetryOnline ? theme.success : theme.warning }
              ]}
            >
              {telemetryOnline ? 'ESP32 ONLINE' : 'CHỜ MQTT'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onToggleTheme}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={
              theme.mode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
            }
            style={[
              styles.iconBtn,
              {
                backgroundColor: theme.bgElevated,
                borderColor: theme.border
              }
            ]}
          >
            <Text style={[styles.iconBtnText, { color: theme.textPrimary }]}>
              {theme.mode === 'dark' ? 'Sáng' : 'Tối'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.serverBarRow}>
        <TouchableOpacity
          onPress={onToggleIpEditor}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Mở hoặc thu gọn cấu hình IP Server C#"
          style={[
            styles.ipPillBtn,
            {
              backgroundColor: theme.bgElevated,
              borderColor: hubConnected ? theme.border : theme.warning
            }
          ]}
        >
          <Text style={[styles.ipPillLabel, { color: theme.textSecondary }]}>Server C#:</Text>
          <Text style={[styles.ipPillValue, TABULAR_NUMS, { color: theme.textPrimary }]}>
            {activeAddress}
          </Text>
          <Text style={[styles.ipPillChevron, { color: theme.accentStrong }]}>
            {ipEditorOpen ? 'Thu gọn' : 'Đổi IP'}
          </Text>
        </TouchableOpacity>
      </View>

      {ipEditorOpen ? (
        <View style={styles.editorBox}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.ipInput,
                TABULAR_NUMS,
                {
                  backgroundColor: theme.bgMain,
                  borderColor: theme.border,
                  color: theme.textPrimary
                }
              ]}
              value={serverIp}
              onChangeText={onChangeServerIp}
              placeholder="IP Wi-Fi Laptop (VD: 192.168.1.31)…"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              onSubmitEditing={onSubmitIp}
              accessibilityLabel="Địa chỉ IP LAN của máy tính chạy Backend C#"
            />
            <TouchableOpacity
              onPress={onSubmitIp}
              disabled={connecting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Kết nối tới Server C#"
              accessibilityState={{ disabled: connecting, busy: connecting }}
              style={[
                styles.connectBtn,
                {
                  backgroundColor: hubConnected ? theme.success : theme.accent,
                  opacity: connecting ? 0.7 : 1
                }
              ]}
            >
              {connecting ? (
                <ActivityIndicator
                  size="small"
                  color={hubConnected ? theme.successTextOn : theme.accentTextOn}
                />
              ) : (
                <Text
                  style={[
                    styles.connectBtnText,
                    { color: hubConnected ? theme.successTextOn : theme.accentTextOn }
                  ]}
                >
                  {hubConnected ? 'Kết nối lại' : 'Kết Nối'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            Điện thoại &amp; Laptop phải chung Wi-Fi. Backend C# mở tại cổng 5000 (trình giả lập Android dùng 10.0.2.2).
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  brandBlock: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },
  iconBtn: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  serverBarRow: {
    flexDirection: 'row'
  },
  ipPillBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ipPillLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  ipPillValue: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  ipPillChevron: {
    fontSize: 12,
    fontWeight: '700'
  },
  editorBox: {
    gap: 8,
    paddingTop: 2
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  ipInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600'
  },
  connectBtn: {
    minHeight: 46,
    minWidth: 96,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  connectBtnText: {
    fontSize: 13,
    fontWeight: '800'
  },
  helperText: {
    fontSize: 11,
    lineHeight: 16
  }
});

export default memo(HeaderBar);

