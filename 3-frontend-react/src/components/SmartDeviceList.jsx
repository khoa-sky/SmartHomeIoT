import React, { memo } from 'react';
import {
  Lightbulb,
  Sun,
  CloudRain,
  Droplets,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Cloudy,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

/**
 * SmartDeviceList — Right 3-column card inspired by the "Rooms" list in the reference image.
 * Lists all 6 real hardware subsystems of Aura Smart Home (Vietduino ESP32)
 * with live status, status indicator dot, and navigation to the corresponding management screen.
 * Bottom button: "View all devices" in dark olive (#394438).
 */
const SmartDeviceList = memo(function SmartDeviceList({
  telemetry,
  onSelectNav
}) {
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);
  const isRaining = Boolean(telemetry.rain);
  const servoAngle = Number(telemetry.servoAngle) ?? 15;
  const servoMode = telemetry.servoMode || 'AUTO';
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const isFire = Boolean(telemetry.fireAlert);
  const isRedLed = Boolean(telemetry.redLedOn);

  const devices = [
    {
      id: 'light-io32',
      name: 'Chiếu sáng phòng khách',
      status: isLightOn ? 'Đang bật sáng (IO32)' : 'Đang tắt (IO32)',
      dot: isLightOn ? 'var(--success)' : 'var(--text-muted)',
      Icon: Lightbulb,
      targetNav: 'devices'
    },
    {
      id: 'servo-io33',
      name: 'Giàn phơi thông minh',
      status: `${servoAngle > 90 ? 'Thu vào' : 'Đưa ra'} ${servoAngle}° • ${servoMode}`,
      dot: 'var(--success)',
      Icon: isRaining ? CloudRain : Sun,
      targetNav: 'devices'
    },
    {
      id: 'pump-io26',
      name: 'Máy bơm tưới tiêu',
      status: isPumpLocked
        ? 'Đã khóa bảo vệ (5/5)'
        : isPumpOn
        ? 'Đang bơm tưới (2.5s)'
        : `Chờ tự động (${telemetry.pumpCount || 0}/5)`,
      dot: isPumpLocked
        ? 'var(--danger)'
        : isPumpOn
        ? 'var(--success)'
        : 'var(--olive-green)',
      Icon: Droplets,
      targetNav: 'garden'
    },
    {
      id: 'pir-io27',
      name: 'Cảm biến chuyển động PIR',
      status: isPirLocked
        ? 'Đã khóa (Chế độ ngủ)'
        : hasMotion
        ? 'Phát hiện có người (IO27)'
        : 'Trực canh tự động (Auto)',
      dot: isPirLocked
        ? 'var(--warning)'
        : hasMotion
        ? 'var(--success)'
        : 'var(--olive-green)',
      Icon: Eye,
      targetNav: 'security'
    },
    {
      id: 'alarm-io19',
      name: 'Hệ thống báo động',
      status: isFire
        ? 'Báo cháy khẩn cấp!'
        : isRedLed
        ? 'Đèn cảnh báo đang nháy'
        : `An toàn (ADC lửa: ${telemetry.flame ?? '—'})`,
      dot: isFire || isRedLed ? 'var(--danger)' : 'var(--success)',
      Icon: isFire ? ShieldAlert : ShieldCheck,
      targetNav: 'security'
    },
    {
      id: 'rain-io23',
      name: 'Cảm biến mưa & Khí hậu',
      status: isRaining
        ? 'Phát hiện trời mưa (IO23)'
        : telemetry.temp !== null && telemetry.temp !== undefined && Number.isFinite(Number(telemetry.temp))
        ? `Khô ráo • ${Number(telemetry.temp).toFixed(1)}°C`
        : 'Khô ráo • Chờ dữ liệu nhiệt độ',
      dot: isRaining ? 'var(--warning)' : 'var(--success)',
      Icon: Cloudy,
      targetNav: 'garden'
    }
  ];

  return (
    <article className="aura-card p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-[16px] font-semibold leading-tight"
          >
            Smart Devices
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            6 phân hệ phần cứng Vietduino ESP32
          </p>
        </div>
        <span
          style={{
            backgroundColor: 'var(--soft-green)',
            color: 'var(--olive-green)'
          }}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums"
        >
          {telemetry.online ? 'Online' : 'Standby'}
        </span>
      </div>

      {/* Device Rows List */}
      <div className="space-y-2 flex-1 flex flex-col justify-center">
        {devices.map((dev) => {
          const Icon = dev.Icon;
          return (
            <button
              key={dev.id}
              type="button"
              onClick={() => onSelectNav(dev.targetNav)}
              className="group w-full aura-subcard px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left hover:opacity-95 aura-btn"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--olive-green)'
                  }}
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p
                    style={{ color: 'var(--text-primary)' }}
                    className="text-[13px] font-semibold truncate leading-tight"
                  >
                    {dev.name}
                  </p>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[11px] truncate mt-0.5"
                  >
                    {dev.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  style={{ backgroundColor: dev.dot }}
                  className="w-2 h-2 rounded-full"
                  aria-hidden="true"
                />
                <ChevronRight
                  className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Olive Button: View all devices */}
      <button
        type="button"
        onClick={() => onSelectNav('devices')}
        style={{
          backgroundColor: 'var(--olive-green)',
          color: '#FAFCF9'
        }}
        className="w-full py-3 px-4 aura-btn text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
      >
        <span>View all devices</span>
        <ArrowRight className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </article>
  );
});

export default SmartDeviceList;

