import React, { memo } from 'react';
import {
  Lock,
  Unlock,
  Droplets,
  RotateCcw,
  Bell,
  BellOff,
  Volume2,
  VolumeX
} from 'lucide-react';

/**
 * Reusable Apple/Scandinavian SmartToggle Component
 */
export const SmartToggle = memo(function SmartToggle({
  checked,
  disabled = false,
  onChange,
  ariaLabel
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      style={{
        backgroundColor: checked ? 'var(--olive-green)' : 'var(--soft-green)',
        borderColor: checked ? 'var(--olive-green)' : 'var(--border-color)'
      }}
      className="relative w-12 h-7 rounded-full border p-0.5 flex items-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#394438] disabled:opacity-60 shrink-0"
    >
      <span
        style={{
          backgroundColor: '#FAFCF9',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)'
        }}
        className="w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-out"
      />
    </button>
  );
});

// ============================================================================
// 1. 3D MATTE PENDANT LAMP CARD (CHIẾU SÁNG PHÒNG KHÁCH IO32 & PIR IO27)
// ============================================================================
export const LightingControlCard = memo(function LightingControlCard({
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
    <article className="aura-card aura-card-interactive p-5 flex flex-col justify-between space-y-4">
      {/* Top Header + SmartToggle */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-[15px] font-semibold leading-tight"
          >
            Chiếu sáng phòng khách
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px] mt-0.5">
            {isLightOn ? 'Đang bật sáng • IO32' : 'Đang tắt • IO32'}
          </p>
        </div>

        <SmartToggle
          checked={isLightOn}
          disabled={isLightBusy}
          ariaLabel={isLightOn ? 'Tắt đèn phòng khách' : 'Bật đèn phòng khách'}
          onChange={() =>
            onCommand(
              'LIGHT',
              isLightOn ? 'OFF' : 'ON',
              isLightOn
                ? 'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)'
                : 'Đã gửi lệnh bật đèn phòng khách'
            )
          }
        />
      </div>

      {/* Studio 3D Matte Clay Pendant Lamp Render SVG */}
      <div className="aura-subcard py-3 px-4 flex items-center justify-center relative overflow-hidden h-[138px]">
        <svg
          width="160"
          height="124"
          viewBox="0 0 160 124"
          role="img"
          aria-label={
            isLightOn
              ? 'Mô hình 3D đèn treo phòng khách đang tỏa ánh sáng vàng ấm'
              : 'Mô hình 3D đèn treo phòng khách màu trắng kem'
          }
        >
          <defs>
            {/* 3D Matte Clay Dome Gradient */}
            <linearGradient id="clayLampShade" x1="0.15" y1="0.1" x2="0.85" y2="0.9">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#F1EFE8" />
              <stop offset="100%" stopColor="#D7D9D2" />
            </linearGradient>
            <linearGradient id="clayLampInner" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isLightOn ? '#F5C97B' : '#CFD4CC'}
              />
              <stop
                offset="100%"
                stopColor={isLightOn ? '#FFF3D1' : '#E3E7E0'}
              />
            </linearGradient>
            <radialGradient id="warm3DBulbHalo" cx="50%" cy="55%" r="52%">
              <stop offset="0%" stopColor="#F2C166" stopOpacity="0.68" />
              <stop offset="55%" stopColor="#F2C166" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F2C166" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Soft Studio Contact Shadow on Floor */}
          <ellipse
            cx="80"
            cy="112"
            rx={isLightOn ? '46' : '34'}
            ry="6"
            fill={isLightOn ? '#E3B664' : '#343E33'}
            fillOpacity={isLightOn ? '0.28' : '0.10'}
          />

          {/* Warm Light Cone & Halo (Only when confirmed lightOn === true) */}
          {isLightOn ? (
            <>
              <polygon
                points="44,62 116,62 138,112 22,112"
                fill="url(#warm3DBulbHalo)"
              />
              <circle
                cx="80"
                cy="70"
                r="38"
                fill="url(#warm3DBulbHalo)"
              />
            </>
          ) : null}

          {/* 3D Matte Ceiling Canopy & Cord */}
          <ellipse cx="80" cy="10" rx="14" ry="4" fill="#D5DAD2" />
          <line
            x1="80"
            y1="14"
            x2="80"
            y2="32"
            stroke="#929B90"
            strokeWidth="2"
          />

          {/* Top Brass/Olive Finial Cap */}
          <rect
            x="74"
            y="28"
            width="12"
            height="8"
            rx="4"
            fill="#394438"
          />

          {/* 3D Sculpted Matte Dome Shade */}
          <path
            d="M36 60 C36 33, 124 33, 124 60 Z"
            fill="url(#clayLampShade)"
          />
          {/* Underside 3D Rim of Lamp */}
          <ellipse
            cx="80"
            cy="60"
            rx="44"
            ry="8"
            fill="url(#clayLampInner)"
          />

          {/* 3D Frosted Glass Bulb Sphere */}
          <circle
            cx="80"
            cy="64"
            r="10"
            fill={isLightOn ? '#FFF7DC' : '#E5EBE4'}
          />
          <circle
            cx="77"
            cy="61"
            r="3"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
        </svg>
      </div>

      {/* Bottom PIR Sync & Quick Action Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--text-secondary)' }}>
            {isPirLocked
              ? 'PIR: Đã khóa (Chế độ ngủ)'
              : hasMotion
              ? 'PIR: Đang có người'
              : 'PIR: Tự động (IO27)'}
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
                  : 'Đã khóa cảm biến PIR (Chế độ ngủ)'
              )
            }
            style={{
              backgroundColor: isPirLocked
                ? 'var(--warning-soft)'
                : 'var(--soft-green)',
              color: isPirLocked ? 'var(--warning)' : 'var(--olive-green)'
            }}
            className="px-2.5 py-1 rounded-[10px] font-semibold flex items-center gap-1 aura-btn"
          >
            {isPirLocked ? (
              <>
                <Unlock className="w-3 h-3" strokeWidth={1.8} aria-hidden="true" />
                <span>Mở PIR</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" strokeWidth={1.8} aria-hidden="true" />
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
// 2. 3D MATTE CLOTHESLINE CARD (GIÀN PHƠI QUẦN ÁO SERVO IO33 & MƯA IO23)
// ============================================================================
export const ClotheslineAnimation = memo(function ClotheslineAnimation({
  isRetracted,
  isRaining
}) {
  return (
    <svg
      width="172"
      height="124"
      viewBox="0 0 172 124"
      role="img"
      aria-label={
        isRetracted
          ? 'Mô hình 3D giàn phơi đã thu quần áo vào dưới mái hiên'
          : 'Mô hình 3D giàn phơi đang đưa quần áo ra ngoài đón nắng'
      }
    >
      <defs>
        <linearGradient id="clayWall3D" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DCE2DA" />
        </linearGradient>
        <linearGradient id="clayGarmentCream" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAFCF9" />
          <stop offset="100%" stopColor="#DFDDD4" />
        </linearGradient>
        <linearGradient id="clayGarmentSage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C5CEC2" />
          <stop offset="100%" stopColor="#929B90" />
        </linearGradient>
      </defs>

      {/* Studio Floor Shadow */}
      <ellipse
        cx="86"
        cy="112"
        rx="58"
        ry="6"
        fill="#343E33"
        fillOpacity="0.10"
      />

      {/* 3D Isometric Architectural Shelter Pillar & Canopy */}
      <rect
        x="18"
        y="22"
        width="18"
        height="86"
        rx="6"
        fill="url(#clayWall3D)"
      />
      <path
        d="M14 18 H84 L74 32 H14 Z"
        fill="#394438"
      />

      {/* 3D Telescopic Matte Aluminum Rail */}
      <rect
        x="32"
        y="42"
        width={isRetracted ? '42' : '112'}
        height="5"
        rx="2.5"
        fill="#929B90"
        style={{ transition: 'width 360ms cubic-bezier(0.22, 1, 0.36, 1)' }}
      />

      {/* 3D Neutral-Toned Garments Sliding on Rail */}
      <g
        style={{
          transform: isRetracted ? 'translateX(0px)' : 'translateX(54px)',
          transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {/* Garment 1: Cream Linen Shirt */}
        <circle cx="48" cy="44" r="3" fill="#394438" />
        <path
          d="M38 52 C38 49, 58 49, 58 52 L61 84 C61 87, 35 87, 35 84 Z"
          fill="url(#clayGarmentCream)"
        />
        {/* Garment 2: Soft Sage Knit */}
        <circle cx="66" cy="44" r="3" fill="#394438" />
        <path
          d="M57 52 C57 49, 75 49, 75 52 L77 80 C77 83, 55 83, 55 80 Z"
          fill="url(#clayGarmentSage)"
        />
      </g>

      {/* Rain Animation or Warm Studio Sun Sphere */}
      {isRaining ? (
        <g stroke="#72A765" strokeWidth="1.8" strokeLinecap="round">
          <line x1="112" y1="20" x2="107" y2="32" className="aura-rain-drop" />
          <line x1="130" y1="26" x2="125" y2="38" className="aura-rain-drop" />
          <line x1="146" y1="18" x2="141" y2="30" className="aura-rain-drop" />
        </g>
      ) : (
        <circle cx="138" cy="26" r="10" fill="#E6B86A" fillOpacity="0.55" />
      )}
    </svg>
  );
});

export const ClotheslineControlCard = memo(function ClotheslineControlCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const angle = Number(telemetry.servoAngle) ?? 15;
  const isRetracted = angle > 90;
  const mode = telemetry.servoMode || 'AUTO';
  const isRaining = Boolean(telemetry.rain);

  const MODES = [
    {
      id: 'AUTO',
      label: 'Auto',
      toast: 'Đã bật chế độ giàn phơi tự động theo mưa'
    },
    {
      id: 'OUT',
      label: 'Đưa ra 15°',
      toast: 'Đã điều khiển đưa giàn phơi ra ngoài (15°)'
    },
    {
      id: 'IN',
      label: 'Thu vào 165°',
      toast: 'Đã điều khiển thu giàn phơi vào mái hiên (165°)'
    }
  ];

  return (
    <article className="aura-card aura-card-interactive p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-[15px] font-semibold leading-tight"
          >
            Giàn phơi quần áo
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px] mt-0.5">
            Góc {angle}° • {isRaining ? 'Phát hiện mưa' : 'Trời khô ráo'}
          </p>
        </div>

        <span
          style={{
            backgroundColor: 'var(--soft-green)',
            color: 'var(--olive-green)'
          }}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums"
        >
          {mode}
        </span>
      </div>

      {/* 3D Matte Clothesline Render Container */}
      <div className="aura-subcard py-3 px-4 flex items-center justify-center relative overflow-hidden h-[138px]">
        <ClotheslineAnimation isRetracted={isRetracted} isRaining={isRaining} />
      </div>

      {/* Segmented Control: Auto / Out / In */}
      <div
        role="group"
        aria-label="Điều khiển chế độ giàn phơi"
        style={{ backgroundColor: 'var(--soft-green)' }}
        className="p-1 rounded-[13px] grid grid-cols-3 gap-1"
      >
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={pendingCmd === `SERVO:${m.id}`}
              onClick={() => onCommand('SERVO', m.id, m.toast)}
              style={{
                backgroundColor: active ? 'var(--olive-green)' : 'transparent',
                color: active ? '#FAFCF9' : 'var(--text-primary)'
              }}
              className="py-1.5 px-2 rounded-[10px] text-[11px] font-semibold transition-colors"
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </article>
  );
});

