import React, { useState, useEffect, memo } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Wifi,
  WifiOff,
  ServerOff,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit'
});

function getTimeOfDayGreeting(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'Chào buổi sáng';
  if (hour >= 11 && hour < 14) return 'Chào buổi trưa';
  if (hour >= 14 && hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function getMqttStatusConfig(hubStatus, online) {
  if (hubStatus !== 'connected') {
    return {
      label: 'MQTT Offline',
      viHint: 'Chưa kết nối Backend C# (cổng 5000)',
      dotColor: 'var(--danger)',
      textColor: 'var(--danger)',
      bgColor: 'var(--danger-soft)',
      Icon: ServerOff
    };
  }
  if (online) {
    return {
      label: 'MQTT Online',
      viHint: 'Mạch ESP32 đang đồng bộ thời gian thực',
      dotColor: 'var(--smart-green)',
      textColor: 'var(--olive-green)',
      bgColor: 'var(--success-soft)',
      Icon: Wifi
    };
  }
  return {
    label: 'Standby MQTT',
    viHint: 'Đã nối Broker — Đang chờ gói tin ESP32',
    dotColor: 'var(--champagne-gold)',
    textColor: 'var(--text-primary)',
    bgColor: 'var(--accent-soft)',
    Icon: WifiOff
  };
}

const Header = memo(function Header({
  activeNav,
  theme,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenNetworkModal,
  telemetry,
  hubStatus = 'connected',
  lanIp,
  recentLogs,
  onSelectNav
}) {
  const [now, setNow] = useState(() => new Date());
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(timer);
  }, []);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeNav) || NAV_ITEMS[0];
  const greeting = getTimeOfDayGreeting(now);
  const mqttConfig = getMqttStatusConfig(hubStatus, telemetry.online);
  const StatusIcon = mqttConfig.Icon;

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-glass)',
        borderColor: 'var(--border-color)'
      }}
      className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-300"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[80px] flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Button + Page Heading & Greeting */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Mở menu điều hướng"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className="lg:hidden p-2.5 rounded-[12px] border aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1
                style={{ color: 'var(--text-primary)' }}
                className="text-[20px] sm:text-[23px] font-semibold tracking-tight truncate leading-tight"
              >
                {currentNav.viLabel}
              </h1>
              <span
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)'
                }}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
              >
                <Sparkles
                  className="w-3 h-3"
                  strokeWidth={1.75}
                  style={{ color: 'var(--champagne-gold)' }}
                  aria-hidden="true"
                />
                <span>{greeting}</span>
              </span>
            </div>

            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px] truncate hidden sm:block mt-0.5 tabular-nums"
            >
              {currentNav.subtitle} • {dateFormatter.format(now)} — {timeFormatter.format(now)}
            </p>
          </div>
        </div>

        {/* Right: MQTT Pill, LAN Trigger, Notification Bell, Luxury Theme Switch */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Accurate MQTT Online / Standby / Offline Status Pill */}
          <button
            type="button"
            onClick={onOpenNetworkModal}
            title={`${mqttConfig.viHint} (Nhấn để xem cấu hình mạng LAN & MQTT)`}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-[14px] border text-[12px] font-medium aura-btn hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
          >
            <span
              style={{ backgroundColor: mqttConfig.dotColor }}
              className="w-2 h-2 rounded-full shrink-0"
              aria-hidden="true"
            />
            <StatusIcon
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={1.75}
              style={{ color: mqttConfig.dotColor }}
              aria-hidden="true"
            />
            <span
              translate="no"
              style={{ color: 'var(--text-primary)' }}
              className="font-semibold"
            >
              {mqttConfig.label}
            </span>
            <span
              translate="no"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color)'
              }}
              className="hidden md:inline tabular-nums border-l pl-2.5"
            >
              {lanIp}
            </span>
          </button>

          {/* Mobile LAN Quick Info Button */}
          <button
            type="button"
            onClick={onOpenNetworkModal}
            aria-label="Thông tin kết nối điện thoại"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
            className="sm:hidden p-2.5 rounded-[12px] border aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
          >
            <Smartphone className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {/* System Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Thông báo sự kiện hệ thống"
              aria-expanded={notifOpen}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="relative p-2.5 rounded-[14px] border aura-btn hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              {telemetry.fireAlert ? (
                <span
                  style={{ backgroundColor: 'var(--danger)' }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                />
              ) : recentLogs.length > 0 ? (
                <span
                  style={{ backgroundColor: 'var(--champagne-gold)' }}
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                />
              ) : null}
            </button>

            {notifOpen ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)'
                }}
                className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-[20px] border p-5 shadow-2xl z-50 space-y-3.5 aura-page-enter"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      style={{ color: 'var(--text-primary)' }}
                      className="text-[13px] font-semibold"
                    >
                      Nhật ký hệ thống gần đây
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                      Đồng bộ trực tiếp từ SignalR Hub
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onSelectNav('analytics');
                    }}
                    style={{ color: 'var(--olive-green)' }}
                    className="text-[12px] font-semibold hover:underline"
                  >
                    Xem toàn bộ
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {recentLogs.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="aura-subcard p-3 text-[12px] space-y-1"
                    >
                      <p
                        style={{ color: 'var(--text-primary)' }}
                        className="font-medium line-clamp-2"
                      >
                        {item.message}
                      </p>
                      <p
                        style={{ color: 'var(--text-secondary)' }}
                        className="text-[11px] tabular-nums"
                      >
                        {item.category} • {item.source}
                      </p>
                    </div>
                  ))}
                  {recentLogs.length === 0 ? (
                    <p
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[12px] py-4 text-center"
                    >
                      Chưa ghi nhận thông báo mới trong phiên này.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* Luxury Minimalist Light / Dark Mode Switch */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'
            }
            title={
              theme === 'dark'
                ? 'Chuyển sang Luxury Light Mode'
                : 'Chuyển sang Luxury Dark Mode'
            }
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-[14px] border text-[12px] font-medium aura-btn hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
          >
            <div
              style={{
                backgroundColor:
                  theme === 'dark' ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                color: theme === 'dark' ? 'var(--champagne-gold)' : 'var(--olive-green)'
              }}
              className="w-6 h-6 rounded-[8px] flex items-center justify-center transition-transform duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Moon className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
              )}
            </div>
            <span className="hidden sm:inline font-medium">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default Header;
