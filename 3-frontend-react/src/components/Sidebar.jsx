import React, { memo } from 'react';
import {
  LayoutGrid,
  SlidersHorizontal,
  Sprout,
  ShieldCheck,
  BarChart2,
  Settings,
  X
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    viLabel: 'Tổng quan hệ thống',
    subtitle: 'Intelligent living, naturally.',
    icon: LayoutGrid
  },
  {
    id: 'devices',
    label: 'Devices',
    viLabel: 'Thiết bị thông minh',
    subtitle: 'Chiếu sáng & Giàn phơi tự động',
    icon: SlidersHorizontal
  },
  {
    id: 'garden',
    label: 'Garden',
    viLabel: 'Tưới tiêu & Độ ẩm đất',
    subtitle: 'Giám sát LM393 & Bảo vệ máy bơm',
    icon: Sprout
  },
  {
    id: 'security',
    label: 'Security',
    viLabel: 'An ninh & Báo cháy',
    subtitle: 'Cảm biến lửa IO34, Buzzer & PIR',
    icon: ShieldCheck
  },
  {
    id: 'analytics',
    label: 'Analytics',
    viLabel: 'Phân tích & Nhật ký',
    subtitle: 'Biểu đồ lịch sử & Xuất báo cáo CSV',
    icon: BarChart2
  },
  {
    id: 'settings',
    label: 'Settings',
    viLabel: 'Cấu hình hệ thống',
    subtitle: 'Mạng LAN, MQTT Broker & Giao diện',
    icon: Settings
  }
];

/** Minimalist Scandinavian Aura Monogram Mark */
function AuraSignatureLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M4 11.2L12 4.2L20 11.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 10.2V19.2H17.5V10.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * CompactSidebar (88px Desktop Icon Rail, Mobile Drawer)
 * Matches the Scandinavian Smart Home reference layout:
 * - Aura Logo at top
 * - Main navigation icons stacked vertically with soft sage active pill & hover tooltips
 * - Settings anchored near bottom + live MQTT connection status dot
 */
