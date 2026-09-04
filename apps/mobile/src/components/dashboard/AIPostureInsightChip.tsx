import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Sparkles, RefreshCw, ChevronRight, Activity } from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

const INSIGHTS = [
  {
    topic: 'SQUAT MECHANICS',
    tip: 'Keep knee-ankle alignment stable during descent to maximize glute activation and protect your patellar tendon.',
  },
  {
    topic: 'PUSH-UP CADENCE',
    tip: 'Lock your core and maintain a 45° elbow angle relative to your torso for optimal chest torque.',
  },
  {
    topic: 'DEADLIFT SPINE TRACKING',
    tip: 'Maintain neutral cervical spine alignment; drive straight through your heels rather than pulling with your lower back.',
  },
  {
    topic: 'POST-WORKOUT HYDRATION',
    tip: 'Drinking 500mL of water within 30 min of exercise accelerates metabolic glycogen re-synthesis.',
  },
];

export default function AIPostureInsightChip() {
  const [index, setIndex] = useState(0);

  const handleNextTip = () => {
    setIndex((prev) => (prev + 1) % INSIGHTS.length);
  };

  const current = INSIGHTS[index];

  return (
    <TouchableOpacity onPress={handleNextTip} activeOpacity={0.88}>
      <NeuCard variant="raised" padding={14} borderRadius={20} style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.badgeRow}>
            <View style={styles.iconCircle}>
              <Activity size={14} color={NeuTheme.colors.violet} />
            </View>
            <Text style={styles.badgeText}>AI FORM INSIGHT • {current.topic}</Text>
          </View>

          <View style={styles.nextPill}>
            <RefreshCw size={11} color={NeuTheme.colors.textMuted} />
            <Text style={styles.nextText}>Tap next</Text>
          </View>
        </View>

        <Text style={styles.tipText}>{current.tip}</Text>
      </NeuCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: NeuTheme.colors.violetBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: NeuTheme.colors.violet,
    letterSpacing: 0.6,
  },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  nextText: {
    fontSize: 10,
    color: NeuTheme.colors.textMuted,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 12,
    color: NeuTheme.colors.textPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
});
