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
import { NeuTheme } from '../theme/neumorphic';
import NeuCard from './neumorphic/NeuCard';

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

  // Pulse animation for the hero badge
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badgeGlowAnim = useRef(new Animated.Value(0.4)).current;
  const slideUpAnim = useRef(new Animated.Value(15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(badgeGlowAnim, {
            toValue: 0.8,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(badgeGlowAnim, {
            toValue: 0.4,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

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
          message: error.message || 'Failed to resend verification email.',
        });
      } else {
        setResendStatus({
          type: 'success',
          message: 'Verification email resent! Check your inbox & spam folder.',
        });
        setCooldown(60);
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
      {/* Hero Badge */}
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
          <Mail size={32} color={NeuTheme.colors.emerald} strokeWidth={2.2} />
          <View style={styles.badgeMiniCheck}>
            <CheckCircle2 size={16} color="#052E16" fill={NeuTheme.colors.emerald} />
          </View>
        </View>
      </View>

      {/* Verification Status Pill */}
      <View style={styles.statusPill}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusPillText}>CONFIRMATION LINK SENT</Text>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>Successfully Registered! 🎉</Text>
      <Text style={styles.subtitle}>
        Welcome aboard, <Text style={styles.highlightName}>{athleteName}</Text>! We’ve sent a confirmation email to verify your address. Once confirmed, you can log in below.
      </Text>

      {/* Email Address Recessed Card */}
      <NeuCard variant="inset" padding={12} borderRadius={16} style={styles.emailCard}>
        <View style={styles.emailCardHeader}>
          <Text style={styles.emailCardLabel}>CONFIRMATION SENT TO</Text>
          <View style={styles.secureTag}>
            <ShieldCheck size={12} color="#047857" />
            <Text style={styles.secureTagText}>Encrypted</Text>
          </View>
        </View>

        <View style={styles.emailDisplayRow}>
          <Mail size={16} color={NeuTheme.colors.emerald} />
          <Text style={styles.emailDisplayText} numberOfLines={1} ellipsizeMode="middle">
            {email}
          </Text>
        </View>

        {/* Quick Open Mail App Button */}
        <TouchableOpacity
          onPress={handleOpenEmailApp}
          style={styles.openMailBtn}
          activeOpacity={0.82}
        >
          <Inbox size={13} color="#047857" />
          <Text style={styles.openMailBtnText}>Open Email App</Text>
          <ExternalLink size={12} color="#047857" />
        </TouchableOpacity>
      </NeuCard>

      {/* 3-Step Instruction Guide */}
      <NeuCard variant="inset" padding={12} borderRadius={16} style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>HOW TO GET STARTED</Text>

        <View style={styles.stepItem}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Check your email inbox</Text>
            <Text style={styles.stepDescription}>
              Look for the confirmation mail from FitPass.
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
            <Text style={styles.stepHeading}>Log in & begin your blueprint</Text>
            <Text style={styles.stepDescription}>
              Return here, click <Text style={styles.stepHighlight}>Go to Login</Text>, and enter password.
            </Text>
          </View>
        </View>
      </NeuCard>

      {/* Resend Status Notifications */}
      {resendStatus && (
        <View
          style={[
            styles.feedbackBanner,
            resendStatus.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          {resendStatus.type === 'success' ? (
            <CheckCircle2 size={15} color="#047857" style={{ marginTop: 2 }} />
          ) : (
            <ShieldCheck size={15} color="#DC2626" style={{ marginTop: 2 }} />
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
          <LogIn size={18} color="#052E16" strokeWidth={2.6} />
          <Text style={styles.loginPrimaryButtonText}>Go to Login Page</Text>
          <ArrowRight size={18} color="#052E16" strokeWidth={2.8} />
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
            <ActivityIndicator size="small" color={NeuTheme.colors.emerald} />
          ) : (
            <RefreshCw
              size={12}
              color={cooldown > 0 ? NeuTheme.colors.textMuted : NeuTheme.colors.emerald}
              style={{ marginRight: 4 }}
            />
          )}
          <Text
            style={[
              styles.resendActionText,
              cooldown > 0 && styles.resendActionTextDisabled,
            ]}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend confirmation email'}
          </Text>
        </TouchableOpacity>

        {onChangeEmail && (
          <TouchableOpacity
            onPress={onChangeEmail}
            style={styles.changeEmailBtn}
            activeOpacity={0.75}
          >
            <Edit3 size={12} color={NeuTheme.colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.changeEmailText}>Change email</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Helpful Spam Note */}
      <View style={styles.spamNotice}>
        <Text style={styles.spamNoticeText}>
          💡 <Text style={{ fontWeight: '700', color: NeuTheme.colors.textPrimary }}>Pro-Tip:</Text> Check your <Text style={{ color: '#D97706', fontWeight: '700' }}>Spam</Text> or <Text style={{ color: '#D97706', fontWeight: '700' }}>Promotions</Text> tab if you don’t find the email in 1-2 min.
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
    marginBottom: 14,
  },
  glowAura: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  neoHeroBadge: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raised,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(163, 177, 198, 0.5)',
    borderRightColor: 'rgba(163, 177, 198, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMiniCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: NeuTheme.colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: NeuTheme.colors.emerald,
    padding: 1.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.emeraldBg,
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 16,
    marginBottom: 10,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  statusPillText: {
    color: '#065F46',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12.5,
    color: NeuTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  highlightName: {
    color: '#047857',
    fontWeight: '800',
  },
  emailCard: {
    width: '100%',
    marginBottom: 12,
  },
  emailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  emailCardLabel: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  secureTagText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
  },
  emailDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  emailDisplayText: {
    flex: 1,
    color: NeuTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  openMailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NeuTheme.colors.emeraldBg,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 5,
  },
  openMailBtnText: {
    color: '#047857',
    fontSize: 11.5,
    fontWeight: '800',
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 14,
  },
  instructionsTitle: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.25)',
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepHeading: {
    color: NeuTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 1,
  },
  stepDescription: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  stepHighlight: {
    color: '#047857',
    fontWeight: '800',
  },
  feedbackBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    borderRadius: 10,
    padding: 9,
    marginBottom: 12,
  },
  feedbackSuccess: {
    backgroundColor: NeuTheme.colors.emeraldBg,
  },
  feedbackError: {
    backgroundColor: NeuTheme.colors.coralBg,
  },
  feedbackText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: '#065F46',
  },
  feedbackTextError: {
    color: '#B91C1C',
  },
  loginPrimaryButton: {
    width: '100%',
    backgroundColor: NeuTheme.colors.emerald,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginPrimaryButtonText: {
    color: '#052E16',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  utilityActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  resendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendBtnDisabled: {
    opacity: 0.55,
  },
  resendActionText: {
    color: '#047857',
    fontSize: 11.5,
    fontWeight: '700',
  },
  resendActionTextDisabled: {
    color: NeuTheme.colors.textMuted,
  },
  changeEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  changeEmailText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  spamNotice: {
    width: '100%',
    backgroundColor: NeuTheme.colors.recessedWell,
    borderRadius: 10,
    padding: 8,
    marginTop: 12,
  },
  spamNoticeText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
  },
});
