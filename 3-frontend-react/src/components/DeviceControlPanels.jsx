import React, { memo } from 'react';
import {
  Lightbulb,
  Lock,
  Unlock,
  Sun,
  CloudRain,
  Sprout,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Power,
  RotateCcw,
  Activity
} from 'lucide-react';

// ============================================================================
// 1. LIVING ROOM SMART LIGHTING & PIR MOTION (IO32 & IO27)
//    Includes Luxury Smart Toggle Switch + Warm Champagne Lamp SVG Illustration
// ============================================================================
export const LightingControlCard = memo(function LightingControlCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  // Visual state reflects ONLY confirmed device telemetry
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);
  const isLightBusy = pendingCmd === 'LIGHT:ON' || pendingCmd === 'LIGHT:OFF';
  const isPirBusy =
    pendingCmd === 'PIR_LOCK:LOCK' || pendingCmd === 'PIR_LOCK:UNLOCK';

  function handleSmartToggle() {
    if (isLightBusy) return;
    if (isLightOn) {
      onCommand(
        'LIGHT',
        'OFF',
        'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)'
      );
    } else {
      onCommand('LIGHT', 'ON', 'Đã gửi lệnh bật đèn phòng khách');
    }
  }

  return (
    <article className="aura-card aura-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-5">
      {/* Header + Luxury Smart Toggle Switch */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            style={{
              backgroundColor: isLightOn
                ? 'var(--accent-soft)'
                : 'var(--bg-elevated)',
              color: isLightOn
                ? 'var(--champagne-gold)'
                : 'var(--text-secondary)'
            }}
            className="w-11 h-11 rounded-[15px] flex items-center justify-center transition-colors duration-300"
          >
            <Lightbulb className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[17px] font-semibold leading-snug"
            >
              Chiếu sáng phòng khách
            </h2>
            <p
              translate="no"
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px]"
            >
              Đèn LED MKE-M01 (IO32) • Cảm biến PIR (IO27)
            </p>
          </div>
        </div>

        {/* Apple-Home-style Smart Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isLightOn}
          aria-label={
            isLightOn ? 'Tắt đèn phòng khách' : 'Bật đèn phòng khách'
          }
          disabled={isLightBusy}
          onClick={handleSmartToggle}
          style={{
            backgroundColor: isLightOn
              ? 'var(--champagne-gold)'
              : 'var(--bg-elevated)',
            borderColor: isLightOn
              ? 'var(--champagne-gold)'
              : 'var(--border-color)'
          }}
          className="relative w-14 h-8 rounded-full border p-1 flex items-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
        >
          <span
            style={{
              backgroundColor: isLightOn ? '#20251F' : 'var(--bg-card)',
              transform: isLightOn ? 'translateX(24px)' : 'translateX(0px)'
            }}
            className="w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-out"
          />
        </button>
      </div>

      {/* Architectural Pendant Lamp & Living Room Illumination Visual */}
      <div className="aura-subcard p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-5 flex items-center justify-center">
          <svg
            width="136"
            height="86"
            viewBox="0 0 136 86"
            role="img"
            aria-label={
              isLightOn
                ? 'Đèn phòng khách đang phát sáng vàng ấm'
                : 'Đèn phòng khách đang tắt'
            }
          >
            <defs>
              <radialGradient id="auraWarmLampGlow" cx="50%" cy="55%" r="50%">
                <stop offset="0%" stopColor="#C5AB6B" stopOpacity="0.55" />
                <stop offset="65%" stopColor="#C5AB6B" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#C5AB6B" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Warm Champagne Halo when confirmed ON */}
            {isLightOn ? (
              <ellipse
                cx="68"
                cy="54"
                rx="54"
                ry="30"
                fill="url(#auraWarmLampGlow)"
              />
            ) : null}

            {/* Ceiling Mount & Cord */}
            <rect
              x="56"
              y="4"
              width="24"
              height="4"
              rx="2"
              fill="currentColor"
              style={{ color: 'var(--text-secondary)' }}
            />
            <line
              x1="68"
              y1="8"
              x2="68"
              y2="28"
              stroke="currentColor"
              strokeWidth="1.6"
              style={{ color: 'var(--text-secondary)' }}
            />

            {/* Designer Dome Pendant Shade */}
            <path
              d="M42 42 C42 26, 94 26, 94 42 Z"
              fill={isLightOn ? '#C5AB6B' : 'currentColor'}
              style={{
                color: isLightOn ? '#C5AB6B' : 'var(--text-secondary)',
                transition: 'fill 280ms ease'
              }}
            />

            {/* Warm Bulb Filament Core */}
            <circle
              cx="68"
              cy="44"
              r="5"
              fill={isLightOn ? '#FFF6D6' : '#7D827A'}
            />

            {/* Minimalist Living Table Silhouette Below */}
            <rect
              x="38"
              y="72"
              width="60"
              height="4"
              rx="2"
              fill="currentColor"
              style={{ color: 'var(--border-color)' }}
            />
          </svg>
        </div>

        <div className="sm:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Trạng thái đèn hiện tại
            </span>
            <span
              style={{
                backgroundColor: isLightOn
                  ? 'var(--accent-soft)'
                  : 'var(--bg-card)',
                color: isLightOn
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)'
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            >
              {isLightOn ? 'Đang sáng ấm (ON)' : 'Đang tắt (OFF)'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Cảm biến chuyển động PIR
            </span>
            <span
              style={{
                color: isPirLocked
                  ? 'var(--warning)'
                  : hasMotion
                  ? 'var(--champagne-gold)'
                  : 'var(--smart-green)'
              }}
              className="text-[12px] font-semibold"
            >
              {isPirLocked
                ? 'Đã khóa (Chế độ ngủ)'
                : hasMotion
                ? 'Phát hiện có người'
                : 'Tự bật khi có người'}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)' }} className="text-[11px] pt-0.5">
            Đồng bộ tức thì 2 chiều với nút bấm vật lý IO25 trên mạch ESP32.
          </p>
        </div>
      </div>

      {/* Explicit Action Buttons + PIR Lock Control */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={pendingCmd === 'LIGHT:ON'}
            onClick={() =>
              onCommand('LIGHT', 'ON', 'Đã gửi lệnh bật đèn phòng khách')
            }
            style={{
              backgroundColor: isLightOn
                ? 'var(--olive-green)'
                : 'var(--bg-elevated)',
              color: isLightOn ? '#FFFFFF' : 'var(--text-primary)'
            }}
            className="py-3 px-4 aura-btn text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
          >
            <Power className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span>Bật đèn</span>
          </button>

          <button
            type="button"
            disabled={pendingCmd === 'LIGHT:OFF'}
            onClick={() =>
              onCommand(
                'LIGHT',
                'OFF',
                'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)'
              )
            }
            style={{
              backgroundColor: !isLightOn
                ? 'var(--text-primary)'
                : 'var(--bg-elevated)',
              color: !isLightOn ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
            className="py-3 px-4 aura-btn text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
          >
            <Power className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span>Tắt đèn (Khóa PIR 5s)</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            Chế độ khóa cảm biến PIR ban đêm (kêu còi Bíp)
          </span>
          <button
            type="button"
            disabled={isPirBusy}
            onClick={() =>
              onCommand(
                'PIR_LOCK',
                isPirLocked ? 'UNLOCK' : 'LOCK',
                isPirLocked
                  ? 'Đã mở khóa cảm biến chuyển động PIR'
                  : 'Đã khóa cảm biến PIR (chế độ đi ngủ)'
              )
            }
            style={{
              backgroundColor: isPirLocked
                ? 'var(--warning-soft)'
                : 'var(--bg-elevated)',
              color: isPirLocked ? 'var(--warning)' : 'var(--text-primary)'
            }}
            className="px-4 py-2.5 aura-btn text-[12px] font-semibold flex items-center gap-1.5 shrink-0 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
          >
            {isPirLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Mở lại PIR</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Khóa PIR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

// ============================================================================
// 2. SMART CLOTHESLINE (GIÀN PHƠI QUẦN ÁO SERVO IO33 & CẢM BIẾN MƯA IO23)
//    Includes Animated Awning SVG + Rain Drops + Luxury Segmented Control
// ============================================================================
export const ClotheslineControlCard = memo(function ClotheslineControlCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const angle = Number(telemetry.servoAngle) ?? 15;
  const isRetracted = angle > 90;
  const mode = telemetry.servoMode || 'AUTO';
  const isRaining = Boolean(telemetry.rain);
  const isMoving =
    pendingCmd === 'SERVO:AUTO' ||
    pendingCmd === 'SERVO:OUT' ||
    pendingCmd === 'SERVO:IN';

  const SEGMENTS = [
    {
      id: 'AUTO',
      label: 'Tự động (Auto)',
      toast: 'Đã bật chế độ giàn phơi tự động theo mưa'
    },
    {
      id: 'OUT',
      label: 'Đưa ra (15°)',
      toast: 'Đã điều khiển đưa giàn phơi ra ngoài (15°)'
    },
    {
      id: 'IN',
      label: 'Thu vào (165°)',
      toast: 'Đã điều khiển thu giàn phơi vào mái hiên (165°)'
    }
  ];

  return (
    <article className="aura-card aura-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            style={{
              backgroundColor: isRaining
                ? 'var(--warning-soft)'
                : 'var(--accent-soft)',
              color: isRaining ? 'var(--warning)' : 'var(--champagne-gold)'
            }}
            className="w-11 h-11 rounded-[15px] flex items-center justify-center transition-colors duration-300"
          >
            {isRaining ? (
              <CloudRain className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Sun className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[17px] font-semibold leading-snug"
            >
              Giàn phơi quần áo thông minh
            </h2>
            <p
              translate="no"
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px]"
            >
              Servo SG90 (IO33) • Cảm biến mưa HS0217V (IO23)
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)'
          }}
          className="px-3 py-1.5 rounded-[10px] text-[12px] font-semibold tabular-nums shrink-0"
        >
          Góc {angle}° • {mode}
        </span>
      </div>

      {/* Animated Architectural Awning & Clothesline SVG with Rain Effect */}
      <div className="aura-subcard p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Vị trí thanh phơi thực tế
          </p>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[15px] font-semibold"
          >
            {isRetracted
              ? 'Đã thu vào dưới mái hiên (165°)'
              : 'Đang đưa ra đón nắng (15°)'}
          </p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            Xung Servo:{' '}
            <span
              style={{ color: 'var(--smart-green)' }}
              className="font-semibold"
            >
              {isMoving ? 'Đang quay…' : 'Ổn định (Tự ngắt PWM)'}
            </span>
          </p>
        </div>

        <svg
          width="136"
          height="68"
          viewBox="0 0 136 68"
          className="shrink-0"
          role="img"
          aria-label={
            isRetracted
              ? 'Minh họa giàn phơi thu vào dưới mái hiên'
              : 'Minh họa giàn phơi vươn ra ngoài trời'
          }
        >
          {/* Architectural Roof / Awning */}
          <path
            d="M8 14 H62 L52 26 H8 Z"
            fill="#596B52"
            fillOpacity="0.85"
          />
          <line
            x1="12"
            y1="14"
            x2="12"
            y2="58"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ color: 'var(--text-secondary)' }}
          />

          {/* Smooth Animated Telescopic Clothesline Rail */}
          <line
            x1="14"
            y1="34"
            x2={isRetracted ? '46' : '112'}
            y2="34"
            stroke="#C5AB6B"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: 'all 340ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />

          {/* Garment Hangers Moving Along Rail */}
          <g
            style={{
              transform: isRetracted ? 'translateX(0px)' : 'translateX(44px)',
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <circle cx="28" cy="34" r="3" fill="#596B52" />
            <path
              d="M23 46 L28 37 L33 46 Z"
              fill="#789681"
              fillOpacity="0.7"
            />
            <circle cx="42" cy="34" r="3" fill="#596B52" />
            <path
              d="M37 46 L42 37 L47 46 Z"
              fill="#C5AB6B"
              fillOpacity="0.75"
            />
          </g>

          {/* Subtle Rain Drops When Rain Sensor is Active */}
          {isRaining ? (
            <g stroke="#789681" strokeWidth="1.5" strokeLinecap="round">
              <line
                x1="78"
                y1="14"
                x2="74"
                y2="24"
                className="aura-rain-drop"
              />
              <line
                x1="96"
                y1="18"
                x2="92"
                y2="28"
                className="aura-rain-drop"
              />
              <line
                x1="114"
                y1="12"
                x2="110"
                y2="22"
                className="aura-rain-drop"
              />
            </g>
          ) : (
            <circle
              cx="114"
              cy="16"
              r="7"
              fill="#C5AB6B"
              fillOpacity="0.45"
            />
          )}
        </svg>
      </div>

      {/* Apple-Style Segmented Control for AUTO / OUT / IN */}
      <div className="space-y-2.5">
        <div
          role="group"
          aria-label="Chế độ vận hành giàn phơi"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
          className="p-1.5 rounded-[16px] border grid grid-cols-3 gap-1.5"
        >
          {SEGMENTS.map((seg) => {
            const active = mode === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                disabled={pendingCmd === `SERVO:${seg.id}`}
                onClick={() => onCommand('SERVO', seg.id, seg.toast)}
                style={{
                  backgroundColor: active
                    ? 'var(--olive-green)'
                    : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-primary)'
                }}
                className={`py-2.5 px-3 rounded-[12px] text-[12px] aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] ${
                  active ? 'font-semibold shadow-sm' : 'font-medium hover:opacity-85'
                }`}
              >
                {seg.label}
              </button>
            );
          })}
        </div>

        <p style={{ color: 'var(--text-muted)' }} className="text-[11px]">
          Chế độ Tự động: mưa liên tục 0.6s tự thu vào 165° • khô ráo sau 2.0s tự đưa ra 15°.
        </p>
      </div>
    </article>
  );
});

