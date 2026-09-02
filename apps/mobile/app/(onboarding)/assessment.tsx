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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Shield,
  Activity,
  Flame,
  ArrowRight,
  Sparkles,
  Plus,
  Minus,
  Check,
  Dumbbell,
  HeartPulse,
  Scale,
  Info,
} from 'lucide-react-native';
import { Gender, TargetGoal, BMICategory, BodyAssessment } from '@fitness/types';
import { calculateBMI, calculateBMR } from '@fitness/utils';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase } from '../../src/lib/supabase';
import { StepProgressBar } from '../../src/components/StepProgressBar';
import { CoachTip } from '../../src/components/CoachTip';
import { SpeedometerGauge } from '../../src/components/SpeedometerGauge';

type HeightUnit = 'CM' | 'FT';
type WeightUnit = 'KG' | 'LBS';

export default function AssessmentWizardScreen() {
  const router = useRouter();
  const { authUser, profile, setLatestAssessment } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const [name, setName] = useState(profile?.full_name || '');
  const [gender, setGender] = useState<Gender>('MALE');
  const [age, setAge] = useState<number>(26);

  // Height & Weight States with Units
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('CM');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('KG');
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(72);

  const [targetGoal, setTargetGoal] = useState<TargetGoal>('MUSCLE_GAIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Calculations via @fitness/utils
  const bmiResult = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);
  const bmrResult = useMemo(() => calculateBMR(weightKg, heightCm, age, gender), [weightKg, heightCm, age, gender]);

  // Derived Unit Conversions
  const heightInInches = Math.round(heightCm / 2.54);
  const heightFeet = Math.floor(heightInInches / 12);
  const heightRemainingInches = heightInInches % 12;

  const weightInLbs = Math.round(weightKg * 2.20462 * 10) / 10;

  // Supportive, Empathetic Coaching Copy
  const coachingFeedback = useMemo(() => {
    switch (bmiResult.category) {
      case 'Normal':
        return `You're currently in a balanced metabolic zone. Your body burns approximately ${Math.round(
          bmrResult
        )} kcal/day just maintaining vital functions at rest.`;
      case 'Underweight':
        return `We'll focus on nutrient-dense caloric surplus and progressive strength to build resilient lean mass and vital energy.`;
      case 'Overweight':
        return `A steady, sustainable caloric deficit combined with resistance training will protect your metabolism and melt body fat efficiently.`;
      case 'Obese':
        return `Every journey starts with a single step. We will build a gentle, progressive blueprint prioritizing joint health and metabolic stamina.`;
      default:
        return `Your baseline calibration gives us the foundation to personalize your daily targets.`;
    }
  }, [bmiResult, bmrResult]);

  const handleNextStep = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMessage('Please enter your name so Coach Aria can personalize your blueprint.');
        return;
      }
    } else if (currentStep === 2) {
      if (heightCm < 100 || heightCm > 250) {
        setErrorMessage('Please enter a realistic height (100 - 250 cm / 3.3 - 8.2 ft).');
        return;
      }
      if (weightKg < 30 || weightKg > 300) {
        setErrorMessage('Please enter a realistic weight (30 - 300 kg / 66 - 660 lbs).');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleHeightAdjust = (delta: number) => {
    if (heightUnit === 'CM') {
      setHeightCm((prev) => Math.max(100, Math.min(250, prev + delta)));
    } else {
      // In FT mode, delta is in inches
      const newTotalInches = Math.max(39, Math.min(98, heightInInches + delta));
      setHeightCm(Math.round(newTotalInches * 2.54));
    }
  };

  const handleWeightAdjust = (delta: number) => {
    if (weightUnit === 'KG') {
      setWeightKg((prev) => Math.max(30, Math.min(300, Math.round((prev + delta) * 10) / 10)));
    } else {
      // In LBS mode, delta is in lbs (1 lb ~ 0.453592 kg)
      const newLbs = Math.max(66, Math.min(660, weightInLbs + delta));
      setWeightKg(Math.round((newLbs / 2.20462) * 10) / 10);
    }
  };

  const handleFinalSubmit = async () => {
    if (!authUser?.id) {
      Alert.alert('Session Error', 'Please log in to save your biometric calibration.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (name.trim()) {
        await supabase.from('users').update({ full_name: name.trim() }).eq('id', authUser.id);
      }

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

      const { data, error } = await supabase.from('body_assessments').insert(payload).select().single();
      if (error) throw error;

      if (data) {
        setLatestAssessment(data as BodyAssessment);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to save assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mobileContainer}>
            {/* Top Step Progress Bar */}
            <StepProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handlePrevStep}
              canGoBack={currentStep > 1}
            />

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Info size={16} color="#F87171" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: THE BASICS */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
              <View>
                <CoachTip
                  message="Let's start with your baseline profile. Your age and biological sex allow our algorithm to calibrate your resting calorie burn with 98% clinical accuracy."
                  badge="HUMAN-FIRST SETUP"
                />

                <Text style={styles.sectionTitle}>What should we call you?</Text>
                <Text style={styles.sectionSubtitle}>
                  We'll personalize your daily nutrition blueprint and milestones.
                </Text>

                {/* Name Recessed Input */}
                <View style={styles.neoInputBox}>
                  <User size={18} color="#10B981" />
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Your preferred name"
                    placeholderTextColor="#475569"
                    autoCapitalize="words"
                    selectionColor="#10B981"
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      setErrorMessage(null);
                    }}
                  />
                </View>

                {/* Biological Sex Selector */}
                <Text style={styles.fieldLabel}>BIOLOGICAL SEX (FOR BMR FORMULA)</Text>
                <View style={styles.sexRow}>
                  <TouchableOpacity
                    onPress={() => setGender('MALE')}
                    style={[styles.sexCard, gender === 'MALE' && styles.sexCardActive]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.sexCardHeader}>
                      <View style={styles.sexIconCircle}>
                        <Shield size={16} color="#10B981" />
                      </View>
                      {gender === 'MALE' && <Check size={16} color="#10B981" strokeWidth={3} />}
                    </View>
                    <Text style={styles.sexTitle}>Male</Text>
                    <Text style={styles.sexFormula}>MSJ (+5 kcal)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setGender('FEMALE')}
                    style={[styles.sexCard, gender === 'FEMALE' && styles.sexCardActive]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.sexCardHeader}>
                      <View style={styles.sexIconCircle}>
                        <HeartPulse size={16} color="#10B981" />
                      </View>
                      {gender === 'FEMALE' && <Check size={16} color="#10B981" strokeWidth={3} />}
                    </View>
                    <Text style={styles.sexTitle}>Female</Text>
                    <Text style={styles.sexFormula}>MSJ (-161 kcal)</Text>
                  </TouchableOpacity>
                </View>

                {/* Age Stepper */}
                <Text style={styles.fieldLabel}>YOUR AGE (YEARS)</Text>
                <View style={styles.stepperCard}>
                  <View>
                    <Text style={styles.stepperBigValue}>{age}</Text>
                    <Text style={styles.stepperUnit}>years old</Text>
                  </View>

                  <View style={styles.stepperButtons}>
                    <TouchableOpacity
                      onPress={() => setAge((prev) => Math.max(12, prev - 1))}
                      style={styles.stepperBtn}
                      activeOpacity={0.8}
                    >
                      <Minus size={18} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setAge((prev) => Math.min(100, prev + 1))}
                      style={[styles.stepperBtn, styles.stepperBtnAdd]}
                      activeOpacity={0.8}
                    >
                      <Plus size={18} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: PHYSICAL METRICS (WITH CM/FT, KG/LBS & BIKE SPEEDOMETER GAUGE) */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
              <View>
                <CoachTip
                  message="Every body is unique and evolves with consistency. Adjust the metrics below—your live metabolic speedometer updates instantly."
                  badge="TACTILE CALIBRATION"
                />

                <Text style={styles.sectionTitle}>Body Metrics</Text>
                <Text style={styles.sectionSubtitle}>
                  Adjust the tactile steppers or tap the numbers directly to type.
                </Text>

                {/* Height Stepper Card with CM / FT Toggle */}
                <View style={styles.metricInputCard}>
                  <View style={styles.metricCardHeader}>
                    <View style={styles.metricIconRow}>
                      <Activity size={16} color="#10B981" />
                      <Text style={styles.metricTitle}>HEIGHT</Text>
                    </View>

                    {/* CM / FT Unit Switcher Toggle */}
                    <View style={styles.unitToggleGroup}>
                      <TouchableOpacity
                        onPress={() => setHeightUnit('CM')}
                        style={[styles.unitToggleBtn, heightUnit === 'CM' && styles.unitToggleBtnActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitToggleText, heightUnit === 'CM' && styles.unitToggleTextActive]}>
                          CM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setHeightUnit('FT')}
                        style={[styles.unitToggleBtn, heightUnit === 'FT' && styles.unitToggleBtnActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitToggleText, heightUnit === 'FT' && styles.unitToggleTextActive]}>
                          FT / IN
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.metricControlRow}>
                    {/* Left: Display / Input */}
                    <View style={styles.metricValueGroup}>
                      {heightUnit === 'CM' ? (
                        <>
                          <TextInput
                            style={styles.metricLargeInput}
                            value={String(heightCm)}
                            keyboardType="numeric"
                            selectionColor="#10B981"
                            onChangeText={(val) => setHeightCm(parseInt(val, 10) || 0)}
                          />
                          <Text style={styles.metricValueUnit}>cm</Text>
                        </>
                      ) : (
                        <View style={styles.ftDisplayRow}>
                          <Text style={styles.metricLargeText}>{heightFeet}</Text>
                          <Text style={styles.metricSubUnit}>ft</Text>
                          <Text style={[styles.metricLargeText, { marginLeft: 8 }]}>{heightRemainingInches}</Text>
                          <Text style={styles.metricSubUnit}>in</Text>
                        </View>
                      )}
                    </View>

                    {/* Right: + / - Stepper Buttons (Docked to right edge) */}
                    <View style={styles.stepperButtons}>
                      <TouchableOpacity
                        onPress={() => handleHeightAdjust(-1)}
                        style={styles.stepperBtn}
                        activeOpacity={0.8}
                      >
                        <Minus size={16} color="#94A3B8" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleHeightAdjust(1)}
                        style={[styles.stepperBtn, styles.stepperBtnAdd]}
                        activeOpacity={0.8}
                      >
                        <Plus size={16} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Weight Stepper Card with KG / LBS Toggle */}
                <View style={styles.metricInputCard}>
                  <View style={styles.metricCardHeader}>
                    <View style={styles.metricIconRow}>
                      <Scale size={16} color="#10B981" />
                      <Text style={styles.metricTitle}>WEIGHT</Text>
                    </View>

                    {/* KG / LBS Unit Switcher Toggle */}
                    <View style={styles.unitToggleGroup}>
                      <TouchableOpacity
                        onPress={() => setWeightUnit('KG')}
                        style={[styles.unitToggleBtn, weightUnit === 'KG' && styles.unitToggleBtnActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitToggleText, weightUnit === 'KG' && styles.unitToggleTextActive]}>
                          KG
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setWeightUnit('LBS')}
                        style={[styles.unitToggleBtn, weightUnit === 'LBS' && styles.unitToggleBtnActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitToggleText, weightUnit === 'LBS' && styles.unitToggleTextActive]}>
                          LBS
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.metricControlRow}>
                    {/* Left: Display / Input */}
                    <View style={styles.metricValueGroup}>
                      {weightUnit === 'KG' ? (
                        <>
                          <TextInput
                            style={styles.metricLargeInput}
                            value={String(weightKg)}
                            keyboardType="decimal-pad"
                            selectionColor="#10B981"
                            onChangeText={(val) => setWeightKg(parseFloat(val) || 0)}
                          />
                          <Text style={styles.metricValueUnit}>kg</Text>
                        </>
                      ) : (
                        <>
                          <TextInput
                            style={styles.metricLargeInput}
                            value={String(weightInLbs)}
                            keyboardType="decimal-pad"
                            selectionColor="#10B981"
                            onChangeText={(val) => {
                              const lbs = parseFloat(val) || 0;
                              setWeightKg(Math.round((lbs / 2.20462) * 10) / 10);
                            }}
                          />
                          <Text style={styles.metricValueUnit}>lbs</Text>
                        </>
                      )}
                    </View>

                    {/* Right: + / - Stepper Buttons (Docked to right edge) */}
                    <View style={styles.stepperButtons}>
                      <TouchableOpacity
                        onPress={() => handleWeightAdjust(-1)}
                        style={styles.stepperBtn}
                        activeOpacity={0.8}
                      >
                        <Minus size={16} color="#94A3B8" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleWeightAdjust(1)}
                        style={[styles.stepperBtn, styles.stepperBtnAdd]}
                        activeOpacity={0.8}
                      >
                        <Plus size={16} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* LIVE BIKE DASHBOARD SPEEDOMETER GAUGE METER */}
                <SpeedometerGauge bmi={bmiResult.bmi} category={bmiResult.category} />
              </View>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: REAL-TIME BIOMETRIC REVEAL */}
            {/* ========================================================================= */}
            {currentStep === 3 && (
              <View>
                <CoachTip message={coachingFeedback} badge="METABOLIC REVEAL" />

                <Text style={styles.sectionTitle}>Your Metabolic Engine</Text>
                <Text style={styles.sectionSubtitle}>
                  Calculated baseline based on the Mifflin-St Jeor equation.
                </Text>

                {/* BMR Spotlight Hero Card */}
                <View style={styles.bmrHeroCard}>
                  <View style={styles.bmrHeroHeader}>
                    <View style={styles.bmrTitleGroup}>
                      <Flame size={18} color="#10B981" />
                      <Text style={styles.bmrTitleText}>RESTING CALORIE BURN (BMR)</Text>
                    </View>
                    <View style={styles.bmrBadge}>
                      <Text style={styles.bmrBadgeText}>Daily Floor</Text>
                    </View>
                  </View>

                  <View style={styles.bmrValueRow}>
                    <Text style={styles.bmrNumber}>{Math.round(bmrResult)}</Text>
                    <Text style={styles.bmrUnit}>kcal / day</Text>
                  </View>

                  <Text style={styles.bmrExplanation}>
                    This is the energy your body burns strictly at rest powering vital organs, circulation, and muscle repair before workouts.
                  </Text>
                </View>

                {/* BMI Speedometer Display on Reveal Screen */}
                <SpeedometerGauge bmi={bmiResult.bmi} category={bmiResult.category} />
              </View>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: PRIMARY GOAL SELECTION */}
            {/* ========================================================================= */}
            {currentStep === 4 && (
              <View>
                <CoachTip
                  message="Pick your primary target. We will calibrate your target daily calories, macronutrient split (Protein, Carbs, Fats), and training intensity around this goal."
                  badge="TARGET CALIBRATION"
                />

                <Text style={styles.sectionTitle}>Your Primary Goal</Text>
                <Text style={styles.sectionSubtitle}>
                  Single tap to select your metabolic trajectory.
                </Text>

                <View style={styles.goalsList}>
                  {[
                    {
                      key: 'WEIGHT_LOSS' as TargetGoal,
                      title: 'Burn Fat & Lean Out',
                      tag: 'FAT LOSS DEFICIT',
                      desc: 'Strategic 300-500 kcal deficit tailored to burn body fat while preserving lean muscle.',
                      icon: Flame,
                      color: '#F59E0B',
                    },
                    {
                      key: 'MUSCLE_GAIN' as TargetGoal,
                      title: 'Build Muscle & Power',
                      tag: 'HYPERTROPHY SURPLUS',
                      desc: 'High-protein surplus paired with progressive overload to maximize muscle mass and strength.',
                      icon: Dumbbell,
                      color: '#10B981',
                    },
                    {
                      key: 'MAINTENANCE' as TargetGoal,
                      title: 'Maintain & Optimize',
                      tag: 'METABOLIC EQUILIBRIUM',
                      desc: 'Caloric balance focusing on endurance, recovery, cardiovascular health, and long-term vitality.',
                      icon: HeartPulse,
                      color: '#06B6D4',
                    },
                  ].map((item) => {
                    const isSelected = targetGoal === item.key;
                    const IconComponent = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => setTargetGoal(item.key)}
                        style={[styles.goalCard, isSelected && styles.goalCardActive]}
                        activeOpacity={0.85}
                      >
                        <View style={styles.goalCardTop}>
                          <View style={styles.goalTitleGroup}>
                            <View
                              style={[
                                styles.goalIconBox,
                                { backgroundColor: `${item.color}15` },
                              ]}
                            >
                              <IconComponent size={18} color={item.color} />
                            </View>
                            <View>
                              <Text style={styles.goalMainTitle}>{item.title}</Text>
                              <Text style={[styles.goalTagText, { color: item.color }]}>
                                {item.tag}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleActive,
                            ]}
                          >
                            {isSelected && <Check size={13} color="#052E16" strokeWidth={3} />}
                          </View>
                        </View>

                        <Text style={styles.goalDescription}>{item.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Bottom Navigation Button */}
            <View style={styles.bottomNav}>
              {currentStep < totalSteps ? (
                <TouchableOpacity
                  onPress={handleNextStep}
                  style={styles.continueButton}
                  activeOpacity={0.9}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <ArrowRight size={19} color="#052E16" strokeWidth={2.8} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleFinalSubmit}
                  disabled={isSubmitting}
                  style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                  activeOpacity={0.9}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#090D16" size="small" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Sparkles size={18} color="#052E16" />
                      <Text style={styles.submitButtonText}>Lock in Blueprint & Enter App</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#161B26',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 440,
    marginHorizontal: 'auto',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(248, 113, 113, 0.3)',
    borderLeftColor: 'rgba(248, 113, 113, 0.2)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#7F1D1D',
    borderRightColor: '#7F1D1D',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 18,
  },
  neoInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11151F',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sexCard: {
    flex: 1,
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  sexCardActive: {
    borderTopColor: '#10B981',
    borderLeftColor: '#10B981',
    borderBottomColor: '#065F46',
    borderRightColor: '#065F46',
    backgroundColor: '#1B2332',
  },
  sexCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sexIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sexTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  sexFormula: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  stepperCard: {
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  stepperBigValue: {
    color: '#F8FAFC',
    fontSize: 34,
    fontWeight: '900',
  },
  stepperUnit: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  stepperButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  stepperBtnAdd: {
    backgroundColor: '#1B2332',
    borderTopColor: '#34D399',
    borderLeftColor: '#34D399',
    borderBottomColor: '#065F46',
    borderRightColor: '#065F46',
  },
  metricInputCard: {
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  // Unit Switcher Toggle Button Group
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#11151F',
    borderRadius: 12,
    padding: 3,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  unitToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unitToggleBtnActive: {
    backgroundColor: '#1B2332',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.4)',
    borderLeftColor: 'rgba(52, 211, 153, 0.3)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
  },
  unitToggleText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  unitToggleTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  metricControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricValueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  metricLargeInput: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '900',
    minWidth: 70,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  metricValueUnit: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
  },
  ftDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricLargeText: {
    color: '#F8FAFC',
    fontSize: 34,
    fontWeight: '900',
  },
  metricSubUnit: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 3,
  },
  bmrHeroCard: {
    backgroundColor: '#161B26',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(52, 211, 153, 0.4)',
    borderLeftColor: 'rgba(52, 211, 153, 0.3)',
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 6,
  },
  bmrHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmrTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bmrTitleText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bmrBadge: {
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bmrBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  bmrValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
  },
  bmrNumber: {
    color: '#F8FAFC',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  bmrUnit: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  bmrExplanation: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  goalsList: {
    gap: 12,
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  goalCardActive: {
    borderTopColor: '#10B981',
    borderLeftColor: '#10B981',
    borderBottomColor: '#065F46',
    borderRightColor: '#065F46',
    backgroundColor: '#1B2332',
  },
  goalCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMainTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  goalTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#11151F',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    backgroundColor: '#10B981',
    borderTopColor: '#34D399',
    borderLeftColor: '#34D399',
    borderBottomColor: '#065F46',
    borderRightColor: '#065F46',
  },
  goalDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    paddingLeft: 48,
  },
  bottomNav: {
    marginTop: 10,
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#6EE7B7',
    borderLeftColor: '#34D399',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: '#047857',
    borderRightColor: '#047857',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  continueButtonText: {
    color: '#052E16',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#6EE7B7',
    borderLeftColor: '#34D399',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: '#047857',
    borderRightColor: '#047857',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#052E16',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
