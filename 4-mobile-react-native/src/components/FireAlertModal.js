import React, { memo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';

/**
 * FireAlertModal — Emergency Fire Alert Dialog
 * Synchronized 100% with 3-frontend-react/src/App.jsx EMERGENCY FIRE ALERT MODAL
 */
function FireAlertModal({
  visible,
  theme,
  flame,
  vibrationEnabled,
  onToggleVibration,
  onDismiss
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.danger
            }
          ]}
          accessibilityViewIsModal
        >
          {/* Centered Shield Alert Badge */}
          <View
            style={[
              styles.shieldCircle,
              { backgroundColor: theme.dangerSoft }
            ]}
          >
            <Text style={[styles.shieldAlertMark, { color: theme.danger }]}>
              !
            </Text>
          </View>

          <View style={styles.textCenterBlock}>
            <Text style={[styles.eyebrow, { color: theme.danger }]}>
              CẢNH BÁO AN NINH KHẨN CẤP
            </Text>

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Phát hiện nguồn nhiệt / lửa tại mạch
            </Text>

            <Text style={[styles.desc, { color: theme.textSecondary }]}>
              Cảm biến lửa hồng ngoại (IO34) ghi nhận chỉ số ADC{' '}
              <Text
                style={[
                  styles.adcStrong,
                  TABULAR_NUMS,
                  { color: theme.danger }
                ]}
              >
                {flame ?? '—'} (&lt; 15)
              </Text>
              . Còi báo động (IO19) và cụm 2 đèn đỏ (IO14) đang kích hoạt, máy bơm đã tự động ngắt.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onToggleVibration}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={
                vibrationEnabled
                  ? 'Tắt rung cảnh báo trên điện thoại'
                  : 'Bật rung cảnh báo trên điện thoại'
              }
              style={[
                styles.secondaryBtn,
                { backgroundColor: theme.bgElevated }
              ]}
            >
              <Text
                style={[styles.secondaryText, { color: theme.textPrimary }]}
              >
                {vibrationEnabled
                  ? 'Tắt rung điện thoại'
                  : 'Bật rung điện thoại'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDismiss}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Đã xác nhận cảnh báo"
              style={[styles.primaryBtn, { backgroundColor: theme.danger }]}
            >
              <Text
                style={[styles.primaryText, { color: theme.dangerTextOn }]}
              >
                Đã xác nhận cảnh báo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 12, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 16
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shieldAlertMark: {
    fontSize: 26,
    fontWeight: '800'
  },
  textCenterBlock: {
    alignItems: 'center',
    gap: 6
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center'
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 2
  },
  adcStrong: {
    fontWeight: '700'
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4
  },
  secondaryBtn: {
    minHeight: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  secondaryText: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  primaryBtn: {
    minHeight: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  primaryText: {
    fontSize: 12.5,
    fontWeight: '600'
  }
});

export default memo(FireAlertModal);
