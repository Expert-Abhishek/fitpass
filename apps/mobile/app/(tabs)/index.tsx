import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NeuTheme } from '../../src/theme/neumorphic';
import { useAuthStore } from '../../src/stores/authStore';
import DashboardHeader from '../../src/components/dashboard/DashboardHeader';
import HeroActionTiles from '../../src/components/dashboard/HeroActionTiles';
import MacroBreakdown, { MacroData } from '../../src/components/dashboard/MacroBreakdown';
import WaterTracker from '../../src/components/dashboard/WaterTracker';
import EnergyBalanceChart from '../../src/components/dashboard/EnergyBalanceChart';
import AIPostureInsightChip from '../../src/components/dashboard/AIPostureInsightChip';
import AddMealModal, { NewMealPayload } from '../../src/components/dashboard/AddMealModal';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, authUser, latestAssessment, signOut } = useAuthStore();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Dynamic Macro & Calorie State
  const targetCalories = latestAssessment?.bmr
    ? Math.round(Number(latestAssessment.bmr) * 1.35)
    : 2400;

  const [macroData, setMacroData] = useState<MacroData>({
    caloriesConsumed: 1840,
    caloriesTarget: targetCalories,
    caloriesBurned: 620,
    protein: { current: 125, target: 160 },
    carbs: { current: 195, target: 240 },
    fats: { current: 52, target: 70 },
    fiber: { current: 28, target: 35 },
  });

  // Water intake state
  const [waterMl, setWaterMl] = useState<number>(1750);
  const targetWaterMl = 3000;

  // Add Meal modal state
  const [isAddMealVisible, setIsAddMealVisible] = useState(false);
  const [loggedMealsCount, setLoggedMealsCount] = useState(2);

  // Sign out confirmation
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of FitPass?', [
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

  // Water increment handler
  const handleAddWater = (deltaMl: number) => {
    setWaterMl((prev) => Math.max(0, Math.min(6000, prev + deltaMl)));
  };

  // New meal logging handler
  const handleSaveMeal = (meal: NewMealPayload) => {
    setMacroData((prev) => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + meal.calories,
      protein: { ...prev.protein, current: prev.protein.current + meal.protein },
      carbs: { ...prev.carbs, current: prev.carbs.current + meal.carbs },
      fats: { ...prev.fats, current: prev.fats.current + meal.fats },
    }));
    setLoggedMealsCount((prev) => prev + 1);

    Alert.alert('Meal Logged! 🎉', `${meal.name} (+${meal.calories} kcal) added to your blueprint.`);
  };

  const handleStartWorkout = () => {
    Alert.alert(
      'AI Workout Engine',
      'Module 2 Realtime Pose Detection & Rep Counter is ready to calibrate your movements.'
    );
  };

  const handleSnapPhotoAI = () => {
    Alert.alert(
      'AI Meal Scanner',
      'Module 3 Computer Vision meal scanning will auto-estimate food volume, calories, and macros.'
    );
  };

  const athleteName = profile?.full_name || authUser?.email?.split('@')[0] || 'Athlete';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mobileContainer}>
          {/* Header with Greeting, Streak & Date Carousel */}
          <DashboardHeader
            userName={athleteName}
            streakDays={7}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSignOut={handleSignOut}
          />

          {/* Primary Hero Action Tiles: Workouts & Diet */}
          <HeroActionTiles
            onStartWorkout={handleStartWorkout}
            onOpenDietTracker={() => setIsAddMealVisible(true)}
            completedRepsToday={45}
            targetRepsToday={80}
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

          {/* Burn vs Intake Energy Balance SVG Chart (Module 5) */}
          <EnergyBalanceChart />

          {/* AI Posture & Biomechanical Form Insight Chip */}
          <AIPostureInsightChip />
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
