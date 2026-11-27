import React, { memo } from 'react';
import AnimatedNumber from './AnimatedNumber';

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

/**
 * Clean, minimal SensorSummaryCard matching reference top row:
 * - Small label at top
 * - Large bold numeric value + smaller unit
 * - Concise threshold / status at bottom (and real history delta only if available)
 * - No cluttered progress bars or redundant icons
 */
export const SensorSummaryCard = memo(function SensorSummaryCard({
  label,
  value,
  decimals = 0,
  unit = '',
  textValue = null,
  statusText,
  statusTone = 'var(--text-secondary)',
  deltaText = null,
  isAlert = false,
  staggerClass = ''
}) {
  const hasNumeric =
    value !== null && value !== undefined && Number.isFinite(Number(value));

  return (
    <article
      style={{
        backgroundColor: isAlert ? 'var(--danger-soft)' : 'var(--bg-card)',
        borderColor: isAlert ? 'var(--danger)' : 'var(--border-color)'
      }}
      className={`rounded-[20px] border px-5 py-4 flex flex-col justify-between min-h-[112px] aura-card-interactive ${staggerClass} ${
        isAlert ? 'aura-danger-pulse' : ''
      }`}
    >
      {/* Top Small Parameter Name */}
      <div className="flex items-center justify-between gap-2">
        <span
          style={{ color: 'var(--text-secondary)' }}
          className="text-[12px] font-medium truncate"
        >
          {label}
        </span>
        {deltaText ? (
          <span
            style={{
              backgroundColor: 'var(--soft-green)',
              color: 'var(--olive-green)'
            }}
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums shrink-0"
          >
            {deltaText}
          </span>
        ) : null}
      </div>

      {/* Main Value + Unit */}
      <div className="my-2 flex items-baseline gap-1">
        {textValue ? (
          <span
            style={{ color: isAlert ? 'var(--danger)' : 'var(--text-primary)' }}
            className="text-[24px] sm:text-[26px] font-semibold tracking-tight leading-none"
          >
            {textValue}
          </span>
        ) : (
          <>
            <span
              style={{ color: 'var(--text-primary)' }}
              className="text-[28px] sm:text-[32px] font-semibold tracking-tight tabular-nums leading-none"
            >
              {hasNumeric ? (
                <AnimatedNumber value={Number(value)} decimals={decimals} />
              ) : (
                '—'
              )}
            </span>
            {unit ? (
              <span
                style={{ color: 'var(--text-secondary)' }}
                className="text-[14px] font-medium"
              >
                {unit}
              </span>
            ) : null}
          </>
        )}
      </div>

      {/* Bottom Threshold / Status */}
      <p
        style={{ color: statusTone }}
        className="text-[11px] font-medium truncate"
      >
        {statusText}
      </p>
    </article>
  );
});

const SensorOverviewGrid = memo(function SensorOverviewGrid({
  telemetry,
  history = []
}) {
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

  const tempStatus =
    !hasTemp
      ? 'Chờ dữ liệu cảm biến DHT20'
      : tempVal > 33
      ? 'Khá ấm • Ngưỡng 24–32°C'
      : 'Thoải mái • Cảm biến DHT20';

  const humStatus =
    !hasHum
      ? 'Chờ dữ liệu cảm biến DHT20'
      : humVal < 45
      ? 'Hơi khô • Ngưỡng 45–75%'
      : humVal <= 75
      ? 'Độ ẩm tối ưu • Ngưỡng 45–75%'
      : 'Độ ẩm cao • Ngưỡng 45–75%';

  const soilStatus =
    !hasSoil
      ? 'Chờ dữ liệu cảm biến LM393'
      : soilVal < 30
      ? 'Đất khô — Tự động tưới (< 30%)'
      : soilVal < 40
      ? 'Đang ngấm nước (30–39%)'
      : 'Đủ ẩm tốt (≥ 40%)';

  const securityStatus = isFire
    ? `Nguy cơ cháy! ADC lửa: ${telemetry.flame} (< 15)`
    : `${isRaining ? 'Trời đang mưa' : 'Trời khô ráo'} • ${
        telemetry.pirLocked
          ? 'PIR đã khóa'
          : telemetry.pir
          ? 'Phát hiện có người'
          : 'Không có chuyển động'
      }`;

  return (
    <section
      aria-label="Tóm tắt 4 thông số cảm biến"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5"
    >
      <SensorSummaryCard
        label="Nhiệt độ phòng"
        value={telemetry.temp}
        decimals={1}
        unit="°C"
        statusText={tempStatus}
        statusTone={tempVal > 33 ? 'var(--warning)' : 'var(--text-secondary)'}
        deltaText={getRealDelta(telemetry.temp, history, 'temp')}
        staggerClass="aura-stagger-1"
      />

      <SensorSummaryCard
        label="Độ ẩm không khí"
        value={telemetry.hum}
        decimals={0}
        unit="%"
        statusText={humStatus}
        statusTone="var(--text-secondary)"
        deltaText={getRealDelta(telemetry.hum, history, 'hum')}
        staggerClass="aura-stagger-2"
      />

      <SensorSummaryCard
        label="Độ ẩm đất vườn"
        value={telemetry.soil}
        decimals={0}
        unit="%"
        statusText={soilStatus}
        statusTone={soilVal < 30 ? 'var(--warning)' : 'var(--success)'}
        deltaText={getRealDelta(telemetry.soil, history, 'soil')}
        staggerClass="aura-stagger-3"
      />

      <SensorSummaryCard
        label="An ninh & Thời tiết"
        textValue={isFire ? 'Cảnh báo cháy' : 'An toàn'}
        statusText={securityStatus}
        statusTone={isFire ? 'var(--danger)' : 'var(--text-secondary)'}
        deltaText={`ADC ${telemetry.flame ?? '—'}`}
        isAlert={isFire}
        staggerClass="aura-stagger-4"
      />
    </section>
  );
});

export default SensorOverviewGrid;
