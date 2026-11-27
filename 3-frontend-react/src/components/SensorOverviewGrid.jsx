import React, { memo, useMemo } from 'react';
import {
  Thermometer,
  Droplets,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  CloudRain,
  Sun,
  Eye
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

// ============================================================================
// 1. TEMPERATURE CARD WITH LIVE SPARKLINE & SEMANTIC COLOR
// ============================================================================
const TemperatureBentoCard = memo(function TemperatureBentoCard({
  temp,
  history = []
}) {
  const hasTemp = temp !== null && temp !== undefined && Number.isFinite(Number(temp));
  const tempVal = hasTemp ? Number(temp) : 0;

  const tempMeta =
    !hasTemp
      ? {
          label: 'Đang chờ cảm biến',
          accent: 'var(--text-secondary)',
          chipBg: 'var(--bg-elevated)'
        }
      : tempVal < 25
      ? {
          label: 'Mát mẻ dễ chịu',
          accent: 'var(--smart-green)',
          chipBg: 'var(--success-soft)'
        }
      : tempVal <= 33
      ? {
          label: 'Nhiệt độ hài hòa',
          accent: 'var(--olive-green)',
          chipBg: 'var(--olive-soft)'
        }
      : {
          label: 'Khá ấm • Cần thoáng khí',
          accent: 'var(--warning)',
          chipBg: 'var(--warning-soft)'
        };

  // Build real SVG sparkline points from actual history array
  const sparkline = useMemo(() => {
    const samples = (history || [])
      .slice(-14)
      .map((item) => Number(item?.temp))
      .filter((n) => Number.isFinite(n));

    if (samples.length < 2) return null;
    const min = Math.min(...samples) - 0.6;
    const max = Math.max(...samples) + 0.6;
    const span = Math.max(1, max - min);
    const w = 180;
    const h = 42;

    const pts = samples.map((val, idx) => {
      const x = (idx / (samples.length - 1)) * w;
      const y = h - ((val - min) / span) * (h - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return {
      polyline: pts.join(' '),
      area: `0,${h} ${pts.join(' ')} ${w},${h}`,
      lastPoint: pts[pts.length - 1].split(',')
    };
  }, [history]);

  return (
    <article className="aura-card aura-card-interactive aura-stagger-1 p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] font-medium"
          >
            Nhiệt độ phòng khách
          </p>
          <p
            translate="no"
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] mt-0.5"
          >
            Cảm biến DHT20 (I2C 0x38)
          </p>
        </div>

        <div
          style={{
            backgroundColor: tempMeta.chipBg,
            color: tempMeta.accent
          }}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
        >
          <Thermometer className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>

      {/* Large Editorial Temperature Readout */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <span
            style={{ color: 'var(--text-primary)' }}
            className="text-[36px] sm:text-[40px] font-semibold tracking-tight tabular-nums leading-none"
          >
            {hasTemp ? <AnimatedNumber value={tempVal} decimals={1} /> : '—'}
          </span>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[16px] font-medium"
          >
            °C
          </span>
        </div>

        <span
          style={{
            backgroundColor: tempMeta.chipBg,
            color: tempMeta.accent
          }}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
        >
          {tempMeta.label}
        </span>
      </div>

      {/* Real-time Sparkline from Actual History */}
      <div className="pt-1">
        {sparkline ? (
          <div className="space-y-1">
            <svg
              viewBox="0 0 180 42"
              className="w-full h-11 overflow-visible"
              role="img"
              aria-label="Biểu đồ biến thiên nhiệt độ thực tế"
            >
              <defs>
                <linearGradient id="auraTempSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5AB6B" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#C5AB6B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={sparkline.area} fill="url(#auraTempSpark)" />
              <polyline
                fill="none"
                stroke="#C5AB6B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparkline.polyline}
              />
              <circle
                cx={sparkline.lastPoint[0]}
                cy={sparkline.lastPoint[1]}
                r="3.2"
                fill="#C5AB6B"
              />
            </svg>
            <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Biến thiên thời gian thực</span>
              <span className="tabular-nums">Ngưỡng êm dịu 24–32°C</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              style={{ backgroundColor: 'var(--bg-elevated)' }}
              className="w-full h-1.5 rounded-full overflow-hidden"
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(12, (tempVal / 45) * 100))}%`,
                  backgroundColor: tempMeta.accent
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
            <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Đo trực tiếp mỗi 1 giây</span>
              <span className="tabular-nums">Ngưỡng 24–32°C</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

// ============================================================================
// 2. AIR HUMIDITY CARD WITH CIRCULAR PROGRESS RING
// ============================================================================
const AirHumidityBentoCard = memo(function AirHumidityBentoCard({ hum }) {
  const hasHum = hum !== null && hum !== undefined && Number.isFinite(Number(hum));
  const humVal = hasHum ? Math.min(100, Math.max(0, Number(hum))) : 0;

  const humState =
    !hasHum
      ? { label: 'Chờ dữ liệu', color: 'var(--text-secondary)' }
      : humVal < 45
      ? { label: 'Không khí hơi khô', color: 'var(--warning)' }
      : humVal <= 75
      ? { label: 'Độ ẩm lý tưởng', color: 'var(--smart-green)' }
      : { label: 'Độ ẩm khá cao', color: 'var(--champagne-gold)' };

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (humVal / 100) * circumference;

  return (
    <article className="aura-card aura-card-interactive aura-stagger-2 p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] font-medium"
          >
            Độ ẩm không khí
          </p>
          <p
            translate="no"
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] mt-0.5"
          >
            Cảm biến DHT20 (I2C 0x38)
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--success-soft)',
            color: 'var(--smart-green)'
          }}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
        >
          <Droplets className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>

      {/* Circular Progress + Animated Humidity Readout */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span
              style={{ color: 'var(--text-primary)' }}
              className="text-[36px] sm:text-[40px] font-semibold tracking-tight tabular-nums leading-none"
            >
              {hasHum ? <AnimatedNumber value={humVal} decimals={0} /> : '—'}
            </span>
            <span
              style={{ color: 'var(--text-secondary)' }}
              className="text-[16px] font-medium"
            >
              %
            </span>
          </div>
          <p
            style={{ color: humState.color }}
            className="text-[12px] font-semibold mt-2"
          >
            {humState.label}
          </p>
        </div>

        {/* SVG Circular Progress Gauge */}
        <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            className="-rotate-90"
            role="img"
            aria-label={`Độ ẩm không khí ${humVal}%`}
          >
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              style={{ color: 'var(--bg-elevated)' }}
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke="#789681"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 360ms cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            />
          </svg>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="absolute text-[11px] font-semibold tabular-nums"
          >
            RH
          </span>
        </div>
      </div>

      <div
        style={{ color: 'var(--text-muted)' }}
        className="flex items-center justify-between text-[11px] pt-1 border-t"
      >
        <span>Ngưỡng khuyến nghị</span>
        <span className="tabular-nums font-medium" style={{ color: 'var(--text-secondary)' }}>
          45% – 75%
        </span>
      </div>
    </article>
  );
});

// ============================================================================
// 3. SOIL MOISTURE CARD WITH BOTANICAL GAUGE & AUTO-IRRIGATION THRESHOLD
// ============================================================================
const SoilMoistureBentoCard = memo(function SoilMoistureBentoCard({
  soil,
  pumpOn
}) {
  const hasSoil = soil !== null && soil !== undefined && Number.isFinite(Number(soil));
  const soilVal = hasSoil ? Math.min(100, Math.max(0, Number(soil))) : 0;

  // Preserves exact ESP32 threshold logic: < 30% dry (auto pump), 30-39% soaking, >= 40% moist
  const soilMeta =
    !hasSoil
      ? {
          label: 'Chờ cảm biến đất',
          color: 'var(--text-secondary)',
          badgeBg: 'var(--bg-elevated)'
        }
      : soilVal < 30
      ? {
          label: 'Đất khô • Cần tưới (< 30%)',
          color: 'var(--warning)',
          badgeBg: 'var(--warning-soft)'
        }
      : soilVal < 40
      ? {
          label: 'Đang ngấm nước (30–39%)',
          color: 'var(--champagne-gold)',
          badgeBg: 'var(--accent-soft)'
        }
      : {
          label: 'Đủ ẩm sinh trưởng (≥ 40%)',
          color: 'var(--smart-green)',
          badgeBg: 'var(--success-soft)'
        };

  return (
    <article className="aura-card aura-card-interactive aura-stagger-3 p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] font-medium"
          >
            Độ ẩm đất khu vườn
          </p>
          <p
            translate="no"
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] mt-0.5"
          >
            Cảm biến LM393 (ADC IO35)
          </p>
        </div>

        <div
          style={{
            backgroundColor: soilMeta.badgeBg,
            color: soilMeta.color
          }}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
        >
          <Sprout className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>

      {/* Value + Minimalist Botanical Sprout Illustration */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span
              style={{ color: 'var(--text-primary)' }}
              className="text-[36px] sm:text-[40px] font-semibold tracking-tight tabular-nums leading-none"
            >
              {hasSoil ? <AnimatedNumber value={soilVal} decimals={0} /> : '—'}
            </span>
            <span
              style={{ color: 'var(--text-secondary)' }}
              className="text-[16px] font-medium"
            >
              %
            </span>
          </div>
          <p
            style={{ color: soilMeta.color }}
            className="text-[12px] font-semibold mt-2"
          >
            {pumpOn ? 'Máy bơm đang tưới ẩm…' : soilMeta.label}
          </p>
        </div>

        {/* Minimalist Botanical Pot SVG */}
        <svg
          width="58"
          height="58"
          viewBox="0 0 58 58"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect
            x="16"
            y="36"
            width="26"
            height="16"
            rx="4"
            fill="#C5AB6B"
            fillOpacity="0.35"
            stroke="#C5AB6B"
            strokeWidth="1.5"
          />
          <path
            d="M29 36V18"
            stroke="#596B52"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M29 27C29 21 20 18 17 22C17 27 23 29 29 27Z"
            fill="#789681"
          />
          <path
            d="M29 23C29 17 38 14 41 18C41 23 35 25 29 23Z"
            fill="#596B52"
          />
        </svg>
      </div>

      {/* Progress Bar with 30% Auto-Pump Threshold Marker */}
      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-label="Độ ẩm đất vườn"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={soilVal}
          style={{ backgroundColor: 'var(--bg-elevated)' }}
          className="relative w-full h-2 rounded-full overflow-hidden"
        >
          <div
            style={{
              width: `${soilVal}%`,
              backgroundColor: soilVal < 30 ? 'var(--warning)' : 'var(--smart-green)'
            }}
            className="h-full rounded-full transition-all duration-300"
          />
          {/* 30% Auto-Irrigation Threshold Line */}
          <span
            aria-hidden="true"
            title="Ngưỡng tự động bật bơm tưới: 30%"
            style={{
              left: '30%',
              backgroundColor: 'var(--text-primary)'
            }}
            className="absolute top-0 bottom-0 w-[1.5px] opacity-45"
          />
        </div>

        <div
          style={{ color: 'var(--text-muted)' }}
          className="flex items-center justify-between text-[11px]"
        >
          <span>Mốc tự tưới: &lt; 30%</span>
          <span className="tabular-nums">Đủ ẩm: ≥ 40%</span>
        </div>
      </div>
    </article>
  );
});

// ============================================================================
// 4. SECURITY & WEATHER BENTO CARD (CALM OLIVE BY DEFAULT, RED ONLY ON DANGER)
// ============================================================================
const SecurityWeatherBentoCard = memo(function SecurityWeatherBentoCard({
  flame,
  fireAlert,
  rain,
  pir,
  pirLocked
}) {
  const isFire = Boolean(fireAlert);
  const isRaining = Boolean(rain);
  const hasMotion = Boolean(pir);
  const isPirLocked = Boolean(pirLocked);

  return (
    <article
      style={{
        borderColor: isFire ? 'var(--danger)' : 'var(--border-color)',
        backgroundColor: isFire ? 'var(--danger-soft)' : 'var(--bg-card)'
      }}
      className={`aura-card aura-card-interactive aura-stagger-4 p-6 flex flex-col justify-between space-y-4 ${
        isFire ? 'aura-danger-pulse' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] font-medium"
          >
            An ninh &amp; Thời tiết
          </p>
          <p
            translate="no"
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] mt-0.5"
          >
            Lửa IO34 • Mưa IO23 • PIR IO27
          </p>
        </div>

        <div
          style={{
            backgroundColor: isFire ? 'var(--danger)' : 'var(--olive-soft)',
            color: isFire ? '#FFFFFF' : 'var(--olive-green)'
          }}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
        >
          {isFire ? (
            <ShieldAlert className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <ShieldCheck className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Main Security Status Readout */}
      <div className="flex items-baseline justify-between gap-2">
        <span
          style={{ color: isFire ? 'var(--danger)' : 'var(--text-primary)' }}
          className="text-[26px] sm:text-[28px] font-semibold tracking-tight leading-none"
        >
          {isFire ? 'Cảnh báo cháy!' : 'An toàn tuyệt đối'}
        </span>
        <span
          translate="no"
          style={{ color: 'var(--text-secondary)' }}
          className="text-[12px] font-medium tabular-nums"
        >
          ADC: {flame ?? '—'}
        </span>
      </div>

      {/* Distinct Weather & Motion Pills */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="aura-subcard px-3 py-2 flex items-center gap-2 text-[11px]">
          {isRaining ? (
            <CloudRain
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={1.75}
              style={{ color: 'var(--warning)' }}
              aria-hidden="true"
            />
          ) : (
            <Sun
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={1.75}
              style={{ color: 'var(--champagne-gold)' }}
              aria-hidden="true"
            />
          )}
          <span style={{ color: 'var(--text-primary)' }} className="font-medium truncate">
            {isRaining ? 'Đang mưa' : 'Khô ráo'}
          </span>
        </div>

        <div className="aura-subcard px-3 py-2 flex items-center gap-2 text-[11px]">
          <Eye
            className="w-3.5 h-3.5 shrink-0"
            strokeWidth={1.75}
            style={{
              color: isPirLocked
                ? 'var(--text-muted)'
                : hasMotion
                ? 'var(--champagne-gold)'
                : 'var(--smart-green)'
            }}
            aria-hidden="true"
          />
          <span style={{ color: 'var(--text-primary)' }} className="font-medium truncate">
            {isPirLocked ? 'Khóa PIR' : hasMotion ? 'Có người' : 'Yên tĩnh'}
          </span>
        </div>
      </div>
    </article>
  );
});

// ============================================================================
// MAIN EXPORT: 4-CARD BENTO SENSOR GRID
// ============================================================================
const SensorOverviewGrid = memo(function SensorOverviewGrid({
  telemetry,
  history = []
}) {
  return (
    <section
      aria-label="Thông số cảm biến môi trường thời gian thực"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
    >
      <TemperatureBentoCard temp={telemetry.temp} history={history} />
      <AirHumidityBentoCard hum={telemetry.hum} />
      <SoilMoistureBentoCard soil={telemetry.soil} pumpOn={telemetry.pumpOn} />
      <SecurityWeatherBentoCard
        flame={telemetry.flame}
        fireAlert={telemetry.fireAlert}
        rain={telemetry.rain}
        pir={telemetry.pir}
        pirLocked={telemetry.pirLocked}
      />
    </section>
  );
});

export default SensorOverviewGrid;
