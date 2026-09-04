import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Flame, ChevronLeft } from 'lucide-react-native';
import RegistrationSuccessView from '../../src/components/RegistrationSuccessView';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; fullName?: string }>();

  const email = params.email || 'your-email@domain.com';
  const fullName = params.fullName || '';

  const handleProceedToLogin = (userEmail: string) => {
    router.replace({
      pathname: '/(auth)/login',
      params: { email: userEmail },
    });
  };

  const handleChangeEmail = () => {
    router.replace('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mobileContainer}>
          {/* Header Bar */}
          <View style={styles.topNav}>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <ChevronLeft size={20} color="#94A3B8" />
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            <View style={styles.brandBadge}>
              <Flame size={16} color="#10B981" />
              <Text style={styles.brandBadgeText}>FITPASS</Text>
            </View>
          </View>

          {/* Neumorphic Card holding the Success View */}
          <View style={styles.neoCard}>
            <RegistrationSuccessView
              email={email}
              fullName={fullName}
              onProceedToLogin={handleProceedToLogin}
              onChangeEmail={handleChangeEmail}
            />
          </View>
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
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 440,
    marginHorizontal: 'auto',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#11151F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#11151F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  brandBadgeText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  neoCard: {
    backgroundColor: '#161B26',
    borderRadius: 24,
    padding: 22,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 8,
  },
});
