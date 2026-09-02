import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Gender, TargetGoal, BMICategory, BodyAssessment } from '@fitness/types';
import { calculateBMI, calculateBMR } from '@fitness/utils';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase } from '../../src/lib/supabase';

export default function AssessmentScreen() {
  const router = useRouter();
  const { authUser, setLatestAssessment } = useAuthStore();

  const [heightText, setHeightText] = useState('175');
  const [weightText, setWeightText] = useState('72');
  const [ageText, setAgeText] = useState('26');
  const [gender, setGender] = useState<Gender>('MALE');
  const [targetGoal, setTargetGoal] = useState<TargetGoal>('MUSCLE_GAIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse numeric values safely
  const heightCm = parseFloat(heightText) || 0;
  const weightKg = parseFloat(weightText) || 0;
  const age = parseInt(ageText, 10) || 0;

  // Real-time live biometrics calculations via @fitness/utils
  const bmiResult = useMemo(() => {
    return calculateBMI(weightKg, heightCm);
  }, [weightKg, heightCm]);

  const bmrResult = useMemo(() => {
    return calculateBMR(weightKg, heightCm, age, gender);
  }, [weightKg, heightCm, age, gender]);

  const getBMICategoryColor = (category: BMICategory) => {
    switch (category) {
      case 'Normal':
        return '#10B981'; // emerald
      case 'Underweight':
        return '#38BDF8'; // sky
      case 'Overweight':
        return '#F59E0B'; // amber
      case 'Obese':
        return '#EF4444'; // rose
      default:
        return '#94A3B8';
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!authUser?.id) {
      Alert.alert('Error', 'No authenticated session found.');
      return;
    }

    if (heightCm <= 50 || heightCm > 260) {
      setErrorMessage('Please enter a valid height between 50 and 260 cm.');
      return;
    }

    if (weightKg <= 20 || weightKg > 350) {
      setErrorMessage('Please enter a valid weight between 20 and 350 kg.');
      return;
    }

    if (age < 12 || age > 100) {
      setErrorMessage('Please enter a valid age between 12 and 100.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        user_id: authUser.id,
        height_cm: heightCm,
        weight_kg: weightKg,
        gender,
        age,
        bmi: bmiResult.bmi,
        bmr: bmrResult,
        target_goal: targetGoal,
      };

      const { data, error } = await supabase
        .from('body_assessments')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setLatestAssessment(data as BodyAssessment);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('[AssessmentScreen] submit error:', err);
      setErrorMessage(err.message || 'Failed to save biometric assessment.');
      Alert.alert('Submission Error', err.message || 'Failed to save assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 1 OF 1 • ONBOARDING</Text>
          </View>
          <Text style={styles.title}>Biometric Baseline</Text>
          <Text style={styles.subtitle}>
            Calibrate your metabolic profile and establish your initial fitness benchmark.
          </Text>
        </View>

        {/* Live Calculation Preview Banner */}
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>LIVE METRIC PREVIEW</Text>
            <View style={styles.activeDot} />
          </View>

          <View style={styles.previewMetricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>BODY MASS INDEX</Text>
              <Text style={styles.metricValue}>
                {bmiResult.bmi > 0 ? bmiResult.bmi.toFixed(1) : '--'}
              </Text>
              <View
                style={[
                  styles.categoryTag,
                  { backgroundColor: `${getBMICategoryColor(bmiResult.category)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    { color: getBMICategoryColor(bmiResult.category) },
                  ]}
                >
                  {bmiResult.bmi > 0 ? bmiResult.category : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>BASAL METABOLIC RATE</Text>
              <Text style={styles.metricValue}>
                {bmrResult > 0 ? `${Math.round(bmrResult)}` : '--'}
              </Text>
              <Text style={styles.metricUnit}>kcal / day base</Text>
            </View>
          </View>
        </View>

        {/* Error Notification */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Biological Sex Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BIOLOGICAL SEX</Text>
          <View style={styles.toggleRow}>
            {(['MALE', 'FEMALE'] as Gender[]).map((g) => {
              const isSelected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.toggleBtn, isSelected && styles.toggleBtnActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      isSelected && styles.toggleBtnTextActive,
                    ]}
                  >
                    {g === 'MALE' ? 'Male (MSJ +5)' : 'Female (MSJ -161)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Numeric Inputs Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BODY MEASUREMENTS</Text>
          <View style={styles.inputsGrid}>
            <View style={styles.gridInputBox}>
              <Text style={styles.inputTitle}>HEIGHT (CM)</Text>
              <TextInput
                style={styles.numericInput}
                keyboardType="numeric"
                value={heightText}
                onChangeText={(val) => {
                  setHeightText(val);
                  setErrorMessage(null);
                }}
                placeholder="175"
                placeholderTextColor="#475569"
              />
            </View>

            <View style={styles.gridInputBox}>
              <Text style={styles.inputTitle}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.numericInput}
                keyboardType="decimal-pad"
                value={weightText}
                onChangeText={(val) => {
                  setWeightText(val);
                  setErrorMessage(null);
                }}
                placeholder="72.0"
                placeholderTextColor="#475569"
              />
            </View>

            <View style={styles.gridInputBox}>
              <Text style={styles.inputTitle}>AGE (YEARS)</Text>
              <TextInput
                style={styles.numericInput}
                keyboardType="number-pad"
                value={ageText}
                onChangeText={(val) => {
                  setAgeText(val);
                  setErrorMessage(null);
                }}
                placeholder="26"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
        </View>

        {/* Target Goal Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TARGET GOAL</Text>
          <View style={styles.goalsContainer}>
            {[
              {
                key: 'WEIGHT_LOSS' as TargetGoal,
                label: 'Weight Loss & Deficit',
                desc: 'Targeted caloric deficit with structured cardio and strength.',
              },
              {
                key: 'MUSCLE_GAIN' as TargetGoal,
                label: 'Hypertrophy & Muscle Gain',
                desc: 'Progressive overload focus with protein-dense surplus.',
              },
              {
                key: 'MAINTENANCE' as TargetGoal,
                label: 'Maintenance & Longevity',
                desc: 'Optimize metabolic flexibility and performance equilibrium.',
              },
            ].map((goal) => {
              const isSelected = targetGoal === goal.key;
              return (
                <TouchableOpacity
                  key={goal.key}
                  style={[styles.goalCard, isSelected && styles.goalCardActive]}
                  onPress={() => setTargetGoal(goal.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.goalHeader}>
                    <Text
                      style={[
                        styles.goalLabel,
                        isSelected && styles.goalLabelActive,
                      ]}
                    >
                      {goal.label}
                    </Text>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={styles.goalDesc}>{goal.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Complete Assessment & Enter App</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  stepBadgeText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 20,
  },
  previewContainer: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  previewMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#090D16',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  categoryTag: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricUnit: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
  },
  toggleBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#818CF8',
    fontWeight: '700',
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gridInputBox: {
    flex: 1,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
  },
  inputTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  numericInput: {
    backgroundColor: '#090D16',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },
  goalsContainer: {
    gap: 10,
  },
  goalCard: {
    backgroundColor: '#131B2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  goalCardActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  goalLabelActive: {
    color: '#818CF8',
  },
  goalDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#6366F1',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
