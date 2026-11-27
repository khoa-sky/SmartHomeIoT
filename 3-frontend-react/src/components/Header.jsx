import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Wifi,
  WifiOff,
  ServerOff,
  Search,
  ArrowUpRight
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

const SEARCHABLE_TARGETS = [
  {
    id: 'light',
    title: 'Chiếu sáng phòng khách (Đèn LED IO32)',
    category: 'Thiết bị • Đèn & PIR',
    nav: 'devices',
    keywords: 'den phong khach light led io32 chieu sang'
  },
  {
    id: 'pir',
    title: 'Cảm biến chuyển động PIR (IO27)',
    category: 'An ninh • Tự động bật đèn',
    nav: 'security',
    keywords: 'pir chuyen dong khoa ngu io27 motion'
  },
  {
    id: 'clothesline',
    title: 'Giàn phơi quần áo thông minh (Servo IO33)',
    category: 'Thiết bị • Cảm biến mưa IO23',
    nav: 'devices',
    keywords: 'gian phoi servo sg90 mua rain io33 io23'
  },
  {
    id: 'pump',
    title: 'Máy bơm tưới cây & Độ ẩm đất (IO26 / IO35)',
    category: 'Khu vườn • Tưới tự động < 30%',
    nav: 'garden',
    keywords: 'may bom tuoi cay do am dat soil pump io26 io35'
  },
  {
    id: 'fire',
    title: 'Hệ thống báo cháy & Còi Buzzer (IO34 / IO19 / IO14)',
    category: 'An ninh • Cảnh báo khẩn cấp',
    nav: 'security',
    keywords: 'bao chay lua coi buzzer den do alarm fire io34 io19 io14'
  },
  {
    id: 'analytics',
    title: 'Biểu đồ phân tích & Xuất báo cáo Excel (.CSV)',
    category: 'Thống kê • Nhật ký sự kiện',
    nav: 'analytics',
    keywords: 'bieu do thong ke lich su nhat ky csv excel analytics'
  },
  {
    id: 'settings',
    title: 'Cấu hình mạng LAN & MQTT Broker',
    category: 'Hệ thống • Kết nối',
    nav: 'settings',
    keywords: 'cai dat cau hinh mqtt lan ip theme dark light settings'
  }
];

function getMqttBadge(hubStatus, online) {
  if (hubStatus !== 'connected') {
    return {
      label: 'MQTT Offline',
      dot: 'var(--danger)',
      Icon: ServerOff
    };
  }
  if (online) {
    return {
      label: 'MQTT Online',
      dot: 'var(--success)',
      Icon: Wifi
    };
  }
  return {
    label: 'Standby MQTT',
    dot: 'var(--warning)',
    Icon: WifiOff
  };
}

/**
 * DashboardHeader — Reference style:
 * Left: "Welcome home!" + live date/time & active section subtitle
 * Center/Right: Functional quick device search, MQTT status pill, notifications, Light/Dark switch, Admin avatar
 */
