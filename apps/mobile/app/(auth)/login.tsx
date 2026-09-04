import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
} from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { NeuTheme } from '../../src/theme/neumorphic';
import RegistrationSuccessView from '../../src/components/RegistrationSuccessView';
import NeuCard from '../../src/components/neumorphic/NeuCard';

type FieldName = 'fullName' | 'email' | 'password';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
}

export default function AuthScreen({ initialMode = 'signin' }: AuthScreenProps) {
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();
  const [isSignUp, setIsSignUp] = useState(
    params.mode ? params.mode === 'signup' : initialMode === 'signup'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Success / Confirmation States
  const [registeredUser, setRegisteredUser] = useState<{
    email: string;
    fullName: string;
  } | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Focus and Validation States
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Neumorphic Sliding Pill Animation
  const [switcherWidth, setSwitcherWidth] = useState<number>(0);
  const slideAnim = useRef(new Animated.Value(initialMode === 'signup' ? 1 : 0)).current;

  const {
    signInWithPassword,
    signUpWithPassword,
    resendConfirmationEmail,
    isLoading,
    error: serverStoreError,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isSignUp ? 1 : 0,
      tension: 38,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [isSignUp]);

  const handleToggleMode = (mode: boolean) => {
    setIsSignUp(mode);
    setRegisteredUser(null);
    setFieldErrors({});
    setApiError(null);
    setSuccessMessage(null);
    setResendStatus(null);
    clearError();
  };

  const onSwitcherLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSwitcherWidth(width);
  };

  const clearFieldError = (field: FieldName) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setApiError(null);
  };

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};

    if (isSignUp && !fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    setResendStatus(null);
    clearError();

    const isValid = validateFields();
    if (!isValid) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (isSignUp) {
      const { error: signUpError, isConfirmed } = await signUpWithPassword(
        cleanEmail,
        password,
        cleanName
      );

      if (signUpError) {
        setApiError(signUpError.message);
        return;
      }

      if (isConfirmed) {
        return;
      }

      setRegisteredUser({
        email: cleanEmail,
        fullName: cleanName,
      });
      setPassword('');
    } else {
      const { error: signInError } = await signInWithPassword(cleanEmail, password);
      if (signInError) {
        const msg = signInError.message || '';
        if (msg.toLowerCase().includes('email not confirmed')) {
          setApiError('EMAIL_NOT_CONFIRMED');
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          setApiError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setApiError(msg);
        }
      }
    }
  };

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setApiError('Please enter your email address first.');
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    try {
      const { error } = await resendConfirmationEmail(cleanEmail);
      if (error) {
        setResendStatus(`Failed to resend: ${error.message}`);
      } else {
        setResendStatus('Verification email sent! Please check your inbox & spam folder.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleProceedToSignInFromSuccess = (userEmail?: string) => {
    const savedEmail = userEmail || registeredUser?.email || email.trim();
    setRegisteredUser(null);
    setIsSignUp(false);
    setEmail(savedEmail);
    setPassword('');
    setFieldErrors({});
    setApiError(null);
    setSuccessMessage('📬 Verification email sent! Enter your password to sign in once confirmed.');
  };

  const handleChangeEmailFromSuccess = () => {
    setRegisteredUser(null);
    setIsSignUp(true);
  };

  const getInputContainerStyle = (fieldName: FieldName) => {
    if (fieldErrors[fieldName]) {
      return [styles.inputContainer, styles.inputContainerError];
    }
    if (focusedField === fieldName) {
      return [styles.inputContainer, styles.inputContainerFocused];
    }
    return styles.inputContainer;
  };

  const getIconColor = (fieldName: FieldName) => {
    if (fieldErrors[fieldName]) return '#EF4444';
    if (focusedField === fieldName) return NeuTheme.colors.emerald;
    return NeuTheme.colors.textMuted;
  };

  const activeTopError = apiError || serverStoreError;

  const tabWidth = switcherWidth > 0 ? (switcherWidth - 10) / 2 : 0;
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mobileContainer}>
            {/* Header Brand */}
            {!registeredUser ? (
              <View style={styles.header}>
                <View style={styles.neoExtrudedCircle}>
                  <Flame size={26} color={NeuTheme.colors.emerald} />
                </View>

                <View style={styles.pillBadge}>
                  <Sparkles size={12} color="#059669" />
                  <Text style={styles.pillBadgeText}>AI METABOLIC COACHING</Text>
                </View>

                <Text style={styles.title}>
                  {isSignUp
                    ? "Let's build your blueprint"
                    : 'Welcome back, Champ'}
                </Text>
                <Text style={styles.subtitle}>
                  {isSignUp
                    ? 'Personalized nutrition, biometric calibration, and training intelligence.'
                    : 'Sign in to access your daily calorie targets and workout analytics.'}
                </Text>
              </View>
            ) : (
              <View style={[styles.header, { marginBottom: 14 }]}>
                <View style={styles.neoExtrudedCircle}>
                  <Flame size={26} color={NeuTheme.colors.emerald} />
                </View>
              </View>
            )}

            {/* Neumorphic Recessed Switcher (Hidden during Success state) */}
            {!registeredUser && (
              <NeuCard variant="inset" padding={4} borderRadius={18} style={styles.neoRecessedSwitcher}>
                <View style={{ flex: 1, flexDirection: 'row' }} onLayout={onSwitcherLayout}>
                  {tabWidth > 0 && (
                    <Animated.View
                      style={[
                        styles.neoSlidingPill,
                        {
                          width: tabWidth,
                          transform: [{ translateX }],
                        },
                      ]}
                    />
                  )}

                  <TouchableOpacity
                    onPress={() => handleToggleMode(false)}
                    style={styles.switchTab}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        !isSignUp && styles.switchTextActive,
                      ]}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleToggleMode(true)}
                    style={styles.switchTab}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        isSignUp && styles.switchTextActive,
                      ]}
                    >
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
              </NeuCard>
            )}

            {/* Neumorphic Form / Success Card */}
            <NeuCard variant="raised" padding={18} borderRadius={24} style={styles.neoCard}>
              {registeredUser ? (
                <RegistrationSuccessView
                  email={registeredUser.email}
                  fullName={registeredUser.fullName}
                  onProceedToLogin={handleProceedToSignInFromSuccess}
                  onChangeEmail={handleChangeEmailFromSuccess}
                />
              ) : (
                <>
                  {/* Success Notification Banner */}
                  {successMessage && (
                    <View style={styles.successBox}>
                      <CheckCircle2 size={16} color="#047857" style={{ marginTop: 2 }} />
                      <View style={styles.successTextGroup}>
                        <Text style={styles.successTitle}>Ready to Sign In</Text>
                        <Text style={styles.successText}>{successMessage}</Text>
                      </View>
                    </View>
                  )}

                  {/* EMAIL NOT CONFIRMED DEDICATED ALERT */}
                  {activeTopError === 'EMAIL_NOT_CONFIRMED' && (
                    <View style={styles.unconfirmedEmailBox}>
                      <View style={styles.unconfirmedHeader}>
                        <AlertCircle size={18} color="#D97706" />
                        <Text style={styles.unconfirmedTitle}>Email Verification Required</Text>
                      </View>
                      <Text style={styles.unconfirmedText}>
                        Your email address has not been confirmed yet. Please check your inbox & spam folder for the confirmation email.
                      </Text>

                      <TouchableOpacity
                        onPress={handleResendConfirmation}
                        disabled={isResending}
                        style={styles.resendBtn}
                        activeOpacity={0.8}
                      >
                        {isResending ? (
                          <ActivityIndicator size="small" color="#B45309" />
                        ) : (
                          <>
                            <Send size={13} color="#92400E" />
                            <Text style={styles.resendBtnText}>Resend Confirmation Link</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Resend Status Message */}
                  {resendStatus && (
                    <View style={styles.resendStatusBox}>
                      <CheckCircle2 size={14} color="#047857" />
                      <Text style={styles.resendStatusText}>{resendStatus}</Text>
                    </View>
                  )}

                  {/* Standard API / Validation Error */}
                  {activeTopError && activeTopError !== 'EMAIL_NOT_CONFIRMED' && (
                    <View style={styles.apiErrorBox}>
                      <AlertCircle size={15} color="#DC2626" />
                      <Text style={styles.apiErrorText}>{activeTopError}</Text>
                    </View>
                  )}

                  {/* Full Name Input (Sign Up Only) */}
                  {isSignUp && (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>YOUR FULL NAME</Text>
                      <View style={getInputContainerStyle('fullName')}>
                        <User size={17} color={getIconColor('fullName')} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Alex Johnson"
                          placeholderTextColor={NeuTheme.colors.textMuted}
                          autoCapitalize="words"
                          autoComplete="off"
                          selectionColor={NeuTheme.colors.emerald}
                          value={fullName}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField(null)}
                          onChangeText={(val) => {
                            setFullName(val);
                            clearFieldError('fullName');
                          }}
                        />
                      </View>
                      {fieldErrors.fullName ? (
                        <View style={styles.fieldErrorRow}>
                          <AlertCircle size={12} color="#EF4444" />
                          <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  {/* Email Address Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <View style={getInputContainerStyle('email')}>
                      <Mail size={17} color={getIconColor('email')} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="athlete@domain.com"
                        placeholderTextColor={NeuTheme.colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        selectionColor={NeuTheme.colors.emerald}
                        value={email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChangeText={(val) => {
                          setEmail(val);
                          clearFieldError('email');
                        }}
                      />
                    </View>
                    {fieldErrors.email ? (
                      <View style={styles.fieldErrorRow}>
                        <AlertCircle size={12} color="#EF4444" />
                        <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Password Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={getInputContainerStyle('password')}>
                      <Lock size={17} color={getIconColor('password')} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="••••••••••••"
                        placeholderTextColor={NeuTheme.colors.textMuted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        selectionColor={NeuTheme.colors.emerald}
                        value={password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        onChangeText={(val) => {
                          setPassword(val);
                          clearFieldError('password');
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                        style={styles.eyeBtn}
                      >
                        {showPassword ? (
                          <EyeOff size={17} color={NeuTheme.colors.textSecondary} />
                        ) : (
                          <Eye size={17} color={NeuTheme.colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {fieldErrors.password ? (
                      <View style={styles.fieldErrorRow}>
                        <AlertCircle size={12} color="#EF4444" />
                        <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={[styles.neoButton, isLoading && styles.buttonDisabled]}
                    activeOpacity={0.9}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#052E16" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.neoButtonText}>
                          {isSignUp ? 'Create My Blueprint' : 'Sign In to Dashboard'}
                        </Text>
                        <ArrowRight size={18} color="#052E16" strokeWidth={2.8} />
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </NeuCard>

            {/* Security Guarantee */}
            <View style={styles.securityRow}>
              <CheckCircle2 size={13} color="#059669" />
              <Text style={styles.securityText}>
                End-to-end encrypted biometric PostgreSQL security
              </Text>
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
    backgroundColor: NeuTheme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  neoExtrudedCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raised,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.emeraldBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    gap: 5,
  },
  pillBadgeText: {
    color: '#065F46',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12.5,
    color: NeuTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
    maxWidth: 320,
  },
  neoRecessedSwitcher: {
    marginBottom: 16,
  },
  neoSlidingPill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 3,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '700',
    color: NeuTheme.colors.textSecondary,
  },
  switchTextActive: {
    color: NeuTheme.colors.textPrimary,
    fontWeight: '900',
  },
  neoCard: {
    marginBottom: 10,
  },
  unconfirmedEmailBox: {
    backgroundColor: NeuTheme.colors.amberBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  unconfirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  unconfirmedTitle: {
    color: '#92400E',
    fontSize: 12.5,
    fontWeight: '800',
  },
  unconfirmedText: {
    color: '#78350F',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 6,
  },
  resendBtnText: {
    color: '#92400E',
    fontSize: 11.5,
    fontWeight: '800',
  },
  resendStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.emeraldBg,
    borderRadius: 10,
    padding: 9,
    marginBottom: 12,
    gap: 6,
  },
  resendStatusText: {
    color: '#065F46',
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  successBox: {
    backgroundColor: NeuTheme.colors.emeraldBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  successTextGroup: {
    flex: 1,
  },
  successTitle: {
    color: '#065F46',
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  successText: {
    color: '#047857',
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
  },
  apiErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.coralBg,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  apiErrorText: {
    color: '#B91C1C',
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.recessedWell,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(163, 177, 198, 0.65)',
    borderLeftColor: 'rgba(163, 177, 198, 0.65)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    borderRightColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 10 : 12,
  },
  inputContainerFocused: {
    borderTopColor: NeuTheme.colors.emerald,
    borderLeftColor: NeuTheme.colors.emerald,
    borderBottomColor: NeuTheme.colors.emerald,
    borderRightColor: NeuTheme.colors.emerald,
    backgroundColor: '#F0FDF4',
  },
  inputContainerError: {
    borderTopColor: '#EF4444',
    borderLeftColor: '#EF4444',
    borderBottomColor: '#EF4444',
    borderRightColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textInput: {
    flex: 1,
    color: NeuTheme.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  eyeBtn: {
    padding: 4,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingLeft: 3,
    gap: 4,
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  neoButton: {
    width: '100%',
    backgroundColor: NeuTheme.colors.emerald,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  neoButtonText: {
    color: '#052E16',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 5,
  },
  securityText: {
    color: NeuTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
