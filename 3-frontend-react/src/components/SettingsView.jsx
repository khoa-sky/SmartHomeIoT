import React, { memo } from 'react';
import {
  Wifi,
  Smartphone,
  Server,
  Volume2,
  Sun,
  Moon,
  Trash2,
  Download,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { getExportCsvUrl } from '../services/apiClient';

/**
 * Apple-Settings-style Grouped Configuration Page for Aura Smart Home 2.0
 */
const SettingsView = memo(function SettingsView({
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  lanIp,
  connMeta,
  telemetry,
  onRequestClearLogs
}) {
  return (
    <div className="space-y-6 max-w-4xl aura-page-enter">
      {/* Top Banner: Aura Smart Home 2.0 Edition Card */}
      <div className="aura-card p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            style={{
              backgroundColor: 'var(--olive-soft)',
              color: 'var(--olive-green)'
            }}
            className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
          >
            <Cpu className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                style={{ color: 'var(--text-primary)' }}
                className="text-[18px] font-semibold"
              >
                AURA SMART HOME 2.0 — LUXURY EDITION
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px] mt-0.5">
              Vietduino ESP32 (N16) • ASP.NET Core 8.0 SignalR • React &amp; Tailwind Luxury UI
            </p>
          </div>
        </div>

        <span
          style={{
            backgroundColor: telemetry.online
              ? 'var(--success-soft)'
              : 'var(--accent-soft)',
            color: telemetry.online
              ? 'var(--olive-green)'
              : 'var(--text-primary)'
          }}
          className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>{telemetry.online ? 'ESP32 Trực tuyến' : 'Chế độ chờ MQTT'}</span>
        </span>
      </div>

      {/* Group 1: Appearance & Audio Alerts (Apple Settings Style) */}
      <section className="space-y-2.5">
        <p
          style={{ color: 'var(--text-secondary)' }}
          className="px-1 text-[12px] font-semibold tracking-wide"
        >
          Giao diện &amp; Trải nghiệm âm thanh
        </p>

        <div className="aura-card divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {/* Row 1: Light / Dark Mode */}
          <div
            style={{ borderColor: 'var(--border-color)' }}
            className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--champagne-gold)'
                }}
                className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
              >
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Sun className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                )}
              </div>
              <div>
                <p
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[14px] font-semibold"
                >
                  Chủ đề hiển thị (Luxury Light / Dark Mode)
                </p>
                <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                  Bảng màu nội thất kiến trúc ấm áp ban ngày hoặc xanh rừng sâu ban đêm
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="px-4 py-2.5 aura-btn border text-[12px] font-semibold flex items-center gap-2 hover:opacity-95"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>Chuyển sang Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>Chuyển sang Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Row 2: Browser Fire Alarm Audio */}
          <div
            style={{ borderColor: 'var(--border-color)' }}
            className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div
                style={{
                  backgroundColor: soundEnabled
                    ? 'var(--olive-soft)'
                    : 'var(--bg-elevated)',
                  color: soundEnabled
                    ? 'var(--olive-green)'
                    : 'var(--text-secondary)'
                }}
                className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
              >
                <Volume2 className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <p
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[14px] font-semibold"
                >
                  Âm thanh cảnh báo cháy trên trình duyệt
                </p>
                <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                  Phát âm báo Web Audio API khi cảm biến hồng ngoại IO34 phát hiện lửa
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={onToggleSound}
              style={{
                backgroundColor: soundEnabled
                  ? 'var(--olive-green)'
                  : 'var(--bg-elevated)',
                color: soundEnabled ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              className="px-4 py-2.5 aura-btn text-[12px] font-semibold flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>{soundEnabled ? 'Đang bật âm báo' : 'Đang tắt âm báo'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Group 2: MQTT Broker & Hardware Telemetry Channels */}
      <section className="space-y-2.5">
        <p
          style={{ color: 'var(--text-secondary)' }}
          className="px-1 text-[12px] font-semibold tracking-wide"
        >
          Giao thức truyền thông MQTT 3.1.1 &amp; Mạch ESP32
        </p>

        <div className="aura-card p-6 space-y-4">
          <div className="flex items-center gap-3.5">
            <div
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--olive-green)'
              }}
              className="w-10 h-10 rounded-[13px] flex items-center justify-center"
            >
              <Wifi className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <h3
                style={{ color: 'var(--text-primary)' }}
                className="text-[15px] font-semibold"
              >
                Kết nối Broker &amp; Chủ đề gói tin (Topics)
              </h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                Đồng bộ hai chiều giữa ESP32, Backend C# và giao diện Web
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="aura-subcard p-4">
              <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                Máy chủ MQTT Broker
              </p>
              <p
                translate="no"
                style={{ color: 'var(--text-primary)' }}
                className="text-[14px] font-semibold tabular-nums mt-1"
              >
                {connMeta.brokerHost}:{connMeta.brokerPort}
              </p>
            </div>

            <div className="aura-subcard p-4">
              <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                Trạng thái bo mạch Vietduino ESP32
              </p>
              <p
                style={{
                  color: telemetry.online
                    ? 'var(--olive-green)'
                    : 'var(--champagne-gold)'
                }}
                className="text-[14px] font-semibold mt-1"
              >
                {telemetry.online
                  ? 'Trực tuyến (Cập nhật mỗi 1 giây)'
                  : 'Chờ gói tin từ ESP32 / MQTTX'}
              </p>
            </div>

            <div className="aura-subcard p-4">
              <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                Kênh dữ liệu cảm biến (Telemetry Topic)
              </p>
              <p
                translate="no"
                style={{ color: 'var(--text-primary)' }}
                className="text-[12px] font-semibold tabular-nums mt-1 select-all"
              >
                {connMeta.telemetryTopic}
              </p>
            </div>

            <div className="aura-subcard p-4">
              <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                Kênh lệnh điều khiển (Command Topic)
              </p>
              <p
                translate="no"
                style={{ color: 'var(--text-primary)' }}
                className="text-[12px] font-semibold tabular-nums mt-1 select-all"
              >
                {connMeta.commandTopic}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Group 3: LAN Network & Data Management */}
      <section className="space-y-2.5">
        <p
          style={{ color: 'var(--text-secondary)' }}
          className="px-1 text-[12px] font-semibold tracking-wide"
        >
          Mạng nội bộ (LAN) &amp; Quản trị dữ liệu
        </p>

        <div className="aura-card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="aura-subcard p-4 flex items-center justify-between gap-3">
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  Địa chỉ truy cập Web trên Điện thoại
                </p>
                <p
                  translate="no"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[14px] font-semibold tabular-nums mt-1 select-all"
                >
                  http://{lanIp}:5173
                </p>
              </div>
              <Smartphone
                className="w-5 h-5 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--champagne-gold)' }}
                aria-hidden="true"
              />
            </div>

            <div className="aura-subcard p-4 flex items-center justify-between gap-3">
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  Máy chủ Backend C# &amp; SignalR Hub
                </p>
                <p
                  translate="no"
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[14px] font-semibold tabular-nums mt-1 select-all"
                >
                  http://{lanIp}:5000
                </p>
              </div>
              <Server
                className="w-5 h-5 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--olive-green)' }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            style={{ borderColor: 'var(--border-color)' }}
            className="pt-4 border-t flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p
                style={{ color: 'var(--text-primary)' }}
                className="text-[14px] font-semibold"
              >
                Xuất báo cáo thống kê &amp; Đặt lại nhật ký
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                Tải file Excel (.CSV UTF-8) hoặc làm mới bộ đếm sự kiện
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={getExportCsvUrl()}
                style={{
                  backgroundColor: 'var(--olive-green)',
                  color: '#FFFFFF'
                }}
                className="px-4 py-2.5 aura-btn text-[12px] font-semibold flex items-center gap-2 hover:opacity-95"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
                <span>Tải báo cáo (.CSV)</span>
              </a>

              <button
                type="button"
                onClick={onRequestClearLogs}
                style={{
                  backgroundColor: 'var(--danger-soft)',
                  color: 'var(--danger)'
                }}
                className="px-4 py-2.5 aura-btn text-[12px] font-semibold flex items-center gap-2 hover:opacity-90"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Đặt lại nhật ký</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default SettingsView;
