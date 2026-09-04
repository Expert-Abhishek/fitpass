import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeuTheme } from '../../src/theme/neumorphic';
import { useAuthStore } from '../../src/stores/authStore';
import { useDashboardStore, NewMealPayload } from '../../src/stores/dashboardStore';
import DashboardHeader from '../../src/components/dashboard/DashboardHeader';
import HeroActionTiles from '../../src/components/dashboard/HeroActionTiles';
import MacroBreakdown from '../../src/components/dashboard/MacroBreakdown';
import WaterTracker from '../../src/components/dashboard/WaterTracker';
import EnergyBalanceChart from '../../src/components/dashboard/EnergyBalanceChart';
import AIPostureInsightChip from '../../src/components/dashboard/AIPostureInsightChip';
import AddMealModal from '../../src/components/dashboard/AddMealModal';
import DashboardSkeleton from '../../src/components/dashboard/DashboardSkeleton';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, authUser, latestAssessment, signOut, isInitialized } = useAuthStore();

  const {
    isLoading,
    isRefreshing,
    streakDays,
    macroData,
    waterMl,
    targetWaterMl,
    completedRepsToday,
    targetRepsToday,
    loggedMealsCount,
    chartData,
    fetchDashboardData,
    logMeal,
    logWater,
    removeWater,
  } = useDashboardStore();

  const [isAddMealVisible, setIsAddMealVisible] = useState(false);

  // Dynamic Assessment parameters
  const bmr = latestAssessment?.bmr ? Number(latestAssessment.bmr) : 1750;
  const targetGoal = latestAssessment?.target_goal || 'MAINTENANCE';
  const weightKg = latestAssessment?.weight_kg ? Number(latestAssessment.weight_kg) : 70;

  // Load Dashboard data on mount or when user/assessment changes
  useEffect(() => {
    if (authUser?.id) {
      fetchDashboardData(authUser.id, bmr, targetGoal, weightKg, false);
    }
  }, [authUser?.id, bmr, targetGoal, weightKg]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    if (authUser?.id) {
      fetchDashboardData(authUser.id, bmr, targetGoal, weightKg, true);
    }
  }, [authUser?.id, bmr, targetGoal, weightKg]);

  // Sign out confirmation
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of FitPass?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  // Water increment / decrement handler
  const handleAddWater = (deltaMl: number) => {
    if (!authUser?.id) return;
    if (deltaMl > 0) {
      logWater(authUser.id, deltaMl);
    } else {
      removeWater(authUser.id, Math.abs(deltaMl));
    }
  };

  // New meal logging handler with backend persistence
  const handleSaveMeal = async (meal: NewMealPayload) => {
    if (!authUser?.id) {
      Alert.alert('Session Expired', 'Please sign in again to record meals.');
      return;
    }

    const result = await logMeal(authUser.id, meal);
    if (result.success) {
      Alert.alert('Meal Logged! 🎉', `${meal.name} (+${meal.calories} kcal) added to your daily blueprint.`);
    } else {
      Alert.alert('Save Failed', result.error || 'Could not record meal.');
    }
  };

  const handleStartWorkout = () => {
    Alert.alert(
      'AI Workout Engine',
      'Module 2 Realtime Pose Detection & Rep Counter is calibrated and ready.'
    );
  };

  const handleSnapPhotoAI = () => {
    Alert.alert(
      'AI Meal Scanner',
      'Module 3 Computer Vision meal scanning will auto-estimate portions, calories, and macros.'
    );
  };

  const athleteName = profile?.full_name || authUser?.email?.split('@')[0] || 'Athlete';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={NeuTheme.colors.emerald}
            colors={[NeuTheme.colors.emerald]}
          />
        }
      >
        <View style={styles.mobileContainer}>
          {isLoading && !isRefreshing ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Header with Greeting & Dynamic Streak Badge */}
              <DashboardHeader
                userName={athleteName}
                streakDays={streakDays}
                onSignOut={handleSignOut}
              />

              {/* Primary Hero Action Tiles: Workouts & Diet */}
              <HeroActionTiles
                onStartWorkout={handleStartWorkout}
                onOpenDietTracker={() => setIsAddMealVisible(true)}
                completedRepsToday={completedRepsToday}
                targetRepsToday={targetRepsToday}
                loggedMealsCount={loggedMealsCount}
              />

              {/* Nutrition & Macro Overview Section */}
              <MacroBreakdown
                data={macroData}
                onAddMealPress={() => setIsAddMealVisible(true)}
              />

              {/* Smart Water Intake Tracker */}
              <WaterTracker
                currentMl={waterMl}
                targetMl={targetWaterMl}
                onAddWater={handleAddWater}
              />

              {/* Real-time Burn vs Intake Energy Balance SVG Chart */}
              <EnergyBalanceChart data={chartData} />

              {/* AI Posture & Biomechanical Form Insight Chip */}
              <AIPostureInsightChip />
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Meal Bottom Sheet Modal */}
      <AddMealModal
        visible={isAddMealVisible}
        onClose={() => setIsAddMealVisible(false)}
        onSaveMeal={handleSaveMeal}
        onSnapPhotoAI={handleSnapPhotoAI}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeuTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 440,
    marginHorizontal: 'auto',
  },
});
