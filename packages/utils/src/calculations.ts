import { BMICategory, Gender, BMIResult } from '@fitness/types';

/**
 * Calculates Body Mass Index (BMI) and determines the clinical weight category.
 *
 * Formula: BMI = weight (kg) / (height (m) ^ 2)
 *
 * @param weightKg - Weight in kilograms (e.g. 75.5)
 * @param heightCm - Height in centimeters (e.g. 178)
 * @returns Object containing numerical BMI (rounded to 1 decimal) and categorical classification
 */
export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Underweight',
    };
  }

  const heightInMeters = heightCm / 100;
  const rawBMI = weightKg / (heightInMeters * heightInMeters);
  const roundedBMI = Math.round(rawBMI * 10) / 10;

  let category: BMICategory;
  if (roundedBMI < 18.5) {
    category = 'Underweight';
  } else if (roundedBMI < 25.0) {
    category = 'Normal';
  } else if (roundedBMI < 30.0) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  return {
    bmi: roundedBMI,
    category,
  };
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 *
 * Formulas:
 * - Men:   BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age_years) + 5
 * - Women: BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age_years) - 161
 *
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @param age - Age in full years
 * @param gender - Biological sex ('MALE' | 'FEMALE')
 * @returns Estimated baseline caloric expenditure in kcal/day (rounded to 1 decimal)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    return 0;
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const rawBMR = gender === 'MALE' ? base + 5 : base - 161;

  return Math.round(rawBMR * 10) / 10;
}
