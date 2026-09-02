import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { BMICategory } from '@fitness/types';
import { Gauge } from 'lucide-react-native';

interface SpeedometerGaugeProps {
  bmi: number;
  category: BMICategory;
}

export function SpeedometerGauge({ bmi, category }: SpeedometerGaugeProps) {
  // Clamp BMI between 15 and 40 for gauge meter range
  const safeBmi = Math.max(15, Math.min(40, bmi || 22));

  // Map BMI (15 to 40) to angle in degrees (-90deg to +90deg / semi-circle)
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
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.14)',
          border: '#0284C7',
        };
      case 'Normal':
        return {
          title: 'HEALTHY / OPTIMAL',
          desc: 'Metabolic Equilibrium Zone',
          color: '#34D399',
          bg: 'rgba(16, 185, 129, 0.14)',
          border: '#059669',
        };
      case 'Overweight':
        return {
          title: 'OVERWEIGHT',
          desc: 'Moderate Deficit & Muscle Preservation',
          color: '#FBBF24',
          bg: 'rgba(245, 158, 11, 0.14)',
          border: '#D97706',
        };
      case 'Obese':
        return {
          title: 'OBESE ZONE',
          desc: 'Structured Progressive Caloric Rebalance',
          color: '#FB7185',
          bg: 'rgba(244, 63, 94, 0.14)',
          border: '#E11D48',
        };
      default:
        return {
          title: 'CALIBRATING',
          desc: 'Enter your height and weight',
          color: '#94A3B8',
          bg: 'rgba(113, 113, 122, 0.14)',
          border: '#475569',
        };
    }
  };

  const config = getCategoryConfig(category);

  // SVG Geometry for Speedometer Arc (Radius 85, Center 110, 100)
  const cx = 110;
  const cy = 95;
  const r = 78;

  // Arc path generator helper: angles from 180 to 0 (top semi-circle)
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

  // Speedometer 4 Zones (180deg total arc: 0 to 180 from left to right)
  // 15 -> 18.5 is (3.5/25) * 180 = 25.2 deg
  // 18.5 -> 25 is (6.5/25) * 180 = 46.8 deg -> total 72 deg
  // 25 -> 30 is (5/25) * 180 = 36 deg -> total 108 deg
  // 30 -> 40 is (10/25) * 180 = 72 deg -> total 180 deg
  const arcUnderweight = describeArc(cx, cy, r, 0, 25.2);
  const arcNormal = describeArc(cx, cy, r, 25.2, 72);
  const arcOverweight = describeArc(cx, cy, r, 72, 108);
  const arcObese = describeArc(cx, cy, r, 108, 180);

  // Needle endpoint based on angleDegrees
  const needleLength = 58;
  const needleAngleRad = ((angleDegrees - 90) * Math.PI) / 180;
  const needleX = cx + needleLength * Math.cos(needleAngleRad);
  const needleY = cy + needleLength * Math.sin(needleAngleRad);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Gauge size={16} color="#10B981" />
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
          <Defs>
            <LinearGradient id="needleGlow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#34D399" />
            </LinearGradient>
          </Defs>

          {/* Background Outer Track */}
          <Path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke="#11151F"
            strokeWidth={14}
            strokeLinecap="round"
          />

          {/* Colored Meter Arcs */}
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
            stroke="#F8FAFC"
            strokeWidth={3.5}
            strokeLinecap="round"
          />

          {/* Center Bezel Cap */}
          <Circle cx={cx} cy={cy} r={9} fill="#11151F" stroke="#10B981" strokeWidth={2.5} />
          <Circle cx={cx} cy={cy} r={4} fill="#F8FAFC" />
        </Svg>

        {/* Digital Speedometer Value HUD */}
        <View style={styles.hudOverlay}>
          <Text style={styles.hudScore}>{bmi > 0 ? bmi.toFixed(1) : '--'}</Text>
          <Text style={styles.hudUnit}>BMI</Text>
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
          <Text style={[styles.legendText, { color: '#34D399', fontWeight: '800' }]}>18.5 - 24.9</Text>
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

      {/* Subtitle description */}
      <Text style={styles.coachSummaryText}>{config.desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161B26',
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
    marginBottom: 10,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#090C12',
    borderRightColor: '#090C12',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  categoryBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 2,
    position: 'relative',
  },
  hudOverlay: {
    position: 'absolute',
    bottom: 38,
    alignItems: 'center',
  },
  hudScore: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  hudUnit: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#11151F',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#090C12',
    borderLeftColor: '#090C12',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  coachSummaryText: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
});