const Sidebar = memo(function CompactSidebar({
  activeNav,
  onSelectNav,
  mobileOpen,
  onCloseMobile,
  online,
  hubStatus = 'connected',
  lanIp = '192.168.1.31'
}) {
  const mainNavItems = NAV_ITEMS.filter((item) => item.id !== 'settings');
  const settingsItem = NAV_ITEMS.find((item) => item.id === 'settings');

  const statusDotColor =
    hubStatus !== 'connected'
      ? 'var(--danger)'
      : online
      ? 'var(--success)'
      : 'var(--warning)';

  const statusTitle =
    hubStatus !== 'connected'
      ? 'Mất kết nối Server C# (cổng 5000)'
      : online
      ? `ESP32 Online (${lanIp})`
      : `Standby MQTT — Chờ dữ liệu ESP32 (${lanIp})`;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      {/* Compact 88px Desktop Rail / 248px Mobile Drawer */}
      <aside
        aria-label="Thanh điều hướng Aura Smart Home"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)'
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r py-5 px-3 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:w-[88px] lg:translate-x-0 ${
          mobileOpen ? 'w-[248px] translate-x-0' : 'w-[88px] -translate-x-full'
        }`}
      >
        {/* Top Brand Mark */}
        <div className="flex items-center justify-between lg:justify-center px-1">
          <button
            type="button"
            onClick={() => {
              onSelectNav('overview');
              onCloseMobile();
            }}
            title="Aura Smart Home — Signature Edition"
            style={{
              backgroundColor: 'var(--olive-green)',
              color: 'var(--bg-card)'
            }}
            className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#394438]"
          >
            <AuraSignatureLogo />
          </button>

          {mobileOpen ? (
            <div className="lg:hidden flex-1 ml-3 min-w-0">
              <p
                translate="no"
                style={{ color: 'var(--text-primary)' }}
                className="text-[14px] font-semibold truncate"
              >
                AURA HOME
              </p>
              <p
                style={{ color: 'var(--text-secondary)' }}
                className="text-[11px] truncate"
              >
                Signature Edition
              </p>
            </div>
          ) : null}

          {mobileOpen ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Đóng thanh điều hướng"
              style={{ color: 'var(--text-secondary)' }}
              className="lg:hidden p-1.5 rounded-[10px]"
            >
              <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {/* Center Vertical Icon Stack */}
        <nav
          aria-label="Menu chính"
          className="flex-1 flex flex-col items-center justify-center gap-2.5 my-4"
        >
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onSelectNav(item.id);
                    onCloseMobile();
                  }}
                  aria-label={`${item.label} — ${item.viLabel}`}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    backgroundColor: isActive ? 'var(--soft-green)' : 'transparent',
                    color: isActive ? 'var(--olive-green)' : 'var(--text-secondary)'
                  }}
                  className={`relative flex items-center gap-3 rounded-[16px] aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#394438] ${
                    mobileOpen
                      ? 'w-full px-3.5 py-3 justify-start'
                      : 'w-12 h-12 justify-center'
                  } ${
                    isActive
                      ? 'font-semibold shadow-sm'
                      : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive ? (
                    <span
                      style={{ backgroundColor: 'var(--olive-green)' }}
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                      aria-hidden="true"
                    />
                  ) : null}

                  <Icon
                    className="w-[20px] h-[20px] shrink-0"
                    strokeWidth={isActive ? 2 : 1.65}
                    aria-hidden="true"
                  />

                  {mobileOpen ? (
                    <span className="lg:hidden text-[13px] truncate">
                      {item.label} • {item.viLabel}
                    </span>
                  ) : null}
                </button>

                {/* Hover Tooltip on Desktop Rail */}
                <div
                  role="tooltip"
                  style={{
                    backgroundColor: 'var(--dark-olive)',
                    color: '#FAFCF9'
                  }}
                  className="pointer-events-none hidden lg:flex items-center gap-2 absolute left-[72px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-[10px] text-[12px] font-medium whitespace-nowrap opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-lg z-50"
                >
                  <span>{item.label}</span>
                  <span className="opacity-70 text-[11px]">({item.viLabel})</span>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Area: Settings Icon + System Status Dot */}
        <div className="flex flex-col items-center gap-3">
          {settingsItem ? (
            <div className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onSelectNav('settings');
                  onCloseMobile();
                }}
                aria-label="Settings — Cấu hình hệ thống"
                aria-current={activeNav === 'settings' ? 'page' : undefined}
                style={{
                  backgroundColor:
                    activeNav === 'settings' ? 'var(--soft-green)' : 'transparent',
                  color:
                    activeNav === 'settings'
                      ? 'var(--olive-green)'
                      : 'var(--text-secondary)'
                }}
                className={`relative flex items-center gap-3 rounded-[16px] aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#394438] ${
                  mobileOpen
                    ? 'w-full px-3.5 py-3 justify-start'
                    : 'w-12 h-12 justify-center'
                } ${
                  activeNav === 'settings'
                    ? 'font-semibold shadow-sm'
                    : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Settings
                  className="w-[20px] h-[20px] shrink-0"
                  strokeWidth={activeNav === 'settings' ? 2 : 1.65}
                  aria-hidden="true"
                />
                {mobileOpen ? (
                  <span className="lg:hidden text-[13px] truncate">
                    Settings • Cấu hình
                  </span>
                ) : null}
              </button>

              <div
                role="tooltip"
                style={{
                  backgroundColor: 'var(--dark-olive)',
                  color: '#FAFCF9'
                }}
                className="pointer-events-none hidden lg:flex items-center gap-2 absolute left-[72px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-[10px] text-[12px] font-medium whitespace-nowrap opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-lg z-50"
              >
                <span>Settings</span>
                <span className="opacity-70 text-[11px]">(Cấu hình hệ thống)</span>
              </div>
            </div>
          ) : null}

          {/* System Connectivity Indicator Pill at Very Bottom */}
          <div
            title={statusTitle}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)'
            }}
            className={`border rounded-[14px] flex items-center justify-center gap-2 ${
              mobileOpen ? 'w-full px-3 py-2 justify-between' : 'w-11 h-10'
            }`}
          >
            <span
              style={{ backgroundColor: statusDotColor }}
              className="w-2.5 h-2.5 rounded-full shrink-0"
            />
            {mobileOpen ? (
              <span
                style={{ color: 'var(--text-secondary)' }}
                className="lg:hidden text-[11px] font-medium truncate"
              >
                {online ? 'ESP32 Online' : 'Standby MQTT'}
              </span>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
