import React, { memo } from 'react';
import {
  Sparkles,
  Lightbulb,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  CloudRain,
  Sun,
  ArrowUpRight
} from 'lucide-react';

/**
 * Luxury Architectural Hero Banner: "Your home, in harmony."
 * Features an original architectural SVG illustration of a warm modern residence
 * with natural timber, olive foliage, soft sunlight and live hardware summary pills.
 */
const HeroBanner = memo(function HeroBanner({
  telemetry,
  theme,
  onSelectNav
}) {
  const isFire = Boolean(telemetry.fireAlert);
  const isLightOn = Boolean(telemetry.lightOn);
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isRaining = Boolean(telemetry.rain);
  const activeCount =
    (isLightOn ? 1 : 0) +
    (isPumpOn ? 1 : 0) +
    (!telemetry.pirLocked ? 1 : 0) +
    (telemetry.servoMode === 'AUTO' ? 1 : 0);

  return (
    <section
      aria-label="Aura Smart Home 2.0 Hero"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isFire ? 'var(--danger)' : 'var(--border-color)'
      }}
      className="aura-card relative overflow-hidden p-6 sm:p-8 lg:p-9"
    >
      {/* Subtle Ambient Architectural Sunlight Glow */}
      <div
        aria-hidden="true"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle at 82% 28%, rgba(197, 171, 107, 0.14), rgba(141, 170, 145, 0.06) 45%, transparent 72%)'
              : 'radial-gradient(circle at 82% 24%, rgba(197, 171, 107, 0.22), rgba(120, 150, 129, 0.10) 48%, transparent 75%)'
        }}
        className="pointer-events-none absolute inset-0"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Editorial Headline & Live Ecosystem Pills */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--olive-green)'
            }}
          >
            <Sparkles
              className="w-3.5 h-3.5"
              strokeWidth={1.75}
              style={{ color: 'var(--champagne-gold)' }}
              aria-hidden="true"
            />
            <span translate="no">AURA SMART HOME 2.0 — LUXURY EDITION</span>
          </div>

          <div className="space-y-2.5">
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[28px] sm:text-[36px] lg:text-[40px] font-semibold tracking-tight leading-[1.12]"
            >
              Your home,{' '}
              <span
                style={{ color: 'var(--olive-green)' }}
                className="font-serif italic font-medium"
              >
                in harmony.
              </span>
            </h2>
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-[13px] sm:text-[14px] leading-relaxed max-w-xl"
            >
              Không gian sống thông minh kết nối trực tiếp cùng hệ thống cảm biến môi trường,
              chiếu sáng nội thất, giàn phơi tự động và khu vườn sinh thái Vietduino ESP32.
            </p>
          </div>

          {/* Live Sanctuary Status Pills (Derived 100% from real telemetry) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onSelectNav('devices')}
              className="aura-subcard px-3.5 py-2 flex items-center gap-2 text-[12px] font-medium aura-btn hover:opacity-90"
            >
              <Lightbulb
                className="w-3.5 h-3.5"
                strokeWidth={1.75}
                style={{
                  color: isLightOn ? 'var(--champagne-gold)' : 'var(--text-secondary)'
                }}
                aria-hidden="true"
              />
              <span style={{ color: 'var(--text-primary)' }}>
                Phòng khách: <strong>{isLightOn ? 'Đang sáng' : 'Đang tắt'}</strong>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNav('garden')}
              className="aura-subcard px-3.5 py-2 flex items-center gap-2 text-[12px] font-medium aura-btn hover:opacity-90"
            >
              <Sprout
                className="w-3.5 h-3.5"
                strokeWidth={1.75}
                style={{ color: 'var(--smart-green)' }}
                aria-hidden="true"
              />
              <span style={{ color: 'var(--text-primary)' }}>
                Đất vườn:{' '}
                <strong className="tabular-nums">
                  {telemetry.soil !== null && telemetry.soil !== undefined
                    ? `${telemetry.soil}%`
                    : '—'}
                </strong>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNav('devices')}
              className="aura-subcard px-3.5 py-2 flex items-center gap-2 text-[12px] font-medium aura-btn hover:opacity-90"
            >
              {isRaining ? (
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
                  style={{ color: 'var(--champagne-gold)' }}
                  aria-hidden="true"
                />
              )}
              <span style={{ color: 'var(--text-primary)' }}>
                Giàn phơi:{' '}
                <strong className="tabular-nums">
                  {telemetry.servoAngle ?? 15}° ({telemetry.servoMode || 'AUTO'})
                </strong>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNav('security')}
              style={{
                backgroundColor: isFire ? 'var(--danger-soft)' : 'var(--bg-elevated)',
                color: isFire ? 'var(--danger)' : 'var(--text-primary)'
              }}
              className="px-3.5 py-2 rounded-[16px] flex items-center gap-2 text-[12px] font-medium aura-btn hover:opacity-90"
            >
              {isFire ? (
                <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <ShieldCheck
                  className="w-3.5 h-3.5"
                  strokeWidth={1.75}
                  style={{ color: 'var(--smart-green)' }}
                  aria-hidden="true"
                />
              )}
              <span>
                {isFire ? 'Cảnh báo nhiệt/lửa!' : `${activeCount}/4 phân hệ tự động`}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right Column: Bespoke Architectural Residence & Botanical Courtyard Illustration */}
        <div className="lg:col-span-5">
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)'
            }}
            className="relative rounded-[20px] border p-4 sm:p-5 overflow-hidden"
          >
            <svg
              viewBox="0 0 420 210"
              className="w-full h-44 sm:h-48"
              role="img"
              aria-label="Minh họa kiến trúc ngôi nhà hiện đại Aura Smart Home với ánh sáng tự nhiên và cây xanh"
            >
              <defs>
                <linearGradient id="auraSunLight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C5AB6B" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#C5AB6B" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="auraRoomWarmth" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#C5AB6B"
                    stopOpacity={isLightOn ? '0.42' : '0.08'}
                  />
                  <stop
                    offset="100%"
                    stopColor="#C5AB6B"
                    stopOpacity={isLightOn ? '0.12' : '0.02'}
                  />
                </linearGradient>
              </defs>

              {/* Soft Morning Sun Disc */}
              <circle
                cx="350"
                cy="44"
                r="26"
                fill="#C5AB6B"
                fillOpacity={isRaining ? '0.12' : '0.26'}
              />
              {/* Natural Diagonal Sunlight Beam */}
              <polygon
                points="290,10 410,10 340,185 180,185"
                fill="url(#auraSunLight)"
              />

              {/* Ground Horizon & Courtyard Terrace */}
              <rect
                x="16"
                y="174"
                width="388"
                height="12"
                rx="6"
                fill="currentColor"
                style={{ color: 'var(--border-color)' }}
              />

              {/* Main Modernist Pavilion Frame (Warm Timber & Limestone) */}
              <rect
                x="62"
                y="58"
                width="236"
                height="116"
                rx="6"
                fill="currentColor"
                style={{ color: 'var(--bg-card)' }}
                stroke="#C5AB6B"
                strokeWidth="1.5"
              />

              {/* Cantilevered Flat Architectural Roof */}
              <rect
                x="44"
                y="48"
                width="274"
                height="12"
                rx="4"
                fill="#596B52"
              />

              {/* Interior Living Sanctuary Window */}
              <rect
                x="80"
                y="74"
                width="124"
                height="86"
                rx="4"
                fill="url(#auraRoomWarmth)"
                stroke="currentColor"
                strokeWidth="1.2"
                style={{ color: 'var(--border-color)' }}
              />

              {/* Pendant Lamp Inside Living Room (Glows when lightOn === true) */}
              <line
                x1="142"
                y1="74"
                x2="142"
                y2="96"
                stroke="#C5AB6B"
                strokeWidth="1.5"
              />
              <path
                d="M130 102 C130 95, 154 95, 154 102 Z"
                fill={isLightOn ? '#C5AB6B' : '#7D827A'}
              />
              {isLightOn ? (
                <circle
                  cx="142"
                  cy="106"
                  r="18"
                  fill="#C5AB6B"
                  fillOpacity="0.28"
                />
              ) : null}

              {/* Minimalist Sofa & Interior Silhouette */}
              <rect
                x="104"
                y="138"
                width="76"
                height="14"
                rx="4"
                fill="#596B52"
                fillOpacity="0.65"
              />
              <rect
                x="110"
                y="130"
                width="28"
                height="10"
                rx="3"
                fill="#789681"
                fillOpacity="0.55"
              />

              {/* Timber Slat Pergola & Smart Clothesline Wing */}
              <rect
                x="220"
                y="74"
                width="62"
                height="86"
                rx="4"
                fill="currentColor"
                style={{ color: 'var(--bg-elevated)' }}
              />
              <line
                x1="226"
                y1="94"
                x2={Number(telemetry.servoAngle) > 90 ? '248' : '276'}
                y2="94"
                stroke="#C5AB6B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Botanical Olive Tree & Indoor Planter */}
              <g>
                {/* Planter Pot */}
                <rect
                  x="324"
                  y="148"
                  width="34"
                  height="26"
                  rx="5"
                  fill="#C5AB6B"
                  fillOpacity="0.75"
                />
                {/* Tree Trunk */}
                <line
                  x1="341"
                  y1="148"
                  x2="341"
                  y2="108"
                  stroke="#596B52"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Olive Foliage Canopy */}
                <circle cx="341" cy="98" r="22" fill="#789681" fillOpacity="0.85" />
                <circle cx="326" cy="110" r="15" fill="#596B52" fillOpacity="0.85" />
                <circle cx="356" cy="112" r="14" fill="#596B52" fillOpacity="0.75" />
              </g>
            </svg>

            {/* Bottom Caption Overlay */}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span style={{ color: 'var(--text-secondary)' }}>
                Kiến trúc đồng bộ hai chiều • Vietduino ESP32
              </span>
              <span
                style={{
                  color: telemetry.online ? 'var(--olive-green)' : 'var(--champagne-gold)'
                }}
                className="font-semibold"
              >
                {telemetry.online ? '● Trực tuyến' : '● Chờ dữ liệu MQTT'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroBanner;

