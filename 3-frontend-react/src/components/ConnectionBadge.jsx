import React, { memo } from 'react';
import { Loader2, ServerOff, Wifi, WifiOff } from 'lucide-react';

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

function formatTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : timeFormatter.format(date);
}

function getBadge(hubStatus, online) {
  if (hubStatus === 'connecting') {
    return {
      label: 'Đang kết nối máy chủ…',
      hint: 'Đang mở kênh SignalR tới Backend C# (cổng 5000)',
      Icon: Loader2,
      spin: true,
      tone: 'bg-slate-800 text-slate-300 border-slate-700'
    };
  }
  if (hubStatus !== 'connected') {
    return {
      label: hubStatus === 'reconnecting' ? 'Đang kết nối lại…' : 'Mất kết nối máy chủ',
      hint: 'Kiểm tra Backend C# đã chạy ở cổng 5000 chưa. Trang sẽ tự kết nối lại.',
      Icon: ServerOff,
      spin: false,
      tone: 'bg-red-500/15 text-red-300 border-red-500/40'
    };
  }
  if (online) {
    return {
      label: 'ESP32 ONLINE',
      hint: 'Mạch đang gửi dữ liệu MQTT mỗi giây',
      Icon: Wifi,
      spin: false,
      tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
    };
  }
  return {
    label: 'CHỜ DỮ LIỆU MQTT',
    hint: 'Đã nối máy chủ, chưa nhận gói tin từ ESP32 trong 6 giây gần nhất',
    Icon: WifiOff,
    spin: false,
    tone: 'bg-amber-500/15 text-amber-300 border-amber-500/40'
  };
}

/** Huy hiệu trạng thái: kết nối SignalR + ESP32 ONLINE / CHỜ DỮ LIỆU MQTT */
function ConnectionBadge({ hubStatus, online, lastUpdated }) {
  const { label, hint, Icon, spin, tone } = getBadge(hubStatus, online);
  const time = formatTime(lastUpdated);

  return (
    <div
      role="status"
      aria-live="polite"
      title={time ? `${hint}. Gói tin cuối: ${time}` : hint}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${tone}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${spin ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span translate="no">{label}</span>
      {hubStatus === 'connected' && online && time ? (
        <span className="hidden sm:inline font-normal opacity-75 tabular-nums">{time}</span>
      ) : null}
    </div>
  );
}

export default memo(ConnectionBadge);

