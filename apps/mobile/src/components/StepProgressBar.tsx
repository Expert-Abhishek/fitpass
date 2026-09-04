import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { NeuTheme } from '../theme/neumorphic';
import NeuCard from './neumorphic/NeuCard';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export function StepProgressBar({
  currentStep,
  totalSteps,
  onBack,
  canGoBack = true,
}: StepProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {canGoBack && currentStep > 1 ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} color={NeuTheme.colors.textSecondary} />
            <Text style={styles.backButtonText}>Previous</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.blueprintBadge}>
            <Text style={styles.blueprintText}>FITPASS BLUEPRINT</Text>
          </View>
        )}

        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>
            Step <Text style={styles.stepHighlight}>{currentStep}</Text> of {totalSteps}
          </Text>
        </View>
      </View>

      {/* Recessed Neumorphic Progress Track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    ...NeuTheme.shadows.raisedSmall,
    gap: 4,
  },
  backButtonText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  blueprintBadge: {
    backgroundColor: NeuTheme.colors.emeraldBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  blueprintText: {
    color: '#065F46',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  stepBadge: {
    backgroundColor: NeuTheme.colors.recessedWell,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  stepText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  stepHighlight: {
    color: NeuTheme.colors.textPrimary,
    fontWeight: '900',
  },
  track: {
    width: '100%',
    height: 7,
    backgroundColor: NeuTheme.colors.recessedDark,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: NeuTheme.colors.emerald,
    borderRadius: 3.5,
  },
});
