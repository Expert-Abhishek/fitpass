import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Dumbbell,
  Camera,
  ScanLine,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

interface HeroActionTilesProps {
  onStartWorkout: () => void;
  onOpenDietTracker: () => void;
  completedRepsToday?: number;
  targetRepsToday?: number;
  loggedMealsCount?: number;
}

export default function HeroActionTiles({
  onStartWorkout,
  onOpenDietTracker,
  completedRepsToday = 45,
  targetRepsToday = 80,
  loggedMealsCount = 2,
}: HeroActionTilesProps) {
  return (
    <View style={styles.container}>
      {/* Left Tile: Exercise / AI Workouts (Module 2) */}
      <TouchableOpacity
        onPress={onStartWorkout}
        style={styles.tileWrapper}
        activeOpacity={0.88}
      >
        <NeuCard variant="raised" padding={12} borderRadius={20} style={styles.tileCard}>
          <View style={styles.tileHeader}>
            <View style={[styles.iconCircle, { backgroundColor: NeuTheme.colors.amberBg }]}>
              <Dumbbell size={18} color={NeuTheme.colors.amber} />
            </View>
            <View style={styles.arrowBadge}>
              <ArrowUpRight size={13} color={NeuTheme.colors.textMuted} />
            </View>
          </View>

          <View style={styles.tileBody}>
            <View style={styles.moduleTag}>
              <Sparkles size={9} color={NeuTheme.colors.amber} />
              <Text style={styles.moduleTagText}>AI POSE ENGINE</Text>
            </View>
            <Text style={styles.tileTitle} numberOfLines={1}>Workouts</Text>
            <Text style={styles.tileSubtitle} numberOfLines={1}>Realtime Session</Text>
          </View>

          <View style={styles.tileFooter}>
            <View style={styles.progressRow}>
              <Text style={styles.footerHighlight} numberOfLines={1}>
                {completedRepsToday} <Text style={styles.footerTarget}>/ {targetRepsToday} reps</Text>
              </Text>
            </View>
            <View style={styles.miniTrack}>
              <View
                style={[
                  styles.miniFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.round((completedRepsToday / targetRepsToday) * 100)
                    )}%`,
                    backgroundColor: NeuTheme.colors.amber,
                  },
                ]}
              />
            </View>
          </View>
        </NeuCard>
      </TouchableOpacity>

      {/* Right Tile: Track Your Diet / AI Meal Snap (Module 3) */}
      <TouchableOpacity
        onPress={onOpenDietTracker}
        style={styles.tileWrapper}
        activeOpacity={0.88}
      >
        <NeuCard variant="raised" padding={12} borderRadius={20} style={styles.tileCard}>
          <View style={styles.tileHeader}>
            <View style={[styles.iconCircle, { backgroundColor: NeuTheme.colors.emeraldBg }]}>
              <ScanLine size={18} color={NeuTheme.colors.emerald} />
            </View>
            <View style={styles.arrowBadge}>
              <ArrowUpRight size={13} color={NeuTheme.colors.textMuted} />
            </View>
          </View>

          <View style={styles.tileBody}>
            <View style={[styles.moduleTag, { backgroundColor: NeuTheme.colors.emeraldBg }]}>
              <Camera size={9} color={NeuTheme.colors.emerald} />
              <Text style={[styles.moduleTagText, { color: '#047857' }]}>AI MEAL SNAP</Text>
            </View>
            <Text style={styles.tileTitle} numberOfLines={1}>Track Diet</Text>
            <Text style={styles.tileSubtitle} numberOfLines={1}>Log Nutrition</Text>
          </View>

          <View style={styles.tileFooter}>
            <View style={styles.progressRow}>
              <Text style={styles.footerHighlight} numberOfLines={1}>
                {loggedMealsCount} <Text style={styles.footerTarget}>/ 4 meals</Text>
              </Text>
            </View>
            <View style={styles.miniTrack}>
              <View
                style={[
                  styles.miniFill,
                  {
                    width: `${Math.min(100, Math.round((loggedMealsCount / 4) * 100))}%`,
                    backgroundColor: NeuTheme.colors.emerald,
                  },
                ]}
              />
            </View>
          </View>
        </NeuCard>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  tileWrapper: {
    flex: 1,
  },
  tileCard: {
    minHeight: 154,
    justifyContent: 'space-between',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NeuTheme.colors.recessedWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBody: {
    marginVertical: 4,
  },
  moduleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    backgroundColor: NeuTheme.colors.amberBg,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  moduleTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.2,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  tileSubtitle: {
    fontSize: 10.5,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  tileFooter: {
    width: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  footerHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
  },
  footerTarget: {
    fontSize: 10.5,
    fontWeight: '600',
    color: NeuTheme.colors.textMuted,
  },
  miniTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: NeuTheme.colors.recessedDark,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },
});
