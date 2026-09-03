import { create } from 'zustand';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, BodyAssessment } from '@fitness/types';

interface AuthState {
  session: Session | null;
  authUser: SupabaseAuthUser | null;
  profile: User | null;
  latestAssessment: BodyAssessment | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signUpWithPassword: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: Error | null; data?: any; isConfirmed?: boolean }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  fetchLatestAssessment: (userId: string) => Promise<BodyAssessment | null>;
  setLatestAssessment: (assessment: BodyAssessment) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  authUser: null,
  profile: null,
  latestAssessment: null,
  isLoading: true,
  isInitialized: false,
  hasCompletedOnboarding: false,
  error: null,

  initializeAuth: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        set({
          session,
          authUser: session.user,
        });

        await get().fetchUserProfile(session.user.id);
        const assessment = await get().fetchLatestAssessment(session.user.id);
        set({
          hasCompletedOnboarding: Boolean(assessment),
        });
      } else {
        set({
          session: null,
          authUser: null,
          profile: null,
          latestAssessment: null,
          hasCompletedOnboarding: false,
        });
      }
    } catch (err: any) {
      console.error('[AuthStore] initializeAuth error:', err);
      set({ error: err.message || 'Failed to initialize authentication' });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signInWithPassword: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { error };
      }

      if (data.session && data.user) {
        set({
          session: data.session,
          authUser: data.user,
        });

        await get().fetchUserProfile(data.user.id);
        const assessment = await get().fetchLatestAssessment(data.user.id);
        set({
          hasCompletedOnboarding: Boolean(assessment),
          isLoading: false,
        });
      }

      return { error: null, data };
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      return { error: err };
    }
  },

  signUpWithPassword: async (email: string, password: string, fullName?: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { error };
      }

      const hasSession = Boolean(data.session && data.user);

      if (hasSession && data.user) {
        set({
          session: data.session,
          authUser: data.user,
          hasCompletedOnboarding: false,
          isLoading: false,
        });
        await get().fetchUserProfile(data.user.id);
      } else {
        set({ isLoading: false });
      }

      return { error: null, data, isConfirmed: hasSession };
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      return { error: err };
    }
  },

  resendConfirmationEmail: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { error };
      }

      set({ isLoading: false });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message || 'Failed to resend confirmation email', isLoading: false });
      return { error: err };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await supabase.auth.signOut();
      set({
        session: null,
        authUser: null,
        profile: null,
        latestAssessment: null,
        hasCompletedOnboarding: false,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[AuthStore] Fetch profile warning:', error.message);
        return;
      }

      set({ profile: data as User });
    } catch (err) {
      console.error('[AuthStore] fetchUserProfile error:', err);
    }
  },

  fetchLatestAssessment: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('body_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[AuthStore] Fetch assessment warning:', error.message);
        return null;
      }

      if (data) {
        set({ latestAssessment: data as BodyAssessment, hasCompletedOnboarding: true });
        return data as BodyAssessment;
      }

      set({ latestAssessment: null, hasCompletedOnboarding: false });
      return null;
    } catch (err) {
      console.error('[AuthStore] fetchLatestAssessment error:', err);
      return null;
    }
  },

  setLatestAssessment: (assessment: BodyAssessment) => {
    set({
      latestAssessment: assessment,
      hasCompletedOnboarding: true,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
