import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';

/**
 * Compute real delta between current reading and oldest sample in real history.
 * Returns null if fewer than 2 real history points exist (no fake delta!).
 */
function getRealDelta(currentValue, history, key) {
  if (!Array.isArray(history) || history.length < 2) return null;
  const first = Number(history[0]?.[key]);
  const current = Number(currentValue);
  if (!Number.isFinite(first) || !Number.isFinite(current)) return null;
  const diff = current - first;
  if (Math.abs(diff) < 0.05) return 'Ổn định';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${key === 'temp' ? diff.toFixed(1) : diff.toFixed(0)} so với đầu phiên`;
}

export const SensorSummaryCard = memo(function SensorSummaryCard({
  theme,
  label,
  value,
  decimals = 0,
  unit = '',
  textValue = null,
  statusText,
  statusTone,
  deltaText = null,
  isAlert = false
}) {
  const hasNumeric =
    value !== null && value !== undefined && Number.isFinite(Number(value));

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${
        textValue || (hasNumeric ? `${Number(value).toFixed(decimals)} ${unit}` : 'Chờ dữ liệu')
      }. ${statusText}`}
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: isAlert ? theme.dangerSoft : theme.bgCard,
          borderColor: isAlert ? theme.danger : theme.border
        }
      ]}
    >
      {/* Top Small Parameter Name + Real Delta Pill */}
      <View style={styles.cardTop}>
        <Text
          style={[styles.label, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {deltaText ? (
          <View
            style={[
              styles.deltaPill,
              { backgroundColor: theme.softGreen }
            ]}
          >
            <Text
              style={[
                styles.deltaText,
                TABULAR_NUMS,
                { color: theme.oliveGreen }
              ]}
              numberOfLines={1}
            >
              {deltaText}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Main Value + Unit */}
      <View style={styles.valueRow}>
        {textValue ? (
          <Text
            style={[
              styles.textValue,
              { color: isAlert ? theme.danger : theme.textPrimary }
            ]}
            numberOfLines={1}
          >
            {textValue}
          </Text>
        ) : (
          <View style={styles.numericWrap}>
            <Text
              style={[
                styles.numericValue,
                TABULAR_NUMS,
                { color: theme.textPrimary }
              ]}
            >
              {hasNumeric ? Number(value).toFixed(decimals) : '—'}
            </Text>
            {unit ? (
              <Text style={[styles.unit, { color: theme.textSecondary }]}>
                {unit}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Bottom Threshold / Status */}
      <Text
        style={[
          styles.statusText,
          { color: statusTone || theme.textSecondary }
        ]}
        numberOfLines={1}
      >
        {statusText}
      </Text>
    </View>
  );
});

function SensorOverviewGrid({ theme, telemetry, history = [] }) {
  const hasTemp =
    telemetry.temp !== null &&
    telemetry.temp !== undefined &&
    Number.isFinite(Number(telemetry.temp));
  const hasHum =
    telemetry.hum !== null &&
    telemetry.hum !== undefined &&
    Number.isFinite(Number(telemetry.hum));
  const hasSoil =
    telemetry.soil !== null &&
    telemetry.soil !== undefined &&
    Number.isFinite(Number(telemetry.soil));

  const tempVal = hasTemp ? Number(telemetry.temp) : NaN;
  const humVal = hasHum ? Number(telemetry.hum) : NaN;
  const soilVal = hasSoil ? Number(telemetry.soil) : NaN;
  const isFire = Boolean(telemetry.fireAlert);
  const isRaining = Boolean(telemetry.rain);

  const tempStatus = !hasTemp
    ? 'Chờ dữ liệu cảm biến DHT20'
    : tempVal > 33
    ? 'Khá ấm • Ngưỡng 24–32°C'
    : 'Thoải mái • Cảm biến DHT20';

  const humStatus = !hasHum
    ? 'Chờ dữ liệu cảm biến DHT20'
    : humVal < 45
    ? 'Hơi khô • Ngưỡng 45–75%'
    : humVal <= 75
    ? 'Độ ẩm tối ưu • Ngưỡng 45–75%'
    : 'Độ ẩm cao • Ngưỡng 45–75%';

  const soilStatus = !hasSoil
    ? 'Chờ dữ liệu cảm biến LM393'
    : soilVal < 30
    ? 'Đất khô — Tự động tưới (< 30%)'
    : soilVal < 40
    ? 'Đang ngấm nước (30–40%)'
    : 'Đủ ẩm tối ưu (≥ 40%)';

  const safetyValue = isFire
    ? 'Báo cháy!'
    : isRaining
    ? 'Trời mưa'
    : 'An toàn';

  const safetyStatus = isFire
    ? `Phát hiện lửa ADC ${telemetry.flame ?? '—'} (< 15)`
    : isRaining
    ? `Mưa IO23 • Giàn phơi ${telemetry.servoAngle ?? 165}°`
    : `${
        telemetry.pirLocked
          ? 'PIR đã khóa'
          : telemetry.pir
          ? 'PIR có người'
          : 'PIR trực canh'
      } • Lửa ADC ${telemetry.flame ?? '—'}`;

  return (
    <View style={styles.grid}>
      <SensorSummaryCard
        theme={theme}
        label="Nhiệt độ phòng"
        value={hasTemp ? tempVal : null}
        decimals={1}
        unit="°C"
        statusText={tempStatus}
        statusTone={
          hasTemp && tempVal > 33 ? theme.warning : theme.textSecondary
        }
        deltaText={getRealDelta(tempVal, history, 'temp')}
      />

      <SensorSummaryCard
        theme={theme}
        label="Độ ẩm không khí"
        value={hasHum ? humVal : null}
        decimals={0}
        unit="%"
        statusText={humStatus}
        statusTone={theme.textSecondary}
        deltaText={getRealDelta(humVal, history, 'hum')}
      />

      <SensorSummaryCard
        theme={theme}
        label="Độ ẩm đất vườn"
        value={hasSoil ? soilVal : null}
        decimals={0}
        unit="%"
        statusText={soilStatus}
        statusTone={
          !hasSoil
            ? theme.textSecondary
            : soilVal < 30
            ? theme.warning
            : theme.oliveGreen
        }
        deltaText={getRealDelta(soilVal, history, 'soil')}
      />

      <SensorSummaryCard
        theme={theme}
        label="An ninh & Thời tiết"
        textValue={safetyValue}
        statusText={safetyStatus}
        statusTone={
          isFire
            ? theme.danger
            : isRaining
            ? theme.warning
            : theme.oliveGreen
        }
        deltaText={telemetry.online ? 'ESP32 Online' : 'Chờ MQTT'}
        isAlert={isFire}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  card: {
    width: '48.4%',
    minHeight: 112,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 14,
    justifyContent: 'space-between',
    gap: 8
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  deltaPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999
  },
  deltaText: {
    fontSize: 9.5,
    fontWeight: '600'
  },
  valueRow: {
    marginVertical: 2
  },
  numericWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3
  },
  numericValue: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.6
  },
  unit: {
    fontSize: 14,
    fontWeight: '500'
  },
  textValue: {
    fontSize: 23,
    fontWeight: '600',
    letterSpacing: -0.4
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500'
  }
});

export default memo(SensorOverviewGrid);
