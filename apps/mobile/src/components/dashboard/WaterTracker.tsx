import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Droplet, Plus, Minus } from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

interface WaterTrackerProps {
  currentMl: number;
  targetMl?: number;
  onAddWater: (amountMl: number) => void;
}

export default function WaterTracker({
  currentMl = 0,
  targetMl = 3000,
  onAddWater,
}: WaterTrackerProps) {
  const safeTarget = targetMl > 0 ? targetMl : 3000;
  const percent = Math.min(100, Math.max(0, Math.round((currentMl / safeTarget) * 100)));
  const animatedWidth = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: percent,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [percent, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.waterIconCircle}>
            <Droplet size={17} color="#0284C7" fill="#0284C7" />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.badgeText}>SMART HYDRATION</Text>
            <Text style={styles.title} numberOfLines={1}>Water Intake</Text>
          </View>
        </View>

        <View style={styles.statsTag}>
          <Text style={styles.statsCurrent}>{currentMl}</Text>
          <Text style={styles.statsTarget}>/ {safeTarget} mL</Text>
        </View>
      </View>

      {/* Inset Water Reservoir Bar */}
      <NeuCard variant="inset" padding={5} borderRadius={14} style={styles.reservoirWell}>
        <View style={styles.trackBackground}>
          <Animated.View
            style={[
              styles.waterFill,
              {
                width: widthInterpolation,
              },
            ]}
          >
            <View style={styles.waveEffect} />
          </Animated.View>
        </View>
      </NeuCard>

      {/* Footer Controls & Quick Buttons */}
      <View style={styles.footerRow}>
        <Text style={styles.statusText} numberOfLines={1}>
          💧 <Text style={{ fontWeight: '800', color: NeuTheme.colors.textPrimary }}>{percent}%</Text> hydrated
        </Text>

        <View style={styles.buttonsGroup}>
          {currentMl > 0 && (
            <TouchableOpacity
              onPress={() => onAddWater(-250)}
              style={styles.controlBtnMinus}
              activeOpacity={0.8}
            >
              <Minus size={12} color={NeuTheme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => onAddWater(250)}
            style={styles.controlBtnPlus}
            activeOpacity={0.85}
          >
            <Plus size={11} color="#0284C7" strokeWidth={2.8} />
            <Text style={styles.controlBtnText}>+250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onAddWater(500)}
            style={[styles.controlBtnPlus, { backgroundColor: '#BAE6FD' }]}
            activeOpacity={0.85}
          >
            <Plus size={11} color="#0369A1" strokeWidth={2.8} />
            <Text style={[styles.controlBtnText, { color: '#0369A1' }]}>+500ml</Text>
          </TouchableOpacity>
        </View>
      </View>
    </NeuCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 6,
  },
  waterIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: NeuTheme.colors.skyBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  statsTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statsCurrent: {
    fontSize: 17,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
  },
  statsTarget: {
    fontSize: 11.5,
    fontWeight: '700',
    color: NeuTheme.colors.textMuted,
  },
  reservoirWell: {
    marginBottom: 10,
  },
  trackBackground: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: NeuTheme.colors.recessedDark,
    overflow: 'hidden',
  },
  waterFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 7,
  },
  waveEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11.5,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
    marginRight: 6,
  },
  buttonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlBtnMinus: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: NeuTheme.colors.recessedWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnPlus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.skyBlueBg,
    paddingVertical: 4.5,
    paddingHorizontal: 7.5,
    borderRadius: 10,
    gap: 2.5,
  },
  controlBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
  },
});
