import React, { memo } from 'react';
import { Droplets, Sprout, RotateCcw } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

/**
 * CircularGauge — Center 4-column card inspired by the 270-degree circular dial in the reference image.
 * Adapted for Aura Smart Home's real Soil Moisture (LM393 IO35) & Automatic Irrigation (Relay IO26):
 * - 270° horseshoe gauge with thick rounded stroke
 * - Track in soft sage green (#E5EBE4), progress in dark olive (#394438)
 * - Outer tick marks around the 270° arc + highlighted 30% auto-watering threshold tick
 * - Large centered soil moisture percentage + real soil state (Đất khô / Đang ngấm nước / Đủ ẩm)
 * - Real pump status & cycle protection counter (0/5) + genuine PUMP START / STOP / UNLOCK actions
 */
const CircularGauge = memo(function CircularGauge({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const hasSoil =
    telemetry.soil !== null &&
    telemetry.soil !== undefined &&
    Number.isFinite(Number(telemetry.soil));
  const soilVal = hasSoil
    ? Math.min(100, Math.max(0, Number(telemetry.soil)))
    : 0;
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const pumpCount = Number(telemetry.pumpCount) || 0;

  // 270-degree arc geometry (from 135° bottom-left to 405° bottom-right)
  const size = 236;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = 82;
  const fullCircumference = 2 * Math.PI * r;
  const arcLength = fullCircumference * 0.75; // 270° = 75% of circle
  const progressLength = (soilVal / 100) * arcLength;

  // Generate 28 radial tick marks along the 270° arc
  const totalTicks = 28;
  const ticks = Array.from({ length: totalTicks + 1 }, (_, i) => {
    const ratio = i / totalTicks;
    const deg = 135 + ratio * 270;
    const rad = (deg * Math.PI) / 180;
    const innerR = r + 15;
    const outerR = i % 7 === 0 ? r + 22 : r + 19;
    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    const active = ratio <= soilVal / 100;
    return { x1, y1, x2, y2, active, major: i % 7 === 0 };
  });

  const soilState =
    !hasSoil
      ? { label: 'Chờ cảm biến', tone: 'var(--text-secondary)' }
      : soilVal < 30
      ? { label: 'Đất khô — Cần tưới', tone: 'var(--warning)' }
      : soilVal < 40
      ? { label: 'Đang ngấm nước', tone: 'var(--olive-green)' }
      : { label: 'Đủ ẩm tối ưu', tone: 'var(--success)' };

  return (
    <article className="aura-card p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-[16px] font-semibold leading-tight"
          >
            Độ ẩm đất &amp; Tưới tiêu
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            Cảm biến LM393 (IO35) • Bơm (IO26)
          </p>
        </div>

        <span
          style={{
            backgroundColor: isPumpLocked
              ? 'var(--danger-soft)'
              : isPumpOn
              ? 'var(--success-soft)'
              : 'var(--soft-green)',
            color: isPumpLocked
              ? 'var(--danger)'
              : isPumpOn
              ? 'var(--success)'
              : 'var(--olive-green)'
          }}
          className="px-3 py-1 rounded-full text-[11px] font-semibold shrink-0"
        >
          {isPumpLocked
            ? 'Khóa bảo vệ (5/5)'
            : isPumpOn
            ? 'Đang bơm tưới…'
            : 'Máy bơm nghỉ'}
        </span>
      </div>

      {/* 270-Degree Circular Gauge Dial */}
      <div className="relative flex flex-col items-center justify-center my-1">
        <svg
          width={size}
          height={size - 16}
          viewBox={`0 0 ${size} ${size - 10}`}
          role="img"
          aria-label={`Đồng hồ độ ẩm đất ${soilVal}%`}
          className="overflow-visible"
        >
          {/* Outer Tick Marks */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.active ? 'var(--olive-green)' : 'var(--border-color)'}
              strokeWidth={t.major ? '2.2' : '1.4'}
              strokeLinecap="round"
            />
          ))}

          {/* 270° Track (Soft Sage Green) */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--soft-green)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${fullCircumference}`}
            transform={`rotate(135 ${cx} ${cy})`}
          />

          {/* 270° Active Progress Arc (Dark Olive) */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--olive-green)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${fullCircumference}`}
            transform={`rotate(135 ${cx} ${cy})`}
            style={{
              transition: 'stroke-dasharray 380ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />

          {/* Scale Labels at 0%, 30% (Auto), and 100% */}
          <text
            x={cx - 64}
            y={cy + 78}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--text-secondary)"
          >
            0%
          </text>
          <text
            x={cx}
            y={cy - r - 28}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--text-secondary)"
          >
            50%
          </text>
          <text
            x={cx + 64}
            y={cy + 78}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--text-secondary)"
          >
            100%
          </text>
        </svg>

        {/* Centered Readout Inside Gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
          <div
            style={{
              backgroundColor: 'var(--soft-green)',
              color: 'var(--olive-green)'
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5"
          >
            <Sprout className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span
              style={{ color: 'var(--text-primary)' }}
              className="text-[38px] font-bold tracking-tight tabular-nums leading-none"
            >
              {hasSoil ? <AnimatedNumber value={soilVal} decimals={0} /> : '—'}
            </span>
            <span
              style={{ color: 'var(--text-secondary)' }}
              className="text-[16px] font-semibold"
            >
              %
            </span>
          </div>
          <span
            style={{ color: soilState.tone }}
            className="text-[12px] font-semibold mt-1"
          >
            {soilState.label}
          </span>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[10px] mt-0.5"
          >
            Tự tưới &lt; 30% • Đủ ẩm ≥ 40%
          </span>
        </div>
      </div>

      {/* Pump Cycle Protection Bar (0/5) */}
      <div className="aura-subcard p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--text-secondary)' }}>
            Bảo vệ máy bơm (2.5s bơm / 12s nghỉ)
          </span>
          <span
            style={{ color: 'var(--text-primary)' }}
            className="font-semibold tabular-nums"
          >
            {pumpCount} / 5 đợt
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              style={{
                backgroundColor:
                  step <= pumpCount
                    ? isPumpLocked
                      ? 'var(--danger)'
                      : 'var(--olive-green)'
                    : 'var(--border-color)'
              }}
              className="h-1.5 rounded-full transition-colors duration-300"
            />
          ))}
        </div>
      </div>

      {/* Real Hardware Pump Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={pendingCmd === 'PUMP:START'}
          onClick={() =>
            onCommand(
              'PUMP',
              'START',
              'Đã kích hoạt máy bơm tưới ngay 1 đợt (2.5s)'
            )
          }
          style={{
            backgroundColor: 'var(--olive-green)',
            color: '#FAFCF9'
          }}
          className="py-2.5 px-2.5 aura-btn text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Droplets className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>Tưới 2.5s</span>
        </button>

        <button
          type="button"
          disabled={pendingCmd === 'PUMP:STOP'}
          onClick={() => onCommand('PUMP', 'STOP', 'Đã gửi lệnh dừng máy bơm')}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)'
          }}
          className="py-2.5 px-2.5 aura-btn text-[12px] font-semibold"
        >
          Dừng bơm
        </button>

        <button
          type="button"
          disabled={pendingCmd === 'PUMP:UNLOCK'}
          onClick={() =>
            onCommand(
              'PUMP',
              'UNLOCK',
              'Đã mở khóa máy bơm và đặt lại bộ đếm 0/5'
            )
          }
          style={{
            backgroundColor: isPumpLocked
              ? 'var(--warning-soft)'
              : 'var(--bg-elevated)',
            color: isPumpLocked ? 'var(--warning)' : 'var(--text-secondary)'
          }}
          className="py-2.5 px-2.5 aura-btn text-[12px] font-semibold flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Mở khóa</span>
        </button>
      </div>
    </article>
  );
});

export default CircularGauge;
