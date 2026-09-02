import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

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
            <ChevronLeft size={16} color="#94A3B8" />
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
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B26',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#0A0D13',
    borderRightColor: '#0A0D13',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    gap: 4,
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  blueprintBadge: {
    backgroundColor: '#161B26',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#0A0D13',
    borderRightColor: '#0A0D13',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  blueprintText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stepBadge: {
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  stepHighlight: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: '#11151F',
    borderRadius: 4,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
  },
  fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
});
