import React, { useState, useMemo, memo } from 'react';
import {
  Thermometer,
  Droplets,
  Sprout,
  ShieldCheck,
  Download,
  RefreshCw,
  Trash2,
  Search,
  Lightbulb,
  Activity
} from 'lucide-react';
import { getExportCsvUrl } from '../services/apiClient';

const timeShortFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

function formatTimeShort(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : timeShortFormatter.format(d);
}

function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFormatter.format(d);
}

// ============================================================================
// MINIMALIST SVG AREA LINE CHART WITH HOVER TOOLTIP
// ============================================================================
const MinimalAreaChart = memo(function MinimalAreaChart({
  title,
  subtitle,
  unit,
  data,
  dataKey,
  strokeColor,
  gradientId,
  minDomain = 0,
  maxDomain = 100,
  thresholds = []
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="aura-card p-5 flex flex-col justify-between h-[260px]">
        <div>
          <h3 style={{ color: 'var(--text-primary)' }} className="text-[15px] font-semibold">
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            {subtitle}
          </p>
        </div>
        <div
          style={{ color: 'var(--text-secondary)' }}
          className="flex-1 flex items-center justify-center text-[13px]"
        >
          Đang chờ dữ liệu lịch sử từ hệ thống…
        </div>
      </div>
    );
  }

  const width = 520;
  const height = 160;
  const padX = 28;
  const padY = 18;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const range = Math.max(1, maxDomain - minDomain);

  const points = data.map((item, idx) => {
    const rawVal = Number(item[dataKey]) || 0;
    const clamped = Math.min(maxDomain, Math.max(minDomain, rawVal));
    const x =
      data.length === 1
        ? width / 2
        : padX + (idx / (data.length - 1)) * usableW;
    const y = padY + usableH - ((clamped - minDomain) / range) * usableH;
    return {
      x,
      y,
      value: rawVal,
      time: formatTimeShort(item.timestamp)
    };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${points[0].x.toFixed(1)},${height - padY} ${polyline} ${points[
    points.length - 1
  ].x.toFixed(1)},${height - padY}`;

  const activePoint =
    hoverIndex !== null && points[hoverIndex]
      ? points[hoverIndex]
      : points[points.length - 1];

  return (
    <div className="aura-card p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 style={{ color: 'var(--text-primary)' }} className="text-[15px] font-semibold">
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
            {subtitle}
          </p>
        </div>

        {activePoint ? (
          <div
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            className="px-3 py-1.5 rounded-[10px] text-right shrink-0"
          >
            <p
              style={{ color: 'var(--text-primary)' }}
              className="text-[14px] font-semibold tabular-nums leading-tight"
            >
              { dataKey === 'temp' ? Number(activePoint.value).toFixed(1) : Number(activePoint.value).toFixed(0) }
              {unit}
            </p>
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-[10px] tabular-nums"
            >
              {activePoint.time}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 overflow-visible"
          role="img"
          aria-label={title}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.24" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Rules */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = padY + usableH * ratio;
            const labelVal = Math.round(maxDomain - ratio * range);
            return (
              <g key={idx}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ color: 'var(--border-color)' }}
                />
                <text
                  x={padX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="currentColor"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Optional Reference Threshold Lines */}
          {thresholds.map((th, idx) => {
            const yTh =
              padY + usableH - ((th.value - minDomain) / range) * usableH;
            return (
              <g key={idx}>
                <line
                  x1={padX}
                  y1={yTh}
                  x2={width - padX}
                  y2={yTh}
                  stroke={th.color}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - padX}
                  y={yTh - 4}
                  textAnchor="end"
                  fontSize="9"
                  fill={th.color}
                >
                  {th.label}
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          <polygon points={area} fill={`url(#${gradientId})`} />
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyline}
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '4.5' : '2.5'}
                  fill={strokeColor}
                  stroke="var(--bg-card)"
                  strokeWidth="1.5"
                />
                <rect
                  x={pt.x - usableW / (points.length * 2)}
                  y={0}
                  width={usableW / points.length}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Bottom Time Axis */}
        <div
          style={{ color: 'var(--text-muted)' }}
          className="flex items-center justify-between text-[11px] tabular-nums px-2 pt-1"
        >
          <span>{points[0]?.time}</span>
          {points.length > 2 ? (
            <span>{points[Math.floor(points.length / 2)]?.time}</span>
          ) : null}
          <span>{points[points.length - 1]?.time}</span>
        </div>
      </div>
    </div>
  );
});

