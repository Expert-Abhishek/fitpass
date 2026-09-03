import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, Text, Platform, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/authStore';
import { supabase } from '../src/lib/supabase';

// Ignore React Native internal Bridgeless engine diagnostic warnings
if (typeof console !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    if (
      args.some(
        (arg) =>
          typeof arg === 'string' &&
          (arg.includes('disableEventLoopOnBridgeless') ||
            arg.includes('disableeventlooponbridgeless') ||
            arg.includes('Could not access feature flag'))
      )
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

LogBox.ignoreLogs([
  /disableeventlooponbridgeless/i,
  /disableEventLoopOnBridgeless/i,
  /native module method was not available/i,
  /Could not access feature flag/i,
]);

// Inject Global Autofill & Focus CSS for Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'fitpass-web-global-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #11151F inset !important;
        -webkit-text-fill-color: #F8FAFC !important;
        caret-color: #10B981 !important;
        transition: background-color 50000s ease-in-out 0s !important;
      }
      input {
        background-color: transparent !important;
        color: #F8FAFC !important;
        outline: none !important;
        border: none !important;
      }
      input:focus {
        outline: none !important;
      }
      * {
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function RootLayout() {
  const {
    session,
    isLoading,
    isInitialized,
    hasCompletedOnboarding,
    initializeAuth,
  } = useAuthStore();

  const segments = useSegments();
  const router = useRouter();

  // Initialize auth session on mount
  useEffect(() => {
    initializeAuth();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user) {
          useAuthStore.setState({
            session: newSession,
            authUser: newSession.user,
          });
          await useAuthStore.getState().fetchUserProfile(newSession.user.id);
          const assessment = await useAuthStore.getState().fetchLatestAssessment(newSession.user.id);
          useAuthStore.setState({ hasCompletedOnboarding: Boolean(assessment) });
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
          session: null,
          authUser: null,
          profile: null,
          latestAssessment: null,
          hasCompletedOnboarding: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Protected Route Guard & Navigation Routing
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session) {
      // User is not signed in -> redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!hasCompletedOnboarding) {
      // User is signed in but hasn't submitted initial assessment
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/assessment');
      }
    } else {
      // User is signed in and has completed assessment
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isInitialized, isLoading, hasCompletedOnboarding, segments]);

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Initializing Fitness Core...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#161B26' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)/assessment" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#161B26',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
