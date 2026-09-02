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

  const getGoalDisplay = (goal?: string) => {
    switch (goal) {
      case 'WEIGHT_LOSS':
        return 'Weight Loss Deficit';
      case 'MUSCLE_GAIN':
        return 'Hypertrophy Surplus';
      case 'MAINTENANCE':
        return 'Caloric Maintenance';
      default:
        return 'General Fitness';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top App Bar */}
        <View style={styles.appBar}>
          <View>
            <Text style={styles.appTitle}>FITPASS CORE</Text>
            <Text style={styles.userGreeting}>
              Hello, {profile?.full_name || authUser?.email?.split('@')[0] || 'Athlete'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Status Chip */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>AUTHENTICATED & ONBOARDED • WEEKS 1 & 2 READY</Text>
        </View>

        {/* Biometrics Assessment Summary Card */}
        <View style={styles.metricHeroCard}>
          <View style={styles.metricHeroHeader}>
            <Text style={styles.metricHeroTitle}>ACTIVE BIOMETRIC BASELINE</Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {getGoalDisplay(latestAssessment?.target_goal)}
              </Text>
            </View>
          </View>

          <View style={styles.metricStatsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>BODY MASS INDEX</Text>
              <Text style={styles.statValue}>
                {latestAssessment?.bmi ? Number(latestAssessment.bmi).toFixed(1) : '--'}
              </Text>
              <Text style={styles.statSub}>Quetelet Index</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>BASAL METABOLIC RATE</Text>
              <Text style={styles.statValue}>
                {latestAssessment?.bmr ? Math.round(Number(latestAssessment.bmr)) : '--'}
              </Text>
              <Text style={styles.statSub}>kcal / day base</Text>
            </View>
          </View>

          {/* Detailed stats chips */}
          <View style={styles.chipsContainer}>
            <View style={styles.detailChip}>
              <Text style={styles.detailChipLabel}>Height:</Text>
              <Text style={styles.detailChipValue}>{latestAssessment?.height_cm} cm</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailChipLabel}>Weight:</Text>
              <Text style={styles.detailChipValue}>{latestAssessment?.weight_kg} kg</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailChipLabel}>Sex:</Text>
              <Text style={styles.detailChipValue}>{latestAssessment?.gender}</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailChipLabel}>Age:</Text>
              <Text style={styles.detailChipValue}>{latestAssessment?.age} yrs</Text>
            </View>
          </View>
        </View>

        {/* Architecture Modules Verification Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SYSTEM MODULES</Text>
        </View>

        <View style={styles.modulesCard}>
          <View style={styles.moduleRow}>
            <View style={styles.moduleIconContainer}>
              <Text style={styles.moduleIconText}>TS</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleName}>@fitness/types</Text>
              <Text style={styles.moduleDesc}>Shared domain entities & Supabase DDL types</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>LINKED</Text>
            </View>
          </View>

          <View style={styles.moduleSeparator} />

          <View style={styles.moduleRow}>
            <View style={styles.moduleIconContainer}>
              <Text style={styles.moduleIconText}>FX</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleName}>@fitness/utils</Text>
              <Text style={styles.moduleDesc}>Mifflin-St Jeor & BMI calculation engines</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>LINKED</Text>
            </View>
          </View>

          <View style={styles.moduleSeparator} />

          <View style={styles.moduleRow}>
            <View style={styles.moduleIconContainer}>
              <Text style={styles.moduleIconText}>PG</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleName}>Supabase PostgreSQL + RLS</Text>
              <Text style={styles.moduleDesc}>Auth triggers, cascade constraints & secure policies</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACTIONS</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(onboarding)/assessment')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Recalibrate Biometric Assessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  userGreeting: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  signOutButtonText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricHeroCard: {
    backgroundColor: '#131B2E',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
  },
  metricHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricHeroTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  goalPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  goalPillText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  metricStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D16',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  statSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#1E293B',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    flexDirection: 'row',
    backgroundColor: '#090D16',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  detailChipLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  detailChipValue: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modulesCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  moduleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIconText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '800',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  moduleDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccessText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  moduleSeparator: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 10,
  },
  actionButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
});
