import React, { memo } from 'react';
import {
  Wifi,
  Smartphone,
  Server,
  Volume2,
  Sun,
  Moon,
  Trash2,
  Download
} from 'lucide-react';
import { getExportCsvUrl } from '../services/apiClient';

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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2
          style={{ color: 'var(--text-primary)' }}
          className="text-[18px] font-semibold"
        >
          Cấu hình hệ thống &amp; Kết nối
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className="text-[13px]">
          Thông số kết nối MQTT Broker, địa chỉ mạng LAN nội bộ và tùy chọn giao diện
        </p>
      </div>

      {/* Card 1: MQTT & Hardware Connectivity */}
      <div className="aura-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
          >
            <Wifi className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-[15px] font-semibold"
            >
              Trạng thái truyền thông MQTT &amp; Mạch ESP32
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Giao thức MQTT 3.1.1 đồng bộ hai chiều với Backend C# ASP.NET Core
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="aura-subcard p-3.5">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Máy chủ MQTT Broker
            </p>
            <p
              translate="no"
              style={{ color: 'var(--text-primary)' }}
              className="text-[13px] font-semibold tabular-nums mt-1"
            >
              {connMeta.brokerHost}:{connMeta.brokerPort}
            </p>
          </div>

          <div className="aura-subcard p-3.5">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Trạng thái bo mạch Vietduino ESP32
            </p>
            <p
              style={{
                color: telemetry.online ? 'var(--success)' : 'var(--warning)'
              }}
              className="text-[13px] font-semibold mt-1"
            >
              {telemetry.online
                ? 'Đang trực tuyến (Nhận gói tin mỗi 1 giây)'
                : 'Đang chờ dữ liệu từ mạch hoặc MQTTX'}
            </p>
          </div>

          <div className="aura-subcard p-3.5">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Kênh nhận dữ liệu cảm biến (Telemetry Topic)
            </p>
            <p
              translate="no"
              style={{ color: 'var(--text-primary)' }}
              className="text-[12px] font-medium tabular-nums mt-1"
            >
              {connMeta.telemetryTopic}
            </p>
          </div>

          <div className="aura-subcard p-3.5">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Kênh phát lệnh điều khiển (Command Topic)
            </p>
            <p
              translate="no"
              style={{ color: 'var(--text-primary)' }}
              className="text-[12px] font-medium tabular-nums mt-1"
            >
              {connMeta.commandTopic}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: LAN & Mobile Access */}
      <div className="aura-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
          >
            <Smartphone className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-[15px] font-semibold"
            >
              Truy cập từ Điện thoại trong mạng Wi-Fi nội bộ
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Sử dụng cho trình duyệt di động hoặc ứng dụng Mobile React Native
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="aura-subcard p-3.5">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Địa chỉ Web Dashboard trên mạng LAN
            </p>
            <p
              translate="no"
              style={{ color: 'var(--text-primary)' }}
              className="text-[14px] font-semibold tabular-nums mt-1 select-all"
            >
              http://{lanIp}:5173
            </p>
          </div>

          <div className="aura-subcard p-3.5">
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Địa chỉ Backend C# API &amp; SignalR Hub
            </p>
            <p
              translate="no"
              style={{ color: 'var(--text-primary)' }}
              className="text-[14px] font-semibold tabular-nums mt-1 select-all"
            >
              http://{lanIp}:5000
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Interface & Data Preferences */}
      <div className="aura-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)'
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
          >
            <Server className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-[15px] font-semibold"
            >
              Tùy chọn giao diện &amp; Quản lý dữ liệu
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Chế độ hiển thị, cảnh báo âm thanh và xuất dữ liệu báo cáo
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="aura-subcard p-4 flex items-center justify-between gap-4">
            <div>
              <p
                style={{ color: 'var(--text-primary)' }}
                className="text-[13px] font-semibold"
              >
                Chế độ giao diện (Light / Dark Mode)
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                Tự động lưu tùy chọn giao diện trên trình duyệt của bạn
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="px-3.5 py-2 rounded-[10px] border text-[12px] font-medium flex items-center gap-2"
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

          <div className="aura-subcard p-4 flex items-center justify-between gap-4">
            <div>
              <p
                style={{ color: 'var(--text-primary)' }}
                className="text-[13px] font-semibold"
              >
                Âm thanh báo cháy trên trình duyệt
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                Phát tiếng còi cảnh báo qua loa máy tính khi cảm biến lửa kích hoạt
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              style={{
                backgroundColor: soundEnabled
                  ? 'var(--success-soft)'
                  : 'var(--bg-card)',
                color: soundEnabled ? 'var(--success)' : 'var(--text-secondary)'
              }}
              className="px-3.5 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>{soundEnabled ? 'Đang bật âm thanh' : 'Đang tắt âm thanh'}</span>
            </button>
          </div>

          <div className="aura-subcard p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                style={{ color: 'var(--text-primary)' }}
                className="text-[13px] font-semibold"
              >
                Xuất báo cáo &amp; Làm mới kho dữ liệu
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
                Tải file thống kê Excel (.CSV) hoặc xóa nhật ký cũ trước khi thuyết trình
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={getExportCsvUrl()}
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-card)'
                }}
                className="px-3.5 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Tải file .CSV</span>
              </a>

              <button
                type="button"
                onClick={onRequestClearLogs}
                style={{
                  backgroundColor: 'var(--danger-soft)',
                  color: 'var(--danger)'
                }}
                className="px-3.5 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>Đặt lại nhật ký</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SettingsView;

