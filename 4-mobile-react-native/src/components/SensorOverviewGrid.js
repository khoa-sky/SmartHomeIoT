import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';

function getTempMeta(temp, theme) {
  if (temp < 26) return { label: 'Mát mẻ', color: theme.info, bg: theme.infoSoft };
  if (temp <= 33) return { label: 'Bình thường', color: theme.success, bg: theme.successSoft };
  return { label: 'Nóng bức', color: theme.warning, bg: theme.warningSoft };
}

function getHumMeta(hum, theme) {
  if (hum < 45) return { label: 'Khô hanh', color: theme.warning, bg: theme.warningSoft };
  if (hum <= 75) return { label: 'Lý tưởng', color: theme.success, bg: theme.successSoft };
  return { label: 'Ẩm ướt', color: theme.info, bg: theme.infoSoft };
}

function getSoilMeta(soil, theme) {
  if (soil < 30) return { label: 'Khô • Cần tưới', color: theme.warning, bg: theme.warningSoft };
  if (soil < 40) return { label: 'Chờ ngấm', color: theme.accentStrong, bg: theme.accentSoft };
  return { label: 'Đủ ẩm', color: theme.success, bg: theme.successSoft };
}

function SensorOverviewGrid({ theme, telemetry }) {
  const temp = Number(telemetry.temp ?? 0);
  const hum = Number(telemetry.hum ?? 0);
  const soil = Math.max(0, Math.min(100, Number(telemetry.soil ?? 0)));
  const flame = Number(telemetry.flame ?? 0);

  const tempMeta = getTempMeta(temp, theme);
  const humMeta = getHumMeta(hum, theme);
  const soilMeta = getSoilMeta(soil, theme);
  const humPercent = Math.max(0, Math.min(100, hum));

  return (
    <View style={styles.grid}>
      {/* 1. Nhiệt độ DHT20 */}
      <View
        style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        accessible
        accessibilityLabel={`Nhiệt độ phòng ${temp.toFixed(1)} độ C, trạng thái ${tempMeta.label}`}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Nhiệt độ phòng</Text>
          <View style={[styles.tag, { backgroundColor: tempMeta.bg }]}>
            <Text style={[styles.tagText, { color: tempMeta.color }]}>{tempMeta.label}</Text>
          </View>
        </View>
        <Text style={[styles.value, TABULAR_NUMS, { color: theme.textPrimary }]}>
          {temp.toFixed(1)}
          <Text style={[styles.unit, { color: theme.textSecondary }]}> °C</Text>
        </Text>
        <Text style={[styles.caption, { color: theme.textMuted }]}>Cảm biến DHT20 (I2C)</Text>
      </View>

      {/* 2. Độ ẩm không khí DHT20 */}
      <View
        style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        accessible
        accessibilityLabel={`Độ ẩm không khí ${hum.toFixed(0)} phần trăm, trạng thái ${humMeta.label}`}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Độ ẩm không khí</Text>
          <View style={[styles.tag, { backgroundColor: humMeta.bg }]}>
            <Text style={[styles.tagText, { color: humMeta.color }]}>{humMeta.label}</Text>
          </View>
        </View>
        <Text style={[styles.value, TABULAR_NUMS, { color: theme.textPrimary }]}>
          {hum.toFixed(0)}
          <Text style={[styles.unit, { color: theme.textSecondary }]}> %</Text>
        </Text>
        <View style={[styles.track, { backgroundColor: theme.bgElevated }]}>
          <View
            style={[
              styles.fill,
              { width: `${humPercent}%`, backgroundColor: humMeta.color }
            ]}
          />
        </View>
      </View>

      {/* 3. Độ ẩm đất LM393 */}
      <View
        style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        accessible
        accessibilityLabel={`Độ ẩm đất vườn ${soil} phần trăm, ${soilMeta.label}`}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Độ ẩm đất vườn</Text>
          <View style={[styles.tag, { backgroundColor: soilMeta.bg }]}>
            <Text style={[styles.tagText, { color: soilMeta.color }]}>{soilMeta.label}</Text>
          </View>
        </View>
        <Text style={[styles.value, TABULAR_NUMS, { color: theme.textPrimary }]}>
          {soil}
          <Text style={[styles.unit, { color: theme.textSecondary }]}> %</Text>
        </Text>
        <View style={[styles.track, { backgroundColor: theme.bgElevated }]}>
          <View
            style={[
              styles.fill,
              { width: `${soil}%`, backgroundColor: soilMeta.color }
            ]}
          />
        </View>
        <Text style={[styles.caption, TABULAR_NUMS, { color: theme.textMuted }]}>
          Ngưỡng tưới &lt;30% • Đủ ≥40%
        </Text>
      </View>

      {/* 4. An ninh (Lửa + Mưa + PIR) */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: telemetry.fireAlert ? theme.dangerSoft : theme.bgCard,
            borderColor: telemetry.fireAlert ? theme.danger : theme.border
          }
        ]}
        accessible
        accessibilityLabel={`An ninh và thời tiết: ${
          telemetry.fireAlert ? 'Cảnh báo cháy' : `Lửa ADC ${flame}`
        }, ${telemetry.rain ? 'Đang mưa' : 'Khô ráo'}, ${
          telemetry.pir ? 'Có chuyển động' : 'Không có người'
        }`}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>An ninh &amp; Thời tiết</Text>
        </View>

        <View style={styles.securityList}>
          <View style={styles.securityRow}>
            <View
              style={[
                styles.smallDot,
                { backgroundColor: telemetry.fireAlert ? theme.danger : theme.success }
              ]}
            />
            <Text
              style={[
                styles.securityText,
                TABULAR_NUMS,
                { color: telemetry.fireAlert ? theme.danger : theme.textPrimary }
              ]}
              numberOfLines={1}
            >
              {telemetry.fireAlert ? `BÁO CHÁY (${flame})` : `Lửa an toàn (${flame})`}
            </Text>
          </View>

          <View style={styles.securityRow}>
            <View
              style={[
                styles.smallDot,
                { backgroundColor: telemetry.rain ? theme.info : theme.accentStrong }
              ]}
            />
            <Text style={[styles.securityText, { color: theme.textPrimary }]} numberOfLines={1}>
              {telemetry.rain ? 'Trời đang có mưa' : 'Trời khô ráo'}
            </Text>
          </View>

          <View style={styles.securityRow}>
            <View
              style={[
                styles.smallDot,
                {
                  backgroundColor: telemetry.pirLocked
                    ? theme.textMuted
                    : telemetry.pir
                    ? theme.accent
                    : theme.border
                }
              ]}
            />
            <Text style={[styles.securityText, { color: theme.textSecondary }]} numberOfLines={1}>
              {telemetry.pirLocked
                ? 'PIR đang khóa'
                : telemetry.pir
                ? 'PIR: Có người'
                : 'PIR: Yên tĩnh'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  card: {
    width: '48.6%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    gap: 8
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4
  },
  label: {
    fontSize: 12,
    fontWeight: '600'
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  value: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  unit: {
    fontSize: 15,
    fontWeight: '600'
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 999
  },
  caption: {
    fontSize: 11,
    fontWeight: '500'
  },
  securityList: {
    gap: 6,
    marginTop: 2
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  smallDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  }
});

export default memo(SensorOverviewGrid);

