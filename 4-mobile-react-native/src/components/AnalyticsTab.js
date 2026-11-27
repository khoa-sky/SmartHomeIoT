import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Linking,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';
import { getMobileExportCsvUrl } from '../services/mobileApi';

const LOG_FILTER_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'BAO_CHAY', label: 'An ninh & Cháy' },
  { id: 'TUOI_CAY', label: 'Máy bơm' },
  { id: 'GIAN_PHOI', label: 'Giàn phơi' },
  { id: 'PIR', label: 'Cảm biến PIR' },
  { id: 'DEN', label: 'Đèn phòng khách' },
  { id: 'DIEU_KHIEN', label: 'Điều khiển từ xa' }
];

const METRICS = [
  { id: 'temp', label: 'Nhiệt độ (°C)', maxScale: 45, unit: '°C' },
  { id: 'hum', label: 'Độ ẩm khí (%)', maxScale: 100, unit: '%' },
  { id: 'soil', label: 'Độ ẩm đất (%)', maxScale: 100, unit: '%' }
];

function formatTimeShort(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return String(isoStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo} ${hh}:${mm}:${ss}`;
}

function getCategoryStyle(category, theme) {
  switch (category) {
    case 'BAO_CHAY':
      return { color: theme.danger, bg: theme.dangerSoft };
    case 'TUOI_CAY':
      return { color: theme.success, bg: theme.successSoft };
    default:
      return { color: theme.textPrimary, bg: theme.bgElevated };
  }
}

/**
 * AnalyticsTab — Synchronized with 3-frontend-react/src/components/AnalyticsView.jsx:
 * - Top bar with sample limit filter (15 / 25 / 50 mẫu), Refresh button, and CSV Export button
 * - 4 Signature KPI Cards (Nhiệt độ trung bình, Độ ẩm không khí TB, Chu kỳ tưới tự động, Tổng sự kiện an ninh)
 * - Interactive Sensor History Chart with tap inspection
 * - 3 Grouped Activity Summary Cards (Lịch sử bật/tắt thiết bị, Hoạt động máy bơm, Cảnh báo & Cảm biến PIR)
 * - Audit Log Table with Category Tabs, Search Input, and Reset action
 */
function AnalyticsTab({
  theme,
  activeIp,
  summary,
  history = [],
  logs = [],
  refreshing,
  onRefresh,
  onRequestClearLogs
}) {
  const [sampleLimit, setSampleLimit] = useState(25);
  const [selectedMetric, setSelectedMetric] = useState('temp');
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(null);
  const [logFilter, setLogFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const visibleHistory = useMemo(
    () => (Array.isArray(history) ? history.slice(-sampleLimit) : []),
    [history, sampleLimit]
  );

  const activeMetricMeta = useMemo(
    () => METRICS.find((m) => m.id === selectedMetric) || METRICS[0],
    [selectedMetric]
  );

  const chartStats = useMemo(() => {
    if (visibleHistory.length === 0) {
      return { min: 0, max: 0, latest: 0 };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const item of visibleHistory) {
      const val = Number(item[selectedMetric] ?? 0);
      if (val < min) min = val;
      if (val > max) max = val;
    }
    const latest = Number(
      visibleHistory[visibleHistory.length - 1][selectedMetric] ?? 0
    );
    return { min, max, latest };
  }, [visibleHistory, selectedMetric]);

  const activePoint =
    selectedSampleIdx !== null && visibleHistory[selectedSampleIdx]
      ? visibleHistory[selectedSampleIdx]
      : visibleHistory[visibleHistory.length - 1] || null;

  // 3 Grouped Activity Histories matching Web AnalyticsView.jsx
  const deviceSwitchingLogs = useMemo(
    () =>
      (Array.isArray(logs) ? logs : [])
        .filter(
          (l) =>
            l.category === 'DEN' ||
            l.category === 'GIAN_PHOI' ||
            l.category === 'DIEU_KHIEN'
        )
        .slice(0, 4),
    [logs]
  );

  const pumpActivityLogs = useMemo(
    () =>
      (Array.isArray(logs) ? logs : [])
        .filter((l) => l.category === 'TUOI_CAY')
        .slice(0, 4),
    [logs]
  );

  const securityAlertLogs = useMemo(
    () =>
      (Array.isArray(logs) ? logs : [])
        .filter((l) => l.category === 'BAO_CHAY' || l.category === 'PIR')
        .slice(0, 4),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return (Array.isArray(logs) ? logs : []).filter((item) => {
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

  const handleExportCsv = () => {
    const url = getMobileExportCsvUrl(activeIp);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.stack}>
      {/* TOP BAR: TITLE, SAMPLE LIMIT & CSV EXPORT */}
      <View
        style={[
          styles.card,
          CARD_SHADOW,
          { backgroundColor: theme.bgCard, borderColor: theme.border }
        ]}
      >
        <View style={styles.topHeader}>
          <View style={styles.titleWrap}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Phân tích dữ liệu &amp; Lịch sử vận hành
            </Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
              Tổng hợp từ dữ liệu đo đạc thời gian thực của mạch Vietduino ESP32
            </Text>
          </View>
        </View>

        <View style={styles.toolbarRow}>
          {/* Sample Limit Segmented Switcher (15 / 25 / 50 mẫu) */}
          <View
            style={[
              styles.sampleSwitcher,
              {
                backgroundColor: theme.bgElevated,
                borderColor: theme.border
              }
            ]}
          >
            {[15, 25, 50].map((limit) => {
              const active = sampleLimit === limit;
              return (
                <TouchableOpacity
                  key={limit}
                  onPress={() => setSampleLimit(limit)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.sampleOption,
                    {
                      backgroundColor: active
                        ? theme.oliveGreen
                        : 'transparent'
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.sampleOptionText,
                      TABULAR_NUMS,
                      {
                        color: active ? '#FAFCF9' : theme.textSecondary
                      }
                    ]}
                  >
                    {limit} mẫu
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.toolbarActions}>
            <TouchableOpacity
              onPress={onRefresh}
              disabled={refreshing}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel="Làm mới dữ liệu thống kê"
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.bgElevated,
                  borderColor: theme.border
                }
              ]}
            >
              <Text
                style={[styles.secondaryBtnText, { color: theme.textPrimary }]}
              >
                {refreshing ? 'Đang tải…' : 'Làm mới'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportCsv}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Xuất báo cáo Excel CSV"
              style={[
                styles.primaryExportBtn,
                { backgroundColor: theme.oliveGreen }
              ]}
            >
              <Text style={styles.primaryExportText}>Xuất CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4 KPI SUMMARY CARDS MATCHING WEB ANALYTICSVIEW */}
      <View style={styles.kpiGrid}>
        <View
          style={[
            styles.kpiCard,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
            Nhiệt độ trung bình
          </Text>
          <Text
            style={[
              styles.kpiValue,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
          >
            {Number(summary.avgTemp ?? 0).toFixed(1)}°C
          </Text>
          <Text
            style={[
              styles.kpiSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            Thấp nhất {Number(summary.minTemp ?? 0).toFixed(1)}°C • Cao nhất{' '}
            {Number(summary.maxTemp ?? 0).toFixed(1)}°C
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
            Độ ẩm không khí TB
          </Text>
          <Text
            style={[
              styles.kpiValue,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
          >
            {Number(summary.avgHum ?? 0).toFixed(1)}%
          </Text>
          <Text
            style={[
              styles.kpiSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            Độ ẩm đất trung bình: {Number(summary.avgSoil ?? 0).toFixed(1)}%
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
            Chu kỳ tưới tự động
          </Text>
          <Text
            style={[
              styles.kpiValue,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
          >
            {summary.totalPumpRuns ?? 0} đợt
          </Text>
          <Text
            style={[
              styles.kpiSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            Lượng nước ước tính ~{summary.estimatedWaterMl ?? 0} ml
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            CARD_SHADOW,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
            Tổng sự kiện an ninh
          </Text>
          <Text
            style={[
              styles.kpiValue,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
          >
            {(summary.totalPirDetections ?? 0) +
              (summary.totalRainEvents ?? 0) +
              (summary.totalFireAlerts ?? 0)}
          </Text>
          <Text
            style={[
              styles.kpiSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            PIR: {summary.totalPirDetections ?? 0} • Mưa:{' '}
            {summary.totalRainEvents ?? 0} • Báo cháy:{' '}
            {summary.totalFireAlerts ?? 0}
          </Text>
        </View>
      </View>

      {/* INTERACTIVE SENSOR HISTORY TREND CHART */}
      <View
        style={[
          styles.card,
          CARD_SHADOW,
          { backgroundColor: theme.bgCard, borderColor: theme.border }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleWrap}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Biểu đồ biến thiên ({visibleHistory.length} mẫu)
            </Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Chạm vào từng cột để xem giá trị và thời điểm đo
            </Text>
          </View>

          {activePoint ? (
            <View
              style={[
                styles.activePointBox,
                { backgroundColor: theme.bgElevated }
              ]}
            >
              <Text
                style={[
                  styles.activePointValue,
                  TABULAR_NUMS,
                  { color: theme.textPrimary }
                ]}
              >
                {selectedMetric === 'temp'
                  ? Number(activePoint[selectedMetric] ?? 0).toFixed(1)
                  : Number(activePoint[selectedMetric] ?? 0).toFixed(0)}
                {activeMetricMeta.unit}
              </Text>
              <Text
                style={[
                  styles.activePointTime,
                  TABULAR_NUMS,
                  { color: theme.textSecondary }
                ]}
              >
                {formatTimeShort(activePoint.timestamp)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.chipRow}>
          {METRICS.map((m) => {
            const active = m.id === selectedMetric;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => {
                  setSelectedMetric(m.id);
                  setSelectedSampleIdx(null);
                }}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? theme.oliveGreen
                      : theme.bgElevated,
                    borderColor: active ? theme.oliveGreen : theme.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#FAFCF9' : theme.textSecondary }
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {visibleHistory.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: theme.bgElevated }
            ]}
          >
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Đang chờ dữ liệu lịch sử từ hệ thống…
            </Text>
          </View>
        ) : (
          <View style={styles.chartWrap}>
            <View
              style={[
                styles.barsContainer,
                { borderBottomColor: theme.border }
              ]}
            >
              {visibleHistory.map((sample, idx) => {
                const raw = Number(sample[selectedMetric] ?? 0);
                const pct = Math.max(
                  10,
                  Math.min(100, (raw / activeMetricMeta.maxScale) * 100)
                );
                const isSelected =
                  (selectedSampleIdx !== null
                    ? selectedSampleIdx
                    : visibleHistory.length - 1) === idx;
                return (
                  <TouchableOpacity
                    key={sample.id || idx}
                    onPress={() => setSelectedSampleIdx(idx)}
                    activeOpacity={0.8}
                    style={styles.barCol}
                  >
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${pct}%`,
                          backgroundColor: isSelected
                            ? theme.oliveGreen
                            : theme.softGreen
                        }
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.chartFoot}>
              <Text
                style={[
                  styles.chartFootText,
                  TABULAR_NUMS,
                  { color: theme.textMuted }
                ]}
              >
                Min:{' '}
                {chartStats.min.toFixed(selectedMetric === 'temp' ? 1 : 0)}
                {activeMetricMeta.unit}
              </Text>
              <Text
                style={[
                  styles.chartFootText,
                  TABULAR_NUMS,
                  { color: theme.textMuted }
                ]}
              >
                Max:{' '}
                {chartStats.max.toFixed(selectedMetric === 'temp' ? 1 : 0)}
                {activeMetricMeta.unit}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 3 GROUPED ACTIVITY SUMMARY CARDS MATCHING WEB ANALYTICSVIEW */}
      <View
        style={[
          styles.card,
          CARD_SHADOW,
          { backgroundColor: theme.bgCard, borderColor: theme.border }
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          Phân nhóm lịch sử vận hành
        </Text>

        {/* 1. Lịch sử bật / tắt thiết bị */}
        <View style={styles.groupBlock}>
          <Text style={[styles.groupTitle, { color: theme.oliveGreen }]}>
            1. Lịch sử bật / tắt thiết bị (Đèn IO32 &amp; Giàn phơi IO33)
          </Text>
          {deviceSwitchingLogs.length === 0 ? (
            <Text style={[styles.groupEmpty, { color: theme.textSecondary }]}>
              Chưa có thao tác chuyển đổi thiết bị trong phiên này.
            </Text>
          ) : (
            deviceSwitchingLogs.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.groupItem,
                  { backgroundColor: theme.bgElevated }
                ]}
              >
                <Text
                  style={[styles.groupMsg, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>
                <Text
                  style={[
                    styles.groupTime,
                    TABULAR_NUMS,
                    { color: theme.textSecondary }
                  ]}
                >
                  {formatTimeShort(item.timestamp)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 2. Hoạt động máy bơm */}
        <View style={styles.groupBlock}>
          <Text style={[styles.groupTitle, { color: theme.success }]}>
            2. Hoạt động máy bơm ({summary.totalPumpRuns ?? 0} đợt • ~
            {summary.estimatedWaterMl ?? 0} ml)
          </Text>
          {pumpActivityLogs.length === 0 ? (
            <Text style={[styles.groupEmpty, { color: theme.textSecondary }]}>
              Chưa phát sinh chu kỳ bơm tưới tự động hoặc thủ công.
            </Text>
          ) : (
            pumpActivityLogs.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.groupItem,
                  { backgroundColor: theme.bgElevated }
                ]}
              >
                <Text
                  style={[styles.groupMsg, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>
                <Text
                  style={[
                    styles.groupTime,
                    TABULAR_NUMS,
                    { color: theme.textSecondary }
                  ]}
                >
                  {formatTimeShort(item.timestamp)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 3. Cảnh báo & Cảm biến PIR */}
        <View style={styles.groupBlock}>
          <Text style={[styles.groupTitle, { color: theme.warning }]}>
            3. Cảnh báo &amp; Cảm biến PIR (PIR: {summary.totalPirDetections ?? 0} •
            Cháy: {summary.totalFireAlerts ?? 0})
          </Text>
          {securityAlertLogs.length === 0 ? (
            <Text style={[styles.groupEmpty, { color: theme.textSecondary }]}>
              Hệ thống an ninh ổn định, chưa có cảnh báo mới.
            </Text>
          ) : (
            securityAlertLogs.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.groupItem,
                  { backgroundColor: theme.bgElevated }
                ]}
              >
                <Text
                  style={[styles.groupMsg, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>
                <Text
                  style={[
                    styles.groupTime,
                    TABULAR_NUMS,
                    { color: theme.textSecondary }
                  ]}
                >
                  {formatTimeShort(item.timestamp)}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* AUDIT LOG TABLE & FILTERING */}
      <View
        style={[
          styles.card,
          CARD_SHADOW,
          { backgroundColor: theme.bgCard, borderColor: theme.border }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleWrap}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Nhật ký kiểm toán hệ thống ({filteredLogs.length})
            </Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Lưu trữ thời gian thực các sự kiện cảm biến và điều khiển từ xa
            </Text>
          </View>

          <TouchableOpacity
            onPress={onRequestClearLogs}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Đặt lại nhật ký"
            style={[styles.clearBtn, { backgroundColor: theme.dangerSoft }]}
          >
            <Text style={[styles.clearBtnText, { color: theme.danger }]}>
              Đặt lại nhật ký
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.bgElevated,
              borderColor: theme.border,
              color: theme.textPrimary
            }
          ]}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          placeholder="Tìm từ khóa sự kiện…"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Tìm kiếm sự kiện nhật ký"
        />

        <View style={styles.chipRow}>
          {LOG_FILTER_TABS.map((cat) => {
            const active = cat.id === logFilter;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setLogFilter(cat.id)}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? theme.bgCard
                      : theme.bgElevated,
                    borderColor: active ? theme.oliveGreen : theme.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? theme.oliveGreen : theme.textSecondary
                    }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredLogs.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: theme.bgElevated }
            ]}
          >
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Không tìm thấy sự kiện phù hợp.
            </Text>
          </View>
        ) : (
          <View style={styles.logList}>
            {filteredLogs.slice(0, 35).map((item, idx) => {
              const catMeta = getCategoryStyle(item.category, theme);
              return (
                <View
                  key={item.id || `${item.timestamp}-${idx}`}
                  style={[
                    styles.logItem,
                    {
                      backgroundColor: theme.bgSubtle,
                      borderColor: theme.border
                    }
                  ]}
                >
                  <View style={styles.logMetaRow}>
                    <View
                      style={[
                        styles.catBadge,
                        { backgroundColor: catMeta.bg }
                      ]}
                    >
                      <Text style={[styles.catText, { color: catMeta.color }]}>
                        {item.category || 'SYSTEM'}
                      </Text>
                    </View>
                    <Text
                      style={[styles.logSource, { color: theme.textSecondary }]}
                    >
                      {item.source || 'ESP32'}
                    </Text>
                    <Text
                      style={[
                        styles.logTime,
                        TABULAR_NUMS,
                        { color: theme.textSecondary }
                      ]}
                    >
                      {formatDateTime(item.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.logMsg, { color: theme.textPrimary }]}>
                    {item.message}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  topHeader: {
    gap: 4
  },
  titleWrap: {
    flex: 1,
    minWidth: 0
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2
  },
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  sampleSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4
  },
  sampleOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  sampleOptionText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  secondaryBtn: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '600'
  },
  primaryExportBtn: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryExportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FAFCF9'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  kpiCard: {
    width: '48.4%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    gap: 6
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5
  },
  kpiSub: {
    fontSize: 11,
    lineHeight: 15
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '600'
  },
  cardSub: {
    fontSize: 11.5,
    marginTop: 2
  },
  activePointBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'flex-end'
  },
  activePointValue: {
    fontSize: 13.5,
    fontWeight: '600'
  },
  activePointTime: {
    fontSize: 10,
    marginTop: 1
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  chip: {
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center'
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  chartWrap: {
    gap: 8
  },
  barsContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    borderBottomWidth: 1,
    paddingBottom: 4
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end'
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    minHeight: 6
  },
  chartFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  chartFootText: {
    fontSize: 11,
    fontWeight: '500'
  },
  groupBlock: {
    gap: 6
  },
  groupTitle: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  groupEmpty: {
    fontSize: 11.5,
    paddingVertical: 4
  },
  groupItem: {
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  groupMsg: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  groupTime: {
    fontSize: 11
  },
  clearBtn: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  clearBtnText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  searchInput: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 12.5
  },
  emptyBox: {
    borderRadius: 14,
    padding: 16
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center'
  },
  logList: {
    gap: 8
  },
  logItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6
  },
  logMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  catText: {
    fontSize: 10.5,
    fontWeight: '600'
  },
  logSource: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1
  },
  logTime: {
    fontSize: 11
  },
  logMsg: {
    fontSize: 12.5,
    lineHeight: 18
  }
});

export default memo(AnalyticsTab);
