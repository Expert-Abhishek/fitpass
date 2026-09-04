import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Inbox,
  LogIn,
  Edit3,
} from 'lucide-react-native';
import { useAuthStore } from '../stores/authStore';

interface RegistrationSuccessViewProps {
  email: string;
  fullName?: string;
  onProceedToLogin: (email: string) => void;
  onChangeEmail?: () => void;
}

export default function RegistrationSuccessView({
  email,
  fullName,
  onProceedToLogin,
  onChangeEmail,
}: RegistrationSuccessViewProps) {
  const [resendStatus, setResendStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { resendConfirmationEmail } = useAuthStore();

  // Pulse animation for the glowing checkmark / mail badge
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badgeGlowAnim = useRef(new Animated.Value(0.4)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade & Slide in
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle continuous ambient pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(badgeGlowAnim, {
            toValue: 0.85,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(badgeGlowAnim, {
            toValue: 0.4,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOpenEmailApp = async () => {
    try {
      if (Platform.OS === 'web') {
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain?.includes('gmail')) {
          window.open('https://mail.google.com', '_blank');
          return;
        }
        if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) {
          window.open('https://outlook.live.com', '_blank');
          return;
        }
        if (domain?.includes('yahoo')) {
          window.open('https://mail.yahoo.com', '_blank');
          return;
        }
        window.open(`mailto:${email}`, '_blank');
      } else {
        const url = 'message://';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(`mailto:${email}`);
        }
      }
    } catch {
      await Linking.openURL(`mailto:${email}`).catch(() => {});
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const { error } = await resendConfirmationEmail(email.trim().toLowerCase());
      if (error) {
        setResendStatus({
          type: 'error',
          message: error.message || 'Failed to resend confirmation email. Please try again.',
        });
      } else {
        setResendStatus({
          type: 'success',
          message: 'Verification email sent! Check your inbox & spam folder.',
        });
        setCooldown(60); // 60s cooldown
      }
    } catch (err: any) {
      setResendStatus({
        type: 'error',
        message: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const athleteName = fullName?.trim() || 'Athlete';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideUpAnim }],
        },
      ]}
    >
      {/* Glow / Pulse Hero Graphic */}
      <View style={styles.heroWrapper}>
        <Animated.View
          style={[
            styles.glowAura,
            {
              opacity: badgeGlowAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View style={styles.neoHeroBadge}>
          <Mail size={36} color="#10B981" strokeWidth={2.2} />
          <View style={styles.badgeMiniCheck}>
            <CheckCircle2 size={18} color="#052E16" fill="#10B981" />
          </View>
        </View>
      </View>

      {/* Verification Status Pill */}
      <View style={styles.statusPill}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusPillText}>CONFIRMATION LINK SENT</Text>
      </View>

      {/* Main Title & Congratulations */}
      <Text style={styles.title}>Successfully Registered! 🎉</Text>
      <Text style={styles.subtitle}>
        Welcome aboard, <Text style={styles.highlightName}>{athleteName}</Text>! We’ve sent a confirmation email to verify your address. Once confirmed, you can log in below.
      </Text>

      {/* Email Address Recessed Card */}
      <View style={styles.emailCard}>
        <View style={styles.emailCardHeader}>
          <Text style={styles.emailCardLabel}>CONFIRMATION SENT TO</Text>
          <View style={styles.secureTag}>
            <ShieldCheck size={12} color="#34D399" />
            <Text style={styles.secureTagText}>Encrypted</Text>
          </View>
        </View>

        <View style={styles.emailDisplayRow}>
          <Mail size={17} color="#10B981" />
          <Text style={styles.emailDisplayText} numberOfLines={1} ellipsizeMode="middle">
            {email}
          </Text>
        </View>

        {/* Quick Open Mail App Button */}
        <TouchableOpacity
          onPress={handleOpenEmailApp}
          style={styles.openMailBtn}
          activeOpacity={0.8}
        >
          <Inbox size={14} color="#34D399" />
          <Text style={styles.openMailBtnText}>Open Email App</Text>
          <ExternalLink size={13} color="#34D399" />
        </TouchableOpacity>
      </View>

      {/* 3-Step Instruction Guide */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>HOW TO GET STARTED</Text>

        <View style={styles.stepItem}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Check your email inbox</Text>
            <Text style={styles.stepDescription}>
              Look for the confirmation mail from FitPass / Supabase.
            </Text>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Confirm your email</Text>
            <Text style={styles.stepDescription}>
              Click the <Text style={styles.stepHighlight}>"Confirm your mail"</Text> link in the message.
            </Text>
          </View>
        </View>

        <View style={[styles.stepItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Log in & begin your journey</Text>
            <Text style={styles.stepDescription}>
              Return here, click <Text style={styles.stepHighlight}>Go to Login</Text>, and enter your password.
            </Text>
          </View>
        </View>
      </View>

      {/* Resend Status Notifications */}
      {resendStatus && (
        <View
          style={[
            styles.feedbackBanner,
            resendStatus.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          {resendStatus.type === 'success' ? (
            <CheckCircle2 size={16} color="#34D399" style={{ marginTop: 2 }} />
          ) : (
            <ShieldCheck size={16} color="#F87171" style={{ marginTop: 2 }} />
          )}
          <Text
            style={[
              styles.feedbackText,
              resendStatus.type === 'success'
                ? styles.feedbackTextSuccess
                : styles.feedbackTextError,
            ]}
          >
            {resendStatus.message}
          </Text>
        </View>
      )}

      {/* Primary Action Button: Take user to Login */}
      <TouchableOpacity
        onPress={() => onProceedToLogin(email)}
        style={styles.loginPrimaryButton}
        activeOpacity={0.88}
      >
        <View style={styles.loginButtonContent}>
          <LogIn size={20} color="#052E16" strokeWidth={2.6} />
          <Text style={styles.loginPrimaryButtonText}>Go to Login Page</Text>
          <ArrowRight size={20} color="#052E16" strokeWidth={2.8} />
        </View>
      </TouchableOpacity>

      {/* Resend & Edit Email Utility Row */}
      <View style={styles.utilityActionsRow}>
        <TouchableOpacity
          onPress={handleResend}
          disabled={cooldown > 0 || isResending}
          style={[
            styles.resendActionBtn,
            (cooldown > 0 || isResending) && styles.resendBtnDisabled,
          ]}
          activeOpacity={0.75}
        >
          {isResending ? (
            <ActivityIndicator size="small" color="#34D399" />
          ) : (
            <RefreshCw
              size={13}
              color={cooldown > 0 ? '#64748B' : '#34D399'}
              style={{ marginRight: 4 }}
            />
          )}
          <Text
            style={[
              styles.resendActionText,
              cooldown > 0 && styles.resendActionTextDisabled,
            ]}
          >
            {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend confirmation email'}
          </Text>
        </TouchableOpacity>

        {onChangeEmail && (
          <TouchableOpacity
            onPress={onChangeEmail}
            style={styles.changeEmailBtn}
            activeOpacity={0.75}
          >
            <Edit3 size={13} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.changeEmailText}>Change email</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Helpful Spam Note */}
      <View style={styles.spamNotice}>
        <Text style={styles.spamNoticeText}>
          💡 <Text style={{ fontWeight: '700', color: '#94A3B8' }}>Pro-Tip:</Text> If you don’t find the email in your primary inbox, please check your <Text style={{ color: '#FDE68A', fontWeight: '600' }}>Spam</Text> or <Text style={{ color: '#FDE68A', fontWeight: '600' }}>Promotions</Text> folder.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  heroWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glowAura: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  neoHeroBadge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#161B26',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(52, 211, 153, 0.45)',
    borderLeftColor: 'rgba(52, 211, 153, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeMiniCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#161B26',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#10B981',
    padding: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.25)',
    borderLeftColor: 'rgba(52, 211, 153, 0.15)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#064E3B',
    borderRightColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
  },
  statusPillText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  highlightName: {
    color: '#34D399',
    fontWeight: '700',
  },
  // Email Display Card
  emailCard: {
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
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 14,
  },
  emailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailCardLabel: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secureTagText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '600',
  },
  emailDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#161B26',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emailDisplayText: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  openMailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  openMailBtnText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  // Step-by-Step Instructions Box
  instructionsContainer: {
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
    marginBottom: 16,
  },
  instructionsTitle: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1B2230',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  stepNumberText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepHeading: {
    color: '#F1F5F9',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDescription: {
    color: '#94A3B8',
    fontSize: 11.5,
    lineHeight: 16,
  },
  stepHighlight: {
    color: '#34D399',
    fontWeight: '700',
  },
  // Feedback Banner
  feedbackBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  feedbackText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  feedbackTextSuccess: {
    color: '#34D399',
  },
  feedbackTextError: {
    color: '#FCA5A5',
  },
  // Primary Login Button
  loginPrimaryButton: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#6EE7B7',
    borderLeftColor: '#34D399',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: '#047857',
    borderRightColor: '#047857',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loginPrimaryButtonText: {
    color: '#052E16',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // Utility Row (Resend & Change Email)
  utilityActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  resendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resendBtnDisabled: {
    opacity: 0.6,
  },
  resendActionText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  resendActionTextDisabled: {
    color: '#64748B',
  },
  changeEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  changeEmailText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  // Spam Notice
  spamNotice: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  spamNoticeText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
