import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';
import { normalizeServerInput } from '../services/mobileApi';

export const NAV_META = {
  overview: {
    viLabel: 'Tổng quan hệ thống',
    subtitle: 'Intelligent living, naturally.'
  },
  devices: {
    viLabel: 'Thiết bị thông minh',
    subtitle: 'Chiếu sáng & Giàn phơi tự động'
  },
  garden: {
    viLabel: 'Tưới tiêu & Độ ẩm đất',
    subtitle: 'Giám sát LM393 & Bảo vệ máy bơm'
  },
  security: {
    viLabel: 'An ninh & Báo cháy',
    subtitle: 'Cảm biến lửa IO34, Buzzer & PIR'
  },
  analytics: {
    viLabel: 'Phân tích & Nhật ký',
    subtitle: 'Biểu đồ lịch sử & Xuất báo cáo CSV'
  },
  settings: {
    viLabel: 'Cấu hình hệ thống',
    subtitle: 'Mạng LAN, MQTT Broker & Giao diện'
  }
};

function formatElapsed(secondsAgo) {
  if (secondsAgo === null || secondsAgo === undefined) return 'Chờ gói tin';
  if (secondsAgo < 2) return 'Vừa đồng bộ';
  if (secondsAgo < 60) return `${secondsAgo}s trước`;
  const mins = Math.floor(secondsAgo / 60);
  return `${mins}p trước`;
}

