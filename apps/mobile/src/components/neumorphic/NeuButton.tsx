import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
} from 'react-native';
import { NeuTheme } from '../../theme/neumorphic';

interface NeuButtonProps {
  children?: React.ReactNode;
  title?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'raised' | 'inset' | 'accent' | 'flat';
  active?: boolean;
  borderRadius?: number;
  disabled?: boolean;
}

export default function NeuButton({
  children,
  title,
  onPress,
  style,
  textStyle,
  variant = 'raised',
  active = false,
  borderRadius = 16,
  disabled = false,
}: NeuButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = () => {
    if (variant === 'accent') {
      return [
        styles.accentButton,
        { borderRadius },
        isPressed && styles.pressedAccent,
      ];
    }

    if (variant === 'inset' || active || isPressed) {
      return [
        styles.insetButton,
        { borderRadius },
      ];
    }

    return [
      styles.raisedButton,
      { borderRadius },
    ];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.baseButton, getButtonStyle(), style]}
    >
      {title ? (
        <Text
          style={[
            styles.defaultText,
            variant === 'accent' && styles.accentText,
            active && styles.activeText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedButton: {
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(163, 177, 198, 0.45)',
    borderRightColor: 'rgba(163, 177, 198, 0.45)',
  },
  insetButton: {
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
  accentButton: {
    backgroundColor: NeuTheme.colors.emerald,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#6EE7B7',
    borderLeftColor: '#6EE7B7',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#047857',
    borderRightColor: '#047857',
  },
  pressedAccent: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  defaultText: {
    color: NeuTheme.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  accentText: {
    color: '#052E16',
    fontWeight: '800',
  },
  activeText: {
    color: NeuTheme.colors.emerald,
    fontWeight: '800',
  },
});
