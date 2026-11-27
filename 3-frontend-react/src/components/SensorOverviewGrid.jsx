import React, { memo } from 'react';
import {
  Thermometer,
  Droplets,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  CloudRain,
  Sun
} from 'lucide-react';

const SensorOverviewGrid = memo(function SensorOverviewGrid({ telemetry }) {
  // 1. Đánh giá Nhiệt độ phòng (DHT20)
  const tempVal = Number(telemetry.temp) || 0;
  const tempState =
    tempVal < 26
      ? { label: 'Mát mẻ', tone: 'var(--success)', bg: 'var(--success-soft)' }
      : tempVal <= 33
      ? { label: 'Thoải mái', tone: 'var(--success)', bg: 'var(--success-soft)' }
      : { label: 'Khá nóng', tone: 'var(--warning)', bg: 'var(--warning-soft)' };

  // 2. Đánh giá Độ ẩm không khí (DHT20)
  const humVal = Number(telemetry.hum) || 0;
  const humState =
    humVal < 45
      ? { label: 'Không khí khô', tone: 'var(--warning)', bg: 'var(--warning-soft)' }
      : humVal <= 75
      ? { label: 'Tối ưu', tone: 'var(--success)', bg: 'var(--success-soft)' }
      : { label: 'Độ ẩm cao', tone: 'var(--warning)', bg: 'var(--warning-soft)' };

  // 3. Đánh giá Độ ẩm đất vườn (LM393 - IO35)
  const soilVal = Number(telemetry.soil) || 0;
  const soilState =
    soilVal < 30
      ? { label: 'Đất khô — Cần tưới', tone: 'var(--warning)', bg: 'var(--warning-soft)' }
      : soilVal < 40
      ? { label: 'Đang ngấm nước', tone: 'var(--accent-strong)', bg: 'var(--accent-soft)' }
      : { label: 'Đủ ẩm tốt', tone: 'var(--success)', bg: 'var(--success-soft)' };

  // 4. Đánh giá An ninh & Thời tiết (IO34, IO23, IO27)
  const isFire = Boolean(telemetry.fireAlert);

  return (
    <section
      aria-label="Thông số môi trường tổng quan"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {/* CARD 1: NHIỆT ĐỘ PHÒNG */}
      <div className="aura-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[13px] font-medium"
          >
            Nhiệt độ phòng
          </span>
          <div
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          >
            <Thermometer className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5">
          <span
            style={{ color: 'var(--text-primary)' }}
            className="text-[32px] font-semibold tracking-tight tabular-nums leading-none"
          >
            {tempVal.toFixed(1)}
          </span>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[15px] font-medium"
          >
            °C
          </span>
        </div>

        <div className="space-y-2">
          <div
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            className="w-full h-1.5 rounded-full overflow-hidden"
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(10, (tempVal / 45) * 100))}%`,
                backgroundColor: tempState.tone
              }}
              className="h-full rounded-full transition-all duration-200"
            />
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span style={{ color: tempState.tone }} className="font-medium">
              {tempState.label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Cảm biến DHT20</span>
          </div>
        </div>
      </div>

      {/* CARD 2: ĐỘ ẨM KHÔNG KHÍ */}
      <div className="aura-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[13px] font-medium"
          >
            Độ ẩm không khí
          </span>
          <div
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          >
            <Droplets className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5">
          <span
            style={{ color: 'var(--text-primary)' }}
            className="text-[32px] font-semibold tracking-tight tabular-nums leading-none"
          >
            {humVal.toFixed(0)}
          </span>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[15px] font-medium"
          >
            %
          </span>
        </div>

        <div className="space-y-2">
          <div
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            className="w-full h-1.5 rounded-full overflow-hidden"
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, humVal))}%`,
                backgroundColor: 'var(--accent)'
              }}
              className="h-full rounded-full transition-all duration-200"
            />
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span style={{ color: humState.tone }} className="font-medium">
              {humState.label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Ngưỡng 45–75%</span>
          </div>
        </div>
      </div>

      {/* CARD 3: ĐỘ ẨM ĐẤT VƯỜN */}
      <div className="aura-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[13px] font-medium"
          >
            Độ ẩm đất vườn
          </span>
          <div
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--success)' }}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          >
            <Sprout className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5">
          <span
            style={{ color: 'var(--text-primary)' }}
            className="text-[32px] font-semibold tracking-tight tabular-nums leading-none"
          >
            {soilVal}
          </span>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[15px] font-medium"
          >
            %
          </span>
        </div>

        <div className="space-y-2">
          <div
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            className="w-full h-1.5 rounded-full overflow-hidden"
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, soilVal))}%`,
                backgroundColor: soilVal < 30 ? 'var(--warning)' : 'var(--success)'
              }}
              className="h-full rounded-full transition-all duration-200"
            />
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span style={{ color: soilState.tone }} className="font-medium">
              {soilState.label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Tự tưới &lt; 30%</span>
          </div>
        </div>
      </div>

      {/* CARD 4: AN NINH & THỜI TIẾT */}
      <div
        style={{
          borderColor: isFire ? 'var(--danger)' : 'var(--border-color)'
        }}
        className="aura-card p-5 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[13px] font-medium"
          >
            An ninh &amp; Thời tiết
          </span>
          <div
            style={{
              backgroundColor: isFire ? 'var(--danger-soft)' : 'var(--bg-elevated)',
              color: isFire ? 'var(--danger)' : 'var(--success)'
            }}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          >
            {isFire ? (
              <ShieldAlert className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="my-3 flex items-baseline justify-between gap-2">
          <span
            style={{ color: isFire ? 'var(--danger)' : 'var(--text-primary)' }}
            className="text-[26px] font-semibold tracking-tight leading-none"
          >
            {isFire ? 'Cảnh báo cháy' : 'An toàn'}
          </span>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] font-medium tabular-nums"
          >
            Lửa ADC: {telemetry.flame}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-1.5">
            {telemetry.rain ? (
              <CloudRain
                className="w-3.5 h-3.5"
                strokeWidth={1.75}
                style={{ color: 'var(--warning)' }}
                aria-hidden="true"
              />
            ) : (
              <Sun
                className="w-3.5 h-3.5"
                strokeWidth={1.75}
                style={{ color: 'var(--accent-strong)' }}
                aria-hidden="true"
              />
            )}
            <span style={{ color: 'var(--text-primary)' }} className="font-medium">
              {telemetry.rain ? 'Trời đang mưa' : 'Trời khô ráo'}
            </span>
          </div>

          <span style={{ color: 'var(--text-secondary)' }}>
            {telemetry.pirLocked
              ? 'PIR đã khóa'
              : telemetry.pir
              ? 'Có chuyển động'
              : 'Không có người'}
          </span>
        </div>
      </div>
    </section>
  );
});

export default SensorOverviewGrid;

