import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Bot } from 'lucide-react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.coachBadge}>
          <View style={styles.avatar}>
            <Bot size={16} color="#10B981" />
          </View>
          <Text style={styles.coachName}>{coachName}</Text>
        </View>

        <View style={styles.tag}>
          <Sparkles size={11} color="#34D399" />
          <Text style={styles.tagText}>{badge}</Text>
        </View>
      </View>

      <Text style={styles.message}>"{message}"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161B26',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#0A0D13',
    borderRightColor: '#0A0D13',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachName: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  tagText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  message: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});
