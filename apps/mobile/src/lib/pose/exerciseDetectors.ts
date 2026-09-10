/**
 * Core 3-State Finite State Machine (FSM) Exercise Detectors
 * Provides high-precision rep counting and real-time form feedback for 10 exercises.
 */

import {
  NormalizedLandmark,
  BLAZEPOSE_LANDMARKS as LM,
  ExerciseId,
  FSMState,
  ExerciseDetectorResult,
} from './poseTypes';
import {
  calculate2DAngle,
  calculateDistance,
  areLandmarksVisible,
  clampPercentage,
} from './geometry';

const MIN_CONFIDENCE = 0.65;
const HARD_COOLDOWN_MS = 400; // 400ms debounce between consecutive reps

export class ExerciseTrackerEngine {
  private exerciseId: ExerciseId;
  private state: FSMState = 'STATE_IDLE';
  private repCount: number = 0;
  private lastRepTimestamp: number = 0;
  private subStep: number = 0; // For multi-step exercises like Burpees
  private sideToggle: 'left' | 'right' | 'none' = 'none'; // For alternate high knees / skaters
  private baselineAnchorX: number | null = null; // For skater jumps

  constructor(exerciseId: ExerciseId) {
    this.exerciseId = exerciseId;
    this.reset();
  }

  public setExercise(id: ExerciseId) {
    this.exerciseId = id;
    this.reset();
  }

  public reset() {
    this.state = 'STATE_IDLE';
    this.repCount = 0;
    this.lastRepTimestamp = 0;
    this.subStep = 0;
    this.sideToggle = 'none';
    this.baselineAnchorX = null;
  }

  public getRepCount(): number {
    return this.repCount;
  }

  public getState(): FSMState {
    return this.state;
  }

  /**
   * Process a single video frame of 33 BlazePose landmarks
   */
  public processFrame(landmarks: NormalizedLandmark[]): ExerciseDetectorResult {
    if (!landmarks || landmarks.length < 33) {
      return {
        state: this.state,
        repIncremented: false,
        repCount: this.repCount,
        progressPercentage: 0,
        feedback: { type: 'warning', message: 'Step back into full camera frame' },
        isConfidenceLow: true,
      };
    }

    const now = Date.now();
    const canCompleteRep = now - this.lastRepTimestamp >= HARD_COOLDOWN_MS;

    switch (this.exerciseId) {
      case 'jumping_jacks':
        return this.detectJumpingJacks(landmarks, canCompleteRep);
      case 'squats':
        return this.detectSquats(landmarks, canCompleteRep);
      case 'high_knees':
        return this.detectHighKnees(landmarks, canCompleteRep);
      case 'mountain_climbers':
        return this.detectMountainClimbers(landmarks, canCompleteRep);
      case 'burpees':
        return this.detectBurpees(landmarks, canCompleteRep);
      case 'butt_kicks':
        return this.detectButtKicks(landmarks, canCompleteRep);
      case 'skater_jumps':
        return this.detectSkaterJumps(landmarks, canCompleteRep);
      case 'lunges':
        return this.detectLunges(landmarks, canCompleteRep);
      case 'shadow_boxing':
        return this.detectShadowBoxing(landmarks, canCompleteRep);
      case 'standing_crunches':
        return this.detectStandingCrunches(landmarks, canCompleteRep);
      default:
        return this.detectSquats(landmarks, canCompleteRep);
    }
  }

