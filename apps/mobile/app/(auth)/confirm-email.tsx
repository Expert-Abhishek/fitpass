import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Flame, ChevronLeft } from 'lucide-react-native';
import { NeuTheme } from '../../src/theme/neumorphic';
import NeuCard from '../../src/components/neumorphic/NeuCard';
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mobileContainer}>
          {/* Header Bar */}
          <View style={styles.topNav}>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <ChevronLeft size={18} color={NeuTheme.colors.textSecondary} />
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            <View style={styles.brandBadge}>
              <Flame size={15} color={NeuTheme.colors.emerald} />
              <Text style={styles.brandBadgeText}>FITPASS</Text>
            </View>
          </View>

          {/* Neumorphic Card holding the Success View */}
          <NeuCard variant="raised" padding={18} borderRadius={24} style={styles.neoCard}>
            <RegistrationSuccessView
              email={email}
              fullName={fullName}
              onProceedToLogin={handleProceedToLogin}
              onChangeEmail={handleChangeEmail}
            />
          </NeuCard>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
    paddingVertical: 20,
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
    marginBottom: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    borderRadius: 12,
  },
  backButtonText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: NeuTheme.colors.emeraldBg,
    borderRadius: 12,
  },
  brandBadgeText: {
    color: '#064E3B',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  neoCard: {
    marginBottom: 10,
  },
});
