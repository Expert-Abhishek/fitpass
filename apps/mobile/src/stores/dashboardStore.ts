import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { MealLog, WorkoutSession, WaterLog, TargetGoal } from '@fitness/types';

export interface MacroData {
  caloriesConsumed: number;
  caloriesTarget: number;
  caloriesBurned: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
  fiber: { current: number; target: number };
}

export interface ChartPoint {
  label: string;
  intake: number;
  burn: number;
}

export interface NewMealPayload {
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DashboardState {
  isLoading: boolean;
  isRefreshing: boolean;
  streakDays: number;
  macroData: MacroData;
  waterMl: number;
  targetWaterMl: number;
  completedRepsToday: number;
  targetRepsToday: number;
  loggedMealsCount: number;
  chartData: {
    day: ChartPoint[];
    week: ChartPoint[];
    month: ChartPoint[];
  };
  error: string | null;

  // Actions
  fetchDashboardData: (
    userId: string,
    bmr?: number,
    targetGoal?: TargetGoal,
    weightKg?: number,
    isRefresh?: boolean
  ) => Promise<void>;
  logMeal: (
    userId: string,
    meal: NewMealPayload
  ) => Promise<{ success: boolean; error?: string }>;
  logWater: (
    userId: string,
    deltaMl: number
  ) => Promise<{ success: boolean; error?: string }>;
  removeWater: (
    userId: string,
    deltaMl: number
  ) => Promise<{ success: boolean; error?: string }>;
}

// -----------------------------------------------------------------------------
// Helper: Format Date YYYY-MM-DD
// -----------------------------------------------------------------------------
const toDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// -----------------------------------------------------------------------------
// Helper: Calculate Target Nutrition & Water from Biometrics
// -----------------------------------------------------------------------------
export const calculateNutritionTargets = (
  bmr: number = 1750,
  goal: TargetGoal = 'MAINTENANCE',
  weightKg: number = 70
) => {
  const baselineMaintenance = bmr * 1.35;
  let targetCalories = Math.round(baselineMaintenance);

  if (goal === 'WEIGHT_LOSS') {
    targetCalories = Math.max(1200, Math.round(baselineMaintenance - 400));
  } else if (goal === 'MUSCLE_GAIN') {
    targetCalories = Math.round(baselineMaintenance + 350);
  }

  let proteinFactor = 1.6;
  if (goal === 'MUSCLE_GAIN') proteinFactor = 2.0;
  if (goal === 'WEIGHT_LOSS') proteinFactor = 1.8;

  const targetProtein = Math.round(weightKg * proteinFactor);
  const targetFats = Math.round((targetCalories * 0.25) / 9);
  const remainingKcal = Math.max(0, targetCalories - (targetProtein * 4 + targetFats * 9));
  const targetCarbs = Math.round(remainingKcal / 4);
  const targetFiber = Math.round((targetCalories / 1000) * 14);
  const targetWater = Math.max(2500, Math.round((weightKg * 35) / 100) * 100);

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
    targetFiber,
    targetWater,
  };
};

