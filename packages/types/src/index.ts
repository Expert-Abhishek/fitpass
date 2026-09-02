export * from './database';

import { Database, Gender, TargetGoal, BMICategory } from './database';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type BodyAssessment = Database['public']['Tables']['body_assessments']['Row'];
export type BodyAssessmentInsert = Database['public']['Tables']['body_assessments']['Insert'];
export type BodyAssessmentUpdate = Database['public']['Tables']['body_assessments']['Update'];

export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert'];
export type WorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update'];

export type MealLog = Database['public']['Tables']['meal_logs']['Row'];
export type MealLogInsert = Database['public']['Tables']['meal_logs']['Insert'];
export type MealLogUpdate = Database['public']['Tables']['meal_logs']['Update'];

export type { Gender, TargetGoal, BMICategory };

export interface BMIResult {
  bmi: number;
  category: BMICategory;
}
