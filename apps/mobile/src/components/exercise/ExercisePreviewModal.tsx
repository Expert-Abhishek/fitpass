/**
 * Phase 1: Exercise Preview & Onboarding Modal
 * Shows looping vector animations, muscle targets, customizable sets/reps,
 * and a bold 3-2-1 countdown overlay.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import {
  X,
  Play,
  Flame,
  Target,
  Sparkles,
  Info,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react-native';
import { ExerciseDefinition } from '../../lib/pose/poseTypes';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';
import NeuButton from '../neumorphic/NeuButton';
import ExerciseVisualLoop from './ExerciseVisualLoop';
import { audioHaptics } from '../../lib/pose/audioHapticFeedback';

interface ExercisePreviewModalProps {
  visible: boolean;
  exercise: ExerciseDefinition | null;
  onClose: () => void;
  onStartSession: (config: { reps: number; sets: number }) => void;
}

export default function ExercisePreviewModal({
  visible,
  exercise,
  onClose,
  onStartSession,
}: ExercisePreviewModalProps) {
  const [targetReps, setTargetReps] = useState(15);
  const [targetSets, setTargetSets] = useState(3);
  const [countdown, setCountdown] = useState<number | null>(null);

  const countdownScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (exercise) {
      setTargetReps(exercise.recommendedReps);
      setTargetSets(exercise.recommendedSets);
      setCountdown(null);
    }
  }, [exercise, visible]);

  // Handle 3-2-1 Countdown Trigger
  const handleStartCountdown = () => {
    setCountdown(3);
    audioHaptics.playCountdownTick(false);

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        audioHaptics.playCountdownTick(false);
      } else if (current === 0) {
        setCountdown(0); // "GO!"
        audioHaptics.playCountdownTick(true);
      } else {
        clearInterval(interval);
        setCountdown(null);
        onStartSession({ reps: targetReps, sets: targetSets });
      }
    }, 900);
  };

  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color={NeuTheme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.tag}>
            <Sparkles size={11} color={NeuTheme.colors.amber} />
            <Text style={styles.tagText}>BLAZEPOSE 33-POINT AI</Text>
          </View>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Exercise Title */}
          <View style={styles.titleSection}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.categorySub}>{exercise.category} Workout • Form Tracker</Text>
          </View>

          {/* Looping Animation Card */}
          <NeuCard variant="inset" padding={12} borderRadius={24} style={styles.visualCard}>
            <ExerciseVisualLoop exerciseId={exercise.id} width={220} height={200} />
          </NeuCard>

          {/* Target Muscles */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Target Muscles</Text>
            <View style={styles.musclePills}>
              {exercise.targetMuscles.map((m, i) => (
                <View key={i} style={styles.musclePill}>
                  <CheckCircle2 size={12} color={NeuTheme.colors.emerald} />
                  <Text style={styles.musclePillText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Configuration: Sets & Reps */}
          <View style={styles.configRow}>
            {/* Reps Selector */}
            <NeuCard variant="raised" padding={12} borderRadius={16} style={styles.configCard}>
              <Text style={styles.configLabel}>TARGET REPS</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTargetReps(Math.max(5, targetReps - 5))}
                >
                  <Minus size={16} color={NeuTheme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{targetReps}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTargetReps(targetReps + 5)}
                >
                  <Plus size={16} color={NeuTheme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </NeuCard>

            {/* Sets Selector */}
            <NeuCard variant="raised" padding={12} borderRadius={16} style={styles.configCard}>
              <Text style={styles.configLabel}>SETS</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTargetSets(Math.max(1, targetSets - 1))}
                >
                  <Minus size={16} color={NeuTheme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{targetSets}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTargetSets(targetSets + 1)}
                >
                  <Plus size={16} color={NeuTheme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </NeuCard>
          </View>

          {/* Coaching Instructions & Tips */}
          <NeuCard variant="flat" padding={14} borderRadius={18} style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Info size={15} color={NeuTheme.colors.emerald} />
              <Text style={styles.tipsTitle}>Form Guide & Accuracy Tips</Text>
            </View>
            {exercise.tips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </NeuCard>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartCountdown}
            activeOpacity={0.88}
          >
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startBtnText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* 3-2-1 Countdown Overlay */}
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <View style={styles.countdownPulseCircle}>
              <Text style={styles.countdownText}>
                {countdown === 0 ? 'GO!' : countdown}
              </Text>
            </View>
            <Text style={styles.countdownSub}>Step into camera frame</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeuTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NeuTheme.colors.recessedWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NeuTheme.colors.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  categorySub: {
    fontSize: 12.5,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 3,
  },
  visualCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  musclePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  musclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: NeuTheme.colors.recessedWell,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  musclePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: NeuTheme.colors.textPrimary,
  },
  configRow: {
    flexDirection: 'row',
    gap: 12,
  },
  configCard: {
    flex: 1,
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: NeuTheme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NeuTheme.colors.recessedWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: 18,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    gap: 6,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    fontSize: 12,
    color: NeuTheme.colors.emerald,
    fontWeight: '900',
  },
  tipText: {
    fontSize: 12,
    color: NeuTheme.colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: NeuTheme.colors.recessedWell,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NeuTheme.colors.emerald,
    height: 52,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  countdownPulseCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: NeuTheme.colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  countdownText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  countdownSub: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 20,
    letterSpacing: 0.3,
  },
});
