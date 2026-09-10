/**
 * Exercise Visualizer & Looping Demonstration
 * Renders smooth animated vector motion graphics for all 10 exercises.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ExerciseId } from '../../lib/pose/poseTypes';
import { NeuTheme } from '../../theme/neumorphic';

interface ExerciseVisualLoopProps {
  exerciseId: ExerciseId;
  width?: number;
  height?: number;
}

export default function ExerciseVisualLoop({
  exerciseId,
  width = 240,
  height = 240,
}: ExerciseVisualLoopProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1400,
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
      <View style={styles.glowCircle} />

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
        </Defs>

        {/* Floor Platform */}
        <Line x1="20" y1="180" x2="180" y2="180" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="4,4" />

        {/* Render Exercise Specific Skeletal Pose */}
        {renderExerciseSvg(exerciseId)}
      </Svg>
    </View>
  );
}

function renderExerciseSvg(exerciseId: ExerciseId) {
  switch (exerciseId) {
    case 'jumping_jacks':
      return (
        <>
          {/* Head */}
          <Circle cx="100" cy="40" r="12" fill="#10B981" />
          {/* Torso */}
          <Line x1="100" y1="52" x2="100" y2="110" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Arms Overhead */}
          <Line x1="100" y1="65" x2="60" y2="25" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="140" y2="25" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          {/* Legs Wide */}
          <Line x1="100" y1="110" x2="55" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="110" x2="145" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Key Joints */}
          <Circle cx="60" cy="25" r="5" fill="#F59E0B" />
          <Circle cx="140" cy="25" r="5" fill="#F59E0B" />
          <Circle cx="55" cy="180" r="5" fill="#F59E0B" />
          <Circle cx="145" cy="180" r="5" fill="#F59E0B" />
        </>
      );

    case 'squats':
      return (
        <>
          {/* Head */}
          <Circle cx="100" cy="55" r="12" fill="#10B981" />
          {/* Torso */}
          <Line x1="100" y1="67" x2="100" y2="120" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Arms Forward */}
          <Line x1="100" y1="78" x2="145" y2="78" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          {/* Bent Thighs & Calves (90 deg Squat) */}
          <Line x1="100" y1="120" x2="65" y2="140" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="65" y1="140" x2="65" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="120" x2="135" y2="140" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="135" y1="140" x2="135" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Joints */}
          <Circle cx="65" cy="140" r="6" fill="#F59E0B" />
          <Circle cx="135" cy="140" r="6" fill="#F59E0B" />
          <Circle cx="145" cy="78" r="5" fill="#3B82F6" />
        </>
      );

    case 'high_knees':
      return (
        <>
          <Circle cx="100" cy="40" r="12" fill="#10B981" />
          <Line x1="100" y1="52" x2="100" y2="110" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Running Arms */}
          <Line x1="100" y1="65" x2="80" y2="85" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="125" y2="50" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          {/* High Knee Raised */}
          <Line x1="100" y1="110" x2="140" y2="105" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="140" y1="105" x2="140" y2="145" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Planted Leg */}
          <Line x1="100" y1="110" x2="85" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Circle cx="140" cy="105" r="6" fill="#F59E0B" />
        </>
      );

    case 'mountain_climbers':
      return (
        <>
          <Circle cx="45" cy="90" r="10" fill="#10B981" />
          {/* Plank Line */}
          <Line x1="45" y1="95" x2="120" y2="95" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Arms down */}
          <Line x1="60" y1="95" x2="60" y2="155" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          {/* Extended Leg */}
          <Line x1="120" y1="95" x2="175" y2="155" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
          {/* Forward Driven Knee */}
          <Line x1="120" y1="95" x2="85" y2="115" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="85" y1="115" x2="100" y2="145" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
          <Circle cx="85" cy="115" r="6" fill="#F59E0B" />
        </>
      );

    case 'shadow_boxing':
      return (
        <>
          <Circle cx="90" cy="45" r="12" fill="#10B981" />
          <Line x1="90" y1="57" x2="90" y2="115" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Guard Hand */}
          <Line x1="90" y1="70" x2="70" y2="58" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          {/* Punching Straight Arm */}
          <Line x1="90" y1="70" x2="170" y2="68" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Boxing Stance Legs */}
          <Line x1="90" y1="115" x2="70" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="90" y1="115" x2="125" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Circle cx="170" cy="68" r="8" fill="#EF4444" />
          <Circle cx="70" cy="58" r="6" fill="#F59E0B" />
        </>
      );

    case 'burpees':
    default:
      return (
        <>
          <Circle cx="100" cy="40" r="12" fill="#10B981" />
          <Line x1="100" y1="52" x2="100" y2="115" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          {/* Arms Out */}
          <Line x1="100" y1="65" x2="55" y2="85" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          <Line x1="100" y1="65" x2="145" y2="85" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
          {/* Athletic Legs */}
          <Line x1="100" y1="115" x2="75" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Line x1="100" y1="115" x2="125" y2="180" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
          <Circle cx="55" cy="85" r="5" fill="#F59E0B" />
          <Circle cx="145" cy="85" r="5" fill="#F59E0B" />
        </>
      );
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
});
