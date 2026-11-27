import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';

/**
 * Reusable Apple/Scandinavian SmartToggle Component
 * Synchronized with 3-frontend-react/src/components/DeviceControlPanels.jsx
 */
export const SmartToggle = memo(function SmartToggle({
  theme,
  checked,
  disabled = false,
  onChange,
  accessibilityLabel
}) {
  return (
    <TouchableOpacity
      onPress={onChange}
      disabled={disabled}
      activeOpacity={0.82}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.toggleTrack,
        {
          backgroundColor: checked ? theme.oliveGreen : theme.softGreen,
          borderColor: checked ? theme.oliveGreen : theme.border,
          opacity: disabled ? 0.6 : 1
        }
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          {
            backgroundColor: '#FAFCF9',
            alignSelf: checked ? 'flex-end' : 'flex-start'
          }
        ]}
      />
    </TouchableOpacity>
  );
});

// ============================================================================
// 1. 3D MATTE PENDANT LAMP CARD (CHIẾU SÁNG PHÒNG KHÁCH IO32 & PIR IO27)
// ============================================================================
export const LightingControlCard = memo(function LightingControlCard({
  theme,
  telemetry,
  pendingCmd,
  onCommand
}) {
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);
  const isLightBusy = pendingCmd === 'LIGHT:ON' || pendingCmd === 'LIGHT:OFF';
  const isPirBusy =
    pendingCmd === 'PIR_LOCK:LOCK' || pendingCmd === 'PIR_LOCK:UNLOCK';

  return (
    <View
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border
        }
      ]}
    >
      {/* Top Header + SmartToggle */}
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Chiếu sáng phòng khách
          </Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            {isLightOn ? 'Đang bật sáng • IO32' : 'Đang tắt • IO32'}
          </Text>
        </View>

        <SmartToggle
          theme={theme}
          checked={isLightOn}
          disabled={isLightBusy}
          accessibilityLabel={
            isLightOn ? 'Tắt đèn phòng khách' : 'Bật đèn phòng khách'
          }
          onChange={() =>
            onCommand(
              'LIGHT',
              isLightOn ? 'OFF' : 'ON',
              isLightOn
                ? 'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)'
                : 'Đã gửi lệnh bật đèn phòng khách'
            )
          }
        />
      </View>

      {/* Studio 3D Matte Clay Pendant Lamp Render */}
      <View
        accessible
        accessibilityLabel={
          isLightOn
            ? 'Mô hình 3D đèn treo phòng khách đang tỏa ánh sáng vàng ấm'
            : 'Mô hình 3D đèn treo phòng khách màu trắng kem'
        }
        style={[
          styles.studioStage,
          {
            backgroundColor: theme.bgElevated,
            borderColor: theme.borderSubtle
          }
        ]}
      >
        {/* Warm Light Halo when confirmed lightOn === true */}
        {isLightOn ? <View style={styles.lampWarmHalo} /> : null}

        {/* Ceiling Canopy & Cord */}
        <View style={styles.lampCanopy} />
        <View style={styles.lampCord} />
        <View style={[styles.lampFinial, { backgroundColor: '#394438' }]} />

        {/* 3D Sculpted Matte Dome Shade */}
        <View style={styles.lampDome}>
          <View
            style={[
              styles.lampInnerRim,
              { backgroundColor: isLightOn ? '#F5C97B' : '#CFD4CC' }
            ]}
          />
        </View>

        {/* 3D Frosted Glass Bulb Sphere */}
        <View
          style={[
            styles.lampBulbSphere,
            { backgroundColor: isLightOn ? '#FFF7DC' : '#E5EBE4' }
          ]}
        />

        {/* Soft Studio Contact Shadow on Floor */}
        <View
          style={[
            styles.floorShadow,
            {
              width: isLightOn ? 92 : 68,
              backgroundColor: isLightOn
                ? 'rgba(227, 182, 100, 0.34)'
                : 'rgba(52, 62, 51, 0.12)'
            }
          ]}
        />
      </View>

      {/* Bottom PIR Sync & Quick Action Row */}
      <View style={styles.bottomSyncRow}>
        <Text
          style={[styles.bottomSyncText, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {isPirLocked
            ? 'PIR: Đã khóa (Chế độ ngủ)'
            : hasMotion
            ? 'PIR: Đang có người'
            : 'PIR: Tự động (IO27)'}
        </Text>

        <TouchableOpacity
          onPress={() =>
            onCommand(
              'PIR_LOCK',
              isPirLocked ? 'UNLOCK' : 'LOCK',
              isPirLocked
                ? 'Đã mở khóa cảm biến chuyển động PIR'
                : 'Đã khóa cảm biến PIR (Chế độ ngủ)'
            )
          }
          disabled={isPirBusy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isPirLocked ? 'Mở PIR' : 'Khóa PIR'}
          style={[
            styles.smallActionPill,
            {
              backgroundColor: isPirLocked
                ? theme.warningSoft
                : theme.softGreen,
              opacity: isPirBusy ? 0.65 : 1
            }
          ]}
        >
          {isPirBusy ? (
            <ActivityIndicator
              size="small"
              color={isPirLocked ? theme.warning : theme.oliveGreen}
            />
          ) : (
            <Text
              style={[
                styles.smallActionText,
                {
                  color: isPirLocked ? theme.warning : theme.oliveGreen
                }
              ]}
            >
              {isPirLocked ? 'Mở PIR' : 'Khóa PIR'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================================================
// 2. 3D MATTE CLOTHESLINE CARD (GIÀN PHƠI QUẦN ÁO SERVO IO33 & MƯA IO23)
// ============================================================================
export const ClotheslineControlCard = memo(function ClotheslineControlCard({
  theme,
  telemetry,
  pendingCmd,
  onCommand
}) {
  const angle = Number(telemetry.servoAngle) ?? 15;
  const isRetracted = angle > 90;
  const mode = telemetry.servoMode || 'AUTO';
  const isRaining = Boolean(telemetry.rain);

  const MODES = [
    {
      id: 'AUTO',
      label: 'Auto',
      toast: 'Đã bật chế độ giàn phơi tự động theo mưa'
    },
    {
      id: 'OUT',
      label: 'Đưa ra 15°',
      toast: 'Đã điều khiển đưa giàn phơi ra ngoài (15°)'
    },
    {
      id: 'IN',
      label: 'Thu vào 165°',
      toast: 'Đã điều khiển thu giàn phơi vào mái hiên (165°)'
    }
  ];

  return (
    <View
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Giàn phơi quần áo
          </Text>
          <Text
            style={[
              styles.cardSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            Góc {angle}° • {isRaining ? 'Phát hiện mưa' : 'Trời khô ráo'}
          </Text>
        </View>

        <View
          style={[
            styles.modeBadge,
            { backgroundColor: theme.softGreen }
          ]}
        >
          <Text
            style={[
              styles.modeBadgeText,
              TABULAR_NUMS,
              { color: theme.oliveGreen }
            ]}
          >
            {mode}
          </Text>
        </View>
      </View>

      {/* 3D Matte Clothesline Render Container */}
      <View
        accessible
        accessibilityLabel={
          isRetracted
            ? 'Mô hình 3D giàn phơi đã thu quần áo vào dưới mái hiên'
            : 'Mô hình 3D giàn phơi đang đưa quần áo ra ngoài đón nắng'
        }
        style={[
          styles.studioStage,
          {
            backgroundColor: theme.bgElevated,
            borderColor: theme.borderSubtle
          }
        ]}
      >
        {/* Architectural Shelter Canopy & Pillar */}
        <View style={styles.clotheslineScene}>
          <View style={styles.shelterPillar} />
          <View style={[styles.shelterCanopy, { backgroundColor: '#394438' }]} />

          {/* Telescopic Matte Aluminum Rail */}
          <View
            style={[
              styles.telescopicRail,
              { width: isRetracted ? 56 : 124 }
            ]}
          />

          {/* Sliding Garments on Rail */}
          <View
            style={[
              styles.garmentsGroup,
              { left: isRetracted ? 30 : 82 }
            ]}
          >
            <View style={styles.garmentCream} />
            <View style={styles.garmentSage} />
          </View>

          {/* Rain Drops or Warm Studio Sun Sphere */}
          {isRaining ? (
            <View style={styles.rainGroup}>
              <View style={styles.rainDropLine} />
              <View style={[styles.rainDropLine, { marginTop: 6 }]} />
              <View style={styles.rainDropLine} />
            </View>
          ) : (
            <View style={styles.sunSphere} />
          )}
        </View>

        <View
          style={[
            styles.floorShadow,
            { width: 112, backgroundColor: 'rgba(52, 62, 51, 0.11)' }
          ]}
        />
      </View>

      {/* Segmented Control: Auto / Đưa ra 15° / Thu vào 165° */}
      <View
        style={[
          styles.segmentedBar,
          { backgroundColor: theme.softGreen }
        ]}
      >
        {MODES.map((m) => {
          const active = mode === m.id;
          const busy = pendingCmd === `SERVO:${m.id}`;
          return (
            <TouchableOpacity
              key={m.id}
              onPress={() => onCommand('SERVO', m.id, m.toast)}
              disabled={busy}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: busy }}
              style={[
                styles.segmentOption,
                {
                  backgroundColor: active ? theme.oliveGreen : 'transparent'
                }
              ]}
            >
              <Text
                style={[
                  styles.segmentOptionText,
                  { color: active ? '#FAFCF9' : theme.textPrimary }
                ]}
                numberOfLines={1}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

// ============================================================================
// 3. 3D MATTE BOTANICAL PLANTER & IRRIGATION CARD (MÁY BƠM IO26 & ĐẤT IO35)
// ============================================================================
export const GardenControlCard = memo(function GardenControlCard({
  theme,
  telemetry,
  pendingCmd,
  onCommand
}) {
  const isPumpOn = Boolean(telemetry.pumpOn);
  const isPumpLocked = Boolean(telemetry.pumpLocked);
  const pumpCount = Number(telemetry.pumpCount) || 0;
  const hasSoil =
    telemetry.soil !== null &&
    telemetry.soil !== undefined &&
    Number.isFinite(Number(telemetry.soil));
  const soilText = hasSoil ? `${Number(telemetry.soil)}%` : 'Chờ dữ liệu';

  return (
    <View
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Máy bơm tưới tiêu
          </Text>
          <Text
            style={[
              styles.cardSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            Đất {soilText} • Chu kỳ {pumpCount}/5 đợt
          </Text>
        </View>

        <SmartToggle
          theme={theme}
          checked={isPumpOn}
          disabled={pendingCmd === 'PUMP:START' || pendingCmd === 'PUMP:STOP'}
          accessibilityLabel={
            isPumpOn ? 'Dừng máy bơm' : 'Kích hoạt tưới 2.5s'
          }
          onChange={() =>
            onCommand(
              'PUMP',
              isPumpOn ? 'STOP' : 'START',
              isPumpOn
                ? 'Đã gửi lệnh dừng máy bơm'
                : 'Đã kích hoạt máy bơm tưới ngay 1 đợt (2.5s)'
            )
          }
        />
      </View>

      {/* 3D Matte Botanical Planter Container */}
      <View
        accessible
        accessibilityLabel={
          isPumpOn
            ? 'Mô hình 3D chậu cây đang được vòi nước tưới ẩm'
            : 'Mô hình 3D chậu cây matte ceramic'
        }
        style={[
          styles.studioStage,
          {
            backgroundColor: theme.bgElevated,
            borderColor: theme.borderSubtle
          }
        ]}
      >
        <View style={styles.planterScene}>
          {/* Overhead Brass/Olive Nozzle */}
          <View style={styles.nozzlePipe} />
          <View style={styles.nozzleHead} />

          {/* Water Streams when confirmed pumpOn === true */}
          {isPumpOn ? (
            <View style={styles.waterStreamsRow}>
              <View style={styles.waterStreamLine} />
              <View style={[styles.waterStreamLine, { height: 28 }]} />
              <View style={styles.waterStreamLine} />
            </View>
          ) : null}

          {/* Botanical Foliage */}
          <View style={styles.foliageWrap}>
            <View style={styles.leafLeft} />
            <View style={styles.leafCenter} />
            <View style={styles.leafRight} />
          </View>

          {/* 3D Matte Ceramic Planter Bowl */}
          <View style={styles.planterBowl}>
            <View
              style={[
                styles.planterRim,
                {
                  backgroundColor: isPumpLocked ? '#C85C5C' : '#394438'
                }
              ]}
            />
          </View>
        </View>

        <View
          style={[
            styles.floorShadow,
            { width: 88, backgroundColor: 'rgba(52, 62, 51, 0.12)' }
          ]}
        />
      </View>

      {/* Bottom Controls */}
      <View style={styles.twoColBtns}>
        <TouchableOpacity
          onPress={() =>
            onCommand(
              'PUMP',
              'START',
              'Đã kích hoạt máy bơm tưới ngay 1 đợt (2.5s)'
            )
          }
          disabled={pendingCmd === 'PUMP:START'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Tưới 2.5 giây"
          style={[
            styles.cardBtn,
            {
              backgroundColor: theme.oliveGreen,
              opacity: pendingCmd === 'PUMP:START' ? 0.65 : 1
            }
          ]}
        >
          <Text style={[styles.cardBtnText, { color: '#FAFCF9' }]}>
            Tưới 2.5s
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            onCommand(
              'PUMP',
              'UNLOCK',
              'Đã mở khóa máy bơm và đặt lại bộ đếm 0/5'
            )
          }
          disabled={pendingCmd === 'PUMP:UNLOCK'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isPumpLocked ? 'Mở khóa bơm' : 'Reset 0/5'}
          style={[
            styles.cardBtn,
            {
              backgroundColor: isPumpLocked
                ? theme.warningSoft
                : theme.softGreen,
              opacity: pendingCmd === 'PUMP:UNLOCK' ? 0.65 : 1
            }
          ]}
        >
          <Text
            style={[
              styles.cardBtnText,
              {
                color: isPumpLocked ? theme.warning : theme.oliveGreen
              }
            ]}
          >
            {isPumpLocked ? 'Mở khóa bơm' : 'Reset 0/5'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================================================
// 4. 3D MATTE ARCHITECTURAL SECURITY SHIELD & HOME MODEL (IO34, IO19, IO14)
// ============================================================================
export const SecurityControlCard = memo(function SecurityControlCard({
  theme,
  telemetry,
  pendingCmd,
  onCommand,
  vibrationEnabled = true,
  onToggleVibration
}) {
  const isFire = Boolean(telemetry.fireAlert);
  const isAlarmLedOn = Boolean(telemetry.redLedOn);
  const isAlertActive = isFire || isAlarmLedOn;

  return (
    <View
      style={[
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: theme.bgCard,
          borderColor: isFire ? theme.danger : theme.border
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Hệ thống an ninh
          </Text>
          <Text
            style={[
              styles.cardSub,
              TABULAR_NUMS,
              { color: theme.textSecondary }
            ]}
          >
            Lửa ADC {telemetry.flame ?? '—'} •{' '}
            {isAlertActive ? 'Còi & Đèn BẬT' : 'Trực canh'}
          </Text>
        </View>

        {onToggleVibration ? (
          <TouchableOpacity
            onPress={onToggleVibration}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={
              vibrationEnabled
                ? 'Đang bật rung cảnh báo cháy — chạm để tắt'
                : 'Đang tắt rung cảnh báo cháy — chạm để bật'
            }
            style={[
              styles.modeBadge,
              {
                backgroundColor: vibrationEnabled
                  ? theme.softGreen
                  : theme.bgElevated
              }
            ]}
          >
            <Text
              style={[
                styles.modeBadgeText,
                {
                  color: vibrationEnabled
                    ? theme.oliveGreen
                    : theme.textSecondary
                }
              ]}
            >
              {vibrationEnabled ? 'Rung: Bật' : 'Rung: Tắt'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 3D Matte Architectural Home & Security Shield Render */}
      <View
        accessible
        accessibilityLabel={
          isFire
            ? 'Mô hình 3D khiên an ninh đang phát cảnh báo đỏ khẩn cấp'
            : 'Mô hình 3D ngôi nhà và khiên bảo vệ an toàn'
        }
        style={[
          styles.studioStage,
          {
            backgroundColor: theme.bgElevated,
            borderColor: theme.borderSubtle
          }
        ]}
      >
        <View style={styles.securityScene}>
          {/* 3D Miniature Architectural House Model */}
          <View style={styles.houseBody}>
            <View style={styles.houseRoof} />
            <View style={styles.houseDoor} />
          </View>

          {/* 3D Overlapping Matte Security Shield Badge */}
          <View
            style={[
              styles.shieldBadge,
              {
                backgroundColor: isAlertActive ? '#C85C5C' : '#394438'
              }
            ]}
          >
            <Text style={styles.shieldCheckMark}>
              {isAlertActive ? '!' : '✓'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.floorShadow,
            {
              width: 92,
              backgroundColor: isAlertActive
                ? 'rgba(200, 92, 92, 0.24)'
                : 'rgba(52, 62, 51, 0.12)'
            }
          ]}
        />
      </View>

      {/* Bottom Alarm Test Controls */}
      <View style={styles.twoColBtns}>
        <TouchableOpacity
          onPress={() =>
            onCommand(
              'ALARM_TEST',
              'ON',
              'Đã kích hoạt kiểm tra còi và 2 đèn đỏ trong 2 giây'
            )
          }
          disabled={pendingCmd === 'ALARM_TEST:ON'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Test còi và 2 đèn đỏ trong 2 giây"
          style={[
            styles.cardBtn,
            {
              backgroundColor: theme.oliveGreen,
              opacity: pendingCmd === 'ALARM_TEST:ON' ? 0.65 : 1
            }
          ]}
        >
          <Text style={[styles.cardBtnText, { color: '#FAFCF9' }]}>
            Test còi (2s)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            onCommand('ALARM_TEST', 'OFF', 'Đã tắt kiểm tra báo động')
          }
          disabled={pendingCmd === 'ALARM_TEST:OFF'}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Tắt kiểm tra báo động"
          style={[
            styles.cardBtn,
            {
              backgroundColor: theme.softGreen,
              opacity: pendingCmd === 'ALARM_TEST:OFF' ? 0.65 : 1
            }
          ]}
        >
          <Text style={[styles.cardBtnText, { color: theme.oliveGreen }]}>
            Tắt test
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

function DeviceControlPanels({
  theme,
  telemetry,
  pendingCmd,
  onCommand,
  vibrationEnabled,
  onToggleVibration
}) {
  return (
    <View style={styles.stack}>
      <LightingControlCard
        theme={theme}
        telemetry={telemetry}
        pendingCmd={pendingCmd}
        onCommand={onCommand}
      />
      <ClotheslineControlCard
        theme={theme}
        telemetry={telemetry}
        pendingCmd={pendingCmd}
        onCommand={onCommand}
      />
      <GardenControlCard
        theme={theme}
        telemetry={telemetry}
        pendingCmd={pendingCmd}
        onCommand={onCommand}
      />
      <SecurityControlCard
        theme={theme}
        telemetry={telemetry}
        pendingCmd={pendingCmd}
        onCommand={onCommand}
        vibrationEnabled={vibrationEnabled}
        onToggleVibration={onToggleVibration}
      />
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  cardSub: {
    fontSize: 11.5,
    marginTop: 2
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    justifyContent: 'center'
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  studioStage: {
    height: 132,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  floorShadow: {
    position: 'absolute',
    bottom: 12,
    height: 10,
    borderRadius: 999
  },
  /* 1. Lamp 3D Matte Geometry */
  lampWarmHalo: {
    position: 'absolute',
    top: 38,
    width: 116,
    height: 76,
    borderRadius: 58,
    backgroundColor: 'rgba(242, 193, 102, 0.32)'
  },
  lampCanopy: {
    position: 'absolute',
    top: 8,
    width: 26,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D5DAD2'
  },
  lampCord: {
    position: 'absolute',
    top: 15,
    width: 2,
    height: 18,
    backgroundColor: '#929B90'
  },
  lampFinial: {
    position: 'absolute',
    top: 30,
    width: 12,
    height: 8,
    borderRadius: 4
  },
  lampDome: {
    marginTop: -6,
    width: 84,
    height: 34,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    backgroundColor: '#F1EFE8',
    borderWidth: 1,
    borderColor: '#D7D9D2',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 2
  },
  lampInnerRim: {
    width: 80,
    height: 8,
    borderRadius: 999
  },
  lampBulbSphere: {
    marginTop: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    zIndex: 1
  },
  bottomSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  bottomSyncText: {
    fontSize: 11.5,
    fontWeight: '500',
    flex: 1
  },
  smallActionPill: {
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  smallActionText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  /* 2. Clothesline 3D Matte Geometry */
  clotheslineScene: {
    width: 168,
    height: 100,
    position: 'relative',
    justifyContent: 'center'
  },
  shelterPillar: {
    position: 'absolute',
    left: 14,
    top: 16,
    width: 16,
    height: 74,
    borderRadius: 5,
    backgroundColor: '#EAECE7',
    borderWidth: 1,
    borderColor: '#D5DAD2'
  },
  shelterCanopy: {
    position: 'absolute',
    left: 10,
    top: 12,
    width: 66,
    height: 13,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  telescopicRail: {
    position: 'absolute',
    left: 26,
    top: 34,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#929B90'
  },
  garmentsGroup: {
    position: 'absolute',
    top: 39,
    flexDirection: 'row',
    gap: 5
  },
  garmentCream: {
    width: 20,
    height: 34,
    borderRadius: 5,
    backgroundColor: '#F6F5EE',
    borderWidth: 1,
    borderColor: '#DFDDD4'
  },
  garmentSage: {
    width: 18,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#B8C2B5'
  },
  sunSphere: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(230, 184, 106, 0.65)'
  },
  rainGroup: {
    position: 'absolute',
    right: 18,
    top: 14,
    flexDirection: 'row',
    gap: 6
  },
  rainDropLine: {
    width: 2.5,
    height: 13,
    borderRadius: 2,
    backgroundColor: '#72A765',
    transform: [{ rotate: '18deg' }]
  },
  segmentedBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 13,
    gap: 4
  },
  segmentOption: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentOptionText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  /* 3. Planter 3D Matte Geometry */
  planterScene: {
    width: 140,
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 6
  },
  nozzlePipe: {
    position: 'absolute',
    left: 20,
    top: 10,
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#394438'
  },
  nozzleHead: {
    position: 'absolute',
    left: 52,
    top: 12,
    width: 10,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#929B90'
  },
  waterStreamsRow: {
    position: 'absolute',
    left: 52,
    top: 20,
    flexDirection: 'row',
    gap: 4
  },
  waterStreamLine: {
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: '#72A765'
  },
  foliageWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: -3,
    zIndex: 2
  },
  leafLeft: {
    width: 18,
    height: 14,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#5B8452',
    transform: [{ rotate: '-18deg' }]
  },
  leafCenter: {
    width: 18,
    height: 22,
    borderRadius: 9,
    backgroundColor: '#72A765',
    marginHorizontal: -3
  },
  leafRight: {
    width: 18,
    height: 14,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#394438',
    transform: [{ rotate: '18deg' }]
  },
  planterBowl: {
    width: 56,
    height: 34,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#EAE8E0',
    borderWidth: 1,
    borderColor: '#CFCBC0',
    alignItems: 'center',
    overflow: 'hidden'
  },
  planterRim: {
    width: '100%',
    height: 6
  },
  /* 4. Security Shield & Home 3D Matte Geometry */
  securityScene: {
    width: 136,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  houseBody: {
    width: 64,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F3F4F0',
    borderWidth: 1.5,
    borderColor: '#394438',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 16
  },
  houseRoof: {
    position: 'absolute',
    top: -12,
    width: 72,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#394438'
  },
  houseDoor: {
    width: 20,
    height: 24,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: '#E5EBE4'
  },
  shieldBadge: {
    position: 'absolute',
    right: 18,
    bottom: 12,
    width: 40,
    height: 46,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FAFCF9'
  },
  shieldCheckMark: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FAFCF9'
  },
  twoColBtns: {
    flexDirection: 'row',
    gap: 8
  },
  cardBtn: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBtnText: {
    fontSize: 11.5,
    fontWeight: '600'
  }
});

export default memo(DeviceControlPanels);
