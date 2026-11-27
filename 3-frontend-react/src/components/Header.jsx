import React, { useState, useEffect, memo } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Wifi,
  WifiOff,
  Smartphone,
  User
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

const Header = memo(function Header({
  activeNav,
  theme,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenNetworkModal,
  telemetry,
  lanIp,
  recentLogs,
  onSelectNav
}) {
  const [now, setNow] = useState(() => new Date());
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeNav) || NAV_ITEMS[0];

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-main)',
        borderColor: 'var(--border-color)'
      }}
      className="sticky top-0 z-30 border-b backdrop-blur-sm bg-opacity-95 transition-colors duration-200"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Mở menu điều hướng"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className="lg:hidden p-2 rounded-[10px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <h1
              style={{ color: 'var(--text-primary)' }}
              className="text-[20px] sm:text-[24px] font-semibold tracking-tight truncate leading-tight"
            >
              {currentNav.label}
            </h1>
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px] truncate hidden sm:block"
            >
              {dateFormatter.format(now)} • {timeFormatter.format(now)}
            </p>
          </div>
        </div>

        {/* Right: MQTT Status, Network IP, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Compact MQTT & Device Connection Pill */}
          <button
            type="button"
            onClick={onOpenNetworkModal}
            title="Xem thông tin kết nối mạng LAN & MQTT Broker"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] border text-[12px] font-medium transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            <span
              style={{
                backgroundColor: telemetry.online ? 'var(--success)' : 'var(--warning)'
              }}
              className="w-2 h-2 rounded-full shrink-0"
              aria-hidden="true"
            />
            {telemetry.online ? (
              <Wifi
                className="w-3.5 h-3.5 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--success)' }}
                aria-hidden="true"
              />
            ) : (
              <WifiOff
                className="w-3.5 h-3.5 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--warning)' }}
                aria-hidden="true"
              />
            )}
            <span style={{ color: 'var(--text-primary)' }} className="hidden md:inline">
              {telemetry.online ? 'MQTT Connected' : 'Standby MQTT'}
            </span>
            <span
              translate="no"
              style={{ color: 'var(--text-secondary)' }}
              className="hidden sm:inline tabular-nums border-l pl-2"
            >
              {lanIp}
            </span>
          </button>

          {/* Mobile LAN Quick Info Trigger (Mobile screens) */}
          <button
            type="button"
            onClick={onOpenNetworkModal}
            aria-label="Thông tin kết nối điện thoại"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
            className="sm:hidden p-2 rounded-[10px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            <Smartphone className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Thông báo sự kiện gần đây"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="relative p-2 rounded-[10px] border transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              {telemetry.fireAlert ? (
                <span
                  style={{ backgroundColor: 'var(--danger)' }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                />
              ) : null}
            </button>

            {notifOpen ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)'
                }}
                className="absolute right-0 mt-2 w-80 rounded-[16px] border p-4 shadow-xl z-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p
                    style={{ color: 'var(--text-primary)' }}
                    className="text-[13px] font-semibold"
                  >
                    Hoạt động mới nhất
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onSelectNav('analytics');
                    }}
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[11px] font-medium hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentLogs.slice(0, 4).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{ backgroundColor: 'var(--bg-elevated)' }}
                      className="p-2.5 rounded-[10px] text-[12px]"
                    >
                      <p
                        style={{ color: 'var(--text-primary)' }}
                        className="font-medium line-clamp-2"
                      >
                        {item.message}
                      </p>
                      <p
                        style={{ color: 'var(--text-secondary)' }}
                        className="text-[11px] mt-1 tabular-nums"
                      >
                        {item.category} • {item.source}
                      </p>
                    </div>
                  ))}
                  {recentLogs.length === 0 ? (
                    <p
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[12px] py-3 text-center"
                    >
                      Chưa có thông báo mới.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* Light / Dark Mode Switch */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            title={theme === 'dark' ? 'Chế độ Sáng (Light Mode)' : 'Chế độ Tối (Dark Mode)'}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] border text-[12px] font-medium transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            {theme === 'dark' ? (
              <>
                <Sun
                  className="w-4 h-4"
                  strokeWidth={1.75}
                  style={{ color: 'var(--accent)' }}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon
                  className="w-4 h-4"
                  strokeWidth={1.75}
                  style={{ color: 'var(--text-secondary)' }}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Subtle User Avatar Badge */}
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)'
            }}
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[10px]"
          >
            <div
              style={{ backgroundColor: 'var(--accent-soft)' }}
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <span className="text-[12px] font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;

