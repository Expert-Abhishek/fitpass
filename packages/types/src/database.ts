export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Gender = 'MALE' | 'FEMALE';
export type TargetGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE';
export type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      body_assessments: {
        Row: {
          id: string;
          user_id: string;
          height_cm: number;
          weight_kg: number;
          gender: Gender;
          age: number;
          bmi: number;
          bmr: number;
          target_goal: TargetGoal;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          height_cm: number;
          weight_kg: number;
          gender: Gender;
          age: number;
          bmi: number;
          bmr: number;
          target_goal: TargetGoal;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          height_cm?: number;
          weight_kg?: number;
          gender?: Gender;
          age?: number;
          bmi?: number;
          bmr?: number;
          target_goal?: TargetGoal;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "body_assessments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          duration_minutes: number;
          calories_burned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: string;
          duration_minutes: number;
          calories_burned: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string;
          duration_minutes?: number;
          calories_burned?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_name: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fats_g: number;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_name: string;
          calories: number;
          protein_g?: number;
          carbs_g?: number;
          fats_g?: number;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_name?: string;
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fats_g?: number;
          logged_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      water_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_ml?: number;
          logged_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "water_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      gender_type: Gender;
      target_goal_type: TargetGoal;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
