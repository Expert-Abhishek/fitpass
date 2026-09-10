/**
 * Phase 2: Active Workout Heads-Up Display (HUD)
 * Mirrored live video stream, 33-point BlazePose skeleton wireframe,
 * large spring-scale rep counter, real-time dynamic coaching tips,
 * confidence gatekeeping and audio-haptic feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import {
  X,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle,
  Timer,
  Layers,
} from 'lucide-react-native';
import {
  ExerciseDefinition,
  NormalizedLandmark,
  ExerciseDetectorResult,
  WorkoutSessionSummary,
} from '../../lib/pose/poseTypes';
import { ExerciseTrackerEngine } from '../../lib/pose/exerciseDetectors';
import { PoseDetectorRunner } from '../../lib/pose/mediaPipePoseRunner';
import { audioHaptics } from '../../lib/pose/audioHapticFeedback';
import SkeletonOverlay from './SkeletonOverlay';
import { NeuTheme } from '../../theme/neumorphic';

interface ActiveWorkoutHUDProps {
  exercise: ExerciseDefinition;
  targetReps: number;
  totalSets: number;
  onFinishWorkout: (summary: WorkoutSessionSummary) => void;
  onCancel: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ActiveWorkoutHUD({
  exercise,
  targetReps,
  totalSets,
  onFinishWorkout,
  onCancel,
}: ActiveWorkoutHUDProps) {
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(0);
  const [totalSessionReps, setTotalSessionReps] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[]>([]);
  const [currentAngle, setCurrentAngle] = useState<number | undefined>(undefined);
  const [targetAngle, setTargetAngle] = useState<number | undefined>(undefined);
  const [coachingTip, setCoachingTip] = useState('Position yourself in view');
  const [isConfidenceLow, setIsConfidenceLow] = useState(false);
  const [formQuality, setFormQuality] = useState<'good' | 'warning' | 'info'>('info');

  // Animation values
  const repScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  // Video and engine references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const engineRef = useRef<ExerciseTrackerEngine | null>(null);
  const runnerRef = useRef<PoseDetectorRunner | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize Engine & Camera Stream
  useEffect(() => {
    engineRef.current = new ExerciseTrackerEngine(exercise.id);
    runnerRef.current = new PoseDetectorRunner();

    // Start Pose Engine loop
    if (videoRef.current) {
      runnerRef.current.start(videoRef.current, handlePoseFrame);
    }

    // Start Session Timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (runnerRef.current) runnerRef.current.stop();
    };
  }, [exercise.id]);

  // Process Each Frame
  const handlePoseFrame = (lms: NormalizedLandmark[]) => {
    setLandmarks(lms);

    if (!engineRef.current || isPaused) return;

    const result: ExerciseDetectorResult = engineRef.current.processFrame(lms);

    setIsConfidenceLow(result.isConfidenceLow);
    setCoachingTip(result.feedback.message);
    setFormQuality(result.feedback.type);
    setCurrentAngle(result.currentAngle);
    setTargetAngle(result.targetAngle);

    // On Rep Incremented
    if (result.repIncremented) {
      const nextRep = result.repCount;
      setReps(nextRep);
      setTotalSessionReps((prev) => prev + 1);

      // Trigger audio & haptics
      audioHaptics.playRepSuccessChime();

      // Trigger spring scale bounce animation
      triggerRepBounce();

      // Check if Set Completed
      if (nextRep >= targetReps) {
        handleSetCompletion(nextRep);
      }
    }
  };

  const triggerRepBounce = () => {
    repScale.setValue(1.4);
    Animated.spring(repScale, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Flash glow
    pulseOpacity.setValue(0.6);
    Animated.timing(pulseOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleSetCompletion = (finishedReps: number) => {
    if (currentSet < totalSets) {
      Alert.alert(
        `Set ${currentSet} Complete! 🎯`,
        `Take a ${exercise.restSeconds}s breather before Set ${currentSet + 1}.`,
        [
          {
            text: 'Next Set',
            onPress: () => {
              setCurrentSet((prev) => prev + 1);
              setReps(0);
              if (engineRef.current) {
                engineRef.current.reset();
              }
            },
          },
        ]
      );
    } else {
      // Completed all sets
      completeSession();
    }
  };

  const completeSession = () => {
    const totalRepsDone = totalSessionReps + reps;
    const caloriesBurned = Math.round(
      totalRepsDone * exercise.calorieBurnPerRep + (elapsedSeconds / 60) * 1.5
    );

    const summary: WorkoutSessionSummary = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      totalReps: totalRepsDone,
      totalSets: currentSet,
      targetReps: targetReps * totalSets,
      durationSeconds: elapsedSeconds,
      caloriesBurned,
      averageFormScore: 94,
      heartRateZone: elapsedSeconds > 180 ? 'Cardio' : 'Fat Burn',
      timestamp: new Date().toISOString(),
    };

    onFinishWorkout(summary);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 1. Mirrored Camera Video Stream (HTML5 Video for WebRTC / Web) */}
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' ? (
          <video
            ref={videoRef as any}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirrored view
              backgroundColor: '#0F172A',
            }}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <View style={styles.fallbackCamera}>
            <Text style={styles.fallbackText}>Camera Feed</Text>
          </View>
        )}

        {/* 2. Skeleton Wireframe Overlay */}
        <SkeletonOverlay
          landmarks={landmarks}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          isGoodForm={formQuality === 'good'}
          currentAngle={currentAngle}
          targetAngle={targetAngle}
          isConfidenceLow={isConfidenceLow}
        />

        {/* Rep Success Flash Glow */}
        <Animated.View
          style={[
            styles.flashGlow,
            {
              opacity: pulseOpacity,
            },
          ]}
          pointerEvents="none"
        />
      </View>

      {/* 3. Top HUD Navigation & Status Bar */}
      <View style={styles.topHud}>
        <View style={styles.topHudLeft}>
          <TouchableOpacity
            style={styles.hudIconBtn}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View>
            <Text style={styles.hudTitle}>{exercise.name}</Text>
            <View style={styles.setRow}>
              <Layers size={11} color="#10B981" />
              <Text style={styles.hudSubtitle}>
                Set {currentSet} of {totalSets}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.topHudRight}>
          <View style={styles.timerBadge}>
            <Timer size={13} color="#38BDF8" />
            <Text style={styles.timerText}>{formatTimer(elapsedSeconds)}</Text>
          </View>

          <TouchableOpacity
            style={styles.finishBtn}
            onPress={completeSession}
            activeOpacity={0.8}
          >
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Confidence Gatekeeper Banner */}
      {isConfidenceLow && (
        <View style={styles.warningBanner}>
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={styles.warningText}>
            Step back into full camera frame
          </Text>
        </View>
      )}

      {/* 5. Center-Right Large Rep Counter Widget */}
      <View style={styles.counterWidget}>
        <Animated.View
          style={[
            styles.repCard,
            {
              transform: [{ scale: repScale }],
            },
          ]}
        >
          <Text style={styles.repLabel}>REPS</Text>
          <Text style={styles.repNumber}>{reps}</Text>
          <Text style={styles.targetSub}>/ {targetReps}</Text>
        </Animated.View>
      </View>

      {/* 6. Bottom Sheet Coaching & Form Guidance */}
      <View style={styles.bottomHud}>
        <View
          style={[
            styles.coachingCard,
            formQuality === 'good'
              ? styles.coachGood
              : formQuality === 'warning'
              ? styles.coachWarning
              : styles.coachInfo,
          ]}
        >
          <View style={styles.coachHeader}>
            <Sparkles
              size={14}
              color={formQuality === 'good' ? '#10B981' : '#F59E0B'}
            />
            <Text style={styles.coachLabel}>REAL-TIME AI COACH</Text>
          </View>
          <Text style={styles.coachMessage} numberOfLines={2}>
            {coachingTip}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  fallbackCamera: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  flashGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 8,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  topHud: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  topHudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hudIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hudTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hudSubtitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10B981',
  },
  topHudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  finishBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  finishBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  warningBanner: {
    position: 'absolute',
    top: 104,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 25,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  counterWidget: {
    position: 'absolute',
    right: 20,
    top: '32%',
    zIndex: 20,
  },
  repCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    minWidth: 92,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  repLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  repNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 52,
    marginVertical: 2,
  },
  targetSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  bottomHud: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  coachingCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  coachGood: {
    borderColor: '#10B981',
  },
  coachWarning: {
    borderColor: '#F59E0B',
  },
  coachInfo: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  coachMessage: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
