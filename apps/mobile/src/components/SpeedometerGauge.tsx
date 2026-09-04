import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BMICategory } from '@fitness/types';
import { Gauge } from 'lucide-react-native';
import { NeuTheme } from '../theme/neumorphic';
import NeuCard from './neumorphic/NeuCard';

interface SpeedometerGaugeProps {
  bmi: number;
  category: BMICategory;
}

export function SpeedometerGauge({ bmi, category }: SpeedometerGaugeProps) {
  const safeBmi = Math.max(15, Math.min(40, bmi || 22));

  const angleDegrees = useMemo(() => {
    const fraction = (safeBmi - 15) / (40 - 15);
    return -90 + fraction * 180;
  }, [safeBmi]);

  const getCategoryConfig = (cat: BMICategory) => {
    switch (cat) {
      case 'Underweight':
        return {
          title: 'UNDERWEIGHT',
          desc: 'Nutrient Surplus & Lean Mass Focus',
          color: '#0284C7',
          bg: NeuTheme.colors.skyBlueBg,
          border: '#38BDF8',
        };
      case 'Normal':
        return {
          title: 'HEALTHY / OPTIMAL',
          desc: 'Metabolic Equilibrium Zone',
          color: '#047857',
          bg: NeuTheme.colors.emeraldBg,
          border: '#10B981',
        };
      case 'Overweight':
        return {
          title: 'OVERWEIGHT',
          desc: 'Moderate Deficit & Muscle Preservation',
          color: '#B45309',
          bg: NeuTheme.colors.amberBg,
          border: '#F59E0B',
        };
      case 'Obese':
        return {
          title: 'OBESE ZONE',
          desc: 'Structured Progressive Caloric Rebalance',
          color: '#B91C1C',
          bg: NeuTheme.colors.coralBg,
          border: '#EF4444',
        };
      default:
        return {
          title: 'CALIBRATING',
          desc: 'Enter your height and weight',
          color: NeuTheme.colors.textSecondary,
          bg: NeuTheme.colors.recessedWell,
          border: '#CBD5E1',
        };
    }
  };

  const config = getCategoryConfig(category);

  const cx = 110;
  const cy = 95;
  const r = 78;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const arcUnderweight = describeArc(cx, cy, r, 0, 25.2);
  const arcNormal = describeArc(cx, cy, r, 25.2, 72);
  const arcOverweight = describeArc(cx, cy, r, 72, 108);
  const arcObese = describeArc(cx, cy, r, 108, 180);

  const needleLength = 58;
  const needleAngleRad = ((angleDegrees - 90) * Math.PI) / 180;
  const needleX = cx + needleLength * Math.cos(needleAngleRad);
  const needleY = cy + needleLength * Math.sin(needleAngleRad);

  return (
    <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Gauge size={16} color={NeuTheme.colors.emerald} />
          <Text style={styles.titleText}>LIVE METABOLIC SPEEDOMETER</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Text style={[styles.categoryBadgeText, { color: config.color }]}>
            {config.title}
          </Text>
        </View>
      </View>

      {/* Speedometer Gauge Dial */}
      <View style={styles.dialContainer}>
        <Svg width={220} height={118} viewBox="0 0 220 118">
          {/* Background Outer Track */}
          <Path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={14}
            strokeLinecap="round"
          />

          {/* 1. Underweight (Blue) */}
          <Path
            d={arcUnderweight}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={10}
            strokeLinecap="round"
          />

          {/* 2. Normal (Green) */}
          <Path
            d={arcNormal}
            fill="none"
            stroke="#10B981"
            strokeWidth={10}
            strokeLinecap="butt"
          />

          {/* 3. Overweight (Yellow) */}
          <Path
            d={arcOverweight}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={10}
            strokeLinecap="butt"
          />

          {/* 4. Obese (Red) */}
          <Path
            d={arcObese}
            fill="none"
            stroke="#EF4444"
            strokeWidth={10}
            strokeLinecap="round"
          />

          {/* Speedometer Center Needle */}
          <Line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#1E293B"
            strokeWidth={3.5}
            strokeLinecap="round"
          />

          {/* Center Bezel Cap */}
          <Circle cx={cx} cy={cy} r={8} fill="#1E293B" stroke="#10B981" strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={3.5} fill="#FFFFFF" />
        </Svg>

        {/* Digital Speedometer Value HUD */}
        <View style={styles.hudOverlay}>
          <Text style={styles.hudScore}>{bmi > 0 ? bmi.toFixed(1) : '--'}</Text>
          <Text style={styles.hudUnit}>BMI SCORE</Text>
        </View>
      </View>

      {/* Speedometer Scale Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
          <Text style={styles.legendText}>&lt;18.5</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: '#047857', fontWeight: '800' }]}>18.5 - 24.9</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>25 - 29.9</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>30+</Text>
        </View>
      </View>

      <Text style={styles.coachSummaryText}>{config.desc}</Text>
    </NeuCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  categoryBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 2,
    position: 'relative',
  },
  hudOverlay: {
    position: 'absolute',
    bottom: 34,
    alignItems: 'center',
  },
  hudScore: {
    color: NeuTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  hudUnit: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NeuTheme.colors.recessedWell,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: NeuTheme.colors.textSecondary,
    fontSize: 9.5,
    fontWeight: '600',
  },
  coachSummaryText: {
    color: NeuTheme.colors.textPrimary,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});
