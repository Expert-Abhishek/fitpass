import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/authStore';
import { supabase } from '../src/lib/supabase';

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
        <ActivityIndicator size="large" color="#6366F1" />
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
          contentStyle: { backgroundColor: '#090D16' },
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
    backgroundColor: '#090D16',
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
