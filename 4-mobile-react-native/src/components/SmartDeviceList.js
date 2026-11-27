import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';

/**
 * SmartDeviceList — 6 Hardware Subsystems Directory Card
 * Synchronized 100% with 3-frontend-react/src/components/SmartDeviceList.jsx:
 * - Lists all 6 real hardware subsystems of Aura Smart Home (Vietduino ESP32)
 * - Live status text, indicator dot, and navigation to the corresponding screen
 * - Bottom dark olive button: "View all devices →"
 */
function SmartDeviceList({ theme, telemetry, onSelectTab }) {
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);
  const isRaining = Boolean(telemetry.rain);
  const servoAngle = Number(telemetry.servoAngle) ?? 15;
  const servoMode = telemetry.servoMode || 'AUTO';
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const isFire = Boolean(telemetry.fireAlert);
  const isRedLed = Boolean(telemetry.redLedOn);
  const hasTemp =
    telemetry.temp !== null &&
    telemetry.temp !== undefined &&
    Number.isFinite(Number(telemetry.temp));

  const devices = [
    {
      id: 'light-io32',
      code: 'L',
      name: 'Chiếu sáng phòng khách',
      status: isLightOn ? 'Đang bật sáng (IO32)' : 'Đang tắt (IO32)',
      dot: isLightOn ? theme.success : theme.textMuted,
      targetTab: 'devices'
    },
    {
      id: 'servo-io33',
      code: 'S',
      name: 'Giàn phơi thông minh',
      status: `${servoAngle > 90 ? 'Thu vào' : 'Đưa ra'} ${servoAngle}° • ${servoMode}`,
      dot: theme.success,
      targetTab: 'devices'
    },
    {
      id: 'pump-io26',
      code: 'P',
      name: 'Máy bơm tưới tiêu',
      status: isPumpLocked
        ? 'Đã khóa bảo vệ (5/5)'
        : isPumpOn
        ? 'Đang bơm tưới (2.5s)'
        : `Chờ tự động (${telemetry.pumpCount || 0}/5)`,
      dot: isPumpLocked
        ? theme.danger
        : isPumpOn
        ? theme.success
        : theme.oliveGreen,
      targetTab: 'garden'
    },
    {
      id: 'pir-io27',
      code: 'M',
      name: 'Cảm biến chuyển động PIR',
      status: isPirLocked
        ? 'Đã khóa (Chế độ ngủ)'
        : hasMotion
        ? 'Phát hiện có người (IO27)'
        : 'Trực canh tự động (Auto)',
      dot: isPirLocked
        ? theme.warning
        : hasMotion
        ? theme.success
        : theme.oliveGreen,
      targetTab: 'security'
    },
    {
      id: 'alarm-io19',
      code: 'A',
      name: 'Hệ thống báo động',
      status: isFire
        ? 'Báo cháy khẩn cấp!'
        : isRedLed
        ? 'Đèn cảnh báo đang nháy'
        : `An toàn (ADC lửa: ${telemetry.flame ?? '—'})`,
      dot: isFire || isRedLed ? theme.danger : theme.success,
      targetTab: 'security'
    },
    {
      id: 'rain-io23',
      code: 'W',
      name: 'Cảm biến mưa & Khí hậu',
      status: isRaining
        ? 'Phát hiện trời mưa (IO23)'
        : hasTemp
        ? `Khô ráo • ${Number(telemetry.temp).toFixed(1)}°C`
        : 'Khô ráo • Chờ dữ liệu nhiệt độ',
      dot: isRaining ? theme.warning : theme.success,
      targetTab: 'garden'
    }
  ];

  return (
    <View
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border
        }
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Smart Devices
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            6 phân hệ phần cứng Vietduino ESP32
          </Text>
        </View>
        <View
          style={[
            styles.onlinePill,
            { backgroundColor: theme.softGreen }
          ]}
        >
          <Text
            style={[
              styles.onlinePillText,
              TABULAR_NUMS,
              { color: theme.oliveGreen }
            ]}
          >
            {telemetry.online ? 'Online' : 'Standby'}
          </Text>
        </View>
      </View>

      {/* 6 Subsystem Rows */}
      <View style={styles.listStack}>
        {devices.map((dev) => (
          <TouchableOpacity
            key={dev.id}
            onPress={() => onSelectTab && onSelectTab(dev.targetTab)}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={`${dev.name}, ${dev.status}`}
            style={[
              styles.deviceRow,
              {
                backgroundColor: theme.bgElevated,
                borderColor: theme.borderSubtle
              }
            ]}
          >
            <View style={styles.leftGroup}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.bgCard }
                ]}
              >
                <Text
                  style={[
                    styles.iconCode,
                    { color: theme.oliveGreen }
                  ]}
                >
                  {dev.code}
                </Text>
              </View>
              <View style={styles.deviceTextWrap}>
                <Text
                  style={[styles.deviceName, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {dev.name}
                </Text>
                <Text
                  style={[
                    styles.deviceStatus,
                    { color: theme.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {dev.status}
                </Text>
              </View>
            </View>

            <View style={styles.rightGroup}>
              <View
                style={[styles.statusDot, { backgroundColor: dev.dot }]}
              />
              <Text style={[styles.chevron, { color: theme.textSecondary }]}>
                ›
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Olive Button: View all devices */}
      <TouchableOpacity
        onPress={() => onSelectTab && onSelectTab('devices')}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Xem toàn bộ danh mục thiết bị thông minh"
        style={[
          styles.viewAllBtn,
          { backgroundColor: theme.oliveGreen }
        ]}
      >
        <Text style={styles.viewAllText}>View all devices →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  onlinePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  onlinePillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  listStack: {
    gap: 8
  },
  deviceRow: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
    minWidth: 0
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCode: {
    fontSize: 13,
    fontWeight: '800'
  },
  deviceTextWrap: {
    flex: 1,
    minWidth: 0
  },
  deviceName: {
    fontSize: 13,
    fontWeight: '600'
  },
  deviceStatus: {
    fontSize: 11,
    marginTop: 2
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: -2
  },
  viewAllBtn: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FAFCF9'
  }
});

export default memo(SmartDeviceList);

