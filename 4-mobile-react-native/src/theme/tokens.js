// ============================================================================
// AURA SMART HOME — SIGNATURE EDITION (MOBILE DESIGN TOKENS)
// Tagline: "Intelligent living, naturally."
// Synchronized 100% with 3-frontend-react/src/index.css
// ============================================================================

import { Platform } from 'react-native';

export const LIGHT_THEME = {
  mode: 'light',
  bgMain: '#F3F5F1',
  bgSidebar: '#FAFCF9',
  bgCard: '#FAFCF9',
  bgElevated: '#E5EBE4',
  bgSubtle: '#EDF1EC',
  softGreen: '#E5EBE4',
  sageGreen: '#A4ADA2',
  sageSurface: '#C5CEC2',
  oliveGreen: '#394438',
  darkOlive: '#303B2F',

  textPrimary: '#343E33',
  textSecondary: '#929B90',
  textMuted: '#A4ADA2',

  border: '#E0E5DE',
  borderSubtle: 'rgba(52, 62, 51, 0.08)',

  accent: '#394438',
  accentStrong: '#303B2F',
  accentTextOn: '#FAFCF9',
  accentSoft: '#E5EBE4',
  oliveSoft: 'rgba(57, 68, 56, 0.10)',
  warmLamp: '#E6B86A',

  success: '#72A765',
  successTextOn: '#FAFCF9',
  successSoft: 'rgba(114, 167, 101, 0.14)',

  warning: '#C99649',
  warningTextOn: '#FFFFFF',
  warningSoft: 'rgba(201, 150, 73, 0.15)',

  danger: '#C85C5C',
  dangerTextOn: '#FFFFFF',
  dangerSoft: 'rgba(200, 92, 92, 0.14)',

  info: '#394438',
  infoTextOn: '#FAFCF9',
  infoSoft: '#E5EBE4'
};

export const DARK_THEME = {
  mode: 'dark',
  bgMain: '#1C221C',
  bgSidebar: '#222922',
  bgCard: '#272F27',
  bgElevated: '#323C31',
  bgSubtle: '#2B342B',
  softGreen: '#323C31',
  sageGreen: '#7A8778',
  sageSurface: '#343F34',
  oliveGreen: '#9EAE98',
  darkOlive: '#394438',

  textPrimary: '#F0F3ED',
  textSecondary: '#A7B0A4',
  textMuted: '#7F897D',

  border: '#353F35',
  borderSubtle: 'rgba(240, 243, 237, 0.08)',

  accent: '#9EAE98',
  accentStrong: '#B4C3AE',
  accentTextOn: '#1C221C',
  accentSoft: 'rgba(158, 174, 152, 0.16)',
  oliveSoft: 'rgba(158, 174, 152, 0.15)',
  warmLamp: '#E8BE74',

  success: '#82B675',
  successTextOn: '#1C221C',
  successSoft: 'rgba(130, 182, 117, 0.16)',

  warning: '#D5A45A',
  warningTextOn: '#1C221C',
  warningSoft: 'rgba(213, 164, 90, 0.16)',

  danger: '#D46A6A',
  dangerTextOn: '#FFFFFF',
  dangerSoft: 'rgba(212, 106, 106, 0.18)',

  info: '#9EAE98',
  infoTextOn: '#1C221C',
  infoSoft: 'rgba(158, 174, 152, 0.16)'
};

export const TABULAR_NUMS = { fontVariant: ['tabular-nums'] };

export const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#303B2F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16
  },
  android: {
    elevation: 2
  },
  default: {}
});