// -----------------------------------------------------------------------------
// Helper: Calculate Unbroken Meal Logging Streak
// -----------------------------------------------------------------------------
export const calculateMealStreak = (mealLogs: MealLog[]): number => {
  if (!mealLogs || mealLogs.length === 0) return 0;

  const loggedDays = new Set<string>();
  mealLogs.forEach((log) => {
    if (log.logged_at) {
      const d = new Date(log.logged_at);
      loggedDays.add(toDateKey(d));
    }
  });

  const now = new Date();
  const todayKey = toDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  let streak = 0;
  const cursor = new Date(now);

  if (loggedDays.has(todayKey)) {
    // Has logged today -> start counting backwards from today
    while (loggedDays.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else if (loggedDays.has(yesterdayKey)) {
    // Has not logged today yet, but logged yesterday -> streak is preserved from yesterday
    cursor.setDate(now.getDate() - 1);
    while (loggedDays.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else {
    // Missed yesterday and today -> streak reset
    streak = 0;
  }

  return streak;
};

// -----------------------------------------------------------------------------
// Helper: Build Real Multi-Timeframe Energy Balance Chart Data
// -----------------------------------------------------------------------------
export const buildEnergyChartData = (
  mealLogs: MealLog[],
  workoutSessions: WorkoutSession[],
  dailyBmr: number = 1750
): { day: ChartPoint[]; week: ChartPoint[]; month: ChartPoint[] } => {
  const now = new Date();

  // --- 1. DAY VIEW (5 buckets: 8AM, 12PM, 3PM, 6PM, 9PM) ---
  const todayKey = toDateKey(now);
  const todayMeals = mealLogs.filter((m) => toDateKey(new Date(m.logged_at)) === todayKey);
  const todayWorkouts = workoutSessions.filter((w) => toDateKey(new Date(w.created_at)) === todayKey);

  const dayBuckets: { label: string; minHour: number; maxHour: number; bmrWeight: number }[] = [
    { label: '8AM', minHour: 0, maxHour: 9, bmrWeight: 9 / 24 },
    { label: '12PM', minHour: 9, maxHour: 13, bmrWeight: 4 / 24 },
    { label: '3PM', minHour: 13, maxHour: 16, bmrWeight: 3 / 24 },
    { label: '6PM', minHour: 16, maxHour: 19, bmrWeight: 3 / 24 },
    { label: '9PM', minHour: 19, maxHour: 24, bmrWeight: 5 / 24 },
  ];

  const dayPoints: ChartPoint[] = dayBuckets.map((b) => {
    const intake = todayMeals
      .filter((m) => {
        const hour = new Date(m.logged_at).getHours();
        return hour >= b.minHour && hour < b.maxHour;
      })
      .reduce((sum, m) => sum + (m.calories || 0), 0);

    const workoutBurn = todayWorkouts
      .filter((w) => {
        const hour = new Date(w.created_at).getHours();
        return hour >= b.minHour && hour < b.maxHour;
      })
      .reduce((sum, w) => sum + (w.calories_burned || 0), 0);

    const burn = Math.round(dailyBmr * b.bmrWeight) + workoutBurn;
    return { label: b.label, intake, burn };
  });

  // --- 2. WEEK VIEW (Past 7 Days: Mon - Sun) ---
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekPoints: ChartPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const key = toDateKey(targetDate);
    const label = dayLabels[targetDate.getDay()];

    const intake = mealLogs
      .filter((m) => toDateKey(new Date(m.logged_at)) === key)
      .reduce((sum, m) => sum + (m.calories || 0), 0);

    const workoutBurn = workoutSessions
      .filter((w) => toDateKey(new Date(w.created_at)) === key)
      .reduce((sum, w) => sum + (w.calories_burned || 0), 0);

    const burn = intake > 0 || workoutBurn > 0 || i === 0 ? dailyBmr + workoutBurn : 0;
    weekPoints.push({ label, intake, burn: Math.round(burn) });
  }

  // --- 3. MONTH VIEW (Past 4 Weeks: Wk 1, Wk 2, Wk 3, Wk 4) ---
  const monthPoints: ChartPoint[] = [];
  for (let w = 3; w >= 0; w--) {
    const label = `Wk ${4 - w}`;
    const startDayOffset = w * 7 + 6;
    const endDayOffset = w * 7;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - startDayOffset);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setDate(now.getDate() - endDayOffset);
    endDate.setHours(23, 59, 59, 999);

    const intake = mealLogs
      .filter((m) => {
        const time = new Date(m.logged_at).getTime();
        return time >= startDate.getTime() && time <= endDate.getTime();
      })
      .reduce((sum, m) => sum + (m.calories || 0), 0);

    const workoutBurn = workoutSessions
      .filter((ws) => {
        const time = new Date(ws.created_at).getTime();
        return time >= startDate.getTime() && time <= endDate.getTime();
      })
      .reduce((sum, ws) => sum + (ws.calories_burned || 0), 0);

    const burn = intake > 0 || workoutBurn > 0 || w === 0 ? dailyBmr * 7 + workoutBurn : 0;
    monthPoints.push({ label, intake, burn: Math.round(burn) });
  }

  return {
    day: dayPoints,
    week: weekPoints,
    month: monthPoints,
  };
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  isLoading: true,
  isRefreshing: false,
  streakDays: 0,
  macroData: {
    caloriesConsumed: 0,
    caloriesTarget: 2200,
    caloriesBurned: 0,
    protein: { current: 0, target: 140 },
    carbs: { current: 0, target: 220 },
    fats: { current: 0, target: 65 },
    fiber: { current: 0, target: 30 },
  },
  waterMl: 0,
  targetWaterMl: 3000,
  completedRepsToday: 0,
  targetRepsToday: 60,
  loggedMealsCount: 0,
  chartData: {
    day: [],
    week: [],
    month: [],
  },
  error: null,

  // ---------------------------------------------------------------------------
  // Fetch Full Dynamic Dashboard Data from Supabase
  // ---------------------------------------------------------------------------
  fetchDashboardData: async (userId, bmr = 1750, targetGoal = 'MAINTENANCE', weightKg = 70, isRefresh = false) => {
    if (!userId) return;

    try {
      if (isRefresh) {
        set({ isRefreshing: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }

      const targets = calculateNutritionTargets(bmr, targetGoal, weightKg);
      const now = new Date();
      const todayKey = toDateKey(now);

      // Start date for 30-day historical chart queries
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const thirtyDaysIso = thirtyDaysAgo.toISOString();

      // 1. Fetch Meal Logs (past 30 days)
      const { data: mealLogsData, error: mealError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', thirtyDaysIso)
        .order('logged_at', { ascending: false });

      if (mealError) {
        console.warn('[DashboardStore] fetch meal logs error:', mealError.message);
      }

      const allMeals: MealLog[] = (mealLogsData as MealLog[]) || [];

      // 2. Fetch Workout Sessions (past 30 days)
      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysIso)
        .order('created_at', { ascending: false });

      if (workoutError) {
        console.warn('[DashboardStore] fetch workout sessions error:', workoutError.message);
      }

      const allWorkouts: WorkoutSession[] = (workoutData as WorkoutSession[]) || [];

      // 3. Fetch Water Logs (today)
      let todayWaterSum = 0;
      try {
        const startOfTodayIso = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const { data: waterData, error: waterError } = await supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', startOfTodayIso);

        if (!waterError && waterData) {
          todayWaterSum = (waterData as WaterLog[]).reduce((sum, w) => sum + (w.amount_ml || 0), 0);
        }
      } catch (e) {
        console.warn('[DashboardStore] water_logs fetch note:', e);
      }

      // Filter Today's Meals
      const todayMeals = allMeals.filter((m) => toDateKey(new Date(m.logged_at)) === todayKey);
      const todayWorkouts = allWorkouts.filter((w) => toDateKey(new Date(w.created_at)) === todayKey);

      // Aggregate Today's Totals
      const caloriesConsumed = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const proteinConsumed = Math.round(todayMeals.reduce((sum, m) => sum + Number(m.protein_g || 0), 0));
      const carbsConsumed = Math.round(todayMeals.reduce((sum, m) => sum + Number(m.carbs_g || 0), 0));
      const fatsConsumed = Math.round(todayMeals.reduce((sum, m) => sum + Number(m.fats_g || 0), 0));
      const fiberConsumed = Math.round((carbsConsumed * 0.15) + (todayMeals.length * 2));
      const caloriesBurned = todayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
      const completedReps = todayWorkouts.reduce((sum, w) => sum + (w.duration_minutes * 2 || 0), 0);

      // Calculate Dynamic Streak
      const streakDays = calculateMealStreak(allMeals);

      // Build Energy Balance Chart Data
      const chartData = buildEnergyChartData(allMeals, allWorkouts, bmr);

      set({
        streakDays,
        waterMl: todayWaterSum,
        targetWaterMl: targets.targetWater,
        loggedMealsCount: todayMeals.length,
        completedRepsToday: completedReps,
        targetRepsToday: 60,
        macroData: {
          caloriesConsumed,
          caloriesTarget: targets.targetCalories,
          caloriesBurned,
          protein: { current: proteinConsumed, target: targets.targetProtein },
          carbs: { current: carbsConsumed, target: targets.targetCarbs },
          fats: { current: fatsConsumed, target: targets.targetFats },
          fiber: { current: fiberConsumed, target: targets.targetFiber },
        },
        chartData,
        isLoading: false,
        isRefreshing: false,
      });
    } catch (err: any) {
      console.error('[DashboardStore] fetchDashboardData error:', err);
      set({
        error: err.message || 'Failed to fetch dashboard metrics',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  // ---------------------------------------------------------------------------
  // Log Meal Mutation with Optimistic UI Update
  // ---------------------------------------------------------------------------
  logMeal: async (userId, payload) => {
    if (!userId) return { success: false, error: 'User not authenticated' };

    const previousMacro = get().macroData;
    const previousMealsCount = get().loggedMealsCount;
    const previousStreak = get().streakDays;

    // Optimistic Update
    const updatedConsumed = previousMacro.caloriesConsumed + payload.calories;
    const updatedProtein = previousMacro.protein.current + payload.protein;
    const updatedCarbs = previousMacro.carbs.current + payload.carbs;
    const updatedFats = previousMacro.fats.current + payload.fats;
    const updatedFiber = previousMacro.fiber.current + Math.round((payload.carbs * 0.15) + 2);

    set({
      loggedMealsCount: previousMealsCount + 1,
      streakDays: Math.max(1, previousStreak === 0 ? 1 : previousStreak),
      macroData: {
        ...previousMacro,
        caloriesConsumed: updatedConsumed,
        protein: { ...previousMacro.protein, current: updatedProtein },
        carbs: { ...previousMacro.carbs, current: updatedCarbs },
        fats: { ...previousMacro.fats, current: updatedFats },
        fiber: { ...previousMacro.fiber, current: updatedFiber },
      },
    });

    try {
      const dbPayload = {
        user_id: userId,
        meal_name: `${payload.name} (${payload.type})`,
        calories: payload.calories,
        protein_g: payload.protein,
        carbs_g: payload.carbs,
        fats_g: payload.fats,
        logged_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('meal_logs').insert(dbPayload);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (err: any) {
      console.error('[DashboardStore] logMeal error:', err);
      // Revert optimistic update
      set({
        macroData: previousMacro,
        loggedMealsCount: previousMealsCount,
        streakDays: previousStreak,
      });
      return { success: false, error: err.message || 'Failed to save meal log' };
    }
  },

  // ---------------------------------------------------------------------------
  // Log Water Mutation with Optimistic UI Update
  // ---------------------------------------------------------------------------
  logWater: async (userId, deltaMl) => {
    if (!userId) return { success: false, error: 'User not authenticated' };

    const previousWater = get().waterMl;
    const updatedWater = Math.min(8000, previousWater + deltaMl);

    // Optimistic Update
    set({ waterMl: updatedWater });

    try {
      const { error } = await supabase.from('water_logs').insert({
        user_id: userId,
        amount_ml: deltaMl,
        logged_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('[DashboardStore] water log insertion note:', error.message);
      }

      return { success: true };
    } catch (err: any) {
      console.error('[DashboardStore] logWater error:', err);
      // Do not hard fail UI for water log
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Remove Water Mutation with Optimistic UI Update
  // ---------------------------------------------------------------------------
  removeWater: async (userId, deltaMl) => {
    if (!userId) return { success: false, error: 'User not authenticated' };

    const previousWater = get().waterMl;
    const updatedWater = Math.max(0, previousWater - deltaMl);

    // Optimistic Update
    set({ waterMl: updatedWater });

    try {
      // Find the most recent water log today to remove
      const startOfTodayIso = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ).toISOString();

      const { data } = await supabase
        .from('water_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('logged_at', startOfTodayIso)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.id) {
        await supabase.from('water_logs').delete().eq('id', data.id);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('[DashboardStore] removeWater error:', err);
      return { success: true };
    }
  },
}));