const LOG_FILTER_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'BAO_CHAY', label: 'An ninh & Cháy' },
  { id: 'TUOI_CAY', label: 'Máy bơm' },
  { id: 'GIAN_PHOI', label: 'Giàn phơi' },
  { id: 'PIR', label: 'Cảm biến PIR' },
  { id: 'DEN', label: 'Đèn phòng khách' },
  { id: 'DIEU_KHIEN', label: 'Điều khiển từ xa' }
];

const AnalyticsView = memo(function AnalyticsView({
  summary,
  history,
  logs,
  onRefresh,
  onRequestClearLogs
}) {
  const [sampleLimit, setSampleLimit] = useState(25);
  const [logFilter, setLogFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const visibleHistory = useMemo(
    () => history.slice(-sampleLimit),
    [history, sampleLimit]
  );

  // Phân nhóm lịch sử thực tế từ dữ liệu EventLogs của hệ thống
  const deviceSwitchingLogs = useMemo(
    () =>
      logs
        .filter((l) => l.category === 'DEN' || l.category === 'GIAN_PHOI' || l.category === 'DIEU_KHIEN')
        .slice(0, 5),
    [logs]
  );

  const pumpActivityLogs = useMemo(
    () => logs.filter((l) => l.category === 'TUOI_CAY').slice(0, 5),
    [logs]
  );

  const securityAlertLogs = useMemo(
    () =>
      logs
        .filter((l) => l.category === 'BAO_CHAY' || l.category === 'PIR')
        .slice(0, 5),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return logs.filter((item) => {
      const matchCat = logFilter === 'ALL' || item.category === logFilter;
      if (!matchCat) return false;
      if (!kw) return true;
      return (
        (item.message && item.message.toLowerCase().includes(kw)) ||
        (item.source && item.source.toLowerCase().includes(kw)) ||
        (item.category && item.category.toLowerCase().includes(kw))
      );
    });
  }, [logs, logFilter, searchKeyword]);

  return (
    <div className="space-y-6">
      {/* Top Bar: Sample Range Filter & CSV Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-[18px] font-semibold"
          >
            Phân tích dữ liệu &amp; Lịch sử vận hành
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[13px]">
            Tổng hợp từ dữ liệu đo đạc thời gian thực của mạch Vietduino ESP32
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            className="p-1 rounded-[10px] border flex items-center gap-1"
          >
            {[10, 20, 30].map((lim) => (
              <button
                key={lim}
                type="button"
                onClick={() => setSampleLimit(lim)}
                style={{
                  backgroundColor:
                    sampleLimit === lim ? 'var(--accent-soft)' : 'transparent',
                  color:
                    sampleLimit === lim
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)'
                }}
                className="px-2.5 py-1 rounded-[8px] text-[12px] font-medium transition-colors"
              >
                {lim} mẫu
              </button>
            ))}
          </div>

          <a
            href={getExportCsvUrl()}
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)'
            }}
            className="px-3.5 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span>Xuất báo cáo (.CSV)</span>
          </a>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="aura-card p-5">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px] font-medium">
              Nhiệt độ trung bình
            </span>
            <Thermometer
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--warning)' }}
              aria-hidden="true"
            />
          </div>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[28px] font-semibold tabular-nums mt-2"
          >
            {Number(summary.avgTemp).toFixed(1)}°C
          </p>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] tabular-nums mt-2"
          >
            Cao nhất: {Number(summary.maxTemp).toFixed(1)}°C • Thấp nhất:{' '}
            {Number(summary.minTemp).toFixed(1)}°C
          </p>
        </div>

        <div className="aura-card p-5">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px] font-medium">
              Độ ẩm trung bình
            </span>
            <Droplets
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--accent-strong)' }}
              aria-hidden="true"
            />
          </div>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[28px] font-semibold tabular-nums mt-2"
          >
            {Number(summary.avgHum).toFixed(1)}%
          </p>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] tabular-nums mt-2"
          >
            Độ ẩm đất trung bình: {Number(summary.avgSoil).toFixed(1)}%
          </p>
        </div>

        <div className="aura-card p-5">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px] font-medium">
              Hoạt động tưới cây
            </span>
            <Sprout
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--success)' }}
              aria-hidden="true"
            />
          </div>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[28px] font-semibold tabular-nums mt-2"
          >
            {summary.totalPumpRuns} đợt
          </p>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] tabular-nums mt-2"
          >
            Lượng nước ước tính: ~{summary.estimatedWaterMl} ml
          </p>
        </div>

        <div className="aura-card p-5">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }} className="text-[12px] font-medium">
              An ninh &amp; Thời tiết
            </span>
            <ShieldCheck
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--success)' }}
              aria-hidden="true"
            />
          </div>
          <p
            style={{ color: 'var(--text-primary)' }}
            className="text-[28px] font-semibold tabular-nums mt-2"
          >
            {summary.totalPirDetections} PIR
          </p>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-[12px] tabular-nums mt-2"
          >
            Mưa thu đồ: {summary.totalRainEvents} • Báo cháy: {summary.totalFireAlerts}
          </p>
        </div>
      </div>

      {/* 3 Time-Series Charts (Temperature, Air Humidity, Soil Moisture) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <MinimalAreaChart
          title="1. Biểu đồ nhiệt độ"
          subtitle="Biến thiên nhiệt độ phòng (°C)"
          unit="°C"
          data={visibleHistory}
          dataKey="temp"
          strokeColor="#D69C52"
          gradientId="tempChartGrad"
          minDomain={15}
          maxDomain={45}
        />

        <MinimalAreaChart
          title="2. Biểu đồ độ ẩm không khí"
          subtitle="Độ ẩm tương đối trong phòng (%)"
          unit="%"
          data={visibleHistory}
          dataKey="hum"
          strokeColor="#C5B56B"
          gradientId="humChartGrad"
          minDomain={0}
          maxDomain={100}
        />

        <MinimalAreaChart
          title="3. Biểu đồ độ ẩm đất"
          subtitle="Độ ẩm đất vườn & ngưỡng tưới (%)"
          unit="%"
          data={visibleHistory}
          dataKey="soil"
          strokeColor="#78977C"
          gradientId="soilChartGrad"
          minDomain={0}
          maxDomain={100}
          thresholds={[
            { value: 30, label: '30% Tưới', color: '#C96D67' },
            { value: 40, label: '40% Ẩm', color: '#78977C' }
          ]}
        />
      </div>

      {/* 3 Activity History Summaries (4. Device On/Off, 5. Pump Runs, 6. Security Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 4. Lịch sử bật/tắt thiết bị */}
        <div className="aura-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--accent-strong)' }}
              aria-hidden="true"
            />
            <h3 style={{ color: 'var(--text-primary)' }} className="text-[14px] font-semibold">
              4. Lịch sử bật/tắt thiết bị
            </h3>
          </div>
          <div className="space-y-2">
            {deviceSwitchingLogs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px] py-4">
                Chưa có sự kiện bật/tắt thiết bị trong phiên này.
              </p>
            ) : (
              deviceSwitchingLogs.map((item, idx) => (
                <div key={item.id || idx} className="aura-subcard p-3 text-[12px]">
                  <p style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {item.message}
                  </p>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[11px] tabular-nums mt-1"
                  >
                    {formatTimeShort(item.timestamp)} • {item.source}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Lịch sử hoạt động máy bơm */}
        <div className="aura-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sprout
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--success)' }}
              aria-hidden="true"
            />
            <h3 style={{ color: 'var(--text-primary)' }} className="text-[14px] font-semibold">
              5. Lịch sử hoạt động máy bơm
            </h3>
          </div>
          <div className="space-y-2">
            {pumpActivityLogs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px] py-4">
                Chưa ghi nhận đợt bơm tưới nào trong phiên này.
              </p>
            ) : (
              pumpActivityLogs.map((item, idx) => (
                <div key={item.id || idx} className="aura-subcard p-3 text-[12px]">
                  <p style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {item.message}
                  </p>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[11px] tabular-nums mt-1"
                  >
                    {formatTimeShort(item.timestamp)} • {item.source}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. Lịch sử cảnh báo an ninh */}
        <div className="aura-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Activity
              className="w-4 h-4"
              strokeWidth={1.75}
              style={{ color: 'var(--danger)' }}
              aria-hidden="true"
            />
            <h3 style={{ color: 'var(--text-primary)' }} className="text-[14px] font-semibold">
              6. Lịch sử cảnh báo an ninh
            </h3>
          </div>
          <div className="space-y-2">
            {securityAlertLogs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }} className="text-[12px] py-4">
                Không có cảnh báo cháy hoặc chuyển động bất thường.
              </p>
            ) : (
              securityAlertLogs.map((item, idx) => (
                <div key={item.id || idx} className="aura-subcard p-3 text-[12px]">
                  <p style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {item.message}
                  </p>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[11px] tabular-nums mt-1"
                  >
                    {formatTimeShort(item.timestamp)} • {item.category}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full System Audit Logs Table */}
      <div className="aura-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-[16px] font-semibold"
            >
              Nhật ký sự kiện toàn hệ thống
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[12px]">
              Hiển thị {filteredLogs.length} sự kiện được ghi nhận
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)'
              }}
              className="px-3 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              onClick={onRequestClearLogs}
              style={{
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)'
              }}
              className="px-3 py-2 rounded-[10px] text-[12px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>Đặt lại nhật ký</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {LOG_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLogFilter(tab.id)}
                style={{
                  backgroundColor:
                    logFilter === tab.id ? 'var(--text-primary)' : 'var(--bg-elevated)',
                  color:
                    logFilter === tab.id ? 'var(--bg-card)' : 'var(--text-secondary)'
                }}
                className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <label htmlFor="audit-search-input" className="sr-only">
              Tìm kiếm sự kiện
            </label>
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
              style={{ color: 'var(--text-secondary)' }}
              aria-hidden="true"
            />
            <input
              id="audit-search-input"
              name="auditSearch"
              type="search"
              autoComplete="off"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm từ khóa sự kiện…"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-[10px] border text-[12px] focus:outline-none focus:ring-2 focus:ring-[#C5B56B]"
            />
          </div>
        </div>

        {/* Table */}
        <div
          style={{ borderColor: 'var(--border-color)' }}
          className="overflow-x-auto max-h-96 overflow-y-auto rounded-[12px] border"
        >
          <table className="w-full text-left text-[12px]">
            <thead
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color)'
              }}
              className="sticky top-0 border-b"
            >
              <tr>
                <th className="py-3 px-4 font-medium">Thời gian</th>
                <th className="py-3 px-4 font-medium">Danh mục</th>
                <th className="py-3 px-4 font-medium">Nguồn</th>
                <th className="py-3 px-4 font-medium">Chi tiết hoạt động</th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: 'var(--border-color)' }}
              className="divide-y"
            >
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: 'var(--text-secondary)' }}
                    className="py-8 text-center"
                  >
                    Không tìm thấy sự kiện phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    style={{ borderColor: 'var(--border-color)' }}
                    className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                  >
                    <td
                      style={{ color: 'var(--text-secondary)' }}
                      className="py-2.5 px-4 whitespace-nowrap tabular-nums"
                    >
                      {formatDateTime(item.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        style={{
                          backgroundColor:
                            item.category === 'BAO_CHAY'
                              ? 'var(--danger-soft)'
                              : item.category === 'TUOI_CAY'
                              ? 'var(--success-soft)'
                              : 'var(--bg-elevated)',
                          color:
                            item.category === 'BAO_CHAY'
                              ? 'var(--danger)'
                              : item.category === 'TUOI_CAY'
                              ? 'var(--success)'
                              : 'var(--text-primary)'
                        }}
                        className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium"
                      >
                        {item.category}
                      </span>
                    </td>
                    <td
                      style={{ color: 'var(--text-secondary)' }}
                      className="py-2.5 px-4 whitespace-nowrap"
                    >
                      {item.source}
                    </td>
                    <td
                      style={{ color: 'var(--text-primary)' }}
                      className="py-2.5 px-4"
                    >
                      {item.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default AnalyticsView;

