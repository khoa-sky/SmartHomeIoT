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
// 4.4. SMART LIGHTING (ĐÈN PHÒNG KHÁCH IO32 & CẢM BIẾN PIR IO27)
// ============================================================================
export const LightingControlCard = memo(function LightingControlCard({
  telemetry,
  pendingCmd,
  onCommand
}) {
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);

  return (
    <article className="aura-card p-6 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: isLightOn ? 'var(--accent-soft)' : 'var(--bg-elevated)',
              color: isLightOn ? 'var(--accent-strong)' : 'var(--text-secondary)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors duration-200"
          >
            <Lightbulb className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[16px] font-semibold leading-snug"
            >
              Chiếu sáng phòng khách
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Đèn LED MKE-M01 (IO32) &amp; Cảm biến PIR (IO27)
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: isLightOn ? 'var(--accent-soft)' : 'var(--bg-elevated)',
            color: isLightOn ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="px-3 py-1 rounded-[8px] text-[12px] font-medium shrink-0 transition-colors duration-200"
        >
          {isLightOn ? 'Đang bật (ON)' : 'Đang tắt (OFF)'}
        </span>
      </div>

      {/* Status Summary Row */}
      <div className="aura-subcard p-4 grid grid-cols-2 gap-4">
        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Trạng thái cảm biến PIR
          </p>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[13px] font-semibold mt-1"
          >
            {isPirLocked
              ? 'Đã khóa (Chế độ ngủ)'
              : hasMotion
              ? 'Phát hiện có người'
              : 'Không có chuyển động'}
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Tự động hóa chiếu sáng
          </p>
          <p
            style={{
              color: isPirLocked ? 'var(--warning)' : 'var(--success)'
            }}
            className="text-[13px] font-semibold mt-1"
          >
            {isPirLocked ? 'Tạm dừng tự bật đèn' : 'Tự bật khi có người'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={pendingCmd === 'LIGHT:ON'}
            onClick={() =>
              onCommand('LIGHT', 'ON', 'Đã gửi lệnh bật đèn phòng khách')
            }
            style={{
              backgroundColor: isLightOn ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: isLightOn ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
            className="py-2.5 px-4 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            <Power className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span>Bật đèn</span>
          </button>

          <button
            type="button"
            disabled={pendingCmd === 'LIGHT:OFF'}
            onClick={() =>
              onCommand('LIGHT', 'OFF', 'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)')
            }
            style={{
              backgroundColor: !isLightOn ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: !isLightOn ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
            className="py-2.5 px-4 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            <Power className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span>Tắt đèn</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            Đồng bộ 2 chiều với nút vật lý IO25
          </span>
          <button
            type="button"
            disabled={pendingCmd === 'PIR_LOCK:LOCK' || pendingCmd === 'PIR_LOCK:UNLOCK'}
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
              backgroundColor: isPirLocked ? 'var(--warning-soft)' : 'var(--bg-elevated)',
              color: isPirLocked ? 'var(--warning)' : 'var(--text-primary)'
            }}
            className="px-3.5 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-1.5 transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            {isPirLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Mở khóa PIR</span>
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
// 4.5. SMART CLOTHESLINE (GIÀN PHƠI QUẦN ÁO SERVO IO33 & MƯA IO23)
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

  return (
    <article className="aura-card p-6 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: isRaining ? 'var(--warning-soft)' : 'var(--accent-soft)',
              color: isRaining ? 'var(--warning)' : 'var(--accent-strong)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors duration-200"
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
              className="text-[16px] font-semibold leading-snug"
            >
              Giàn phơi quần áo thông minh
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Servo SG90 (IO33) &amp; Cảm biến mưa HS0217V (IO23)
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)'
          }}
          className="px-3 py-1 rounded-[8px] text-[12px] font-medium tabular-nums shrink-0"
        >
          Góc {angle}° • {mode}
        </span>
      </div>

      {/* Minimalist Architectural Clothesline Illustration & Status */}
      <div className="aura-subcard p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Vị trí giàn phơi hiện tại
          </p>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[14px] font-semibold"
          >
            {isRetracted ? 'Đã thu vào dưới mái hiên' : 'Đang đưa ra phơi ngoài trời'}
          </p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            Trạng thái Servo:{' '}
            <span style={{ color: 'var(--success)' }} className="font-medium">
              {isMoving ? 'Đang di chuyển…' : 'Đã hoàn thành (Ngắt PWM)'}
            </span>
          </p>
        </div>

        {/* Clean SVG Illustration of Roof Awning & Rack Position */}
        <svg
          width="116"
          height="54"
          viewBox="0 0 116 54"
          className="shrink-0"
          role="img"
          aria-label={isRetracted ? 'Minh họa giàn phơi thu vào mái hiên' : 'Minh họa giàn phơi đưa ra ngoài'}
        >
          {/* Roof / Awning Structure */}
          <path
            d="M6 12 H54 L46 24 H6 Z"
            fill="currentColor"
            style={{ color: 'var(--border-color)' }}
          />
          <line
            x1="10"
            y1="12"
            x2="10"
            y2="48"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ color: 'var(--text-secondary)' }}
          />
          {/* Extending Arm */}
          <line
            x1="12"
            y1="30"
            x2={isRetracted ? '42' : '96'}
            y2="30"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ color: 'var(--accent-strong)' }}
          />
          {/* Hangers */}
          <circle
            cx={isRetracted ? '26' : '64'}
            cy="30"
            r="3"
            fill="currentColor"
            style={{ color: 'var(--text-primary)' }}
          />
          <circle
            cx={isRetracted ? '38' : '86'}
            cy="30"
            r="3"
            fill="currentColor"
            style={{ color: 'var(--text-primary)' }}
          />
        </svg>
      </div>

      {/* Mode & Position Controls */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              onCommand('SERVO', 'AUTO', 'Đã bật chế độ giàn phơi tự động theo mưa')
            }
            style={{
              backgroundColor: mode === 'AUTO' ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: mode === 'AUTO' ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
            className="py-2.5 px-3 rounded-[10px] text-[12px] font-medium transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            Tự động (Auto)
          </button>

          <button
            type="button"
            onClick={() =>
              onCommand('SERVO', 'OUT', 'Đã điều khiển đưa giàn phơi ra ngoài (15°)')
            }
            style={{
              backgroundColor: mode === 'OUT' ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: mode === 'OUT' ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
            className="py-2.5 px-3 rounded-[10px] text-[12px] font-medium transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            Đưa ra (15°)
          </button>

          <button
            type="button"
            onClick={() =>
              onCommand('SERVO', 'IN', 'Đã điều khiển thu giàn phơi vào mái hiên (165°)')
            }
            style={{
              backgroundColor: mode === 'IN' ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: mode === 'IN' ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
            className="py-2.5 px-3 rounded-[10px] text-[12px] font-medium transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            Thu vào (165°)
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
          Tự động thu vào khi mưa liên tục 0.6s và đưa đồ ra sau khi khô 2.0s.
        </p>
      </div>
    </article>
  );
});

// ============================================================================
// 4.6. SMART GARDEN (TƯỚI CÂY TỰ ĐỘNG & BẢO VỆ MÁY BƠM IO26 / IO35)
// ============================================================================
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
    <article className="aura-card p-6 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: isPumpLocked
                ? 'var(--danger-soft)'
                : 'var(--success-soft)',
              color: isPumpLocked ? 'var(--danger)' : 'var(--success)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors duration-200"
          >
            <Sprout className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[16px] font-semibold leading-snug"
            >
              Tưới tiêu &amp; Bảo vệ máy bơm
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Relay MKE-M05 (IO26) &amp; Độ ẩm đất LM393 (IO35)
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
              ? 'var(--success)'
              : 'var(--text-secondary)'
          }}
          className="px-3 py-1 rounded-[8px] text-[12px] font-medium shrink-0"
        >
          {isPumpLocked
            ? 'Đã khóa bảo vệ'
            : isPumpOn
            ? 'Đang bơm tưới'
            : 'Máy bơm nghỉ'}
        </span>
      </div>

      {/* Combined Sensor Value & Cycle Protection Info */}
      <div className="aura-subcard p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Độ ẩm đất hiện tại
            </p>
            <p
              style={{ color: 'var(--text-primary)' }}
              className="text-[22px] font-semibold tabular-nums mt-0.5"
            >
              {soilVal}%{' '}
              <span
                style={{
                  color: soilVal < 30 ? 'var(--warning)' : 'var(--success)'
                }}
                className="text-[12px] font-medium"
              >
                ({soilVal < 30 ? 'Cần tưới < 30%' : 'Đạt ngưỡng ổn định'})
              </span>
            </p>
          </div>

          <div className="text-right">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Chu kỳ tưới tiêu
            </p>
            <p
              style={{ color: 'var(--text-primary)' }}
              className="text-[13px] font-semibold tabular-nums mt-1"
            >
              2.5s bơm / 12s nghỉ
            </p>
          </div>
        </div>

        {/* 5-Cycle Dry Run Protection Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: 'var(--text-secondary)' }}>
              Bộ đếm bảo vệ chống cháy bơm (tối đa 5 đợt liên tiếp)
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
                        : 'var(--success)'
                      : 'var(--border-color)'
                }}
                className="h-1.5 rounded-full transition-colors duration-200"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={pendingCmd === 'PUMP:START'}
          onClick={() =>
            onCommand('PUMP', 'START', 'Đã kích hoạt máy bơm tưới ngay 1 đợt (2.5s)')
          }
          style={{
            backgroundColor: 'var(--success)',
            color: '#FFFFFF'
          }}
          className="py-2.5 px-3 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78977C]"
        >
          <Droplets className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>Tưới ngay</span>
        </button>

        <button
          type="button"
          disabled={pendingCmd === 'PUMP:STOP'}
          onClick={() =>
            onCommand('PUMP', 'STOP', 'Đã gửi lệnh dừng máy bơm')
          }
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)'
          }}
          className="py-2.5 px-3 rounded-[10px] text-[12px] font-medium transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
        >
          Dừng bơm
        </button>

        <button
          type="button"
          disabled={pendingCmd === 'PUMP:UNLOCK'}
          onClick={() =>
            onCommand('PUMP', 'UNLOCK', 'Đã mở khóa máy bơm và đặt lại bộ đếm 0/5')
          }
          style={{
            backgroundColor: isPumpLocked ? 'var(--warning-soft)' : 'var(--bg-elevated)',
            color: isPumpLocked ? 'var(--warning)' : 'var(--text-secondary)'
          }}
          className="py-2.5 px-3 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Mở khóa</span>
        </button>
      </div>
    </article>
  );
});

// ============================================================================
// 4.7. SECURITY & ALARM (CÒI BUZZER IO19, 2 ĐÈN ĐỎ IO14 & LỬA IO34)
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
      className="aura-card p-6 flex flex-col justify-between space-y-5"
    >
      {/* Header: Calm when safe, only uses red when active alert */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: isAlertActive
                ? 'var(--danger-soft)'
                : 'var(--bg-elevated)',
              color: isAlertActive ? 'var(--danger)' : 'var(--text-secondary)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors duration-200"
          >
            {isAlertActive ? (
              <ShieldAlert className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </div>
          <div>
            <h2
              style={{ color: 'var(--text-primary)' }}
              className="text-[16px] font-semibold leading-snug"
            >
              An ninh &amp; Báo động khẩn cấp
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Còi Buzzer (IO19) • Cụm 2 Đèn Đỏ (IO14) • Lửa (IO34)
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: isAlertActive
              ? 'var(--danger-soft)'
              : 'var(--success-soft)',
            color: isAlertActive ? 'var(--danger)' : 'var(--success)'
          }}
          className="px-3 py-1 rounded-[8px] text-[12px] font-medium shrink-0"
        >
          {isFire
            ? 'Báo cháy khẩn cấp'
            : isAlarmLedOn
            ? 'Đèn cảnh báo bật'
            : 'Hệ thống an toàn'}
        </span>
      </div>

      {/* Hardware Channels Status Grid */}
      <div className="aura-subcard p-4 grid grid-cols-3 gap-3">
        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Cảm biến lửa (IO34)
          </p>
          <p
            style={{ color: isFire ? 'var(--danger)' : 'var(--text-primary)' }}
            className="text-[13px] font-semibold tabular-nums mt-1"
          >
            ADC {telemetry.flame} (&lt; 15)
          </p>
        </div>

        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Còi Buzzer (IO19)
          </p>
          <p
            style={{
              color: isAlertActive ? 'var(--danger)' : 'var(--text-primary)'
            }}
            className="text-[13px] font-semibold mt-1"
          >
            {isAlertActive ? 'Đang phát còi' : 'Trạng thái chờ'}
          </p>
        </div>

        <div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            2 Đèn Đỏ (IO14)
          </p>
          <p
            style={{
              color: isAlarmLedOn ? 'var(--danger)' : 'var(--text-primary)'
            }}
            className="text-[13px] font-semibold mt-1"
          >
            {isAlarmLedOn ? 'Đang chớp sáng' : 'Đang tắt'}
          </p>
        </div>
      </div>

      {/* Controls & Browser Sound Toggle */}
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
            className="py-2.5 px-3.5 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
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
            className="py-2.5 px-3.5 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
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
              Âm thanh cảnh báo trên trình duyệt
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            style={{
              backgroundColor: soundEnabled
                ? 'var(--success-soft)'
                : 'var(--bg-elevated)',
              color: soundEnabled ? 'var(--success)' : 'var(--text-secondary)'
            }}
            className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
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

