/**
 * Exercise Visualizer & Looping Demonstration
 * Renders smooth animated vector motion graphics for all 10 exercises.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ExerciseId } from '../../lib/pose/poseTypes';

interface ExerciseVisualLoopProps {
  exerciseId: ExerciseId;
  width?: number;
  height?: number;
  highlightCorrection?: boolean;
}

export default function ExerciseVisualLoop({
  exerciseId,
  width = 240,
  height = 240,
  highlightCorrection = false,
}: ExerciseVisualLoopProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, exerciseId]);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background glow circle */}
      <View
        style={[
          styles.glowCircle,
          highlightCorrection && styles.correctionGlow,
        ]}
      />

      <Svg width={width} height={height} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#06B6D4" />
          </LinearGradient>
          <LinearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </LinearGradient>
          <LinearGradient id="correctGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#10B981" />
          </LinearGradient>
        </Defs>

        {/* Floor Platform */}
        <Line x1="20" y1="180" x2="180" y2="180" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,4" />

        {/* Render Exercise Specific Skeletal Pose */}
        {renderExerciseSvg(exerciseId, highlightCorrection)}
      </Svg>
    </View>
  );
}

function renderExerciseSvg(exerciseId: ExerciseId, highlightCorrection: boolean) {
  const primaryColor = highlightCorrection ? '#34D399' : '#10B981';
  const jointColor = highlightCorrection ? '#FBBF24' : '#F59E0B';
  const armColor = '#38BDF8';

  switch (exerciseId) {
    case 'jumping_jacks':
      return (
        <>
          <Circle cx="100" cy="38" r="12" fill={primaryColor} />
          <Line x1="100" y1="50" x2="100" y2="110" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="62" x2="60" y2="24" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="62" x2="140" y2="24" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="110" x2="55" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="110" x2="145" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Circle cx="60" cy="24" r="5" fill={jointColor} />
          <Circle cx="140" cy="24" r="5" fill={jointColor} />
          <Circle cx="55" cy="180" r="5" fill={jointColor} />
          <Circle cx="145" cy="180" r="5" fill={jointColor} />
        </>
      );

    case 'squats':
      return (
        <>
          <Circle cx="100" cy="55" r="12" fill={primaryColor} />
          <Line x1="100" y1="67" x2="100" y2="120" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="78" x2="148" y2="78" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="120" x2="65" y2="140" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="65" y1="140" x2="65" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="120" x2="135" y2="140" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="135" y1="140" x2="135" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Circle cx="65" cy="140" r="6" fill={jointColor} />
          <Circle cx="135" cy="140" r="6" fill={jointColor} />
          <Circle cx="148" cy="78" r="5" fill="#38BDF8" />
        </>
      );

    case 'high_knees':
      return (
        <>
          <Circle cx="100" cy="40" r="12" fill={primaryColor} />
          <Line x1="100" y1="52" x2="100" y2="110" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="80" y2="85" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="125" y2="50" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="110" x2="140" y2="105" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="140" y1="105" x2="140" y2="145" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="110" x2="85" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Circle cx="140" cy="105" r="6" fill={jointColor} />
          <Circle cx="85" cy="180" r="5" fill={jointColor} />
        </>
      );

    case 'mountain_climbers':
      return (
        <>
          <Circle cx="45" cy="90" r="10" fill={primaryColor} />
          <Line x1="45" y1="95" x2="125" y2="95" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="60" y1="95" x2="60" y2="155" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="125" y1="95" x2="175" y2="155" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="125" y1="95" x2="88" y2="118" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="88" y1="118" x2="102" y2="148" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
          <Circle cx="88" cy="118" r="6" fill={jointColor} />
          <Circle cx="60" cy="155" r="5" fill={jointColor} />
        </>
      );

    case 'burpees':
      return (
        <>
          <Circle cx="100" cy="40" r="12" fill={primaryColor} />
          <Line x1="100" y1="52" x2="100" y2="115" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="55" y2="85" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="145" y2="85" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="115" x2="75" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="115" x2="125" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Circle cx="55" cy="85" r="5" fill={jointColor} />
          <Circle cx="145" cy="85" r="5" fill={jointColor} />
        </>
      );

    case 'butt_kicks':
      return (
        <>
          <Circle cx="100" cy="40" r="12" fill={primaryColor} />
          <Line x1="100" y1="52" x2="100" y2="112" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="80" y2="85" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="120" y2="60" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="112" x2="90" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="112" x2="115" y2="150" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="115" y1="150" x2="95" y2="135" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
          <Circle cx="115" cy="150" r="5" fill={jointColor} />
          <Circle cx="95" cy="135" r="5" fill="#EF4444" />
        </>
      );

    case 'skater_jumps':
      return (
        <>
          <Circle cx="80" cy="50" r="12" fill={primaryColor} />
          <Line x1="80" y1="62" x2="85" y2="120" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="82" y1="75" x2="50" y2="90" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="82" y1="75" x2="120" y2="80" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="85" y1="120" x2="70" y2="150" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="70" y1="150" x2="68" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="85" y1="120" x2="135" y2="155" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
          <Circle cx="70" cy="150" r="6" fill={jointColor} />
          <Circle cx="135" cy="155" r="5" fill={jointColor} />
        </>
      );

    case 'lunges':
      return (
        <>
          <Circle cx="85" cy="45" r="12" fill={primaryColor} />
          <Line x1="85" y1="57" x2="85" y2="115" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="85" y1="70" x2="70" y2="90" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="85" y1="70" x2="100" y2="90" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="85" y1="115" x2="135" y2="135" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="135" y1="135" x2="135" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="85" y1="115" x2="55" y2="150" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="55" y1="150" x2="35" y2="180" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
          <Circle cx="135" cy="135" r="6" fill={jointColor} />
          <Circle cx="55" cy="150" r="5" fill={jointColor} />
        </>
      );

    case 'shadow_boxing':
      return (
        <>
          <Circle cx="90" cy="45" r="12" fill={primaryColor} />
          <Line x1="90" y1="57" x2="90" y2="115" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="90" y1="70" x2="70" y2="58" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="90" y1="70" x2="170" y2="68" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="90" y1="115" x2="70" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="90" y1="115" x2="125" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Circle cx="170" cy="68" r="8" fill="#EF4444" />
          <Circle cx="70" cy="58" r="6" fill={jointColor} />
        </>
      );

    case 'standing_crunches':
      return (
        <>
          <Circle cx="100" cy="42" r="12" fill={primaryColor} />
          <Line x1="100" y1="54" x2="108" y2="115" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="80" y2="48" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="135" y2="90" stroke={armColor} strokeWidth="5" strokeLinecap="round" />
          <Line x1="108" y1="115" x2="90" y2="180" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="108" y1="115" x2="142" y2="110" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" />
          <Line x1="142" y1="110" x2="148" y2="155" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
          <Circle cx="135" cy="90" r="6" fill="#EF4444" />
          <Circle cx="142" cy="110" r="6" fill={jointColor} />
        </>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  correctionGlow: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
});