  // --------------------------------------------------------------------------
  // 1. Jumping Jacks
  // --------------------------------------------------------------------------
  private detectJumpingJacks(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const nose = lm[LM.NOSE];
    const lWrist = lm[LM.LEFT_WRIST];
    const rWrist = lm[LM.RIGHT_WRIST];
    const lShoulder = lm[LM.LEFT_SHOULDER];
    const rShoulder = lm[LM.RIGHT_SHOULDER];
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rAnkle = lm[LM.RIGHT_ANKLE];

    if (!areLandmarksVisible([nose, lWrist, rWrist, lShoulder, rShoulder, lAnkle, rAnkle], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const shoulderWidth = calculateDistance(lShoulder, rShoulder);
    const ankleDistance = calculateDistance(lAnkle, rAnkle);
    const avgWristY = (lWrist.y + rWrist.y) / 2;
    const avgShoulderY = (lShoulder.y + rShoulder.y) / 2;

    const handsAboveNose = avgWristY < nose.y;
    const feetWide = ankleDistance > 1.35 * shoulderWidth;
    const handsBelowShoulders = avgWristY > avgShoulderY;
    const feetTogether = ankleDistance < 0.85 * shoulderWidth;

    let repIncremented = false;
    let progress = clampPercentage(ankleDistance, 0.8 * shoulderWidth, 1.4 * shoulderWidth);

    if (this.state === 'STATE_IDLE') {
      if (handsAboveNose && feetWide) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (handsBelowShoulders && feetTogether && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      feedback:
        this.state === 'STATE_IN_PROGRESS'
          ? { type: 'good', message: 'Bring hands down and jump feet together!' }
          : { type: 'info', message: 'Jump wide and raise arms above head' },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 2. Bodyweight Squats
  // --------------------------------------------------------------------------
  private detectSquats(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lHip = lm[LM.LEFT_HIP];
    const lKnee = lm[LM.LEFT_KNEE];
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rHip = lm[LM.RIGHT_HIP];
    const rKnee = lm[LM.RIGHT_KNEE];
    const rAnkle = lm[LM.RIGHT_ANKLE];

    if (!areLandmarksVisible([lHip, lKnee, lAnkle, rHip, rKnee, rAnkle], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const leftKneeAngle = calculate2DAngle(lHip, lKnee, lAnkle);
    const rightKneeAngle = calculate2DAngle(rHip, rKnee, rAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    let repIncremented = false;
    // 170 deg is standing (0%), 90 deg is full squat (100%)
    const progress = clampPercentage(170 - avgKneeAngle, 0, 80);

    let feedbackMessage = 'Lower your hips until thighs are parallel (<=95°)';

    if (avgKneeAngle <= 95) {
      feedbackMessage = 'Excellent depth! Now drive up through heels.';
    } else if (avgKneeAngle < 130) {
      feedbackMessage = 'Go a bit deeper for a complete rep';
    }

    if (this.state === 'STATE_IDLE') {
      if (avgKneeAngle <= 95) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (avgKneeAngle >= 165 && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      currentAngle: Math.round(avgKneeAngle),
      targetAngle: 90,
      feedback: {
        type: avgKneeAngle <= 95 ? 'good' : 'info',
        message: feedbackMessage,
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 3. High Knees (1 Rep = Left + Right pair)
  // --------------------------------------------------------------------------
  private detectHighKnees(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lHip = lm[LM.LEFT_HIP];
    const lKnee = lm[LM.LEFT_KNEE];
    const rHip = lm[LM.RIGHT_HIP];
    const rKnee = lm[LM.RIGHT_KNEE];

    if (!areLandmarksVisible([lHip, lKnee, rHip, rKnee], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const leftRaised = lKnee.y <= lHip.y + 0.02;
    const rightRaised = rKnee.y <= rHip.y + 0.02;

    let repIncremented = false;
    let progress = 0;

    if (leftRaised || rightRaised) {
      progress = 100;
    }

    if (this.state === 'STATE_IDLE') {
      if (leftRaised) {
        this.state = 'STATE_IN_PROGRESS';
        this.sideToggle = 'left';
      } else if (rightRaised) {
        this.state = 'STATE_IN_PROGRESS';
        this.sideToggle = 'right';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (this.sideToggle === 'left' && rightRaised) {
        if (canCompleteRep) {
          this.state = 'STATE_REP_COMPLETED';
          this.repCount += 1;
          this.lastRepTimestamp = Date.now();
          repIncremented = true;
          this.state = 'STATE_IDLE';
          this.sideToggle = 'none';
        }
      } else if (this.sideToggle === 'right' && leftRaised) {
        if (canCompleteRep) {
          this.state = 'STATE_REP_COMPLETED';
          this.repCount += 1;
          this.lastRepTimestamp = Date.now();
          repIncremented = true;
          this.state = 'STATE_IDLE';
          this.sideToggle = 'none';
        }
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      feedback: {
        type: leftRaised || rightRaised ? 'good' : 'info',
        message: 'Drive knees up high to waist level!',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 4. Mountain Climbers
  // --------------------------------------------------------------------------
  private detectMountainClimbers(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lShoulder = lm[LM.LEFT_SHOULDER];
    const lHip = lm[LM.LEFT_HIP];
    const lKnee = lm[LM.LEFT_KNEE];
    const lWrist = lm[LM.LEFT_WRIST];
    const rKnee = lm[LM.RIGHT_KNEE];
    const rWrist = lm[LM.RIGHT_WRIST];

    if (!areLandmarksVisible([lShoulder, lHip, lKnee, lWrist], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const torsoLength = calculateDistance(lShoulder, lHip);
    const lKneeWristDist = calculateDistance(lKnee, lWrist);
    const rKneeWristDist = calculateDistance(rKnee, rWrist);

    const activeDist = Math.min(lKneeWristDist, rKneeWristDist);
    const kneeDrivenForward = activeDist < 0.40 * torsoLength;
    const plankExtended = activeDist > 0.70 * torsoLength;

    let repIncremented = false;
    const progress = clampPercentage(0.70 * torsoLength - activeDist, 0, 0.35 * torsoLength);

    if (this.state === 'STATE_IDLE') {
      if (kneeDrivenForward) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (plankExtended && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      feedback: {
        type: kneeDrivenForward ? 'good' : 'info',
        message: kneeDrivenForward ? 'Drive knee back and switch legs!' : 'Maintain straight plank & drive knee to chest',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 5. Burpees (3-Stage Sequence: Drop -> Plank/Pushup -> Vertical Jump)
  // --------------------------------------------------------------------------
  private detectBurpees(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const nose = lm[LM.NOSE];
    const lWrist = lm[LM.LEFT_WRIST];
    const rWrist = lm[LM.RIGHT_WRIST];
    const lHip = lm[LM.LEFT_HIP];
    const rHip = lm[LM.RIGHT_HIP];

    if (!areLandmarksVisible([nose, lWrist, rWrist, lHip, rHip], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const avgWristY = (lWrist.y + rWrist.y) / 2;
    const avgHipY = (lHip.y + rHip.y) / 2;

    const onGround = avgWristY > 0.65 && avgHipY > 0.60;
    const handsHighOverhead = avgWristY < nose.y - 0.05;

    let repIncremented = false;
    let progress = this.subStep === 1 ? 50 : 0;

    if (this.state === 'STATE_IDLE') {
      if (onGround) {
        this.state = 'STATE_IN_PROGRESS';
        this.subStep = 1; // Stage 1 reached: ground drop
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (this.subStep === 1 && handsHighOverhead && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
        this.subStep = 0;
        progress = 100;
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      feedback: {
        type: this.subStep === 1 ? 'good' : 'info',
        message: this.subStep === 1 ? 'Jump up explosively with arms reaching high!' : 'Drop chest/hands to floor',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 6. Butt Kicks
  // --------------------------------------------------------------------------
  private detectButtKicks(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lHip = lm[LM.LEFT_HIP];
    const lKnee = lm[LM.LEFT_KNEE];
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rHip = lm[LM.RIGHT_HIP];
    const rKnee = lm[LM.RIGHT_KNEE];
    const rAnkle = lm[LM.RIGHT_ANKLE];

    if (!areLandmarksVisible([lHip, lKnee, lAnkle, rHip, rKnee, rAnkle], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const lAngle = calculate2DAngle(lHip, lKnee, lAnkle);
    const rAngle = calculate2DAngle(rHip, rKnee, rAnkle);
    const minAngle = Math.min(lAngle, rAngle);

    const heelToGlute = minAngle <= 65;
    const legExtended = minAngle >= 150;

    let repIncremented = false;
    const progress = clampPercentage(150 - minAngle, 0, 90);

    if (this.state === 'STATE_IDLE') {
      if (heelToGlute) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (legExtended && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      currentAngle: Math.round(minAngle),
      targetAngle: 60,
      feedback: {
        type: heelToGlute ? 'good' : 'info',
        message: heelToGlute ? 'Great flex! Now snap leg back.' : 'Kick heels sharply toward glutes',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 7. Skater Jumps
  // --------------------------------------------------------------------------
  private detectSkaterJumps(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lHip = lm[LM.LEFT_HIP];
    const rHip = lm[LM.RIGHT_HIP];

    if (!areLandmarksVisible([lHip, rHip], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const midHipX = (lHip.x + rHip.x) / 2;

    if (this.baselineAnchorX === null) {
      this.baselineAnchorX = midHipX;
    }

    const lateralShift = midHipX - this.baselineAnchorX;
    const shiftedFar = Math.abs(lateralShift) > 0.18; // >18% viewport width shift

    let repIncremented = false;
    let progress = clampPercentage(Math.abs(lateralShift), 0, 0.25);

    if (this.state === 'STATE_IDLE') {
      if (shiftedFar) {
        this.state = 'STATE_IN_PROGRESS';
        this.sideToggle = lateralShift > 0 ? 'right' : 'left';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      // Bound back to opposite side
      const oppositeShift = this.sideToggle === 'right' ? lateralShift < -0.10 : lateralShift > 0.10;
      if (oppositeShift && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
        this.baselineAnchorX = midHipX;
        this.sideToggle = 'none';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      feedback: {
        type: shiftedFar ? 'good' : 'info',
        message: shiftedFar ? 'Bound across laterally to the opposite side!' : 'Spring laterally side to side',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 8. Alternating Forward Lunges
  // --------------------------------------------------------------------------
  private detectLunges(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lHip = lm[LM.LEFT_HIP];
    const lKnee = lm[LM.LEFT_KNEE];
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rHip = lm[LM.RIGHT_HIP];
    const rKnee = lm[LM.RIGHT_KNEE];
    const rAnkle = lm[LM.RIGHT_ANKLE];

    if (!areLandmarksVisible([lHip, lKnee, lAnkle, rHip, rKnee, rAnkle], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const lAngle = calculate2DAngle(lHip, lKnee, lAnkle);
    const rAngle = calculate2DAngle(rHip, rKnee, rAnkle);
    const leadKneeAngle = Math.min(lAngle, rAngle);
    const trailingKneeAngle = Math.max(lAngle, rAngle);

    const inLunge = leadKneeAngle <= 95;
    const standingUp = leadKneeAngle >= 160 && trailingKneeAngle >= 160;

    let repIncremented = false;
    const progress = clampPercentage(160 - leadKneeAngle, 0, 70);

    if (this.state === 'STATE_IDLE') {
      if (inLunge) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (standingUp && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      currentAngle: Math.round(leadKneeAngle),
      targetAngle: 90,
      feedback: {
        type: inLunge ? 'good' : 'info',
        message: inLunge ? 'Push off front heel and return upright' : 'Step forward & drop hips until knee reaches 90°',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 9. Shadow Boxing (Jab / Cross)
  // --------------------------------------------------------------------------
  private detectShadowBoxing(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lShoulder = lm[LM.LEFT_SHOULDER];
    const lElbow = lm[LM.LEFT_ELBOW];
    const lWrist = lm[LM.LEFT_WRIST];
    const rShoulder = lm[LM.RIGHT_SHOULDER];
    const rElbow = lm[LM.RIGHT_ELBOW];
    const rWrist = lm[LM.RIGHT_WRIST];

    if (!areLandmarksVisible([lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const lElbowAngle = calculate2DAngle(lShoulder, lElbow, lWrist);
    const rElbowAngle = calculate2DAngle(rShoulder, rElbow, rWrist);
    const maxElbowAngle = Math.max(lElbowAngle, rElbowAngle);
    const minElbowAngle = Math.min(lElbowAngle, rElbowAngle);

    const fullPunchExtension = maxElbowAngle >= 155;
    const guardReturn = minElbowAngle <= 80 && maxElbowAngle <= 100;

    let repIncremented = false;
    const progress = clampPercentage(maxElbowAngle - 75, 0, 85);

    if (this.state === 'STATE_IDLE') {
      if (fullPunchExtension) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (guardReturn && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      currentAngle: Math.round(maxElbowAngle),
      targetAngle: 160,
      feedback: {
        type: fullPunchExtension ? 'good' : 'info',
        message: fullPunchExtension ? 'Snap fist back to chin guard!' : 'Throw crisp straight punch with full reach',
      },
      isConfidenceLow: false,
    };
  }

  // --------------------------------------------------------------------------
  // 10. Standing Oblique Crunches
  // --------------------------------------------------------------------------
  private detectStandingCrunches(
    lm: NormalizedLandmark[],
    canCompleteRep: boolean
  ): ExerciseDetectorResult {
    const lElbow = lm[LM.LEFT_ELBOW];
    const lKnee = lm[LM.LEFT_KNEE];
    const rElbow = lm[LM.RIGHT_ELBOW];
    const rKnee = lm[LM.RIGHT_KNEE];

    if (!areLandmarksVisible([lElbow, lKnee, rElbow, rKnee], MIN_CONFIDENCE)) {
      return this.makeLowConfidenceResult();
    }

    const lDist = calculateDistance(lElbow, lKnee);
    const rDist = calculateDistance(rElbow, rKnee);
    const activeDistance = Math.min(lDist, rDist);

    const crunchReached = activeDistance <= 0.16;
    const standingNeutral = activeDistance >= 0.38;

    let repIncremented = false;
    const progress = clampPercentage(0.40 - activeDistance, 0, 0.24);

    if (this.state === 'STATE_IDLE') {
      if (crunchReached) {
        this.state = 'STATE_IN_PROGRESS';
      }
    } else if (this.state === 'STATE_IN_PROGRESS') {
      if (standingNeutral && canCompleteRep) {
        this.state = 'STATE_REP_COMPLETED';
        this.repCount += 1;
        this.lastRepTimestamp = Date.now();
        repIncremented = true;
        this.state = 'STATE_IDLE';
      }
    }

    return {
      state: this.state,
      repIncremented,
      repCount: this.repCount,
      progressPercentage: progress,
      feedback: {
        type: crunchReached ? 'good' : 'info',
        message: crunchReached ? 'Squeeze oblique and return upright!' : 'Lift knee and crunch elbow to knee',
      },
      isConfidenceLow: false,
    };
  }

  private makeLowConfidenceResult(): ExerciseDetectorResult {
    return {
      state: this.state,
      repIncremented: false,
      repCount: this.repCount,
      progressPercentage: 0,
      feedback: {
        type: 'warning',
        message: 'Step back into full camera frame',
      },
      isConfidenceLow: true,
    };
  }
}
