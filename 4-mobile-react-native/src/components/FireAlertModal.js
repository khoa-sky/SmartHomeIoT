import React, { memo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TABULAR_NUMS } from '../theme/tokens';

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
          <View style={[styles.alertPill, { backgroundColor: theme.dangerSoft }]}>
            <Text style={[styles.alertPillText, { color: theme.danger }]}>
              CẢNH BÁO AN NINH KHẨN CẤP
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Phát hiện nguồn lửa tại mạch!
          </Text>

          <Text style={[styles.desc, { color: theme.textSecondary }]}>
            Cảm biến lửa hồng ngoại (IO34) ghi nhận chỉ số ADC{' '}
            <Text style={[styles.adcStrong, TABULAR_NUMS, { color: theme.danger }]}>
              {flame} (&lt; 15)
            </Text>
            . Còi báo động (IO19) và cụm 2 đèn đỏ (IO14) đang kích hoạt, máy bơm đã tự ngắt để đảm bảo an toàn.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onToggleVibration}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={
                vibrationEnabled ? 'Tạm tắt rung cảnh báo trên điện thoại' : 'Bật lại rung cảnh báo'
              }
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.bgElevated,
                  borderColor: theme.border
                }
              ]}
            >
              <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>
                {vibrationEnabled ? 'Tạm tắt rung điện thoại' : 'Bật lại rung cảnh báo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDismiss}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Đã xác nhận cảnh báo cháy"
              style={[styles.primaryBtn, { backgroundColor: theme.danger }]}
            >
              <Text style={[styles.primaryText, { color: theme.dangerTextOn }]}>
                Đã Xác Nhận Cảnh Báo
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
    backgroundColor: 'rgba(10, 10, 10, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    gap: 14
  },
  alertPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  alertPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  desc: {
    fontSize: 14,
    lineHeight: 21
  },
  adcStrong: {
    fontWeight: '800'
  },
  actions: {
    gap: 10,
    marginTop: 4
  },
  secondaryBtn: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '700'
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '800'
  }
});

export default memo(FireAlertModal);