// ============================================================================
// 3. 3D MATTE BOTANICAL PLANTER & IRRIGATION CARD (MÁY BƠM IO26 & ĐẤT IO35)
// ============================================================================
export const IrrigationAnimation = memo(function IrrigationAnimation({
  isPumpOn,
  isPumpLocked
}) {
  return (
    <svg
      width="160"
      height="124"
      viewBox="0 0 160 124"
      role="img"
      aria-label={
        isPumpOn
          ? 'Mô hình 3D chậu cây đang được vòi nước tưới ẩm'
          : 'Mô hình 3D chậu cây matte ceramic'
      }
    >
      <defs>
        <linearGradient id="clayPlanterPot" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#EAE8E0" />
          <stop offset="100%" stopColor="#CFCBC0" />
        </linearGradient>
        <linearGradient id="clayLeafOlive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#72A765" />
          <stop offset="100%" stopColor="#394438" />
        </linearGradient>
      </defs>

      {/* Studio Floor Contact Shadow */}
      <ellipse
        cx="84"
        cy="112"
        rx="44"
        ry="6"
        fill="#343E33"
        fillOpacity="0.12"
      />

      {/* 3D Matte Brass/Olive Overhead Irrigation Nozzle */}
      <path
        d="M22 20 H58 C64 20, 66 24, 66 30"
        fill="none"
        stroke="#394438"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="61" y="29" width="10" height="5" rx="2" fill="#929B90" />

      {/* Animated Water Streams (Only when confirmed pumpOn === true) */}
      {isPumpOn ? (
        <g
          stroke="#72A765"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="aura-water-stream"
        >
          <line x1="66" y1="36" x2="76" y2="72" />
          <line x1="63" y1="36" x2="66" y2="72" />
          <line x1="69" y1="36" x2="88" y2="72" />
        </g>
      ) : null}

      {/* 3D Sculpted Botanical Foliage */}
      <path
        d="M84 74 V42"
        stroke="#394438"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M84 60 C84 46, 62 42, 58 51 C58 61, 72 64, 84 60 Z"
        fill="url(#clayLeafOlive)"
      />
      <path
        d="M84 52 C84 38, 108 34, 112 43 C112 53, 96 56, 84 52 Z"
        fill="url(#clayLeafOlive)"
      />
      <circle cx="84" cy="38" r="9" fill="#72A765" />

      {/* 3D Matte Ceramic Planter Bowl */}
      <path
        d="M54 72 H114 L106 106 C105 109, 101 111, 97 111 H71 C67 111, 63 109, 62 106 Z"
        fill="url(#clayPlanterPot)"
      />
      <ellipse
        cx="84"
        cy="72"
        rx="30"
        ry="5"
        fill={isPumpLocked ? '#C85C5C' : '#394438'}
        fillOpacity="0.75"
      />
    </svg>
  );
});

