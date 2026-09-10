/**
 * Real-Time 33-Point BlazePose Skeleton Wireframe Overlay
 * Renders joints, bones, tracking vectors and live angle tags.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  NormalizedLandmark,
  POSE_CONNECTIONS,
  BLAZEPOSE_LANDMARKS as LM,
} from '../../lib/pose/poseTypes';

interface SkeletonOverlayProps {
  landmarks: NormalizedLandmark[];
  width: number;
  height: number;
  isGoodForm?: boolean;
  currentAngle?: number;
  targetAngle?: number;
  isConfidenceLow?: boolean;
}

export default function SkeletonOverlay({
  landmarks,
  width,
  height,
  isGoodForm = true,
  currentAngle,
  targetAngle,
  isConfidenceLow = false,
}: SkeletonOverlayProps) {
  if (!landmarks || landmarks.length < 33 || isConfidenceLow) {
    return null;
  }

  // Key tracking color
  const boneColor = isGoodForm ? '#10B981' : '#F59E0B'; // Emerald vs Amber
  const jointColor = '#06B6D4'; // Cyan
  const highlightJointColor = '#FBBF24'; // Amber Gold

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="activeBone" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* 1. Render Bone Connectors */}
        {POSE_CONNECTIONS.map(([idx1, idx2], index) => {
          const p1 = landmarks[idx1];
          const p2 = landmarks[idx2];

          if (!p1 || !p2) return null;
          if ((p1.visibility ?? 1) < 0.5 || (p2.visibility ?? 1) < 0.5) return null;

          const x1 = p1.x * width;
          const y1 = p1.y * height;
          const x2 = p2.x * width;
          const y2 = p2.y * height;

          return (
            <Line
              key={`bone-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={boneColor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeOpacity={0.85}
            />
          );
        })}

        {/* 2. Render Key Joints */}
        {landmarks.map((lm, idx) => {
          if (!lm || (lm.visibility ?? 1) < 0.5) return null;

          const cx = lm.x * width;
          const cy = lm.y * height;

          const isMajorJoint = [
            LM.LEFT_SHOULDER,
            LM.RIGHT_SHOULDER,
            LM.LEFT_ELBOW,
            LM.RIGHT_ELBOW,
            LM.LEFT_WRIST,
            LM.RIGHT_WRIST,
            LM.LEFT_HIP,
            LM.RIGHT_HIP,
            LM.LEFT_KNEE,
            LM.RIGHT_KNEE,
            LM.LEFT_ANKLE,
            LM.RIGHT_ANKLE,
          ].includes(idx as any);

          const r = isMajorJoint ? 6 : 3.5;
          const fill = isMajorJoint ? highlightJointColor : jointColor;

          return (
            <Circle
              key={`joint-${idx}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={fill}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>

      {/* 3. Live Angle Badge (positioned near Knee / Elbow) */}
      {currentAngle !== undefined && (
        <View
          style={[
            styles.angleBadge,
            {
              left: (landmarks[LM.LEFT_KNEE]?.x ?? 0.5) * width - 40,
              top: (landmarks[LM.LEFT_KNEE]?.y ?? 0.5) * height - 32,
              backgroundColor: isGoodForm ? 'rgba(16, 185, 129, 0.88)' : 'rgba(245, 158, 11, 0.88)',
            },
          ]}
        >
          <Text style={styles.angleText}>{currentAngle}°</Text>
          {targetAngle !== undefined && (
            <Text style={styles.targetAngleText}>/ {targetAngle}°</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  angleBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    gap: 3,
  },
  angleText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  targetAngleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
