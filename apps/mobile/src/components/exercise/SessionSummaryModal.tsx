/**
 * Phase 3: Session Wrap-up & Summary Modal
 * Shows total clean reps completed, set breakdown, active heart-rate zone estimate,
 * form score, and calorie burn calculation.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  Trophy,
  Flame,
  Clock,
  Heart,
  Target,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { WorkoutSessionSummary } from '../../lib/pose/poseTypes';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

interface SessionSummaryModalProps {
  visible: boolean;
  summary: WorkoutSessionSummary | null;
  onClose: () => void;
  onSaveAndExit: () => void;
}

export default function SessionSummaryModal({
  visible,
  summary,
  onClose,
  onSaveAndExit,
}: SessionSummaryModalProps) {
  if (!summary) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Trophy Header */}
          <View style={styles.header}>
            <View style={styles.trophyCircle}>
              <Trophy size={42} color="#F59E0B" />
            </View>
            <View style={styles.tag}>
              <Sparkles size={11} color={NeuTheme.colors.emerald} />
              <Text style={styles.tagText}>WORKOUT COMPLETED</Text>
            </View>
            <Text style={styles.title}>{summary.exerciseName}</Text>
            <Text style={styles.subtitle}>
              Clean pose execution verified on-device
            </Text>
          </View>

          {/* Primary Metric Hero Card */}
          <NeuCard variant="raised" padding={18} borderRadius={24} style={styles.heroCard}>
            <View style={styles.heroGrid}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>TOTAL REPS</Text>
                <Text style={styles.heroStatValue}>{summary.totalReps}</Text>
                <Text style={styles.heroStatSub}>Target: {summary.targetReps}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>CALORIES</Text>
                <Text style={[styles.heroStatValue, { color: '#B45309' }]}>
                  {summary.caloriesBurned}
                </Text>
                <Text style={styles.heroStatSub}>kcal burned</Text>
              </View>
            </View>
          </NeuCard>

          {/* Secondary Metric Cards Grid */}
          <View style={styles.gridRow}>
            {/* Duration */}
            <NeuCard variant="inset" padding={14} borderRadius={18} style={styles.miniCard}>
              <View style={styles.miniIconRow}>
                <Clock size={16} color="#0284C7" />
                <Text style={styles.miniLabel}>TIME</Text>
              </View>
              <Text style={styles.miniValue}>{formatTime(summary.durationSeconds)}</Text>
            </NeuCard>

            {/* Sets */}
            <NeuCard variant="inset" padding={14} borderRadius={18} style={styles.miniCard}>
              <View style={styles.miniIconRow}>
                <Target size={16} color="#7C3AED" />
                <Text style={styles.miniLabel}>SETS</Text>
              </View>
              <Text style={styles.miniValue}>{summary.totalSets} Sets</Text>
            </NeuCard>
          </View>

          <View style={styles.gridRow}>
            {/* Heart Rate Zone */}
            <NeuCard variant="inset" padding={14} borderRadius={18} style={styles.miniCard}>
              <View style={styles.miniIconRow}>
                <Heart size={16} color="#EF4444" />
                <Text style={styles.miniLabel}>HR ZONE</Text>
              </View>
              <Text style={[styles.miniValue, { color: '#EF4444' }]}>
                {summary.heartRateZone}
              </Text>
            </NeuCard>

            {/* Form Accuracy */}
            <NeuCard variant="inset" padding={14} borderRadius={18} style={styles.miniCard}>
              <View style={styles.miniIconRow}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.miniLabel}>FORM SCORE</Text>
              </View>
              <Text style={[styles.miniValue, { color: '#047857' }]}>
                {summary.averageFormScore}%
              </Text>
            </NeuCard>
          </View>

          {/* AI Coaching Wrap-up Note */}
          <NeuCard variant="flat" padding={16} borderRadius={20} style={styles.noteCard}>
            <Text style={styles.noteTitle}>⚡ Coach Feedback</Text>
            <Text style={styles.noteBody}>
              Outstanding cadence and symmetric joint alignment. You maintained proper joint angle thresholds across all repetitions.
            </Text>
          </NeuCard>
        </ScrollView>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={onSaveAndExit}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>Save Workout & Exit</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeuTheme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NeuTheme.colors.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NeuTheme.colors.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
  },
  heroCard: {
    width: '100%',
  },
  heroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  heroStatLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: NeuTheme.colors.textMuted,
    letterSpacing: 0.4,
  },
  heroStatValue: {
    fontSize: 36,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -1,
  },
  heroStatSub: {
    fontSize: 11,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniCard: {
    flex: 1,
    gap: 4,
  },
  miniIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: NeuTheme.colors.textMuted,
    letterSpacing: 0.3,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
  },
  noteCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    gap: 4,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
  },
  noteBody: {
    fontSize: 12.5,
    color: NeuTheme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: NeuTheme.colors.recessedWell,
  },
  saveBtn: {
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
  saveBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