export const GardenControlCard = memo(function GardenControlCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const pumpCount = Number(telemetry.pumpCount) || 0;
  const soilVal = Number(telemetry.soil) || 0;

  return (
    <article className="aura-card aura-card-interactive p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-[15px] font-semibold leading-tight"
          >
            Máy bơm tưới tiêu
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px] mt-0.5">
            Đất {soilVal}% • Chu kỳ {pumpCount}/5 đợt
          </p>
        </div>

        <SmartToggle
          checked={isPumpOn}
          disabled={pendingCmd === 'PUMP:START' || pendingCmd === 'PUMP:STOP'}
          ariaLabel={isPumpOn ? 'Dừng máy bơm' : 'Kích hoạt tưới 2.5s'}
          onChange={() =>
            onCommand(
              'PUMP',
              isPumpOn ? 'STOP' : 'START',
              isPumpOn
                ? 'Đã gửi lệnh dừng máy bơm'
                : 'Đã kích hoạt máy bơm tưới ngay 1 đợt (2.5s)'
            )
          }
        />
      </div>

      {/* 3D Matte Botanical Planter Container */}
      <div className="aura-subcard py-3 px-4 flex items-center justify-center relative overflow-hidden h-[138px]">
        <IrrigationAnimation isPumpOn={isPumpOn} isPumpLocked={isPumpLocked} />
      </div>

      {/* Bottom Controls */}
      <div className="grid grid-cols-2 gap-2">
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
          className="py-2 px-3 rounded-[11px] text-[11px] font-semibold flex items-center justify-center gap-1.5 aura-btn"
        >
          <Droplets className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>Tưới 2.5s</span>
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
              : 'var(--soft-green)',
            color: isPumpLocked ? 'var(--warning)' : 'var(--olive-green)'
          }}
          className="py-2 px-3 rounded-[11px] text-[11px] font-semibold flex items-center justify-center gap-1.5 aura-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>{isPumpLocked ? 'Mở khóa bơm' : 'Reset 0/5'}</span>
        </button>
      </div>
    </article>
  );
});

