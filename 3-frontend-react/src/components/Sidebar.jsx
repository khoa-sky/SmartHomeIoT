import React, { memo } from 'react';
import {
  LayoutGrid,
  SlidersHorizontal,
  Sprout,
  ShieldCheck,
  BarChart2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Radio
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    viLabel: 'Không gian tổng quan',
    subtitle: 'Giám sát & Điều phối trung tâm',
    icon: LayoutGrid
  },
  {
    id: 'devices',
    label: 'Devices',
    viLabel: 'Thiết bị nội thất',
    subtitle: 'Chiếu sáng & Giàn phơi thông minh',
    icon: SlidersHorizontal
  },
  {
    id: 'garden',
    label: 'Garden',
    viLabel: 'Khu vườn sinh thái',
    subtitle: 'Độ ẩm đất & Tưới tiêu tự động',
    icon: Sprout
  },
  {
    id: 'security',
    label: 'Security',
    viLabel: 'Trung tâm an ninh',
    subtitle: 'Cảnh báo nhiệt, Lửa & PIR',
    icon: ShieldCheck
  },
  {
    id: 'analytics',
    label: 'Analytics',
    viLabel: 'Phân tích & Nhật ký',
    subtitle: 'Biểu đồ thời gian thực & Báo cáo CSV',
    icon: BarChart2
  },
  {
    id: 'settings',
    label: 'Settings',
    viLabel: 'Cấu hình hệ thống',
    subtitle: 'Kết nối LAN, MQTT & Giao diện',
    icon: Settings
  }
];

/** Minimalist Architectural Monogram Logo for Aura Smart Home 2.0 */
function AuraMonogramLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Architectural A-Roof & Inner Sanctuary Arch */}
      <path
        d="M3.5 11.2L12 4L20.5 11.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 10.2V19.5H17.8V10.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 19.5V14.75C9.75 13.5074 10.7574 12.5 12 12.5C13.2426 12.5 14.25 13.5074 14.25 14.75V19.5"
        stroke="#C5AB6B"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const Sidebar = memo(function Sidebar({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  online,
  hubStatus = 'connected',
  lanIp = '192.168.1.31'
}) {
  const statusLabel =
    hubStatus !== 'connected'
      ? 'Mất kết nối Server C#'
      : online
      ? 'ESP32 đang trực tuyến'
      : 'Chờ gói tin MQTT';

  const statusDotColor =
    hubStatus !== 'connected'
      ? 'var(--danger)'
      : online
      ? 'var(--smart-green)'
      : 'var(--champagne-gold)';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar Container */}
      <aside
        aria-label="Điều hướng chính Aura Smart Home"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)'
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r transition-[width,transform,background-color] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[84px]' : 'w-[264px]'}`}
      >
        {/* Brand Header */}
        <div className="h-[80px] px-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="w-11 h-11 rounded-[14px] border flex items-center justify-center shrink-0 shadow-sm"
            >
              <AuraMonogramLogo />
            </div>

            {!collapsed ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    translate="no"
                    style={{ color: 'var(--text-primary)' }}
                    className="text-[15px] font-semibold tracking-tight truncate"
                  >
                    AURA HOME
                  </p>
                  <span
                    translate="no"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      color: 'var(--accent-strong)'
                    }}
                    className="px-1.5 py-0.5 rounded-[6px] text-[10px] font-semibold"
                  >
                    2.0
                  </span>
                </div>
                <p
                  style={{ color: 'var(--text-secondary)' }}
                  className="text-[11px] truncate mt-0.5"
                >
                  Luxury Living &amp; Garden
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Đóng thanh điều hướng"
            style={{ color: 'var(--text-secondary)' }}
            className="lg:hidden p-1.5 rounded-[10px] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
          >
            <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
          {!collapsed ? (
            <p
              style={{ color: 'var(--text-muted)' }}
              className="px-3 pb-2 text-[11px] font-medium tracking-wide"
            >
              Không gian điều khiển
            </p>
          ) : null}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectNav(item.id);
                  onCloseMobile();
                }}
                title={collapsed ? `${item.label} — ${item.viLabel}` : undefined}
                style={{
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                className={`group relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] text-[13px] aura-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B] ${
                  isActive
                    ? 'font-semibold shadow-sm'
                    : 'font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                {/* Subtle Olive / Champagne Indicator Pill */}
                {isActive ? (
                  <span
                    style={{ backgroundColor: 'var(--olive-green)' }}
                    className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full transition-all duration-200"
                    aria-hidden="true"
                  />
                ) : null}

                <div
                  style={{
                    backgroundColor: isActive ? 'var(--olive-soft)' : 'transparent',
                    color: isActive ? 'var(--olive-green)' : 'var(--text-secondary)'
                  }}
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-colors duration-200"
                >
                  <Icon
                    className="w-[18px] h-[18px]"
                    strokeWidth={isActive ? 2 : 1.75}
                    aria-hidden="true"
                  />
                </div>

                {!collapsed ? (
                  <div className="flex flex-col items-start min-w-0 text-left">
                    <span className="truncate leading-tight">{item.label}</span>
                    <span
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[11px] font-normal truncate mt-0.5"
                    >
                      {item.viLabel}
                    </span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Telemetry Card, Administrator Info & Collapse Toggle */}
        <div
          style={{ borderColor: 'var(--border-subtle)' }}
          className="p-3.5 border-t space-y-2.5"
        >
          {/* System Connection Status Block */}
          {!collapsed ? (
            <div className="aura-subcard p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Radio
                    className="w-3.5 h-3.5 shrink-0"
                    strokeWidth={1.75}
                    style={{ color: statusDotColor }}
                    aria-hidden="true"
                  />
                  <p
                    translate="no"
                    style={{ color: 'var(--text-primary)' }}
                    className="text-[12px] font-semibold truncate"
                  >
                    Vietduino ESP32
                  </p>
                </div>
                <span
                  style={{ backgroundColor: statusDotColor }}
                  className="w-2 h-2 rounded-full shrink-0"
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-secondary)' }} className="truncate">
                  {statusLabel}
                </span>
                <span
                  translate="no"
                  style={{ color: 'var(--text-muted)' }}
                  className="tabular-nums font-medium"
                >
                  {lanIp}
                </span>
              </div>
            </div>
          ) : (
            <div
              title={`Vietduino ESP32 — ${statusLabel}`}
              className="aura-subcard py-2.5 flex items-center justify-center"
            >
              <span
                style={{ backgroundColor: statusDotColor }}
                className="w-2.5 h-2.5 rounded-full"
              />
            </div>
          )}

          {/* Administrator Profile Row */}
          {!collapsed ? (
            <div className="px-2.5 py-2 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{
                    backgroundColor: 'var(--olive-green)',
                    color: '#FFFFFF'
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                >
                  AH
                </div>
                <div className="min-w-0">
                  <p
                    style={{ color: 'var(--text-primary)' }}
                    className="text-[12px] font-semibold truncate leading-tight"
                  >
                    Home Residence
                  </p>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[11px] truncate"
                  >
                    Quản trị viên hệ thống
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Thu gọn thanh điều hướng"
                title="Thu gọn thanh điều hướng"
                style={{ color: 'var(--text-secondary)' }}
                className="hidden lg:flex p-1.5 rounded-[10px] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
              >
                <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Mở rộng thanh điều hướng"
              title="Mở rộng thanh điều hướng"
              style={{ color: 'var(--text-secondary)' }}
              className="hidden lg:flex w-full items-center justify-center py-2 rounded-[10px] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5AB6B]"
            >
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
