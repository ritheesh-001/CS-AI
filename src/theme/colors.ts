export const Colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',

  // Google Pay signature colors & high-contrast focal points
  primary: '#1A73E8', // Google Blue
  primaryDark: '#1557B0',
  primaryLight: '#E8F0FE',
  primaryGlow: 'rgba(26, 115, 232, 0.15)',

  secondary: '#0F172A',
  secondaryMuted: '#334155',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Severity Badges (Strict Google Pay / Civic safety standards)
  severity: {
    low: {
      main: '#10B981',
      bg: '#ECFDF5',
      text: '#065F46',
      border: '#A7F3D0',
      label: 'Low Severity',
    },
    medium: {
      main: '#F59E0B',
      bg: '#FFFBEB',
      text: '#92400E',
      border: '#FDE68A',
      label: 'Medium Severity',
    },
    high: {
      main: '#EF4444',
      bg: '#FEF2F2',
      text: '#991B1B',
      border: '#FECACA',
      label: 'Critical / High',
    },
  },

  // Report status colors
  status: {
    PENDING: {
      bg: '#F1F5F9',
      text: '#475569',
      border: '#CBD5E1',
      label: 'Pending Review',
    },
    ACKNOWLEDGED: {
      bg: '#EFF6FF',
      text: '#1D4ED8',
      border: '#BFDBFE',
      label: 'Acknowledged',
    },
    INSPECTED: {
      bg: '#F5F3FF',
      text: '#6D28D9',
      border: '#DDD6FE',
      label: 'Inspected',
    },
    REPAIRED: {
      bg: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0',
      label: 'Repaired',
    },
  },

  // Utility colors
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#D97706',
  success: '#059669',
  info: '#0284C7',

  // Reticle & Scanner
  scannerLaser: '#EF4444',
  reticleCorner: '#FFFFFF',
  reticleActive: '#38BDF8',
  viewfinderScrim: 'rgba(15, 23, 42, 0.65)',
};
