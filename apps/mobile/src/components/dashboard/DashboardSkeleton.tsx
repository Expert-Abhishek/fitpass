import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

export default function DashboardSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.avatarSkeleton, { opacity: pulseAnim }]} />
          <View style={{ gap: 6 }}>
            <Animated.View style={[styles.textLineSmall, { width: 90, opacity: pulseAnim }]} />
            <Animated.View style={[styles.textLineMedium, { width: 140, opacity: pulseAnim }]} />
          </View>
        </View>
        <Animated.View style={[styles.streakBadgeSkeleton, { opacity: pulseAnim }]} />
      </View>

      {/* Hero Tiles Skeleton */}
      <View style={styles.heroRow}>
        <NeuCard variant="raised" padding={12} borderRadius={20} style={styles.heroTile}>
          <View style={styles.tileTop}>
            <Animated.View style={[styles.iconSkeleton, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.badgeSkeleton, { width: 50, opacity: pulseAnim }]} />
          </View>
          <View style={{ gap: 5, marginVertical: 8 }}>
            <Animated.View style={[styles.textLineSmall, { width: 70, opacity: pulseAnim }]} />
            <Animated.View style={[styles.textLineMedium, { width: 95, opacity: pulseAnim }]} />
          </View>
          <Animated.View style={[styles.miniTrackSkeleton, { opacity: pulseAnim }]} />
        </NeuCard>

        <NeuCard variant="raised" padding={12} borderRadius={20} style={styles.heroTile}>
          <View style={styles.tileTop}>
            <Animated.View style={[styles.iconSkeleton, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.badgeSkeleton, { width: 50, opacity: pulseAnim }]} />
          </View>
          <View style={{ gap: 5, marginVertical: 8 }}>
            <Animated.View style={[styles.textLineSmall, { width: 70, opacity: pulseAnim }]} />
            <Animated.View style={[styles.textLineMedium, { width: 95, opacity: pulseAnim }]} />
          </View>
          <Animated.View style={[styles.miniTrackSkeleton, { opacity: pulseAnim }]} />
        </NeuCard>
      </View>

      {/* Macro Breakdown Skeleton */}
      <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.cardSkeleton}>
        <View style={styles.cardHeader}>
          <View style={{ gap: 4 }}>
            <Animated.View style={[styles.textLineSmall, { width: 110, opacity: pulseAnim }]} />
            <Animated.View style={[styles.textLineMedium, { width: 150, opacity: pulseAnim }]} />
          </View>
          <Animated.View style={[styles.btnSkeleton, { opacity: pulseAnim }]} />
        </View>

        <NeuCard variant="inset" padding={12} borderRadius={16} style={{ marginBottom: 12 }}>
          <View style={{ gap: 6, marginBottom: 8 }}>
            <Animated.View style={[styles.textLineSmall, { width: 90, opacity: pulseAnim }]} />
            <Animated.View style={[styles.textLineLarge, { width: 160, opacity: pulseAnim }]} />
          </View>
          <Animated.View style={[styles.trackSkeleton, { opacity: pulseAnim }]} />
        </NeuCard>

        <View style={styles.macroGrid}>
          {[1, 2, 3, 4].map((i) => (
            <NeuCard key={i} variant="raised" padding={8} borderRadius={14} style={styles.macroPill}>
              <Animated.View style={[styles.dotSkeleton, { opacity: pulseAnim }]} />
              <Animated.View style={[styles.textLineSmall, { width: 35, opacity: pulseAnim }]} />
              <Animated.View style={[styles.textLineMedium, { width: 45, opacity: pulseAnim }]} />
            </NeuCard>
          ))}
        </View>
      </NeuCard>

      {/* Water Skeleton */}
      <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.cardSkeleton}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Animated.View style={[styles.iconSkeleton, { opacity: pulseAnim }]} />
            <View style={{ gap: 4 }}>
              <Animated.View style={[styles.textLineSmall, { width: 100, opacity: pulseAnim }]} />
              <Animated.View style={[styles.textLineMedium, { width: 120, opacity: pulseAnim }]} />
            </View>
          </View>
          <Animated.View style={[styles.textLineMedium, { width: 80, opacity: pulseAnim }]} />
        </View>
        <NeuCard variant="inset" padding={6} borderRadius={14} style={{ marginTop: 6 }}>
          <Animated.View style={[styles.waterTrackSkeleton, { opacity: pulseAnim }]} />
        </NeuCard>
      </NeuCard>

      {/* Chart Skeleton */}
      <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.cardSkeleton}>
        <View style={styles.cardHeader}>
          <View style={{ gap: 4 }}>
            <Animated.View style={[styles.textLineSmall, { width: 110, opacity: pulseAnim }]} />
            <Animated.View style={[styles.textLineMedium, { width: 130, opacity: pulseAnim }]} />
          </View>
          <Animated.View style={[styles.timeframeSkeleton, { opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.chartBodySkeleton, { opacity: pulseAnim }]} />
      </NeuCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSkeleton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  streakBadgeSkeleton: {
    width: 86,
    height: 32,
    borderRadius: 16,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  heroTile: {
    flex: 1,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  badgeSkeleton: {
    height: 18,
    borderRadius: 6,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  miniTrackSkeleton: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
  cardSkeleton: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSkeleton: {
    width: 80,
    height: 30,
    borderRadius: 10,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  trackSkeleton: {
    width: '100%',
    height: 9,
    borderRadius: 4.5,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  macroPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  dotSkeleton: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
  waterTrackSkeleton: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
  timeframeSkeleton: {
    width: 120,
    height: 28,
    borderRadius: 10,
    backgroundColor: NeuTheme.colors.recessedWell,
  },
  chartBodySkeleton: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: NeuTheme.colors.recessedWell,
    marginTop: 6,
  },
  textLineSmall: {
    height: 10,
    borderRadius: 5,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
  textLineMedium: {
    height: 14,
    borderRadius: 7,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
  textLineLarge: {
    height: 22,
    borderRadius: 11,
    backgroundColor: NeuTheme.colors.recessedDark,
  },
});
