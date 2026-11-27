import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';

function ActionButton({
  label,
  active = false,
  tone = 'neutral',
  pending = false,
  disabled = false,
  theme,
  onPress,
  accessibilityLabel,
  flex = 1
}) {
  let backgroundColor = theme.bgElevated;
  let borderColor = theme.border;
  let textColor = theme.textPrimary;

  if (active) {
    if (tone === 'accent') {
      backgroundColor = theme.accent;
      borderColor = theme.accent;
      textColor = theme.accentTextOn;
    } else if (tone === 'success') {
      backgroundColor = theme.success;
      borderColor = theme.success;
      textColor = theme.successTextOn;
    } else if (tone === 'info') {
      backgroundColor = theme.info;
      borderColor = theme.info;
      textColor = theme.infoTextOn;
    } else if (tone === 'warning') {
      backgroundColor = theme.warning;
      borderColor = theme.warning;
      textColor = theme.warningTextOn;
    } else if (tone === 'danger') {
      backgroundColor = theme.danger;
      borderColor = theme.danger;
      textColor = theme.dangerTextOn;
    } else {
      backgroundColor = theme.textPrimary;
      borderColor = theme.textPrimary;
      textColor = theme.bgCard;
    }
  } else if (tone === 'dangerSoft') {
    backgroundColor = theme.dangerSoft;
    borderColor = theme.danger;
    textColor = theme.danger;
  } else if (tone === 'warningSoft') {
    backgroundColor = theme.warningSoft;
    borderColor = theme.warning;
    textColor = theme.warning;
  } else if (tone === 'successSoft') {
    backgroundColor = theme.successSoft;
    borderColor = theme.success;
    textColor = theme.success;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || pending}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected: active, disabled: disabled || pending, busy: pending }}
      style={[
        styles.actionBtn,
        flex ? { flex } : null,
        {
          backgroundColor,
          borderColor,
          opacity: disabled && !pending ? 0.55 : 1
        }
      ]}
    >
      {pending ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.actionBtnText, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function DeviceControlPanels({ theme, telemetry, pendingCmd, onCommand }) {
  const servoIsIn = telemetry.servoAngle > 90;
  const pumpCount = Math.max(0, Math.min(5, Number(telemetry.pumpCount || 0)));

  return (
    <View style={styles.stack}>
      {/* KHỐI 1: ĐÈN PHÒNG KHÁCH (IO32) & CẢM BIẾN PIR (IO27) */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Đèn phòng khách &amp; PIR
            </Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              LED Trắng (IO32) • Cảm biến chuyển động (IO27)
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: telemetry.lightOn ? theme.accentSoft : theme.bgElevated
              }
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: telemetry.lightOn ? theme.accentStrong : theme.textSecondary }
              ]}
            >
              {telemetry.lightOn ? 'Đèn đang sáng' : 'Đèn đang tắt'}
            </Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <ActionButton
            label="Bật đèn trắng"
            active={Boolean(telemetry.lightOn)}
            tone="accent"
            pending={pendingCmd === 'LIGHT:ON'}
            theme={theme}
            onPress={() => onCommand('LIGHT', 'ON', 'Đã gửi lệnh bật đèn trắng (IO32)')}
          />
          <ActionButton
            label="Tắt đèn (Khóa 5s)"
            active={!telemetry.lightOn}
            tone="neutral"
            pending={pendingCmd === 'LIGHT:OFF'}
            theme={theme}
            onPress={() =>
              onCommand('LIGHT', 'OFF', 'Đã tắt đèn trắng (tạm khóa PIR 5 giây)')
            }
          />
        </View>

        <ActionButton
          label={
            telemetry.pirLocked
              ? 'Đang khóa PIR (Đi ngủ) — Chạm để mở tự động'
              : 'PIR đang tự động — Chạm để khóa PIR (Kêu Bíp)'
          }
          active={false}
          tone={telemetry.pirLocked ? 'warningSoft' : 'successSoft'}
          pending={pendingCmd === 'PIR_LOCK:LOCK' || pendingCmd === 'PIR_LOCK:UNLOCK'}
          theme={theme}
          flex={0}
          onPress={() =>
            onCommand(
              'PIR_LOCK',
              telemetry.pirLocked ? 'UNLOCK' : 'LOCK',
              telemetry.pirLocked
                ? 'Đã mở lại cảm biến PIR tự động'
                : 'Đã khóa PIR (Chế độ đi ngủ)'
            )
          }
        />
      </View>

      {/* KHỐI 2: GIÀN PHƠI THÔNG MINH SERVO SG90 (IO33) */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Giàn phơi thông minh
            </Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Servo SG90 (IO33) • {telemetry.rain ? 'Cảm biến báo có mưa' : 'Thời tiết khô ráo'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.infoSoft }]}>
            <Text style={[styles.badgeText, TABULAR_NUMS, { color: theme.info }]}>
              {telemetry.servoAngle}° ({telemetry.servoMode})
            </Text>
          </View>
        </View>

        {/* Thanh trực quan vị trí giàn phơi */}
        <View style={[styles.servoTrackBox, { backgroundColor: theme.bgElevated }]}>
          <Text style={[styles.servoEndText, { color: !servoIsIn ? theme.accentStrong : theme.textMuted }]}>
            Phơi ngoài (15°)
          </Text>
          <View style={[styles.servoBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.servoThumb,
                {
                  backgroundColor: servoIsIn ? theme.info : theme.accent,
                  alignSelf: servoIsIn ? 'flex-end' : 'flex-start'
                }
              ]}
            />
          </View>
          <Text style={[styles.servoEndText, { color: servoIsIn ? theme.info : theme.textMuted }]}>
            Thu mái hiên (165°)
          </Text>
        </View>

        <View style={styles.btnRow}>
          <ActionButton
            label="Tự động"
            active={telemetry.servoMode === 'AUTO'}
            tone="info"
            pending={pendingCmd === 'SERVO:AUTO'}
            theme={theme}
            onPress={() => onCommand('SERVO', 'AUTO', 'Giàn phơi chuyển sang chế độ Tự động theo mưa')}
          />
          <ActionButton
            label="Phơi (15°)"
            active={telemetry.servoMode === 'OUT'}
            tone="accent"
            pending={pendingCmd === 'SERVO:OUT'}
            theme={theme}
            onPress={() => onCommand('SERVO', 'OUT', 'Đã đưa giàn phơi ra ngoài (15°)')}
          />
          <ActionButton
            label="Thu (165°)"
            active={telemetry.servoMode === 'IN'}
            tone="info"
            pending={pendingCmd === 'SERVO:IN'}
            theme={theme}
            onPress={() => onCommand('SERVO', 'IN', 'Đã thu giàn phơi vào mái hiên (165°)')}
          />
        </View>
      </View>

      {/* KHỐI 3: HỆ THỐNG TƯỚI CÂY & BẢO VỆ MÁY BƠM (IO26) */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Máy bơm tưới cây
            </Text>
            <Text style={[styles.cardSub, TABULAR_NUMS, { color: theme.textSecondary }]}>
              Relay (IO26) • Đợt tưới liên tiếp: {pumpCount}/5
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: telemetry.pumpLocked
                  ? theme.dangerSoft
                  : telemetry.pumpOn
                  ? theme.successSoft
                  : theme.bgElevated
              }
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: telemetry.pumpLocked
                    ? theme.danger
                    : telemetry.pumpOn
                    ? theme.success
                    : theme.textSecondary
                }
              ]}
            >
              {telemetry.pumpLocked
                ? 'Khóa an toàn'
                : telemetry.pumpOn
                ? 'Đang bơm 2.5s'
                : 'Đang nghỉ'}
            </Text>
          </View>
        </View>

        {/* Thanh 5 đợt tưới */}
        <View style={styles.pumpDotsRow}>
          {[1, 2, 3, 4, 5].map((step) => {
            const filled = step <= pumpCount;
            return (
              <View
                key={step}
                style={[
                  styles.pumpSegment,
                  {
                    backgroundColor: filled
                      ? telemetry.pumpLocked
                        ? theme.danger
                        : theme.success
                      : theme.bgElevated,
                    borderColor: filled ? 'transparent' : theme.border
                  }
                ]}
              />
            );
          })}
        </View>

        {telemetry.pumpLocked ? (
          <View
            style={[
              styles.noticeBox,
              { backgroundColor: theme.dangerSoft, borderColor: theme.danger }
            ]}
          >
            <Text style={[styles.noticeText, { color: theme.danger }]}>
              Máy bơm đã tự khóa sau 5 đợt tưới mà đất chưa đủ ẩm (&lt; 40%). Hãy kiểm tra nguồn nước rồi bấm Mở khóa.
            </Text>
          </View>
        ) : null}

        <View style={styles.btnRow}>
          <ActionButton
            label="Tưới 2.5s"
            active={Boolean(telemetry.pumpOn)}
            tone="success"
            pending={pendingCmd === 'PUMP:START'}
            theme={theme}
            onPress={() => onCommand('PUMP', 'START', 'Đã kích hoạt máy bơm tưới 1 đợt (2.5 giây)')}
          />
          <ActionButton
            label="Dừng bơm"
            active={false}
            tone="neutral"
            pending={pendingCmd === 'PUMP:STOP'}
            theme={theme}
            onPress={() => onCommand('PUMP', 'STOP', 'Đã gửi lệnh dừng máy bơm ngay')}
          />
          <ActionButton
            label="Mở khóa"
            active={false}
            tone={telemetry.pumpLocked ? 'warningSoft' : 'neutral'}
            pending={pendingCmd === 'PUMP:UNLOCK'}
            theme={theme}
            onPress={() => onCommand('PUMP', 'UNLOCK', 'Đã mở khóa bảo vệ máy bơm')}
          />
        </View>
      </View>

      {/* KHỐI 4: CÒI BÁO ĐỘNG (IO19) & 2 ĐÈN ĐỎ (IO14) */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Còi báo động &amp; 2 Đèn đỏ
            </Text>
            <Text style={[styles.cardSub, TABULAR_NUMS, { color: theme.textSecondary }]}>
              Còi (IO19) • 2 Đèn Đỏ (IO14) • Lửa ADC: {telemetry.flame}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: telemetry.redLedOn ? theme.dangerSoft : theme.bgElevated
              }
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: telemetry.redLedOn ? theme.danger : theme.textSecondary }
              ]}
            >
              {telemetry.redLedOn ? 'Đang chớp sáng' : 'Đang tắt'}
            </Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <ActionButton
            label="Test còi & đèn (2s)"
            active={Boolean(telemetry.redLedOn)}
            tone="danger"
            pending={pendingCmd === 'ALARM_TEST:ON'}
            theme={theme}
            onPress={() => onCommand('ALARM_TEST', 'ON', 'Đang phát thử còi và chớp 2 đèn đỏ (2 giây)')}
          />
          <ActionButton
            label="Tắt test"
            active={false}
            tone="neutral"
            pending={pendingCmd === 'ALARM_TEST:OFF'}
            theme={theme}
            onPress={() => onCommand('ALARM_TEST', 'OFF', 'Đã tắt chế độ kiểm tra báo động')}
          />
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center'
  },
  servoTrackBox: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  servoEndText: {
    fontSize: 11,
    fontWeight: '700'
  },
  servoBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  servoThumb: {
    width: 18,
    height: 10,
    borderRadius: 999
  },
  pumpDotsRow: {
    flexDirection: 'row',
    gap: 6
  },
  pumpSegment: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  noticeBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
  }
});

export default memo(DeviceControlPanels);

