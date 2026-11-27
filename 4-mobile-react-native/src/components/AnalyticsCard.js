import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';

function formatShortTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const METRIC_TABS = [
  { id: 'soil', label: 'Độ ẩm đất', unit: '%', max: 100 },
  { id: 'temp', label: 'Nhiệt độ', unit: '°C', max: 45 },
  { id: 'hum', label: 'Độ ẩm khí', unit: '%', max: 100 }
];

/**
 * AnalyticsCard — Signature Sage Green Rounded Bar Chart Card
 * Synchronized 100% with 3-frontend-react/src/components/AnalyticsCard.jsx:
 * - Sage green surface (theme.sageSurface: #C5CEC2 in light / #343F34 in dark)
 * - Rounded cream bars (#FAFCF9) with the active/selected bar in dark olive (#394438)
 * - Interactive tap tooltip and metric switcher (Độ ẩm đất / Nhiệt độ / Độ ẩm khí)
 */
function AnalyticsCard({
  theme,
  history = [],
  summary,
  onOpenFullAnalytics
}) {
  const [metric, setMetric] = useState('soil');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const currentTab =
    METRIC_TABS.find((t) => t.id === metric) || METRIC_TABS[0];

  const bars = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) return [];
    const slice = history.slice(-12);
    return slice.map((pt, idx) => {
      const raw = Number(pt?.[metric]) || 0;
      const ratio = Math.min(1, Math.max(0.14, raw / currentTab.max));
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
    <View
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: theme.sageSurface,
          borderColor: theme.border
        }
      ]}
    >
      {/* Top Row: Title + Metric Pill Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <View style={styles.titleInline}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Biến thiên môi trường thực tế
            </Text>
            {onOpenFullAnalytics ? (
              <TouchableOpacity
                onPress={onOpenFullAnalytics}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Mở trang phân tích chi tiết"
                style={styles.openIconBtn}
              >
                <Text
                  style={[styles.openIconText, { color: theme.oliveGreen }]}
                >
                  ↗
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text
            style={[
              styles.subtitle,
              TABULAR_NUMS,
              { color: theme.textPrimary }
            ]}
          >
            {activeBar
              ? `Mẫu ${activeBar.time} • ${
                  metric === 'temp'
                    ? activeBar.value.toFixed(1)
                    : activeBar.value.toFixed(0)
                }${currentTab.unit}`
              : 'Dữ liệu lịch sử thời gian thực từ ESP32'}
          </Text>
        </View>

        {/* Metric Switcher */}
        <View
          style={[
            styles.switcherWrap,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(28, 34, 28, 0.45)'
                  : 'rgba(250, 252, 249, 0.58)'
            }
          ]}
        >
          {METRIC_TABS.map((tab) => {
            const active = metric === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  setMetric(tab.id);
                  setSelectedIndex(null);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.switcherBtn,
                  {
                    backgroundColor: active ? '#394438' : 'transparent'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.switcherText,
                    {
                      color: active ? '#FAFCF9' : theme.textPrimary
                    }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Rounded Column Bar Chart */}
      {bars.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.22)'
                  : 'rgba(255, 255, 255, 0.44)'
            }
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            Đang chờ mẫu dữ liệu lịch sử từ mạch ESP32
          </Text>
          <Text style={[styles.emptySub, { color: theme.textPrimary }]}>
            Biểu đồ cột sẽ tự động cập nhật ngay khi gói tin MQTT được gửi lên.
          </Text>
        </View>
      ) : (
        <View style={styles.chartSection}>
          <View style={styles.barsArea}>
            {/* Subtle Horizontal Reference Grid Lines */}
            <View pointerEvents="none" style={styles.gridOverlay}>
              <View style={styles.gridRule} />
              <View style={styles.gridRule} />
            </View>

            {bars.map((bar, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedIndex(idx)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Mẫu ${bar.time}: ${bar.value}${currentTab.unit}`}
                  style={styles.barSlot}
                >
                  {isSelected ? (
                    <View style={styles.floatingValuePill}>
                      <Text
                        style={[
                          styles.floatingValueText,
                          TABULAR_NUMS
                        ]}
                        numberOfLines={1}
                      >
                        {metric === 'temp'
                          ? bar.value.toFixed(1)
                          : bar.value.toFixed(0)}
                        {currentTab.unit}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.columnBar,
                      {
                        height: `${bar.heightPercent}%`,
                        backgroundColor: isSelected ? '#394438' : '#FAFCF9'
                      }
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Time Labels & Real Summary Stats */}
          <View style={styles.footerRow}>
            <Text
              style={[
                styles.footerText,
                TABULAR_NUMS,
                { color: theme.textPrimary }
              ]}
            >
              {bars[0]?.time}
            </Text>
            <Text
              style={[
                styles.footerText,
                TABULAR_NUMS,
                { color: theme.textPrimary }
              ]}
            >
              TB nhiệt: {Number(summary?.avgTemp || 0).toFixed(1)}°C • Đã tưới:{' '}
              {summary?.totalPumpRuns || 0} đợt
            </Text>
            <Text
              style={[
                styles.footerText,
                TABULAR_NUMS,
                { color: theme.textPrimary }
              ]}
            >
              {bars[bars.length - 1]?.time}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  headerRow: {
    gap: 10
  },
  titleBlock: {
    gap: 2
  },
  titleInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  openIconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  openIconText: {
    fontSize: 15,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.78
  },
  switcherWrap: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: 12,
    gap: 4
  },
  switcherBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9
  },
  switcherText: {
    fontSize: 11,
    fontWeight: '600'
  },
  emptyBox: {
    minHeight: 132,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  emptyTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center'
  },
  emptySub: {
    fontSize: 11,
    opacity: 0.72,
    textAlign: 'center'
  },
  chartSection: {
    gap: 8
  },
  barsArea: {
    height: 140,
    paddingTop: 26,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 62, 51, 0.14)',
    position: 'relative'
  },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 26,
    bottom: 0,
    justifyContent: 'space-between'
  },
  gridRule: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(52, 62, 51, 0.12)'
  },
  barSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative'
  },
  floatingValuePill: {
    position: 'absolute',
    top: -22,
    backgroundColor: '#394438',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    zIndex: 10
  },
  floatingValueText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#FAFCF9'
  },
  columnBar: {
    width: '100%',
    maxWidth: 22,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    minHeight: 8
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8
  }
});

export default memo(AnalyticsCard);