// ============================================================================
// 4. 3D MATTE ARCHITECTURAL SECURITY SHIELD & HOME MODEL (IO34, IO19, IO14)
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
      className={`aura-card aura-card-interactive p-5 flex flex-col justify-between space-y-4 ${
        isFire ? 'aura-danger-pulse' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-[15px] font-semibold leading-tight"
          >
            Hệ thống an ninh
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px] mt-0.5">
            Lửa ADC {telemetry.flame ?? '—'} • {isAlertActive ? 'Còi & Đèn BẬT' : 'Trực canh'}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          title="Bật/tắt âm báo cháy trên trình duyệt"
          style={{
            backgroundColor: soundEnabled
              ? 'var(--soft-green)'
              : 'var(--bg-elevated)',
            color: soundEnabled
              ? 'var(--olive-green)'
              : 'var(--text-secondary)'
          }}
          className="p-2 rounded-[11px] aura-btn"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* 3D Matte Architectural Home & Security Shield Render */}
      <div className="aura-subcard py-3 px-4 flex items-center justify-center relative overflow-hidden h-[138px]">
        <svg
          width="160"
          height="124"
          viewBox="0 0 160 124"
          role="img"
          aria-label={
            isFire
              ? 'Mô hình 3D khiên an ninh đang phát cảnh báo đỏ khẩn cấp'
              : 'Mô hình 3D ngôi nhà và khiên bảo vệ an toàn'
          }
        >
          <defs>
            <linearGradient id="clayHomeBlock" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#DCDFD8" />
            </linearGradient>
            <linearGradient id="clayShield3D" x1="0" y1="0" x2="1" y2="1">
              <stop
                offset="0%"
                stopColor={isAlertActive ? '#D96B6B' : '#72A765'}
              />
              <stop
                offset="100%"
                stopColor={isAlertActive ? '#B54848' : '#394438'}
              />
            </linearGradient>
          </defs>

          {/* Studio Floor Shadow */}
          <ellipse
            cx="80"
            cy="112"
            rx="46"
            ry="6"
            fill={isAlertActive ? '#C85C5C' : '#343E33'}
            fillOpacity={isAlertActive ? '0.24' : '0.12'}
          />

          {/* 3D Miniature Architectural House Model */}
          <path
            d="M36 52 L72 26 L108 52 V98 H36 Z"
            fill="url(#clayHomeBlock)"
          />
          <path
            d="M32 54 L72 24 L112 54"
            fill="none"
            stroke="#394438"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="58"
            y="66"
            width="28"
            height="32"
            rx="6"
            fill="#E5EBE4"
          />

          {/* 3D Overlapping Matte Security Shield Badge */}
          <path
            d="M104 46 L128 54 V74 C128 90, 116 100, 104 105 C92 100, 80 90, 80 74 V54 Z"
            fill="url(#clayShield3D)"
          />
          <path
            d="M96 75 L102 81 L113 69"
            fill="none"
            stroke="#FAFCF9"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Bottom Alarm Test Controls */}
      <div className="grid grid-cols-2 gap-2">
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
            backgroundColor: 'var(--olive-green)',
            color: '#FAFCF9'
          }}
          className="py-2 px-2.5 rounded-[11px] text-[11px] font-semibold flex items-center justify-center gap-1.5 aura-btn"
        >
          <Bell className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>Test còi (2s)</span>
        </button>

        <button
          type="button"
          disabled={pendingCmd === 'ALARM_TEST:OFF'}
          onClick={() =>
            onCommand('ALARM_TEST', 'OFF', 'Đã tắt kiểm tra báo động')
          }
          style={{
            backgroundColor: 'var(--soft-green)',
            color: 'var(--olive-green)'
          }}
          className="py-2 px-2.5 rounded-[11px] text-[11px] font-semibold flex items-center justify-center gap-1.5 aura-btn"
        >
          <BellOff className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Tắt test</span>
        </button>
      </div>
    </article>
  );
});
