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
import { useAuthStore } from '../../src/stores/authStore';

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
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
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

      // If user was immediately confirmed and authenticated
      if (isConfirmed) {
        return;
      }

      // Show dedicated high-visibility Registration Success View
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

  const handleProceedToSignInFromSuccess = () => {
    const savedEmail = registeredUser?.email || email.trim();
    setRegisteredUser(null);
    setIsSignUp(false);
    setEmail(savedEmail);
    setPassword('');
    setFieldErrors({});
    setApiError(null);
    setSuccessMessage('👋 Account registered! Enter your password to sign in.');
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
    if (fieldErrors[fieldName]) return '#F87171';
    if (focusedField === fieldName) return '#10B981';
    return '#64748B';
  };

  const activeTopError = apiError || serverStoreError;

  // Compute sliding pill dimensions (account for 6px padding)
  const tabWidth = switcherWidth > 0 ? (switcherWidth - 12) / 2 : 0;
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
        >
          <View style={styles.mobileContainer}>
            {/* Header Brand */}
            <View style={styles.header}>
              <View style={styles.neoExtrudedCircle}>
                <Flame size={28} color="#10B981" />
              </View>

              <View style={styles.pillBadge}>
                <Sparkles size={12} color="#34D399" />
                <Text style={styles.pillBadgeText}>AI METABOLIC COACHING</Text>
              </View>

              <Text style={styles.title}>
                {registeredUser
                  ? 'Registration Complete'
                  : isSignUp
                  ? "Let's build your blueprint"
                  : 'Welcome back, Champ'}
              </Text>
              <Text style={styles.subtitle}>
                {registeredUser
                  ? 'Your athletic account is created and ready for biometric calibration.'
                  : isSignUp
                  ? 'Personalized nutrition, biometric calibration, and training intelligence.'
                  : 'Sign in to access your daily calorie targets and workout analytics.'}
              </Text>
            </View>

            {/* Neumorphic Recessed Switcher (Hidden during Success state) */}
            {!registeredUser && (
              <View style={styles.neoRecessedSwitcher} onLayout={onSwitcherLayout}>
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
            )}

            {/* Neumorphic Form / Success Card */}
            <View style={styles.neoCard}>
              {/* DEDICATED REGISTRATION SUCCESS VIEW */}
              {registeredUser ? (
                <View style={styles.successScreenContent}>
                  <View style={styles.successIconBadge}>
                    <CheckCircle2 size={44} color="#10B981" strokeWidth={2.4} />
                  </View>

                  <Text style={styles.successHeaderTitle}>Account Registered! 🎉</Text>
                  <Text style={styles.successHeaderSubtitle}>
                    Welcome aboard, <Text style={styles.highlightName}>{registeredUser.fullName || 'Athlete'}</Text>!
                  </Text>

                  <View style={styles.successDetailsBox}>
                    <View style={styles.successDetailRow}>
                      <Mail size={16} color="#10B981" />
                      <Text style={styles.successEmailText}>{registeredUser.email}</Text>
                    </View>
                    <View style={styles.statusIndicatorRow}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusBadgeText}>Database Profile Created</Text>
                    </View>
                  </View>

                  <View style={styles.infoNoticeBox}>
                    <Sparkles size={16} color="#34D399" style={{ marginTop: 2 }} />
                    <Text style={styles.infoNoticeText}>
                      Your account is all set! Click the button below to sign in with your password and begin your biometric calibration wizard.
                    </Text>
                  </View>

                  {/* Note about Supabase email confirmation if applicable */}
                  <View style={styles.verificationNoteBox}>
                    <Text style={styles.verificationNoteText}>
                      💡 <Text style={{ fontWeight: '700', color: '#94A3B8' }}>Note:</Text> If your Supabase database requires email verification, please also check your email inbox to verify the link.
                    </Text>
                  </View>

                  {/* Primary Redirect to Login Button */}
                  <TouchableOpacity
                    onPress={handleProceedToSignInFromSuccess}
                    style={styles.neoButton}
                    activeOpacity={0.88}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.neoButtonText}>Proceed to Sign In</Text>
                      <ArrowRight size={20} color="#052E16" strokeWidth={2.8} />
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                /* REGULAR AUTH FORM */
                <>
                  {/* Success Notification Banner */}
                  {successMessage && (
                    <View style={styles.successBox}>
                      <CheckCircle2 size={18} color="#10B981" style={{ marginTop: 2 }} />
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
                        <AlertCircle size={20} color="#FBBF24" />
                        <Text style={styles.unconfirmedTitle}>Email Verification Required</Text>
                      </View>
                      <Text style={styles.unconfirmedText}>
                        Your email address has not been confirmed yet. Please check your inbox & spam folder for the Supabase confirmation email.
                      </Text>

                      <TouchableOpacity
                        onPress={handleResendConfirmation}
                        disabled={isResending}
                        style={styles.resendBtn}
                        activeOpacity={0.8}
                      >
                        {isResending ? (
                          <ActivityIndicator size="small" color="#FBBF24" />
                        ) : (
                          <>
                            <Send size={14} color="#FDE68A" />
                            <Text style={styles.resendBtnText}>Resend Confirmation Link</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <Text style={styles.devHintText}>
                        ⚙️ Dev Tip: In Supabase Dashboard &gt; Auth &gt; Providers &gt; Email, turn off "Confirm email" for instant login.
                      </Text>
                    </View>
                  )}

                  {/* Resend Status Message */}
                  {resendStatus && (
                    <View style={styles.resendStatusBox}>
                      <CheckCircle2 size={15} color="#34D399" />
                      <Text style={styles.resendStatusText}>{resendStatus}</Text>
                    </View>
                  )}

                  {/* Standard API / Validation Error */}
                  {activeTopError && activeTopError !== 'EMAIL_NOT_CONFIRMED' && (
                    <View style={styles.apiErrorBox}>
                      <AlertCircle size={16} color="#F87171" />
                      <Text style={styles.apiErrorText}>{activeTopError}</Text>
                    </View>
                  )}

                  {/* Full Name Input (Sign Up Only) */}
                  {isSignUp && (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>YOUR FULL NAME</Text>
                      <View style={getInputContainerStyle('fullName')}>
                        <User size={18} color={getIconColor('fullName')} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Alex Johnson"
                          placeholderTextColor="#475569"
                          autoCapitalize="words"
                          autoComplete="off"
                          selectionColor="#10B981"
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
                          <AlertCircle size={13} color="#F87171" />
                          <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  {/* Email Address Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <View style={getInputContainerStyle('email')}>
                      <Mail size={18} color={getIconColor('email')} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="athlete@domain.com"
                        placeholderTextColor="#475569"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        selectionColor="#10B981"
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
                        <AlertCircle size={13} color="#F87171" />
                        <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Password Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={getInputContainerStyle('password')}>
                      <Lock size={18} color={getIconColor('password')} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="••••••••••••"
                        placeholderTextColor="#475569"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        selectionColor="#10B981"
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
                          <EyeOff size={18} color="#64748B" />
                        ) : (
                          <Eye size={18} color="#64748B" />
                        )}
                      </TouchableOpacity>
                    </View>
                    {fieldErrors.password ? (
                      <View style={styles.fieldErrorRow}>
                        <AlertCircle size={13} color="#F87171" />
                        <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Neumorphic Extruded Action Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={[styles.neoButton, isLoading && styles.buttonDisabled]}
                    activeOpacity={0.9}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#090D16" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.neoButtonText}>
                          {isSignUp ? 'Create My Blueprint' : 'Sign In to Dashboard'}
                        </Text>
                        <ArrowRight size={19} color="#052E16" strokeWidth={2.8} />
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Security Guarantee */}
            <View style={styles.securityRow}>
              <CheckCircle2 size={14} color="#10B981" />
              <Text style={styles.securityText}>
                End-to-end encrypted biometric PostgreSQL database security
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
    backgroundColor: '#161B26', // Neumorphic Dark Steel Slate
  },
  keyboardContainer: {
    flex: 1,
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  // Extruded Neumorphic Circle for Brand Icon
  neoExtrudedCircle: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#161B26',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#0A0D13',
    borderRightColor: '#0A0D13',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B26',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#0A0D13',
    borderRightColor: '#0A0D13',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    marginBottom: 12,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  pillBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#F1F5F9',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 320,
  },
  // Recessed / Inset Channel for the Switcher
  neoRecessedSwitcher: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: '#11151F',
    borderRadius: 18,
    padding: 5,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 20,
  },
  // Extruded Neumorphic Sliding Pill
  neoSlidingPill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    backgroundColor: '#1B2230',
    borderRadius: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  switchTextActive: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  // Extruded Neumorphic Card Body
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
  // SUCCESS VIEW STYLES
  successScreenContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  successIconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#161B26',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(52, 211, 153, 0.3)',
    borderLeftColor: 'rgba(52, 211, 153, 0.2)',
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  successHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  successHeaderSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  highlightName: {
    color: '#34D399',
    fontWeight: '700',
  },
  successDetailsBox: {
    width: '100%',
    backgroundColor: '#11151F',
    borderRadius: 16,
    padding: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 14,
    gap: 8,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successEmailText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
  },
  infoNoticeBox: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    marginBottom: 12,
  },
  infoNoticeText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  verificationNoteBox: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 11,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  verificationNoteText: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 16,
  },
  // UNCONFIRMED EMAIL BOX STYLES
  unconfirmedEmailBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(251, 191, 36, 0.3)',
    borderLeftColor: 'rgba(251, 191, 36, 0.2)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#78350F',
    borderRightColor: '#78350F',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  unconfirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  unconfirmedTitle: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '800',
  },
  unconfirmedText: {
    color: '#FDE68A',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 10,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B13',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    gap: 8,
    marginBottom: 8,
  },
  resendBtnText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '700',
  },
  devHintText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  resendStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  resendStatusText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  // NOTIFICATION & ERROR BANNERS
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.3)',
    borderLeftColor: 'rgba(52, 211, 153, 0.2)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  successTextGroup: {
    flex: 1,
  },
  successTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  successText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  apiErrorBox: {
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
  apiErrorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  // Inset / Recessed Well for Inputs
  inputContainer: {
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 11 : 13,
  },
  inputContainerFocused: {
    borderTopColor: '#10B981',
    borderLeftColor: '#10B981',
    borderBottomColor: '#065F46',
    borderRightColor: '#065F46',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    backgroundColor: '#0F1522',
  },
  inputContainerError: {
    borderTopColor: '#EF4444',
    borderLeftColor: '#EF4444',
    borderBottomColor: '#7F1D1D',
    borderRightColor: '#7F1D1D',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    backgroundColor: '#181116',
  },
  textInput: {
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
  eyeBtn: {
    padding: 4,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 4,
    gap: 5,
  },
  fieldErrorText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  // Extruded Neumorphic Action Button with Emerald Radiance
  neoButton: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 6,
  },
  securityText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});