function HeaderBar({
  theme,
  activeTab = 'overview',
  telemetry,
  telemetryOnline,
  hubConnected,
  connecting,
  secondsAgo,
  serverIp,
  activeIp,
  ipEditorOpen,
  recentLogs = [],
  onToggleIpEditor,
  onChangeServerIp,
  onSubmitIp,
  onToggleTheme,
  onSelectTab
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const activeAddress = normalizeServerInput(activeIp);
  const currentMeta = NAV_META[activeTab] || NAV_META.overview;
  const isFire = Boolean(telemetry?.fireAlert);

  return (
    <View
      style={[
        styles.wrapper,
        CARD_SHADOW,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border
        }
      ]}
    >
      {/* ROW 1: AURA BRAND MONOGRAM + TITLE + ACTIONS */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => onSelectTab && onSelectTab('overview')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Aura Smart Home — Về trang Tổng quan"
          style={[
            styles.logoBadge,
            { backgroundColor: theme.oliveGreen }
          ]}
        >
          <Text style={[styles.logoText, { color: theme.bgCard }]}>AH</Text>
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <View style={styles.brandEyebrowRow}>
            <Text style={[styles.brandEyebrow, { color: theme.oliveGreen }]}>
              AURA HOME
            </Text>
            <Text style={[styles.dotSep, { color: theme.textMuted }]}>•</Text>
            <Text
              style={[styles.elapsedText, TABULAR_NUMS, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {formatElapsed(secondsAgo)}
            </Text>
          </View>
          <Text
            style={[styles.title, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {currentMeta.viLabel}
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {currentMeta.subtitle}
          </Text>
        </View>

        <View style={styles.rightActions}>
          {/* Notification Bell Button */}
          <TouchableOpacity
            onPress={() => setNotifOpen((v) => !v)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Xem thông báo hoạt động hệ thống gần nhất"
            style={[
              styles.actionIconBtn,
              {
                backgroundColor: notifOpen ? theme.softGreen : theme.bgSubtle,
                borderColor: theme.border
              }
            ]}
          >
            <Text style={[styles.actionIconLabel, { color: theme.textPrimary }]}>
              Nhật ký
            </Text>
            {isFire ? (
              <View style={[styles.notifDot, { backgroundColor: theme.danger }]} />
            ) : recentLogs.length > 0 ? (
              <View style={[styles.notifDot, { backgroundColor: theme.success }]} />
            ) : null}
          </TouchableOpacity>

          {/* Light / Dark Mode Switch */}
          <TouchableOpacity
            onPress={onToggleTheme}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={
              theme.mode === 'dark'
                ? 'Chuyển sang giao diện Sáng (Signature Light)'
                : 'Chuyển sang giao diện Tối (Botanical Dark)'
            }
            style={[
              styles.actionIconBtn,
              {
                backgroundColor: theme.bgSubtle,
                borderColor: theme.border
              }
            ]}
          >
            <Text style={[styles.actionIconLabel, { color: theme.textPrimary }]}>
              {theme.mode === 'dark' ? 'Sáng' : 'Tối'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ROW 2: 3 STATUS PILLS (SIGNALR + ESP32 + LAN IP) MATCHING WEB HEADER */}
      <View style={styles.pillsRow}>
        {/* 1. SignalR Hub Status Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: theme.bgSubtle,
              borderColor: theme.border
            }
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: hubConnected
                  ? theme.success
                  : connecting
                  ? theme.warning
                  : theme.danger
              }
            ]}
          />
          <Text
            style={[styles.statusPillText, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {hubConnected
              ? 'SignalR: Đã kết nối'
              : connecting
              ? 'SignalR: Đang nối…'
              : 'Mất kết nối C#'}
          </Text>
        </View>

        {/* 2. ESP32 Online / Standby Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: telemetryOnline
                ? theme.softGreen
                : theme.bgSubtle,
              borderColor: theme.border
            }
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: telemetryOnline
                  ? theme.oliveGreen
                  : theme.textSecondary
              }
            ]}
          />
          <Text
            style={[
              styles.statusPillText,
              {
                color: telemetryOnline
                  ? theme.oliveGreen
                  : theme.textSecondary
              }
            ]}
            numberOfLines={1}
          >
            {telemetryOnline ? 'ESP32 Online' : 'Chờ dữ liệu MQTT'}
          </Text>
        </View>

        {/* 3. LAN IP Pill (Tappable to open IP input) */}
        <TouchableOpacity
          onPress={onToggleIpEditor}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Mở hoặc thu gọn cấu hình IP LAN Server C#"
          style={[
            styles.statusPill,
            styles.ipStatusPill,
            {
              backgroundColor: ipEditorOpen ? theme.softGreen : theme.bgSubtle,
              borderColor: hubConnected ? theme.border : theme.warning
            }
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
            numberOfLines={1}
          >
            LAN: {activeAddress}
          </Text>
          <Text style={[styles.changeIpHint, { color: theme.oliveGreen }]}>
            {ipEditorOpen ? 'Ẩn' : 'Đổi'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* COLLAPSIBLE NOTIFICATION POPOVER (RECENT SYSTEM LOGS) */}
      {notifOpen ? (
        <View
          style={[
            styles.notifPanel,
            {
              backgroundColor: theme.bgElevated,
              borderColor: theme.border
            }
          ]}
        >
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>
              Hoạt động hệ thống gần nhất
            </Text>
            <TouchableOpacity
              onPress={() => {
                setNotifOpen(false);
                if (onSelectTab) onSelectTab('analytics');
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.notifLink, { color: theme.oliveGreen }]}>
                Xem tất cả →
              </Text>
            </TouchableOpacity>
          </View>

          {recentLogs.length === 0 ? (
            <Text style={[styles.notifEmpty, { color: theme.textSecondary }]}>
              Chưa có thông báo mới trong phiên này.
            </Text>
          ) : (
            <View style={styles.notifList}>
              {recentLogs.slice(0, 3).map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[
                    styles.notifItem,
                    { backgroundColor: theme.bgCard, borderColor: theme.border }
                  ]}
                >
                  <Text
                    style={[styles.notifMsg, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={[
                      styles.notifMeta,
                      TABULAR_NUMS,
                      { color: theme.textSecondary }
                    ]}
                  >
                    {item.category || 'SYSTEM'} • {item.source || 'ESP32'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* COLLAPSIBLE LAN IP CONFIG EDITOR */}
      {ipEditorOpen ? (
        <View
          style={[
            styles.editorBox,
            {
              backgroundColor: theme.bgSubtle,
              borderColor: theme.border
            }
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.ipInput,
                TABULAR_NUMS,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: theme.border,
                  color: theme.textPrimary
                }
              ]}
              value={serverIp}
              onChangeText={onChangeServerIp}
              placeholder="IP Wi-Fi máy chạy C# (VD: 192.168.1.31)…"
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
                  backgroundColor: theme.oliveGreen,
                  opacity: connecting ? 0.7 : 1
                }
              ]}
            >
              {connecting ? (
                <ActivityIndicator size="small" color={theme.accentTextOn} />
              ) : (
                <Text
                  style={[styles.connectBtnText, { color: theme.accentTextOn }]}
                >
                  {hubConnected ? 'Đồng bộ' : 'Kết nối'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            Điện thoại &amp; Laptop chung Wi-Fi (cổng 5000). Máy ảo Android dùng 10.0.2.2.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 15,
    gap: 12
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  brandEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  brandEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  dotSep: {
    fontSize: 10
  },
  elapsedText: {
    fontSize: 10,
    fontWeight: '600'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 1
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionIconBtn: {
    minHeight: 36,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  actionIconLabel: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1
  },
  ipStatusPill: {
    flex: 1,
    minWidth: 145,
    justifyContent: 'space-between'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  changeIpHint: {
    fontSize: 11,
    fontWeight: '700'
  },
  notifPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notifTitle: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  notifLink: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  notifEmpty: {
    fontSize: 12,
    paddingVertical: 6,
    textAlign: 'center'
  },
  notifList: {
    gap: 6
  },
  notifItem: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2
  },
  notifMsg: {
    fontSize: 12,
    fontWeight: '600'
  },
  notifMeta: {
    fontSize: 10.5,
    fontWeight: '500'
  },
  editorBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 11,
    gap: 8
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  ipInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13.5,
    fontWeight: '600'
  },
  connectBtn: {
    minHeight: 44,
    minWidth: 92,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  connectBtnText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  helperText: {
    fontSize: 11,
    lineHeight: 15
  }
});

export default memo(HeaderBar);
