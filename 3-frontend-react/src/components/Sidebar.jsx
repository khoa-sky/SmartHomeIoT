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
  Home
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', subtitle: 'Tổng quan & Giám sát', icon: LayoutGrid },
  { id: 'devices', label: 'Devices', subtitle: 'Đèn & Giàn phơi', icon: SlidersHorizontal },
  { id: 'garden', label: 'Garden', subtitle: 'Tưới tiêu & Độ ẩm đất', icon: Sprout },
  { id: 'security', label: 'Security', subtitle: 'An ninh & Báo cháy', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', subtitle: 'Thống kê & Nhật ký', icon: BarChart2 },
  { id: 'settings', label: 'Settings', subtitle: 'Kết nối & Hệ thống', icon: Settings }
];

const Sidebar = memo(function Sidebar({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  online
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar Container */}
      <aside
        aria-label="Điều hướng chính"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)'
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[76px]' : 'w-[240px]'}`}
      >
        {/* Brand Header */}
        <div className="h-[72px] px-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--text-primary)'
              }}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
            >
              <Home className="w-[18px] h-[18px]" strokeWidth={1.8} aria-hidden="true" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[15px] font-semibold tracking-tight truncate"
                >
                  Aura Smart Home
                </p>
                <p
                  style={{ color: 'var(--text-secondary)' }}
                  className="text-[11px] truncate"
                >
                  Home &amp; Garden IoT
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Đóng thanh điều hướng"
            style={{ color: 'var(--text-secondary)' }}
            className="lg:hidden p-1.5 rounded-[8px] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            <X className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!collapsed ? (
            <p
              style={{ color: 'var(--text-muted)' }}
              className="px-3 pb-2 text-[11px] font-medium"
            >
              Danh mục quản lý
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
                title={collapsed ? `${item.label} — ${item.subtitle}` : undefined}
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] transition-colors duration-150 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B] ${
                  isActive ? 'font-semibold' : 'font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon
                  className="w-[18px] h-[18px] shrink-0"
                  strokeWidth={isActive ? 2 : 1.75}
                  style={{
                    color: isActive ? 'var(--accent-strong)' : 'var(--text-secondary)'
                  }}
                  aria-hidden="true"
                />
                {!collapsed ? (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate leading-tight">{item.label}</span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status & Collapse Button */}
        <div className="p-3 space-y-2">
          {!collapsed ? (
            <div
              style={{ backgroundColor: 'var(--bg-elevated)' }}
              className="px-3.5 py-3 rounded-[12px] flex items-center justify-between"
            >
              <div className="min-w-0">
                <p
                  style={{ color: 'var(--text-primary)' }}
                  className="text-[12px] font-medium truncate"
                >
                  Vietduino ESP32
                </p>
                <p
                  style={{ color: 'var(--text-secondary)' }}
                  className="text-[11px] truncate mt-0.5"
                >
                  {online ? 'Đang truyền dữ liệu' : 'Chờ gói tin MQTT'}
                </p>
              </div>
              <span
                style={{
                  backgroundColor: online ? 'var(--success)' : 'var(--warning)'
                }}
                className="w-2 h-2 rounded-full shrink-0"
                aria-hidden="true"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            style={{ color: 'var(--text-secondary)' }}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-[8px] text-[12px] font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B56B]"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                <span>Thu gọn menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;

