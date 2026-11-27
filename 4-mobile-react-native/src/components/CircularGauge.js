import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';

/**
 * CircularGauge — 270-degree Horseshoe Soil Moisture & Irrigation Dial
 * Synchronized 100% with 3-frontend-react/src/components/CircularGauge.jsx:
 * - 270° radial horseshoe gauge (from 135° bottom-left to 405° bottom-right)
 * - Outer tick marks around the 270° arc + inner thick progress segments
 * - Soft sage green track (#E5EBE4) and dark olive active progress (#394438)
 * - Centered readout with sprout badge, percentage, and soil threshold status
 * - Pump cycle protection bar (0/5) + genuine PUMP START / STOP / UNLOCK controls
 */
function CircularGauge({ theme, telemetry, pendingCmd, onCommand }) {
  const hasSoil =
    telemetry.soil !== null &&
    telemetry.soil !== undefined &&
    Number.isFinite(Number(telemetry.soil));
  const soilVal = hasSoil
    ? Math.min(100, Math.max(0, Number(telemetry.soil)))
    : 0;
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const pumpCount = Math.max(0, Math.min(5, Number(telemetry.pumpCount) || 0));

  // Precompute 29 outer radial tick marks + 45 thick inner arc segments along the 270° horseshoe
  const dialSize = 228;
  const cx = dialSize / 2;
  const cy = dialSize / 2 + 6;
  const arcRadius = 78;
  const tickRadius = 98;

  const outerTicks = useMemo(() => {
    const total = 28;
    return Array.from({ length: total + 1 }, (_, i) => {
      const ratio = i / total;
      const deg = 135 + ratio * 270;
      const rad = (deg * Math.PI) / 180;
      const major = i % 7 === 0;
      const len = major ? 9 : 6;
      const x = cx + tickRadius * Math.cos(rad);
      const y = cy + tickRadius * Math.sin(rad);
      return {
        key: i,
        ratio,
        major,
        len,
        x,
        y,
        rotateDeg: `${deg + 90}deg`
      };
    });
  }, [cx, cy, tickRadius]);

  const arcSegments = useMemo(() => {
    const totalSegs = 44;
    return Array.from({ length: totalSegs + 1 }, (_, i) => {
      const ratio = i / totalSegs;
      const deg = 135 + ratio * 270;
      const rad = (deg * Math.PI) / 180;
      const x = cx + arcRadius * Math.cos(rad);
      const y = cy + arcRadius * Math.sin(rad);
      return {
        key: i,
        ratio,
        x,
        y,
        rotateDeg: `${deg + 90}deg`
      };
    });
  }, [cx, cy, arcRadius]);

  const soilState = !hasSoil
    ? { label: 'Chờ cảm biến', tone: theme.textSecondary }
    : soilVal < 30
    ? { label: 'Đất khô — Cần tưới', tone: theme.warning }
    : soilVal < 40
    ? { label: 'Đang ngấm nước', tone: theme.oliveGreen }
    : { label: 'Đủ ẩm tối ưu', tone: theme.success };

  const activeRatio = hasSoil ? soilVal / 100 : 0;

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
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Độ ẩm đất &amp; Tưới tiêu
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Cảm biến LM393 (IO35) • Bơm (IO26)
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPumpLocked
                ? theme.dangerSoft
                : isPumpOn
                ? theme.successSoft
                : theme.softGreen
            }
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              {
                color: isPumpLocked
                  ? theme.danger
                  : isPumpOn
                  ? theme.success
                  : theme.oliveGreen
              }
            ]}
          >
            {isPumpLocked
              ? 'Khóa bảo vệ (5/5)'
              : isPumpOn
              ? 'Đang bơm tưới…'
              : 'Máy bơm nghỉ'}
          </Text>
        </View>
      </View>

      {/* 270-Degree Horseshoe Circular Gauge Dial */}
      <View
        accessible
        accessibilityLabel={`Đồng hồ độ ẩm đất ${hasSoil ? `${soilVal}%` : 'Chờ cảm biến'}, ${soilState.label}`}
        style={styles.gaugeWrapper}
      >
        <View style={[styles.dialCanvas, { width: dialSize, height: dialSize - 10 }]}>
          {/* 50% Top Scale Label */}
          <Text
            style={[
              styles.scaleTopLabel,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            50%
          </Text>

          {/* Outer Radial Tick Marks */}
          {outerTicks.map((t) => {
            const active = hasSoil && t.ratio <= activeRatio;
            return (
              <View
                key={t.key}
                style={[
                  styles.tickMark,
                  {
                    width: t.major ? 2.4 : 1.6,
                    height: t.len,
                    left: t.x - (t.major ? 1.2 : 0.8),
                    top: t.y - t.len / 2,
                    backgroundColor: active ? theme.oliveGreen : theme.border,
                    transform: [{ rotate: t.rotateDeg }]
                  }
                ]}
              />
            );
          })}

          {/* 270° Thick Horseshoe Track & Progress Arc */}
          {arcSegments.map((seg) => {
            const active = hasSoil && seg.ratio <= activeRatio;
            return (
              <View
                key={seg.key}
                style={[
                  styles.arcCapsule,
                  {
                    left: seg.x - 6,
                    top: seg.y - 7,
                    backgroundColor: active
                      ? theme.oliveGreen
                      : theme.softGreen,
                    transform: [{ rotate: seg.rotateDeg }]
                  }
                ]}
              />
            );
          })}

          {/* Bottom-Left 0% and Bottom-Right 100% Scale Labels */}
          <Text
            style={[
              styles.scaleBottomLeft,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            0%
          </Text>
          <Text
            style={[
              styles.scaleBottomRight,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            100%
          </Text>

          {/* Centered Readout Inside Gauge */}
          <View style={styles.centerReadout}>
            <View
              style={[
                styles.sproutCircle,
                { backgroundColor: theme.softGreen }
              ]}
            >
              <View
                style={[
                  styles.sproutLeafLeft,
                  { backgroundColor: theme.oliveGreen }
                ]}
              />
              <View
                style={[
                  styles.sproutLeafRight,
                  { backgroundColor: theme.success }
                ]}
              />
            </View>

            <View style={styles.valueBaseline}>
              <Text
                style={[
                  styles.gaugeNumber,
                  TABULAR_NUMS,
                  { color: theme.textPrimary }
                ]}
              >
                {hasSoil ? Math.round(soilVal) : '—'}
              </Text>
              <Text
                style={[
                  styles.gaugeUnit,
                  { color: theme.textSecondary }
                ]}
              >
                %
              </Text>
            </View>

            <Text style={[styles.soilStateText, { color: soilState.tone }]}>
              {soilState.label}
            </Text>
            <Text style={[styles.thresholdCaption, { color: theme.textSecondary }]}>
              Tự tưới &lt; 30% • Đủ ẩm ≥ 40%
            </Text>
          </View>
        </View>
      </View>

      {/* Pump Cycle Protection Bar (0/5) */}
      <View
        style={[
          styles.protectionBox,
          {
            backgroundColor: theme.bgElevated,
            borderColor: theme.borderSubtle
          }
        ]}
      >
        <View style={styles.protectionHeader}>
          <Text style={[styles.protectionLabel, { color: theme.textSecondary }]}>
            Bảo vệ máy bơm (2.5s bơm / 12s nghỉ)
          </Text>
          <Text
            style={[
              styles.protectionCount,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
          >
            {pumpCount} / 5 đợt
          </Text>
        </View>

        <View style={styles.segmentsRow}>
          {[1, 2, 3, 4, 5].map((step) => {
            const filled = step <= pumpCount;
            return (
              <View
                key={step}
                style={[
                  styles.segmentBar,
                  {
                    backgroundColor: filled
                      ? isPumpLocked
                        ? theme.danger
                        : theme.oliveGreen
                      : theme.border
                  }
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Real Hardware Pump Controls */}
      <View style={styles.btnGrid}>
        <TouchableOpacity
          onPress={() =>
            onCommand(
              'PUMP',
              'START',
              'Đã kích hoạt máy bơm tưới ngay 1 đợt (2.5s)'
            )
          }
          disabled={pendingCmd === 'PUMP:START'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Tưới cây ngay 2.5 giây"
          style={[
            styles.pumpBtn,
            {
              backgroundColor: theme.oliveGreen,
              opacity: pendingCmd === 'PUMP:START' ? 0.65 : 1
            }
          ]}
        >
          <Text style={[styles.pumpBtnText, { color: '#FAFCF9' }]}>
            Tưới 2.5s
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onCommand('PUMP', 'STOP', 'Đã gửi lệnh dừng máy bơm')}
          disabled={pendingCmd === 'PUMP:STOP'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Dừng máy bơm"
          style={[
            styles.pumpBtn,
            {
              backgroundColor: theme.bgElevated,
              opacity: pendingCmd === 'PUMP:STOP' ? 0.65 : 1
            }
          ]}
        >
          <Text style={[styles.pumpBtnText, { color: theme.textPrimary }]}>
            Dừng bơm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            onCommand(
              'PUMP',
              'UNLOCK',
              'Đã mở khóa máy bơm và đặt lại bộ đếm 0/5'
            )
          }
          disabled={pendingCmd === 'PUMP:UNLOCK'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Mở khóa máy bơm và reset bộ đếm 0/5"
          style={[
            styles.pumpBtn,
            {
              backgroundColor: isPumpLocked
                ? theme.warningSoft
                : theme.bgElevated,
              opacity: pendingCmd === 'PUMP:UNLOCK' ? 0.65 : 1
            }
          ]}
        >
          <Text
            style={[
              styles.pumpBtnText,
              {
                color: isPumpLocked ? theme.warning : theme.textSecondary
              }
            ]}
          >
            Mở khóa
          </Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  titleBlock: {
    flex: 1
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
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2
  },
  dialCanvas: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scaleTopLabel: {
    position: 'absolute',
    top: 2,
    fontSize: 10,
    fontWeight: '600'
  },
  scaleBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 34,
    fontSize: 10,
    fontWeight: '600'
  },
  scaleBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    fontSize: 10,
    fontWeight: '600'
  },
  tickMark: {
    position: 'absolute',
    borderRadius: 2
  },
  arcCapsule: {
    position: 'absolute',
    width: 12,
    height: 14,
    borderRadius: 6
  },
  centerReadout: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10
  },
  sproutCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4
  },
  sproutLeafLeft: {
    width: 7,
    height: 11,
    borderTopLeftRadius: 7,
    borderBottomRightRadius: 7,
    transform: [{ rotate: '-20deg' }]
  },
  sproutLeafRight: {
    width: 7,
    height: 11,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    transform: [{ rotate: '20deg' }]
  },
  valueBaseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2
  },
  gaugeNumber: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8
  },
  gaugeUnit: {
    fontSize: 16,
    fontWeight: '600'
  },
  soilStateText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  thresholdCaption: {
    fontSize: 10,
    marginTop: 2
  },
  protectionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    gap: 8
  },
  protectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  protectionLabel: {
    fontSize: 11,
    fontWeight: '500'
  },
  protectionCount: {
    fontSize: 11,
    fontWeight: '600'
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: 6
  },
  segmentBar: {
    flex: 1,
    height: 6,
    borderRadius: 999
  },
  btnGrid: {
    flexDirection: 'row',
    gap: 8
  },
  pumpBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pumpBtnText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default memo(CircularGauge);

