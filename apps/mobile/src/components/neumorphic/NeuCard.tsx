import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { NeuTheme } from '../../theme/neumorphic';

interface NeuCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'raised' | 'inset' | 'flat';
  borderRadius?: number;
  padding?: number;
}

export default function NeuCard({
  children,
  style,
  variant = 'raised',
  borderRadius = 20,
  padding = 16,
}: NeuCardProps) {
  if (variant === 'inset') {
    return (
      <View
        style={[
          styles.baseCard,
          styles.insetCard,
          { borderRadius, padding },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (variant === 'flat') {
    return (
      <View
        style={[
          styles.baseCard,
          styles.flatCard,
          { borderRadius, padding },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Raised / Extruded variant (Default)
  return (
    <View
      style={[
        styles.baseCard,
        styles.raisedOuter,
        { borderRadius, padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: NeuTheme.colors.cardBackground,
  },
  raisedOuter: {
    ...NeuTheme.shadows.raised,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
  },
  insetCard: {
    backgroundColor: NeuTheme.colors.recessedWell,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(163, 177, 198, 0.65)',
    borderLeftColor: 'rgba(163, 177, 198, 0.65)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    borderRightColor: 'rgba(255, 255, 255, 0.95)',
  },
  flatCard: {
    backgroundColor: NeuTheme.colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(163, 177, 198, 0.25)',
  },
});
