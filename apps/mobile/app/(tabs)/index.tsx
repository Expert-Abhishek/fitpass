import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Flame,
  Activity,
  HeartPulse,
  Dumbbell,
  Sparkles,
  LogOut,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, authUser, latestAssessment, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const getGoalInfo = (goal?: string) => {
    switch (goal) {
      case 'WEIGHT_LOSS':
        return { label: 'Fat Loss Deficit', color: '#F59E0B', icon: Flame };
      case 'MUSCLE_GAIN':
        return { label: 'Hypertrophy Surplus', color: '#10B981', icon: Dumbbell };
      case 'MAINTENANCE':
        return { label: 'Metabolic Balance', color: '#06B6D4', icon: HeartPulse };
      default:
        return { label: 'Custom Blueprint', color: '#818CF8', icon: Zap };
    }
  };

  const goalInfo = getGoalInfo(latestAssessment?.target_goal);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mobileContainer}>
          {/* Top App Bar */}
          <View style={styles.appBar}>
            <View style={styles.brandGroup}>
              <View style={styles.brandIcon}>
                <Flame size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.brandTitle}>FITPASS CORE</Text>
                <Text style={styles.userName}>
                  {profile?.full_name || authUser?.email?.split('@')[0] || 'Athlete'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.logoutBtn}
              activeOpacity={0.8}
            >
              <LogOut size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Motivational Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusCardTop}>
              <View style={styles.statusBadgeGroup}>
                <Sparkles size={13} color="#34D399" />
                <Text style={styles.statusBadgeText}>ACTIVE BLUEPRINT CALIBRATED</Text>
              </View>
              <View style={[styles.goalTag, { backgroundColor: '#11151F' }]}>
                <Text style={[styles.goalTagText, { color: goalInfo.color }]}>
                  {goalInfo.label}
                </Text>
              </View>
            </View>
            <Text style={styles.statusDesc}>
              Your personalized metabolic targets and workouts are synchronized with Supabase PostgreSQL.
            </Text>
          </View>

          {/* Biometrics Summary Card */}
          <View style={styles.metricsHeroCard}>
            <Text style={styles.cardHeaderTitle}>METABOLIC SNAPSHOT</Text>

            <View style={styles.metricsGrid}>
              {/* BMR Card */}
              <View style={styles.metricGridItem}>
                <View style={styles.metricGridHeader}>
                  <Flame size={16} color="#10B981" />
                  <Text style={styles.metricGridTag}>RESTING BURN</Text>
                </View>
                <Text style={styles.metricGridValue}>
                  {latestAssessment?.bmr ? Math.round(Number(latestAssessment.bmr)) : '--'}
                </Text>
                <Text style={styles.metricGridUnit}>kcal / day base</Text>
              </View>

              {/* BMI Card */}
              <View style={styles.metricGridItem}>
                <View style={styles.metricGridHeader}>
                  <Activity size={16} color="#38BDF8" />
                  <Text style={styles.metricGridTag}>BMI SCORE</Text>
                </View>
                <Text style={styles.metricGridValue}>
                  {latestAssessment?.bmi ? Number(latestAssessment.bmi).toFixed(1) : '--'}
                </Text>
                <Text style={[styles.metricGridUnit, { color: '#34D399', fontWeight: '800' }]}>
                  Quetelet Index
                </Text>
              </View>
            </View>

            {/* Quick Metrics Chips */}
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Height:</Text>
                <Text style={styles.chipValue}>{latestAssessment?.height_cm} cm</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Weight:</Text>
                <Text style={styles.chipValue}>{latestAssessment?.weight_kg} kg</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Sex:</Text>
                <Text style={styles.chipValue}>{latestAssessment?.gender}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Age:</Text>
                <Text style={styles.chipValue}>{latestAssessment?.age} yrs</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.cardHeaderTitle}>ONBOARDING ACTIONS</Text>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/assessment')}
            style={styles.actionCard}
            activeOpacity={0.85}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <TrendingUp size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.actionTitle}>Recalibrate Biometrics</Text>
                <Text style={styles.actionSubtitle}>Update your weight, height, or goal</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#161B26',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 440,
    marginHorizontal: 'auto',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  brandTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  statusCard: {
    backgroundColor: '#161B26',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(52, 211, 153, 0.3)',
    borderLeftColor: 'rgba(52, 211, 153, 0.2)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  statusCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  goalTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
  },
  goalTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  metricsHeroCard: {
    backgroundColor: '#161B26',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  cardHeaderTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricGridItem: {
    flex: 1,
    backgroundColor: '#11151F',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 14,
  },
  metricGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricGridTag: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricGridValue: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
  },
  metricGridUnit: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  chipLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  chipValue: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  actionCard: {
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
  actionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  actionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
});
