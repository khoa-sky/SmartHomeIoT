import React, { memo } from 'react';
import { Lightbulb, Eye, Lock, Unlock, Thermometer, Droplets } from 'lucide-react';
import livingRoomPhoto from '../assets/scandinavian-living-room.jpg';

/**
 * LivingRoomCard — Left 5-column centerpiece card inspired by the reference interior card.
 * - Uses the Scandinavian living room photograph stored in src/assets/scandinavian-living-room.jpg
 * - Applies a warm golden ambient lighting overlay when telemetry.lightOn === true,
 *   and a subtle natural dusk dimming when telemetry.lightOn === false
 * - Displays real PIR motion sensor status (IO27) and quick Light / PIR Lock controls
 * - Does NOT display fake "Live" camera badges
 */
const LivingRoomCard = memo(function LivingRoomCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);
  const isLightBusy = pendingCmd === 'LIGHT:ON' || pendingCmd === 'LIGHT:OFF';
  const isPirBusy =
    pendingCmd === 'PIR_LOCK:LOCK' || pendingCmd === 'PIR_LOCK:UNLOCK';

  return (
    <article className="aura-card overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between space-y-3.5">
      {/* Top Bar inside Card */}
      <div className="px-1.5 pt-1 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-[16px] font-semibold leading-tight"
          >
            Living Room Sanctuary
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            Không gian phòng khách • Đèn IO32 &amp; Cảm biến PIR IO27
          </p>
        </div>

        {/* PIR Status Pill */}
        <button
          type="button"
          disabled={isPirBusy}
          onClick={() =>
            onCommand(
              'PIR_LOCK',
              isPirLocked ? 'UNLOCK' : 'LOCK',
              isPirLocked
                ? 'Đã mở khóa cảm biến chuyển động PIR'
                : 'Đã khóa cảm biến PIR (Chế độ ngủ)'
            )
          }
          style={{
            backgroundColor: isPirLocked
              ? 'var(--warning-soft)'
              : 'var(--soft-green)',
            color: isPirLocked ? 'var(--warning)' : 'var(--olive-green)'
          }}
          className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 aura-btn"
        >
          {isPirLocked ? (
            <>
              <Lock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>PIR: Đã khóa (Chế độ ngủ)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>
                {hasMotion ? 'PIR: Phát hiện có người' : 'PIR: Tự động bật đèn'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Scandinavian Interior Visual Container */}
      <div className="relative rounded-[20px] overflow-hidden aspect-[16/10] bg-[#E5EBE4]">
        <img
          src={livingRoomPhoto}
          alt="Không gian phòng khách Scandinavian Aura Smart Home"
          width="800"
          height="500"
          className="w-full h-full object-cover transition-[filter,transform] duration-500 ease-out"
          style={{
            filter: isLightOn
              ? 'brightness(1.05) saturate(1.06)'
              : 'brightness(0.84) contrast(0.98)'
          }}
        />

        {/* Warm Ambient Ceiling Lamp Glow Overlay when Light is Confirmed ON */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: isLightOn ? 1 : 0,
            background:
              'radial-gradient(circle at 52% 28%, rgba(235, 190, 108, 0.36), rgba(235, 190, 108, 0.12) 48%, transparent 75%)'
          }}
        />

        {/* Subtle Bottom Vignette for Readability of Floating Pills */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/15 to-transparent"
        />

        {/* Top-Left Environment Tag Overlay */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md bg-white/80 text-[#343E33] flex items-center gap-1.5 shadow-sm">
            <Thermometer className="w-3.5 h-3.5 text-[#394438]" aria-hidden="true" />
            <span className="tabular-nums">
              {telemetry.temp !== null && telemetry.temp !== undefined && Number.isFinite(Number(telemetry.temp))
                ? `${Number(telemetry.temp).toFixed(1)}°C`
                : 'Chờ dữ liệu'}
            </span>
          </span>
          <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md bg-white/80 text-[#343E33] flex items-center gap-1.5 shadow-sm">
            <Droplets className="w-3.5 h-3.5 text-[#394438]" aria-hidden="true" />
            <span className="tabular-nums">
              {telemetry.hum !== null && telemetry.hum !== undefined && Number.isFinite(Number(telemetry.hum))
                ? `${Number(telemetry.hum).toFixed(0)}%`
                : 'Chờ dữ liệu'}
            </span>
          </span>
        </div>

        {/* Bottom Floating Lighting Control Bar over Interior Image */}
        <div className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between gap-3 px-4 py-2.5 rounded-[16px] backdrop-blur-md bg-white/88 dark:bg-[#272F27]/90 border border-white/40 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{
                backgroundColor: isLightOn ? '#394438' : '#E5EBE4',
                color: isLightOn ? '#FAFCF9' : '#343E33'
              }}
              className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-colors duration-300"
            >
              <Lightbulb className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#343E33] dark:text-[#F0F3ED] truncate">
                {isLightOn
                  ? 'Đèn trần phòng khách đang sáng'
                  : 'Đèn trần phòng khách đang tắt'}
              </p>
              <p className="text-[11px] text-[#7D827A] dark:text-[#A7B0A4] truncate">
                Đồng bộ nút vật lý IO25 • {isPirLocked ? 'Khóa PIR' : 'PIR Auto'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLightBusy}
            onClick={() =>
              onCommand(
                'LIGHT',
                isLightOn ? 'OFF' : 'ON',
                isLightOn
                  ? 'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)'
                  : 'Đã gửi lệnh bật đèn phòng khách'
              )
            }
            style={{
              backgroundColor: isLightOn ? '#394438' : '#E5EBE4',
              color: isLightOn ? '#FAFCF9' : '#343E33'
            }}
            className="px-3.5 py-1.5 rounded-[12px] text-[12px] font-semibold shrink-0 aura-btn"
          >
            {isLightOn ? 'Tắt đèn' : 'Bật đèn'}
          </button>
        </div>
      </div>
    </article>
  );
});

export default LivingRoomCard;