// ============================================================================
// 3. SMART GARDEN & PUMP PROTECTION (RELAY IO26 & ĐỘ ẨM ĐẤT IO35)
//    Includes Minimalist Garden Illustration + Water Stream Animation when Pump On
// ============================================================================
export const GardenControlCard = memo(function GardenControlCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const pumpCount = Number(telemetry.pumpCount) || 0;
  const soilVal =
    telemetry.soil !== null && telemetry.soil !== undefined
      ? Number(telemetry.soil)
      : 0;

  return (
    <article className="aura-card aura-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            style={{
              backgroundColor: isPumpLocked
                ? 'var(--danger-soft)'
                : 'var(--success-soft)',
              color: isPumpLocked ? 'var(--danger)' : 'var(--smart-green)'
            }}
            className="w-11 h-11 rounded-[15px] flex items-center justify-center transition-colors duration-300"
          >
            <Sprout className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[17px] font-semibold leading-snug"
            >
              Tưới tiêu &amp; Bảo vệ máy bơm
            </h2>
            <p
              translate="no"
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px]"
            >
              Relay MKE-M05 (IO26) • Độ ẩm đất LM393 (IO35)
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: isPumpLocked
              ? 'var(--danger-soft)'
              : isPumpOn
              ? 'var(--success-soft)'
              : 'var(--bg-elevated)',
            color: isPumpLocked
              ? 'var(--danger)'
              : isPumpOn
              ? 'var(--olive-green)'
              : 'var(--text-secondary)'
          }}
          className="px-3 py-1.5 rounded-[10px] text-[12px] font-semibold shrink-0"
        >
          {isPumpLocked
            ? 'Đã khóa bảo vệ (5/5)'
            : isPumpOn
            ? 'Đang bơm tưới…'
            : 'Máy bơm nghỉ'}
        </span>
      </div>

      {/* Minimalist Botanical Garden Illustration + Water Flow Stream */}
      <div className="aura-subcard p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Độ ẩm đất &amp; Chu kỳ tưới tự động
            </p>
            <p
              style={{ color: 'var(--text-primary)' }}
              className="text-[22px] font-semibold tabular-nums"
            >
              {soilVal}%{' '}
              <span
                style={{
                  color:
                    soilVal < 30 ? 'var(--warning)' : 'var(--smart-green)'
                }}
                className="text-[12px] font-semibold"
              >
                ({soilVal < 30 ? 'Đất khô < 30%' : 'Độ ẩm ổn định'})
              </span>
            </p>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Chu kỳ: <strong>2.5s bơm</strong> / 12s chờ ngấm nước
            </p>
          </div>

          {/* Botanical Irrigation Nozzle & Plant SVG */}
          <svg
            width="116"
            height="64"
            viewBox="0 0 116 64"
            className="shrink-0"
            role="img"
            aria-label={
              isPumpOn
                ? 'Minh họa vòi tưới đang phun dòng nước cho cây'
                : 'Minh họa khu vườn đang ở trạng thái nghỉ'
            }
          >
            {/* Irrigation Pipe & Nozzle */}
            <path
              d="M10 14 H44 V22"
              fill="none"
              stroke="#C5AB6B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Active Water Stream (Only when confirmed pumpOn === true) */}
            {isPumpOn ? (
              <g
                stroke="#789681"
                strokeWidth="2"
                strokeLinecap="round"
                className="aura-water-stream"
              >
                <line x1="44" y1="25" x2="62" y2="50" />
                <line x1="40" y1="25" x2="50" y2="50" />
                <line x1="48" y1="25" x2="74" y2="48" />
              </g>
            ) : null}

            {/* Soil Mound & Botanical Leaves */}
            <path
              d="M52 56 C60 48, 86 48, 94 56 Z"
              fill="#596B52"
              fillOpacity="0.65"
            />
            <path
              d="M73 50 V30"
              stroke="#596B52"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M73 38 C73 32, 62 28, 58 33 C58 39, 66 41, 73 38 Z"
              fill="#789681"
            />
            <path
              d="M73 33 C73 27, 84 23, 88 28 C88 34, 80 36, 73 33 Z"
              fill="#596B52"
            />
          </svg>
        </div>

        {/* 5-Cycle Dry-Run Safety Counter */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: 'var(--text-secondary)' }}>
              Cơ chế bảo vệ chống cháy bơm (khóa sau 5 đợt nếu đất chưa ẩm)
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
                        : 'var(--smart-green)'
                      : 'var(--border-color)'
                }}
                className="h-1.5 rounded-full transition-colors duration-300"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pump Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
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
            color: '#FFFFFF'
          }}
          className="py-3 px-3 aura-btn text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
        >
          <Droplets className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>Tưới ngay (2.5s)</span>
        </button>

        <button
          type="button"
          disabled={pendingCmd === 'PUMP:STOP'}
          onClick={() => onCommand('PUMP', 'STOP', 'Đã gửi lệnh dừng máy bơm')}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)'
          }}
          className="py-3 px-3 aura-btn text-[12px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
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
          className="py-3 px-3 aura-btn text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Mở khóa</span>
        </button>
      </div>
    </article>
  );
});

