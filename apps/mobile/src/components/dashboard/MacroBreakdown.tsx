import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Plus, Flame } from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';
import { MacroData } from '../../stores/dashboardStore';

interface MacroBreakdownProps {
  data: MacroData;
  onAddMealPress: () => void;
}

export default function MacroBreakdown({
  data,
  onAddMealPress,
}: MacroBreakdownProps) {
  const targetKcal = data.caloriesTarget || 2000;
  const consumedKcal = data.caloriesConsumed || 0;
  const burnedKcal = data.caloriesBurned || 0;

  const remainingCalories = Math.max(0, targetKcal - consumedKcal + burnedKcal);
  const intakePercent = targetKcal > 0 ? Math.min(100, Math.round((consumedKcal / targetKcal) * 100)) : 0;

  const macroItems = [
    {
      label: 'PROTEIN',
      current: data.protein?.current || 0,
      target: data.protein?.target || 140,
      color: NeuTheme.colors.emerald,
      bgColor: NeuTheme.colors.emeraldBg,
      unit: 'g',
    },
    {
      label: 'CARBS',
      current: data.carbs?.current || 0,
      target: data.carbs?.target || 220,
      color: NeuTheme.colors.skyBlue,
      bgColor: NeuTheme.colors.skyBlueBg,
      unit: 'g',
    },
    {
      label: 'FATS',
      current: data.fats?.current || 0,
      target: data.fats?.target || 65,
      color: NeuTheme.colors.amber,
      bgColor: NeuTheme.colors.amberBg,
      unit: 'g',
    },
    {
      label: 'FIBER',
      current: data.fiber?.current || 0,
      target: data.fiber?.target || 30,
      color: NeuTheme.colors.violet,
      bgColor: NeuTheme.colors.violetBg,
      unit: 'g',
    },
  ];

  return (
    <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.headerBadge}>NUTRITION & MACROS</Text>
          <Text style={styles.title} numberOfLines={1}>Energy Distribution</Text>
        </View>

        <TouchableOpacity
          onPress={onAddMealPress}
          style={styles.addMealButton}
          activeOpacity={0.85}
        >
          <Plus size={15} color="#052E16" strokeWidth={2.8} />
          <Text style={styles.addMealButtonText}>Add Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Calorie Meter Banner */}
      <NeuCard variant="inset" padding={12} borderRadius={16} style={styles.calorieMeterWell}>
        <View style={styles.calorieMeterTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.meterLabel}>CONSUMED TODAY</Text>
            <View style={styles.calorieValueRow}>
              <Text style={styles.consumedKcalText}>{consumedKcal}</Text>
              <Text style={styles.targetKcalText}>/ {targetKcal} kcal</Text>
            </View>
          </View>

          <View style={styles.burnPill}>
            <Flame size={13} color={NeuTheme.colors.coral} />
            <Text style={styles.burnPillText}>+{burnedKcal} burn</Text>
          </View>
        </View>

        {/* Dual Layered Progress Track */}
        <View style={styles.calorieTrackOuter}>
          <View
            style={[
              styles.calorieTrackFill,
              {
                width: `${intakePercent}%`,
                backgroundColor:
                  intakePercent > 100
                    ? NeuTheme.colors.coral
                    : NeuTheme.colors.emerald,
              },
            ]}
          />
        </View>

        <View style={styles.meterFooter}>
          <Text style={styles.remainingText} numberOfLines={1}>
            ⚡ <Text style={{ fontWeight: '800', color: NeuTheme.colors.textPrimary }}>{remainingCalories} kcal</Text> remaining
          </Text>
          <Text style={styles.percentText}>{intakePercent}%</Text>
        </View>
      </NeuCard>

      {/* 4-Column Macro Pill Grid */}
      <View style={styles.macroGrid}>
        {macroItems.map((item, index) => {
          const percent = item.target > 0
            ? Math.min(100, Math.round((item.current / item.target) * 100))
            : 0;

          return (
            <NeuCard
              key={index}
              variant="raised"
              padding={6}
              borderRadius={14}
              style={styles.macroPillCard}
            >
              <View style={[styles.macroDot, { backgroundColor: item.color }]} />
              <Text style={styles.macroLabel} numberOfLines={1}>{item.label}</Text>

              <Text style={styles.macroCurrentVal} numberOfLines={1}>
                {item.current}
                <Text style={styles.macroUnitVal}>{item.unit}</Text>
              </Text>
              <Text style={styles.macroTargetVal} numberOfLines={1}>/{item.target}{item.unit}</Text>

              <View style={styles.miniMacroTrack}>
                <View
                  style={[
                    styles.miniMacroFill,
                    { width: `${percent}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
            </NeuCard>
          );
        })}
      </View>
    </NeuCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.emerald,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 12,
    gap: 4,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  addMealButtonText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#052E16',
  },
  calorieMeterWell: {
    marginBottom: 12,
  },
  calorieMeterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meterLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  calorieValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  consumedKcalText: {
    fontSize: 22,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  targetKcalText: {
    fontSize: 12,
    fontWeight: '700',
    color: NeuTheme.colors.textMuted,
  },
  burnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeuTheme.colors.cardBackground,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
    gap: 3,
  },
  burnPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: NeuTheme.colors.coral,
  },
  calorieTrackOuter: {
    width: '100%',
    height: 9,
    borderRadius: 4.5,
    backgroundColor: NeuTheme.colors.recessedDark,
    overflow: 'hidden',
    marginBottom: 6,
  },
  calorieTrackFill: {
    height: '100%',
    borderRadius: 4.5,
  },
  meterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 11,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '800',
    color: NeuTheme.colors.emerald,
    marginLeft: 6,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  macroPillCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 3,
  },
  macroDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginBottom: 3,
  },
  macroLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  macroCurrentVal: {
    fontSize: 13,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
  },
  macroUnitVal: {
    fontSize: 9,
    fontWeight: '600',
    color: NeuTheme.colors.textSecondary,
  },
  macroTargetVal: {
    fontSize: 9,
    color: NeuTheme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 5,
  },
  miniMacroTrack: {
    width: '100%',
    height: 3.5,
    borderRadius: 2,
    backgroundColor: NeuTheme.colors.recessedWell,
    overflow: 'hidden',
  },
  miniMacroFill: {
    height: '100%',
    borderRadius: 2,
  },
});
