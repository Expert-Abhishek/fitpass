/**
 * MediaPipe BlazePose 33-Keypoint Topology & Pose Engine Types
 */

export interface NormalizedLandmark {
  x: number; // 0.0 to 1.0 (left to right)
  y: number; // 0.0 to 1.0 (top to bottom)
  z?: number; // depth
  visibility?: number; // 0.0 to 1.0 confidence
}

/**
 * Standard 33 MediaPipe BlazePose landmark indices
 */
export const BLAZEPOSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export type LandmarkIndex = typeof BLAZEPOSE_LANDMARKS[keyof typeof BLAZEPOSE_LANDMARKS];

/**
 * Skeleton bone connections for wireframe rendering
 */
export const POSE_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  // Head / Face
  [BLAZEPOSE_LANDMARKS.LEFT_EAR, BLAZEPOSE_LANDMARKS.LEFT_EYE_OUTER],
  [BLAZEPOSE_LANDMARKS.LEFT_EYE_OUTER, BLAZEPOSE_LANDMARKS.LEFT_EYE],
  [BLAZEPOSE_LANDMARKS.LEFT_EYE, BLAZEPOSE_LANDMARKS.LEFT_EYE_INNER],
  [BLAZEPOSE_LANDMARKS.LEFT_EYE_INNER, BLAZEPOSE_LANDMARKS.NOSE],
  [BLAZEPOSE_LANDMARKS.NOSE, BLAZEPOSE_LANDMARKS.RIGHT_EYE_INNER],
  [BLAZEPOSE_LANDMARKS.RIGHT_EYE_INNER, BLAZEPOSE_LANDMARKS.RIGHT_EYE],
  [BLAZEPOSE_LANDMARKS.RIGHT_EYE, BLAZEPOSE_LANDMARKS.RIGHT_EYE_OUTER],
  [BLAZEPOSE_LANDMARKS.RIGHT_EYE_OUTER, BLAZEPOSE_LANDMARKS.RIGHT_EAR],
  [BLAZEPOSE_LANDMARKS.MOUTH_LEFT, BLAZEPOSE_LANDMARKS.MOUTH_RIGHT],

  // Torso
  [BLAZEPOSE_LANDMARKS.LEFT_SHOULDER, BLAZEPOSE_LANDMARKS.RIGHT_SHOULDER],
  [BLAZEPOSE_LANDMARKS.LEFT_SHOULDER, BLAZEPOSE_LANDMARKS.LEFT_HIP],
  [BLAZEPOSE_LANDMARKS.RIGHT_SHOULDER, BLAZEPOSE_LANDMARKS.RIGHT_HIP],
  [BLAZEPOSE_LANDMARKS.LEFT_HIP, BLAZEPOSE_LANDMARKS.RIGHT_HIP],

  // Left Arm
  [BLAZEPOSE_LANDMARKS.LEFT_SHOULDER, BLAZEPOSE_LANDMARKS.LEFT_ELBOW],
  [BLAZEPOSE_LANDMARKS.LEFT_ELBOW, BLAZEPOSE_LANDMARKS.LEFT_WRIST],
  [BLAZEPOSE_LANDMARKS.LEFT_WRIST, BLAZEPOSE_LANDMARKS.LEFT_PINKY],
  [BLAZEPOSE_LANDMARKS.LEFT_WRIST, BLAZEPOSE_LANDMARKS.LEFT_INDEX],
  [BLAZEPOSE_LANDMARKS.LEFT_WRIST, BLAZEPOSE_LANDMARKS.LEFT_THUMB],

  // Right Arm
  [BLAZEPOSE_LANDMARKS.RIGHT_SHOULDER, BLAZEPOSE_LANDMARKS.RIGHT_ELBOW],
  [BLAZEPOSE_LANDMARKS.RIGHT_ELBOW, BLAZEPOSE_LANDMARKS.RIGHT_WRIST],
  [BLAZEPOSE_LANDMARKS.RIGHT_WRIST, BLAZEPOSE_LANDMARKS.RIGHT_PINKY],
  [BLAZEPOSE_LANDMARKS.RIGHT_WRIST, BLAZEPOSE_LANDMARKS.RIGHT_INDEX],
  [BLAZEPOSE_LANDMARKS.RIGHT_WRIST, BLAZEPOSE_LANDMARKS.RIGHT_THUMB],

  // Left Leg
  [BLAZEPOSE_LANDMARKS.LEFT_HIP, BLAZEPOSE_LANDMARKS.LEFT_KNEE],
  [BLAZEPOSE_LANDMARKS.LEFT_KNEE, BLAZEPOSE_LANDMARKS.LEFT_ANKLE],
  [BLAZEPOSE_LANDMARKS.LEFT_ANKLE, BLAZEPOSE_LANDMARKS.LEFT_HEEL],
  [BLAZEPOSE_LANDMARKS.LEFT_HEEL, BLAZEPOSE_LANDMARKS.LEFT_FOOT_INDEX],
  [BLAZEPOSE_LANDMARKS.LEFT_ANKLE, BLAZEPOSE_LANDMARKS.LEFT_FOOT_INDEX],

  // Right Leg
  [BLAZEPOSE_LANDMARKS.RIGHT_HIP, BLAZEPOSE_LANDMARKS.RIGHT_KNEE],
  [BLAZEPOSE_LANDMARKS.RIGHT_KNEE, BLAZEPOSE_LANDMARKS.RIGHT_ANKLE],
  [BLAZEPOSE_LANDMARKS.RIGHT_ANKLE, BLAZEPOSE_LANDMARKS.RIGHT_HEEL],
  [BLAZEPOSE_LANDMARKS.RIGHT_HEEL, BLAZEPOSE_LANDMARKS.RIGHT_FOOT_INDEX],
  [BLAZEPOSE_LANDMARKS.RIGHT_ANKLE, BLAZEPOSE_LANDMARKS.RIGHT_FOOT_INDEX],
];

/**
 * Exercise IDs for the 10 Cardio & Bodyweight Exercises
 */
export type ExerciseId =
  | 'jumping_jacks'
  | 'squats'
  | 'high_knees'
  | 'mountain_climbers'
  | 'burpees'
  | 'butt_kicks'
  | 'skater_jumps'
  | 'lunges'
  | 'shadow_boxing'
  | 'standing_crunches';

/**
 * 3-State Finite State Machine (FSM)
 */
export type FSMState = 'STATE_IDLE' | 'STATE_IN_PROGRESS' | 'STATE_REP_COMPLETED';

export interface FormFeedback {
  type: 'good' | 'warning' | 'info';
  message: string;
}

export interface ExerciseDetectorResult {
  state: FSMState;
  repIncremented: boolean;
  repCount: number;
  progressPercentage: number; // 0 to 100% of current rep motion
  currentAngle?: number;
  targetAngle?: number;
  feedback: FormFeedback;
  isConfidenceLow: boolean;
  isFormFault?: boolean;
  faultReason?: string;
}

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  category: 'Cardio' | 'Strength' | 'Agility' | 'Core';
  targetMuscles: string[];
  calorieBurnPerRep: number; // kcal
  estimatedMets: number;
  instructions: string[];
  tips: string[];
  recommendedReps: number;
  recommendedSets: number;
  restSeconds: number;
  iconName: string;
}

export interface WorkoutSessionSummary {
  exerciseId: ExerciseId;
  exerciseName: string;
  totalReps: number;
  totalSets: number;
  targetReps: number;
  durationSeconds: number;
  caloriesBurned: number;
  averageFormScore: number;
  heartRateZone: 'Warmup' | 'Fat Burn' | 'Cardio' | 'Peak';
  timestamp: string;
}
