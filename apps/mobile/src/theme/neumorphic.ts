export const NeuTheme = {
  colors: {
    // Soft Off-White / Light Slate Canvas
    background: '#EEF2F6',
    canvasSecondary: '#E6ECF5',
    cardBackground: '#EEF2F6',
    recessedWell: '#E2E8F0',
    recessedDark: '#D8E2EC',

    // Typography & Slate neutrals
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textLight: '#CBD5E1',

    // Accents
    emerald: '#10B981',
    emeraldLight: '#34D399',
    emeraldBg: '#D1FAE5',

    cyan: '#06B6D4',
    cyanLight: '#22D3EE',
    cyanBg: '#CFFAFE',

    amber: '#F59E0B',
    amberLight: '#FBBF24',
    amberBg: '#FEF3C7',

    coral: '#EF4444',
    coralLight: '#F87171',
    coralBg: '#FEE2E2',

    skyBlue: '#3B82F6',
    skyBlueLight: '#60A5FA',
    skyBlueBg: '#DBEAFE',

    violet: '#8B5CF6',
    violetLight: '#A78BFA',
    violetBg: '#EDE9FE',
  },

  shadows: {
    // Raised / Extruded Soft Bevel
    raised: {
      shadowColor: '#A3B1C6',
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 0.55,
      shadowRadius: 8,
      elevation: 6,
    },
    raisedSmall: {
      shadowColor: '#A3B1C6',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.45,
      shadowRadius: 5,
      elevation: 4,
    },
    // Top-Left Light Highlight simulation for cross-platform
    lightHighlight: {
      borderTopColor: 'rgba(255, 255, 255, 0.95)',
      borderLeftColor: 'rgba(255, 255, 255, 0.95)',
      borderBottomColor: 'rgba(163, 177, 198, 0.35)',
      borderRightColor: 'rgba(163, 177, 198, 0.35)',
    },
    // Inset / Recessed Well border simulation
    insetWell: {
      backgroundColor: '#E2E8F0',
      borderTopColor: 'rgba(163, 177, 198, 0.55)',
      borderLeftColor: 'rgba(163, 177, 198, 0.55)',
      borderBottomColor: 'rgba(255, 255, 255, 0.9)',
      borderRightColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
};