const Header = memo(function DashboardHeader({
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
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(timer);
  }, []);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeNav) || NAV_ITEMS[0];
  const mqttBadge = getMqttBadge(hubStatus, telemetry.online);
  const StatusIcon = mqttBadge.Icon;

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCHABLE_TARGETS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    );
  }, [query]);

  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mobile Menu Button + "Welcome home!" Heading */}
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
            className="lg:hidden p-2.5 rounded-[14px] border aura-btn"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h1
                style={{ color: 'var(--text-primary)' }}
                className="text-[22px] sm:text-[26px] font-semibold tracking-tight leading-tight truncate"
              >
                {activeNav === 'overview' ? 'Welcome home!' : currentNav.viLabel}
              </h1>
              <span
                style={{ color: 'var(--text-secondary)' }}
                className="hidden md:inline text-[12px] font-medium"
              >
                Intelligent living, naturally.
              </span>
            </div>
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-[12px] truncate mt-0.5 tabular-nums"
            >
              {dateFormatter.format(now)} • {timeFormatter.format(now)}
              {activeNav !== 'overview' ? ` — ${currentNav.subtitle}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Functional Quick Search + MQTT Status + Bell + Theme Toggle + Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Functional Device & Section Search Bar */}
          <div className="relative hidden xl:block w-64">
            <label htmlFor="aura-quick-search" className="sr-only">
              Tìm nhanh thiết bị hoặc khu vực
            </label>
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
              style={{ color: 'var(--text-secondary)' }}
              aria-hidden="true"
            />
            <input
              id="aura-quick-search"
              type="search"
              name="auraQuickSearch"
              autoComplete="off"
              value={query}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm thiết bị, cảm biến…"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="w-full pl-9 pr-3 py-2 rounded-[14px] border text-[12px] focus:outline-none focus:ring-2 focus:ring-[#394438]"
            />

            {searchFocused && query.trim() ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)'
                }}
                className="absolute left-0 right-0 mt-2 rounded-[18px] border p-2 shadow-xl z-50 space-y-1"
              >
                {searchResults.length === 0 ? (
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[12px] px-3 py-2"
                  >
                    Không tìm thấy thiết bị phù hợp.
                  </p>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => {
                        onSelectNav(item.nav);
                        setQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-[12px] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p
                          style={{ color: 'var(--text-primary)' }}
                          className="text-[12px] font-semibold truncate"
                        >
                          {item.title}
                        </p>
                        <p
                          style={{ color: 'var(--text-secondary)' }}
                          className="text-[11px] truncate"
                        >
                          {item.category}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-hidden="true"
                      />
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          {/* MQTT Status Pill */}
          <button
            type="button"
            onClick={onOpenNetworkModal}
            title="Xem thông tin kết nối mạng LAN & MQTT Broker"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[14px] border text-[12px] font-medium aura-btn"
          >
            <span
              style={{ backgroundColor: mqttBadge.dot }}
              className="w-2 h-2 rounded-full shrink-0"
              aria-hidden="true"
            />
            <StatusIcon
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={1.75}
              style={{ color: mqttBadge.dot }}
              aria-hidden="true"
            />
            <span translate="no" style={{ color: 'var(--text-primary)' }} className="font-semibold">
              {mqttBadge.label}
            </span>
            <span
              translate="no"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color)'
              }}
              className="hidden sm:inline tabular-nums border-l pl-2"
            >
              {lanIp}
            </span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Thông báo hệ thống"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="relative p-2.5 rounded-[14px] border aura-btn"
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              {telemetry.fireAlert ? (
                <span
                  style={{ backgroundColor: 'var(--danger)' }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                />
              ) : recentLogs.length > 0 ? (
                <span
                  style={{ backgroundColor: 'var(--success)' }}
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
                className="absolute right-0 mt-2 w-80 rounded-[20px] border p-4 shadow-xl z-50 space-y-3 aura-page-enter"
              >
                <div className="flex items-center justify-between">
                  <p
                    style={{ color: 'var(--text-primary)' }}
                    className="text-[13px] font-semibold"
                  >
                    Hoạt động hệ thống
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onSelectNav('analytics');
                    }}
                    style={{ color: 'var(--olive-green)' }}
                    className="text-[11px] font-semibold hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentLogs.slice(0, 4).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="aura-subcard p-2.5 text-[12px]"
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

          {/* Light / Dark Mode Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'
            }
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className="p-2.5 rounded-[14px] border aura-btn"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>

          {/* Admin Avatar Pill */}
          <button
            type="button"
            onClick={() => onSelectNav('settings')}
            title="Quản trị viên Aura Home"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-[14px] border aura-btn"
          >
            <span
              style={{
                backgroundColor: 'var(--olive-green)',
                color: 'var(--bg-card)'
              }}
              className="w-7 h-7 rounded-[10px] flex items-center justify-center text-[11px] font-semibold"
            >
              AH
            </span>
            <span
              style={{ color: 'var(--text-primary)' }}
              className="text-[12px] font-semibold"
            >
              Admin
            </span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default Header;
