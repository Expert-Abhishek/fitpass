import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';

type Timeframe = 'Day' | 'Week' | 'Month';

interface ChartPoint {
  label: string;
  intake: number;
  burn: number;
}

export default function EnergyBalanceChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Week');
  const [selectedIndex, setSelectedIndex] = useState<number>(4);
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get('window').width > 440
      ? 360
      : Math.max(260, Dimensions.get('window').width - 64)
  );

  const onChartLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 50) {
      setContainerWidth(width);
    }
  };

  const weekData: ChartPoint[] = [
    { label: 'Mon', intake: 2150, burn: 2450 },
    { label: 'Tue', intake: 1980, burn: 2300 },
    { label: 'Wed', intake: 2400, burn: 2550 },
    { label: 'Thu', intake: 1850, burn: 2400 },
    { label: 'Fri', intake: 1840, burn: 2460 },
    { label: 'Sat', intake: 2200, burn: 2600 },
    { label: 'Sun', intake: 1900, burn: 2350 },
  ];

  const dayData: ChartPoint[] = [
    { label: '8AM', intake: 450, burn: 300 },
    { label: '12PM', intake: 650, burn: 550 },
    { label: '3PM', intake: 200, burn: 400 },
    { label: '6PM', intake: 540, burn: 750 },
    { label: '9PM', intake: 0, burn: 460 },
  ];

  const monthData: ChartPoint[] = [
    { label: 'Wk 1', intake: 14200, burn: 16800 },
    { label: 'Wk 2', intake: 13900, burn: 17100 },
    { label: 'Wk 3', intake: 14500, burn: 16900 },
    { label: 'Wk 4', intake: 13100, burn: 16500 },
  ];

  const getData = () => {
    switch (timeframe) {
      case 'Day':
        return dayData;
      case 'Month':
        return monthData;
      default:
        return weekData;
    }
  };

  const activeData = getData();
  const currentPoint = activeData[Math.min(selectedIndex, activeData.length - 1)] || activeData[0];
  const deltaEnergy = currentPoint.intake - currentPoint.burn;
  const isDeficit = deltaEnergy <= 0;

  // Dynamic Chart Dimensions
  const chartHeight = 135;
  const chartWidth = Math.max(240, containerWidth);
  const maxCal = Math.max(...activeData.map((d) => Math.max(d.intake, d.burn))) * 1.15;

  const barGroupWidth = chartWidth / activeData.length;
  const barWidth = Math.max(6, Math.min(13, (barGroupWidth - 8) / 2));

  return (
    <NeuCard variant="raised" padding={16} borderRadius={22} style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Text style={styles.badgeText}>ENERGY DYNAMICS</Text>
          <Text style={styles.title} numberOfLines={1}>Burn vs Intake</Text>
        </View>

        {/* Timeframe Selector Pill */}
        <NeuCard variant="inset" padding={3} borderRadius={12} style={styles.timeframeWell}>
          {(['Day', 'Week', 'Month'] as Timeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => {
                  setTimeframe(tf);
                  setSelectedIndex(0);
                }}
                style={[styles.tfButton, isActive && styles.tfButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tfText, isActive && styles.tfTextActive]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </NeuCard>
      </View>

      {/* Delta Forecast Banner */}
      <NeuCard variant="inset" padding={9} borderRadius={13} style={styles.deltaCard}>
        <View style={styles.deltaContent}>
          <View
            style={[
              styles.deltaIconBadge,
              { backgroundColor: isDeficit ? NeuTheme.colors.emeraldBg : NeuTheme.colors.coralBg },
            ]}
          >
            {isDeficit ? (
              <TrendingDown size={15} color={NeuTheme.colors.emerald} />
            ) : (
              <TrendingUp size={15} color={NeuTheme.colors.coral} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.deltaValueText} numberOfLines={1}>
              {currentPoint.label}: {Math.abs(deltaEnergy)} kcal {isDeficit ? 'Deficit (Fat Loss)' : 'Surplus (Growth)'}
            </Text>
            <Text style={styles.deltaSubText} numberOfLines={1}>
              Intake: {currentPoint.intake} kcal • Burn: {currentPoint.burn} kcal
            </Text>
          </View>
        </View>
      </NeuCard>

      {/* SVG Dual-Bar Chart with onLayout container measurement */}
      <View style={styles.chartContainer} onLayout={onChartLayout}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
              <Stop offset="1" stopColor="#059669" stopOpacity="0.85" />
            </LinearGradient>
            <LinearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F59E0B" stopOpacity="1" />
              <Stop offset="1" stopColor="#D97706" stopOpacity="0.85" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line
            x1="0"
            y1={chartHeight - 22}
            x2={chartWidth}
            y2={chartHeight - 22}
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4, 4"
          />

          {/* Render grouped bars */}
          {activeData.map((d, i) => {
            const groupX = i * barGroupWidth;
            const intakeHeight = (d.intake / maxCal) * (chartHeight - 32);
            const burnHeight = (d.burn / maxCal) * (chartHeight - 32);
            const isSelected = selectedIndex === i;

            return (
              <React.Fragment key={i}>
                {/* Selected Column Highlight Area */}
                {isSelected && (
                  <Rect
                    x={groupX + 1}
                    y={3}
                    width={barGroupWidth - 2}
                    height={chartHeight - 26}
                    rx={6}
                    fill="rgba(16, 185, 129, 0.08)"
                  />
                )}

                {/* Intake Bar (Emerald) */}
                <Rect
                  x={groupX + (barGroupWidth / 2) - barWidth - 1.5}
                  y={chartHeight - 22 - intakeHeight}
                  width={barWidth}
                  height={intakeHeight}
                  rx={barWidth / 2}
                  fill="url(#intakeGrad)"
                  onPress={() => setSelectedIndex(i)}
                />

                {/* Burn Bar (Amber) */}
                <Rect
                  x={groupX + (barGroupWidth / 2) + 1.5}
                  y={chartHeight - 22 - burnHeight}
                  width={barWidth}
                  height={burnHeight}
                  rx={barWidth / 2}
                  fill="url(#burnGrad)"
                  onPress={() => setSelectedIndex(i)}
                />

                {/* X-Axis Label */}
                <SvgText
                  x={groupX + (barGroupWidth / 2)}
                  y={chartHeight - 5}
                  fontSize="9.5"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? '#0F172A' : '#64748B'}
                  textAnchor="middle"
                >
                  {d.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Chart Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: NeuTheme.colors.emerald }]} />
          <Text style={styles.legendText}>Intake (Consumed)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: NeuTheme.colors.amber }]} />
          <Text style={styles.legendText}>Burned (Active + BMR)</Text>
        </View>
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
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  timeframeWell: {
    flexDirection: 'row',
  },
  tfButton: {
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  tfButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
    elevation: 2,
  },
  tfText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NeuTheme.colors.textMuted,
  },
  tfTextActive: {
    color: NeuTheme.colors.textPrimary,
    fontWeight: '800',
  },
  deltaCard: {
    marginBottom: 10,
  },
  deltaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deltaIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaValueText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
  },
  deltaSubText: {
    fontSize: 10,
    color: NeuTheme.colors.textSecondary,
    marginTop: 1,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    overflow: 'hidden',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(163, 177, 198, 0.2)',
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
    fontSize: 10,
    fontWeight: '600',
    color: NeuTheme.colors.textSecondary,
  },
});
