/**
 * Main AI Real-Time Exercise & Cardio Tracker Orchestration Modal
 * Coordinates the full workout flow:
 * Catalog Selection -> Phase 1 Preview -> Phase 2 Active HUD -> Phase 3 Wrap-up.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ExerciseDefinition, WorkoutSessionSummary } from '../../lib/pose/poseTypes';
import { EXERCISE_DEFINITIONS } from '../../lib/pose/exerciseDefinitions';
import ExerciseCatalogModal from './ExerciseCatalogModal';
import ExercisePreviewModal from './ExercisePreviewModal';
import ActiveWorkoutHUD from './ActiveWorkoutHUD';
import SessionSummaryModal from './SessionSummaryModal';

interface AIExerciseTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  onWorkoutCompleted?: (summary: WorkoutSessionSummary) => void;
}

type TrackerFlowState = 'catalog' | 'preview' | 'active' | 'summary';

export default function AIExerciseTrackerModal({
  visible,
  onClose,
  onWorkoutCompleted,
}: AIExerciseTrackerModalProps) {
  const [flowState, setFlowState] = useState<TrackerFlowState>('catalog');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition>(
    EXERCISE_DEFINITIONS.squats
  );
  const [sessionConfig, setSessionConfig] = useState({ reps: 15, sets: 3 });
  const [sessionSummary, setSessionSummary] = useState<WorkoutSessionSummary | null>(null);

  if (!visible) return null;

  const handleSelectExercise = (exercise: ExerciseDefinition) => {
    setSelectedExercise(exercise);
    setFlowState('preview');
  };

  const handleStartWorkout = (config: { reps: number; sets: number }) => {
    setSessionConfig(config);
    setFlowState('active');
  };

  const handleFinishWorkout = (summary: WorkoutSessionSummary) => {
    setSessionSummary(summary);
    setFlowState('summary');
    if (onWorkoutCompleted) {
      onWorkoutCompleted(summary);
    }
  };

  const handleCloseEntireFlow = () => {
    setFlowState('catalog');
    setSessionSummary(null);
    onClose();
  };

  return (
    <>
      {/* 1. Catalog Selection */}
      <ExerciseCatalogModal
        visible={flowState === 'catalog'}
        onClose={handleCloseEntireFlow}
        onSelectExercise={handleSelectExercise}
      />

      {/* 2. Phase 1: Preview & 3-2-1 Countdown */}
      <ExercisePreviewModal
        visible={flowState === 'preview'}
        exercise={selectedExercise}
        onClose={() => setFlowState('catalog')}
        onStartSession={handleStartWorkout}
      />

      {/* 3. Phase 2: Active Workout Heads-Up Display (HUD) */}
      {flowState === 'active' && (
        <Modal visible animationType="none" transparent={false}>
          <ActiveWorkoutHUD
            exercise={selectedExercise}
            targetReps={sessionConfig.reps}
            totalSets={sessionConfig.sets}
            onFinishWorkout={handleFinishWorkout}
            onCancel={() => setFlowState('preview')}
          />
        </Modal>
      )}

      {/* 4. Phase 3: Session Wrap-up & Summary */}
      <SessionSummaryModal
        visible={flowState === 'summary'}
        summary={sessionSummary}
        onClose={handleCloseEntireFlow}
        onSaveAndExit={handleCloseEntireFlow}
      />
    </>
  );
}
