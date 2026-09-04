import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Bot } from 'lucide-react-native';
import { NeuTheme } from '../theme/neumorphic';
import NeuCard from './neumorphic/NeuCard';

interface CoachTipProps {
  message: string;
  coachName?: string;
  badge?: string;
}

export function CoachTip({
  message,
  coachName = 'Coach Aria',
  badge = 'AI COACH INSIGHT',
}: CoachTipProps) {
  return (
    <NeuCard variant="raised" padding={14} borderRadius={18} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.coachBadge}>
          <View style={styles.avatar}>
            <Bot size={15} color={NeuTheme.colors.emerald} />
          </View>
          <Text style={styles.coachName}>{coachName}</Text>
        </View>

        <View style={styles.tag}>
          <Sparkles size={10} color="#047857" />
          <Text style={styles.tagText}>{badge}</Text>
        </View>
      </View>

      <Text style={styles.message}>"{message}"</Text>
    </NeuCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NeuTheme.colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachName: {
    color: NeuTheme.colors.textPrimary,
    fontWeight: '800',
    fontSize: 13.5,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  tagText: {
    color: '#047857',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  message: {
    color: NeuTheme.colors.textPrimary,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
});
