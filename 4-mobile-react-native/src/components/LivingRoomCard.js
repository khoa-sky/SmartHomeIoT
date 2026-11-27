import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { CARD_SHADOW, TABULAR_NUMS } from '../theme/tokens';

const livingRoomPhoto = require('../assets/scandinavian-living-room.jpg');

/**
 * LivingRoomCard — Centerpiece Scandinavian Interior Card synchronized with
 * 3-frontend-react/src/components/LivingRoomCard.jsx:
 * - Real Scandinavian living room photograph (src/assets/scandinavian-living-room.jpg)
 * - Warm golden ceiling lamp glow overlay when telemetry.lightOn === true,
 *   and natural dusk dimming when telemetry.lightOn === false
 * - Real PIR motion sensor status (IO27) and quick Light / PIR Lock controls
 */
function LivingRoomCard({ theme, telemetry, pendingCmd, onCommand }) {
  const isLightOn = Boolean(telemetry.lightOn);
  const isPirLocked = Boolean(telemetry.pirLocked);
  const hasMotion = Boolean(telemetry.pir);
  const isLightBusy = pendingCmd === 'LIGHT:ON' || pendingCmd === 'LIGHT:OFF';
  const isPirBusy =
    pendingCmd === 'PIR_LOCK:LOCK' || pendingCmd === 'PIR_LOCK:UNLOCK';

  const hasTemp =
    telemetry.temp !== null &&
    telemetry.temp !== undefined &&
    Number.isFinite(Number(telemetry.temp));
  const hasHum =
    telemetry.hum !== null &&
    telemetry.hum !== undefined &&
    Number.isFinite(Number(telemetry.hum));

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
      {/* Top Bar inside Card */}
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Living Room Sanctuary
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Không gian phòng khách • Đèn IO32 &amp; Cảm biến PIR IO27
          </Text>
        </View>

        {/* Interactive PIR Lock Pill */}
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
          accessibilityLabel={
            isPirLocked
              ? 'Mở khóa cảm biến chuyển động PIR'
              : 'Khóa cảm biến chuyển động PIR'
          }
          style={[
            styles.pirPill,
            {
              backgroundColor: isPirLocked
                ? theme.warningSoft
                : theme.softGreen,
              opacity: isPirBusy ? 0.65 : 1
            }
          ]}
        >
          <View
            style={[
              styles.pirDot,
              {
                backgroundColor: isPirLocked
                  ? theme.warning
                  : hasMotion
                  ? theme.success
                  : theme.oliveGreen
              }
            ]}
          />
          <Text
            style={[
              styles.pirPillText,
              {
                color: isPirLocked ? theme.warning : theme.oliveGreen
              }
            ]}
          >
            {isPirLocked
              ? 'PIR: Đã khóa (Chế độ ngủ)'
              : hasMotion
              ? 'PIR: Phát hiện có người'
              : 'PIR: Tự động bật đèn'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scandinavian Interior Visual Container */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: theme.softGreen }
        ]}
      >
        <Image
          source={livingRoomPhoto}
          resizeMode="cover"
          style={styles.roomImage}
          accessibilityLabel="Không gian phòng khách Scandinavian Aura Smart Home"
        />

        {/* Natural Dusk Dimming when Light is OFF vs Warm Golden Halo when Light is ON */}
        {isLightOn ? (
          <View pointerEvents="none" style={styles.warmGlowOverlay}>
            <View style={styles.warmCeilingHalo} />
          </View>
        ) : (
          <View pointerEvents="none" style={styles.duskDimOverlay} />
        )}

        {/* Top-Left Environment Tag Overlay */}
        <View style={styles.topTagsRow}>
          <View style={styles.envGlassTag}>
            <View style={styles.envDot} />
            <Text style={[styles.envTagText, TABULAR_NUMS]}>
              {hasTemp ? `${Number(telemetry.temp).toFixed(1)}°C` : 'Chờ dữ liệu'}
            </Text>
          </View>

          <View style={styles.envGlassTag}>
            <View style={[styles.envDot, { backgroundColor: '#72A765' }]} />
            <Text style={[styles.envTagText, TABULAR_NUMS]}>
              {hasHum ? `${Number(telemetry.hum).toFixed(0)}%` : 'Chờ dữ liệu'}
            </Text>
          </View>
        </View>

        {/* Bottom Floating Lighting Control Bar over Interior Image */}
        <View
          style={[
            styles.floatingBar,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(39, 47, 39, 0.94)'
                  : 'rgba(250, 252, 249, 0.93)',
              borderColor:
                theme.mode === 'dark'
                  ? 'rgba(240, 243, 237, 0.14)'
                  : 'rgba(255, 255, 255, 0.7)'
            }
          ]}
        >
          <View style={styles.floatingInfo}>
            <View
              style={[
                styles.lampIconBox,
                {
                  backgroundColor: isLightOn ? '#394438' : '#E5EBE4'
                }
              ]}
            >
              <View
                style={[
                  styles.lampBulbCore,
                  {
                    backgroundColor: isLightOn ? '#F5C97B' : '#929B90'
                  }
                ]}
              />
            </View>
            <View style={styles.floatingTextWrap}>
              <Text
                style={[
                  styles.floatingTitle,
                  { color: theme.mode === 'dark' ? '#F0F3ED' : '#343E33' }
                ]}
                numberOfLines={1}
              >
                {isLightOn
                  ? 'Đèn trần phòng khách đang sáng'
                  : 'Đèn trần phòng khách đang tắt'}
              </Text>
              <Text
                style={[
                  styles.floatingSub,
                  { color: theme.mode === 'dark' ? '#A7B0A4' : '#7D827A' }
                ]}
                numberOfLines={1}
              >
                Đồng bộ nút vật lý IO25 • {isPirLocked ? 'Khóa PIR' : 'PIR Auto'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              onCommand(
                'LIGHT',
                isLightOn ? 'OFF' : 'ON',
                isLightOn
                  ? 'Đã gửi lệnh tắt đèn phòng khách (khóa tạm PIR 5s)'
                  : 'Đã gửi lệnh bật đèn phòng khách'
              )
            }
            disabled={isLightBusy}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={
              isLightOn ? 'Tắt đèn phòng khách' : 'Bật đèn phòng khách'
            }
            style={[
              styles.lightToggleBtn,
              {
                backgroundColor: isLightOn ? '#394438' : '#E5EBE4',
                opacity: isLightBusy ? 0.65 : 1
              }
            ]}
          >
            <Text
              style={[
                styles.lightToggleBtnText,
                { color: isLightOn ? '#FAFCF9' : '#343E33' }
              ]}
            >
              {isLightOn ? 'Tắt đèn' : 'Bật đèn'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 15,
    gap: 12
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  titleBlock: {
    flex: 1,
    minWidth: 180
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  pirPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999
  },
  pirDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  pirPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  imageContainer: {
    height: 224,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between'
  },
  roomImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%'
  },
  warmGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(235, 190, 108, 0.14)',
    alignItems: 'center'
  },
  warmCeilingHalo: {
    marginTop: -24,
    width: 210,
    height: 130,
    borderRadius: 105,
    backgroundColor: 'rgba(242, 193, 102, 0.26)'
  },
  duskDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 26, 20, 0.22)'
  },
  topTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12
  },
  envGlassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 252, 249, 0.88)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999
  },
  envDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#394438'
  },
  envTagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#343E33'
  },
  floatingBar: {
    margin: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  floatingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0
  },
  lampIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lampBulbCore: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  floatingTextWrap: {
    flex: 1,
    minWidth: 0
  },
  floatingTitle: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  floatingSub: {
    fontSize: 11,
    marginTop: 1
  },
  lightToggleBtn: {
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  lightToggleBtnText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default memo(LivingRoomCard);

