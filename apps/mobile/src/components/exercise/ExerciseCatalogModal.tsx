/**
 * Exercise Catalog Selector Modal
 * Choose from the 10 Cardio & Bodyweight exercises.
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
  X,
  Sparkles,
  Flame,
  Activity,
  Zap,
  Target,
  ChevronRight,
  Dumbbell,
} from 'lucide-react-native';
import { ExerciseId, ExerciseDefinition } from '../../lib/pose/poseTypes';
import { ALL_EXERCISE_LIST } from '../../lib/pose/exerciseDefinitions';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

interface ExerciseCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
}

export default function ExerciseCatalogModal({
  visible,
  onClose,
  onSelectExercise,
}: ExerciseCatalogModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Sparkles size={11} color={NeuTheme.colors.amber} />
              <Text style={styles.badgeText}>AI REALTIME TRACKER</Text>
            </View>
            <Text style={styles.headerTitle}>Select Exercise</Text>
            <Text style={styles.headerSubtitle}>
              10 zero-latency cardio & bodyweight drills
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color={NeuTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* List of Exercises */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {ALL_EXERCISE_LIST.map((ex) => {
            const isCardio = ex.category === 'Cardio';
            const categoryBg = isCardio
              ? NeuTheme.colors.amberBg
              : ex.category === 'Strength'
              ? NeuTheme.colors.emeraldBg
              : '#EEF2FF';
            const categoryColor = isCardio
              ? '#B45309'
              : ex.category === 'Strength'
              ? '#047857'
              : '#4F46E5';

            return (
              <TouchableOpacity
                key={ex.id}
                onPress={() => onSelectExercise(ex)}
                activeOpacity={0.85}
                style={styles.cardTouch}
              >
                <NeuCard variant="raised" padding={14} borderRadius={18} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryBg }]}>
                        <Text style={[styles.categoryText, { color: categoryColor }]}>
                          {ex.category.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                    </View>

                    <ChevronRight size={18} color={NeuTheme.colors.textMuted} />
                  </View>

                  <View style={styles.muscleTagsRow}>
                    {ex.targetMuscles.slice(0, 3).map((m, i) => (
                      <View key={i} style={styles.muscleTag}>
                        <Text style={styles.muscleTagText}>{m}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.statItem}>
                      <Target size={12} color={NeuTheme.colors.textSecondary} />
                      <Text style={styles.statText}>
                        {ex.recommendedReps} reps × {ex.recommendedSets} sets
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Flame size={12} color={NeuTheme.colors.amber} />
                      <Text style={[styles.statText, { color: '#B45309', fontWeight: '700' }]}>
                        ~{(ex.calorieBurnPerRep * ex.recommendedReps * ex.recommendedSets).toFixed(0)} kcal
                      </Text>
                    </View>
                  </View>
                </NeuCard>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: NeuTheme.colors.recessedWell,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: NeuTheme.colors.amber,
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NeuTheme.colors.recessedWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  cardTouch: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'column',
    gap: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
    marginTop: 2,
  },
  muscleTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  muscleTag: {
    backgroundColor: NeuTheme.colors.recessedWell,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: NeuTheme.colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: NeuTheme.colors.recessedDark,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: NeuTheme.colors.textSecondary,
  },
});
