import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Flame, LogOut, Sparkles, User, Calendar as CalendarIcon } from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

interface DashboardHeaderProps {
  userName: string;
  streakDays?: number;
  onSignOut?: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function DashboardHeader({
  userName,
  streakDays = 7,
  onSignOut,
  selectedDate,
  onSelectDate,
}: DashboardHeaderProps) {
  // Generate 7-day strip (2 days before, today, 4 days ahead)
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const daysList = getDaysArray();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.userSection}>
          <View style={styles.avatarPill}>
            <User size={18} color={NeuTheme.colors.emerald} />
          </View>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText}>{userName || 'Athlete'} 👋</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          {/* Streak Counter Badge */}
          <NeuCard variant="raised" padding={6} borderRadius={20} style={styles.streakBadge}>
            <Flame size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>{streakDays}d Streak</Text>
          </NeuCard>

          {/* Sign Out Action */}
          {onSignOut && (
            <TouchableOpacity
              onPress={onSignOut}
              style={styles.iconBtn}
              activeOpacity={0.8}
            >
              <LogOut size={16} color={NeuTheme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Carousel Strip */}
      <View style={styles.dateCarouselWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContent}
        >
          {daysList.map((d, index) => {
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());

            return (
              <TouchableOpacity
                key={index}
                onPress={() => onSelectDate(d)}
                activeOpacity={0.85}
                style={[
                  styles.dayCard,
                  isSelected ? styles.dayCardSelected : styles.dayCardNormal,
                ]}
              >
                <Text
                  style={[
                    styles.dayNameText,
                    isSelected && styles.dayNameTextSelected,
                  ]}
                >
                  {dayNames[d.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && styles.dayNumberTextSelected,
                  ]}
                >
                  {d.getDate()}
                </Text>

                {isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      isSelected && { backgroundColor: '#FFFFFF' },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
  },
  greetingText: {
    fontSize: 12.5,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 18,
    color: NeuTheme.colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  dateCarouselWrapper: {
    marginTop: 2,
  },
  dateScrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  dayCard: {
    width: 52,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardNormal: {
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(163, 177, 198, 0.35)',
    borderRightColor: 'rgba(163, 177, 198, 0.35)',
  },
  dayCardSelected: {
    backgroundColor: NeuTheme.colors.emerald,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dayNameText: {
    fontSize: 10,
    fontWeight: '700',
    color: NeuTheme.colors.textMuted,
    marginBottom: 3,
  },
  dayNameTextSelected: {
    color: '#052E16',
    fontWeight: '800',
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: NeuTheme.colors.emerald,
    marginTop: 3,
  },
});
