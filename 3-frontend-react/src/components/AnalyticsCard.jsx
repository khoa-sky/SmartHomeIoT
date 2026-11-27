import React, { useState, useMemo, memo } from 'react';
import { BarChart2, ArrowUpRight } from 'lucide-react';

const timeShortFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

function formatShortTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : timeShortFormatter.format(d);
}

const METRIC_TABS = [
  { id: 'soil', label: 'Độ ẩm đất', unit: '%', max: 100 },
  { id: 'temp', label: 'Nhiệt độ', unit: '°C', max: 45 },
  { id: 'hum', label: 'Độ ẩm khí', unit: '%', max: 100 }
];

/**
 * AnalyticsCard — Placed directly below LivingRoomCard in the left 5-column stack,
 * inspired by the Sage Green rounded bar chart card in the reference image.
 * - Uses 100% real sensor history (`history` array from Backend C# / SignalR)
 * - Sage green surface (`aura-sage-card`)
 * - Rounded cream bars (`#FAFCF9`) with the active/selected bar in dark olive (`#394438`)
 * - Minimal tooltip and metric switcher (Độ ẩm đất / Nhiệt độ / Độ ẩm khí)
 */
const AnalyticsCard = memo(function AnalyticsCard({
  history = [],
  summary,
  onOpenFullAnalytics
}) {
  const [metric, setMetric] = useState('soil');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const currentTab = METRIC_TABS.find((t) => t.id === metric) || METRIC_TABS[0];

  const bars = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) return [];
    const slice = history.slice(-12);
    return slice.map((pt, idx) => {
      const raw = Number(pt?.[metric]) || 0;
      const ratio = Math.min(1, Math.max(0.12, raw / currentTab.max));
      return {
        idx,
        value: raw,
        heightPercent: Math.round(ratio * 100),
        time: formatShortTime(pt?.timestamp)
      };
    });
  }, [history, metric, currentTab.max]);

  const activeIdx =
    selectedIndex !== null && bars[selectedIndex]
      ? selectedIndex
      : bars.length - 1;
  const activeBar = bars[activeIdx] || null;

  return (
    <article className="aura-sage-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
      {/* Top Row: Title + Metric Pill Switcher */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-[16px] font-semibold leading-tight"
            >
              Biến thiên môi trường thực tế
            </h3>
            <button
              type="button"
              onClick={onOpenFullAnalytics}
              title="Mở trang phân tích chi tiết"
              style={{ color: 'var(--olive-green)' }}
              className="p-1 rounded-[8px] hover:bg-black/5"
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <p
            style={{ color: 'var(--text-primary)', opacity: 0.72 }}
            className="text-[12px] mt-0.5"
          >
            {activeBar
              ? `Mẫu đo lúc ${activeBar.time}: ${
                  metric === 'temp'
                    ? activeBar.value.toFixed(1)
                    : activeBar.value.toFixed(0)
                }${currentTab.unit}`
              : 'Dữ liệu lịch sử thời gian thực từ ESP32'}
          </p>
        </div>

        {/* Metric Switcher */}
        <div
          style={{ backgroundColor: 'rgba(250, 252, 249, 0.55)' }}
          className="p-1 rounded-[12px] flex items-center gap-1 backdrop-blur-sm"
        >
          {METRIC_TABS.map((tab) => {
            const active = metric === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMetric(tab.id);
                  setSelectedIndex(null);
                }}
                style={{
                  backgroundColor: active ? '#394438' : 'transparent',
                  color: active ? '#FAFCF9' : '#343E33'
                }}
                className="px-2.5 py-1 rounded-[9px] text-[11px] font-semibold transition-colors"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rounded Column Bar Chart */}
      {bars.length === 0 ? (
        <div className="h-36 rounded-[16px] bg-white/40 dark:bg-black/20 flex flex-col items-center justify-center text-center px-4">
          <BarChart2
            className="w-6 h-6 mb-1.5"
            strokeWidth={1.6}
            style={{ color: 'var(--olive-green)' }}
            aria-hidden="true"
          />
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[12px] font-semibold"
          >
            Đang chờ mẫu dữ liệu lịch sử từ mạch ESP32
          </p>
          <p
            style={{ color: 'var(--text-primary)', opacity: 0.7 }}
            className="text-[11px]"
          >
            Biểu đồ cột sẽ tự động cập nhật ngay khi gói tin MQTT được gửi lên.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative h-36 pt-6 px-2 flex items-end justify-between gap-2 border-b border-black/10 dark:border-white/10">
            {/* Subtle Horizontal Reference Grid Lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-6 bottom-0 flex flex-col justify-between"
            >
              <div className="border-t border-dashed border-black/10 dark:border-white/10" />
              <div className="border-t border-dashed border-black/10 dark:border-white/10" />
            </div>

            {bars.map((bar, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  aria-label={`Mẫu ${bar.time}: ${bar.value}${currentTab.unit}`}
                  className="group relative flex-1 h-full flex flex-col items-center justify-end focus:outline-none"
                >
                  {/* Floating Value Pill Above Active Bar */}
                  {isSelected ? (
                    <span
                      style={{
                        backgroundColor: '#394438',
                        color: '#FAFCF9'
                      }}
                      className="absolute -top-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums shadow-sm whitespace-nowrap z-10"
                    >
                      {metric === 'temp'
                        ? bar.value.toFixed(1)
                        : bar.value.toFixed(0)}
                      {currentTab.unit}
                    </span>
                  ) : null}

                  <div
                    style={{
                      height: `${bar.heightPercent}%`,
                      backgroundColor: isSelected ? '#394438' : '#FAFCF9'
                    }}
                    className="w-full max-w-[26px] rounded-t-[10px] rounded-b-[4px] transition-all duration-300 shadow-sm group-hover:opacity-95"
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Time Labels & Real Summary Stats */}
          <div
            style={{ color: 'var(--text-primary)', opacity: 0.78 }}
            className="flex items-center justify-between text-[11px] font-medium tabular-nums px-1"
          >
            <span>{bars[0]?.time}</span>
            <span>
              TB nhiệt: {Number(summary?.avgTemp || 0).toFixed(1)}°C • Đã tưới:{' '}
              {summary?.totalPumpRuns || 0} đợt
            </span>
            <span>{bars[bars.length - 1]?.time}</span>
          </div>
        </div>
      )}
    </article>
  );
});

export default AnalyticsCard;
