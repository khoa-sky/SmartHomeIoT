import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';

const LOG_CATEGORIES = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'BAO_CHAY', label: 'Báo cháy' },
  { id: 'TUOI_CAY', label: 'Tưới cây' },
  { id: 'GIAN_PHOI', label: 'Giàn phơi' },
  { id: 'PIR', label: 'PIR' },
  { id: 'DEN', label: 'Đèn' },
  { id: 'DIEU_KHIEN', label: 'Điều khiển' }
];

const METRICS = [
  { id: 'temp', label: 'Nhiệt độ (°C)', maxScale: 50, unit: '°C' },
  { id: 'hum', label: 'Độ ẩm khí (%)', maxScale: 100, unit: '%' },
  { id: 'soil', label: 'Độ ẩm đất (%)', maxScale: 100, unit: '%' }
];

function formatLogTime(isoStr) {
  if (!isoStr) return '--:--';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return String(isoStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${hh}:${mm}:${ss} ${dd}/${mo}`;
}

function getCategoryStyle(category, theme) {
  switch (category) {
    case 'BAO_CHAY':
      return { color: theme.danger, bg: theme.dangerSoft };
    case 'TUOI_CAY':
      return { color: theme.success, bg: theme.successSoft };
    case 'GIAN_PHOI':
      return { color: theme.info, bg: theme.infoSoft };
    case 'PIR':
    case 'DEN':
      return { color: theme.warning, bg: theme.warningSoft };
    default:
      return { color: theme.accentStrong, bg: theme.accentSoft };
  }
}

function AnalyticsTab({
  theme,
  summary,
  history,
  logs,
  refreshing,
  onRefresh,
  onRequestClearLogs
}) {
  const [selectedMetric, setSelectedMetric] = useState('temp');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [keyword, setKeyword] = useState('');

  const chartSamples = useMemo(() => {
    const slice = Array.isArray(history) ? history.slice(-18) : [];
    return slice;
  }, [history]);

  const activeMetricMeta = useMemo(
    () => METRICS.find((m) => m.id === selectedMetric) || METRICS[0],
    [selectedMetric]
  );

  const chartStats = useMemo(() => {
    if (chartSamples.length === 0) {
      return { min: 0, max: 0, latest: 0 };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const item of chartSamples) {
      const val = Number(item[selectedMetric] ?? 0);
      if (val < min) min = val;
      if (val > max) max = val;
    }
    const latest = Number(chartSamples[chartSamples.length - 1][selectedMetric] ?? 0);
    return { min, max, latest };
  }, [chartSamples, selectedMetric]);

  const filteredLogs = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return (Array.isArray(logs) ? logs : []).filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (!kw) return true;
      const hay = `${item.category || ''} ${item.source || ''} ${item.message || ''}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [logs, selectedCategory, keyword]);

  const barColor =
    selectedMetric === 'temp'
      ? theme.warning
      : selectedMetric === 'hum'
      ? theme.info
      : theme.success;

  return (
    <View style={styles.stack}>
      {/* HEADER ACTIONS */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Thống kê &amp; Nhật ký
          </Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            Kéo xuống để làm mới dữ liệu từ Backend C#
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Làm mới thống kê"
          style={[
            styles.refreshBtn,
            { backgroundColor: theme.bgCard, borderColor: theme.border }
          ]}
        >
          <Text style={[styles.refreshBtnText, { color: theme.textPrimary }]}>
            {refreshing ? 'Đang tải…' : 'Làm mới'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4 KPI SUMMARY CARDS */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Nhiệt độ TB</Text>
          <Text style={[styles.kpiValue, TABULAR_NUMS, { color: theme.warning }]}>
            {Number(summary.avgTemp ?? 0).toFixed(1)} °C
          </Text>
          <Text style={[styles.kpiSub, TABULAR_NUMS, { color: theme.textMuted }]}>
            Min {Number(summary.minTemp ?? 0).toFixed(1)} • Max {Number(summary.maxTemp ?? 0).toFixed(1)}
          </Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Độ ẩm TB</Text>
          <Text style={[styles.kpiValue, TABULAR_NUMS, { color: theme.info }]}>
            {Number(summary.avgHum ?? 0).toFixed(0)} %
          </Text>
          <Text style={[styles.kpiSub, TABULAR_NUMS, { color: theme.textMuted }]}>
            Đất TB: {Number(summary.avgSoil ?? 0).toFixed(0)} %
          </Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Tưới cây tự động</Text>
          <Text style={[styles.kpiValue, TABULAR_NUMS, { color: theme.success }]}>
            {summary.totalPumpRuns ?? 0} đợt
          </Text>
          <Text style={[styles.kpiSub, TABULAR_NUMS, { color: theme.textMuted }]}>
            Ước tính {summary.estimatedWaterMl ?? 0} ml
          </Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Sự kiện an ninh</Text>
          <Text style={[styles.kpiValue, TABULAR_NUMS, { color: theme.accentStrong }]}>
            {(summary.totalPirDetections ?? 0) + (summary.totalRainEvents ?? 0)}
          </Text>
          <Text style={[styles.kpiSub, TABULAR_NUMS, { color: theme.textMuted }]}>
            PIR {summary.totalPirDetections ?? 0} • Mưa {summary.totalRainEvents ?? 0} • Cháy{' '}
            {summary.totalFireAlerts ?? 0}
          </Text>
        </View>
      </View>

      {/* BIỂU ĐỒ BIẾN THIÊN MẪU CẢM BIẾN */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Biến thiên 18 mẫu gần nhất
          </Text>
          {chartSamples.length > 0 ? (
            <Text style={[styles.chartLatest, TABULAR_NUMS, { color: barColor }]}>
              Mới nhất: {chartStats.latest.toFixed(selectedMetric === 'temp' ? 1 : 0)}
              {activeMetricMeta.unit}
            </Text>
          ) : null}
        </View>

        <View style={styles.chipRow}>
          {METRICS.map((m) => {
            const active = m.id === selectedMetric;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedMetric(m.id)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.accent : theme.bgElevated,
                    borderColor: active ? theme.accent : theme.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? theme.accentTextOn : theme.textSecondary }
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {chartSamples.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.bgElevated }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có lịch sử mẫu cảm biến. Hãy kết nối Server C# hoặc kéo xuống để làm mới.
            </Text>
          </View>
        ) : (
          <View style={styles.chartWrap}>
            <View style={[styles.barsContainer, { borderBottomColor: theme.border }]}>
              {chartSamples.map((sample, idx) => {
                const raw = Number(sample[selectedMetric] ?? 0);
                const pct = Math.max(8, Math.min(100, (raw / activeMetricMeta.maxScale) * 100));
                return (
                  <View key={sample.id || idx} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${pct}%`,
                          backgroundColor: barColor
                        }
                      ]}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.chartFoot}>
              <Text style={[styles.chartFootText, TABULAR_NUMS, { color: theme.textMuted }]}>
                Thấp nhất: {chartStats.min.toFixed(selectedMetric === 'temp' ? 1 : 0)}
                {activeMetricMeta.unit}
              </Text>
              <Text style={[styles.chartFootText, TABULAR_NUMS, { color: theme.textMuted }]}>
                Cao nhất: {chartStats.max.toFixed(selectedMetric === 'temp' ? 1 : 0)}
                {activeMetricMeta.unit}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* NHẬT KÝ SỰ KIỆN HỆ THỐNG */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Nhật ký hoạt động ({filteredLogs.length})
          </Text>
          <TouchableOpacity
            onPress={onRequestClearLogs}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Xóa nhật ký hoạt động"
            style={[styles.clearBtn, { backgroundColor: theme.dangerSoft }]}
          >
            <Text style={[styles.clearBtnText, { color: theme.danger }]}>Đặt lại</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.bgMain,
              borderColor: theme.border,
              color: theme.textPrimary
            }
          ]}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Tìm theo từ khóa (VD: bơm, mưa, lửa, PIR)…"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Tìm kiếm nhật ký sự kiện"
        />

        <View style={styles.chipRow}>
          {LOG_CATEGORIES.map((cat) => {
            const active = cat.id === selectedCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.textPrimary : theme.bgElevated,
                    borderColor: active ? theme.textPrimary : theme.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? theme.bgCard : theme.textSecondary }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredLogs.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.bgElevated }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Không có dòng nhật ký phù hợp với bộ lọc hiện tại.
            </Text>
          </View>
        ) : (
          <View style={styles.logList}>
            {filteredLogs.slice(0, 30).map((item, idx) => {
              const catMeta = getCategoryStyle(item.category, theme);
              return (
                <View
                  key={item.id || `${item.timestamp}-${idx}`}
                  style={[
                    styles.logItem,
                    { backgroundColor: theme.bgElevated, borderColor: theme.border }
                  ]}
                >
                  <View style={styles.logMetaRow}>
                    <View style={[styles.catBadge, { backgroundColor: catMeta.bg }]}>
                      <Text style={[styles.catText, { color: catMeta.color }]}>
                        {item.category || 'SYSTEM'}
                      </Text>
                    </View>
                    <Text style={[styles.logSource, { color: theme.textMuted }]}>
                      {item.source || 'ESP32'}
                    </Text>
                    <Text style={[styles.logTime, TABULAR_NUMS, { color: theme.textSecondary }]}>
                      {formatLogTime(item.timestamp)}
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
    gap: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2
  },
  refreshBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  kpiCard: {
    width: '48.6%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    gap: 5
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800'
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: '500'
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  chartLatest: {
    fontSize: 12,
    fontWeight: '700'
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
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center'
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  chartWrap: {
    gap: 8
  },
  barsContainer: {
    height: 110,
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
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 6
  },
  chartFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  chartFootText: {
    fontSize: 11,
    fontWeight: '600'
  },
  clearBtn: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  searchInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13
  },
  emptyBox: {
    borderRadius: 12,
    padding: 14
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 11,
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
    fontSize: 10,
    fontWeight: '800'
  },
  logSource: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  logTime: {
    fontSize: 11,
    fontWeight: '500'
  },
  logMsg: {
    fontSize: 13,
    lineHeight: 18
  }
});

export default memo(AnalyticsTab);