// ============================================================================
// 4. SECURITY & EMERGENCY ALARM CENTER (CÒI IO19, 2 ĐÈN ĐỎ IO14 & LỬA IO34)
//    Calm Olive Green when safe; Controlled Red Pulse when danger is confirmed
// ============================================================================
export const SecurityControlCard = memo(function SecurityControlCard({
  telemetry,
  pendingCmd,
  onCommand,
  soundEnabled,
  onToggleSound
}) {
  const isFire = Boolean(telemetry.fireAlert);
  const isAlarmLedOn = Boolean(telemetry.redLedOn);
  const isAlertActive = isFire || isAlarmLedOn;

  return (
    <article
      style={{
        borderColor: isFire ? 'var(--danger)' : 'var(--border-color)'
      }}
      className={`aura-card aura-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-5 ${
        isFire ? 'aura-danger-pulse' : ''
      }`}
    >
      {/* Header: Calm Olive when safe, Red only on confirmed alert */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            style={{
              backgroundColor: isAlertActive
                ? 'var(--danger-soft)'
                : 'var(--olive-soft)',
              color: isAlertActive ? 'var(--danger)' : 'var(--olive-green)'
            }}
            className="w-11 h-11 rounded-[15px] flex items-center justify-center transition-colors duration-300"
          >
            {isAlertActive ? (
              <ShieldAlert className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
            )}
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[17px] font-semibold leading-snug"
            >
              Trung tâm an ninh &amp; Báo động
            </h2>
            <p
              translate="no"
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px]"
            >
              Còi Buzzer (IO19) • 2 Đèn Đỏ (IO14) • Lửa (IO34)
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: isAlertActive
              ? 'var(--danger-soft)'
              : 'var(--olive-soft)',
            color: isAlertActive ? 'var(--danger)' : 'var(--olive-green)'
          }}
          className="px-3 py-1.5 rounded-[10px] text-[12px] font-semibold shrink-0"
        >
          {isFire
            ? 'Báo cháy khẩn cấp!'
            : isAlarmLedOn
            ? 'Đèn cảnh báo đang nháy'
            : 'An ninh ổn định'}
        </span>
      </div>

      {/* 3-Channel Hardware Security Matrix */}
      <div className="aura-subcard p-4 sm:p-5 grid grid-cols-3 gap-3">
        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Hồng ngoại lửa (IO34)
          </p>
          <p
            style={{ color: isFire ? 'var(--danger)' : 'var(--text-primary)' }}
            className="text-[14px] font-semibold tabular-nums mt-1"
          >
            ADC {telemetry.flame ?? '—'} (&lt; 15)
          </p>
        </div>

        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Còi Buzzer (IO19)
          </p>
          <p
            style={{
              color: isAlertActive ? 'var(--danger)' : 'var(--olive-green)'
            }}
            className="text-[14px] font-semibold mt-1"
          >
            {isAlertActive ? 'Đang phát còi' : 'Trực canh'}
          </p>
        </div>

        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Cụm 2 Đèn Đỏ (IO14)
          </p>
          <p
            style={{
              color: isAlarmLedOn ? 'var(--danger)' : 'var(--text-primary)'
            }}
            className="text-[14px] font-semibold mt-1"
          >
            {isAlarmLedOn ? 'Đang chớp đỏ' : 'Đang tắt'}
          </p>
        </div>
      </div>

      {/* Alarm Test Actions & Browser Siren Toggle */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={pendingCmd === 'ALARM_TEST:ON'}
            onClick={() =>
              onCommand(
                'ALARM_TEST',
                'ON',
                'Đã kích hoạt kiểm tra còi và 2 đèn đỏ trong 2 giây'
              )
            }
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)'
            }}
            className="py-3 px-3.5 aura-btn text-[12px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
          >
            <Bell className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Kiểm tra còi &amp; đèn (2s)</span>
          </button>

          <button
            type="button"
            disabled={pendingCmd === 'ALARM_TEST:OFF'}
            onClick={() =>
              onCommand('ALARM_TEST', 'OFF', 'Đã tắt kiểm tra báo động')
            }
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)'
            }}
            className="py-3 px-3.5 aura-btn text-[12px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] disabled:opacity-60"
          >
            <BellOff className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Tắt kiểm tra</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Activity
              className="w-3.5 h-3.5"
              strokeWidth={1.75}
              style={{ color: 'var(--text-secondary)' }}
              aria-hidden="true"
            />
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Chuông báo cháy trên trình duyệt
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            style={{
              backgroundColor: soundEnabled
                ? 'var(--olive-soft)'
                : 'var(--bg-elevated)',
              color: soundEnabled
                ? 'var(--olive-green)'
                : 'var(--text-secondary)'
            }}
            className="px-3.5 py-2 aura-btn text-[12px] font-semibold flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Đang bật loa</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Đã tắt loa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});
