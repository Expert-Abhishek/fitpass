import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Flame, LogOut, User } from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

interface DashboardHeaderProps {
  userName: string;
  streakDays?: number;
  onSignOut?: () => void;
}

export default function DashboardHeader({
  userName,
  streakDays = 0,
  onSignOut,
}: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* User Avatar & Greeting */}
        <View style={styles.userSection}>
          <View style={styles.avatarPill}>
            <User size={19} color={NeuTheme.colors.emerald} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText} numberOfLines={1}>
              {userName || 'Athlete'} 👋
            </Text>
          </View>
        </View>

        {/* Dynamic Streak Badge & Sign Out Button */}
        <View style={styles.actionSection}>
          <NeuCard variant="raised" padding={6} borderRadius={18} style={styles.streakBadge}>
            <Flame
              size={16}
              color={streakDays > 0 ? '#F59E0B' : NeuTheme.colors.textMuted}
              fill={streakDays > 0 ? '#F59E0B' : 'transparent'}
            />
            <Text
              style={[
                styles.streakText,
                streakDays === 0 && { color: NeuTheme.colors.textSecondary },
              ]}
            >
              {streakDays}d Streak
            </Text>
          </NeuCard>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
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
    fontSize: 12,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 17.5,
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
    paddingVertical: 5,
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
});
