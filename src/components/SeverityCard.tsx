import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SeverityLevel, StructuralType } from '../types/inspection';
import { Colors } from '../theme/colors';
import { Shadows, Typography } from '../theme/typography';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface SeverityCardProps {
  severity: SeverityLevel;
  crackWidthMm: number;
  structuralType: StructuralType;
  confidence: number;
  suggestedAction?: string;
}

export const SeverityCard: React.FC<SeverityCardProps> = ({
  severity,
  crackWidthMm,
  structuralType,
  confidence,
  suggestedAction,
}) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (severity === 'HIGH') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [severity, pulseScale]);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const config =
    severity === 'HIGH'
      ? {
          badge: Colors.severity.high,
          icon: <AlertTriangle size={18} color={Colors.severity.high.text} />,
          title: 'CRITICAL STRUCTURAL RISK',
          subtext: 'Exceeds permissible strain limits (>4.5mm)',
        }
      : severity === 'MEDIUM'
      ? {
          badge: Colors.severity.medium,
          icon: <AlertCircle size={18} color={Colors.severity.medium.text} />,
          title: 'MODERATE DISTRESS DETECTED',
          subtext: 'Preventative repair advised (1.0mm - 4.5mm)',
        }
      : {
          badge: Colors.severity.low,
          icon: <CheckCircle2 size={18} color={Colors.severity.low.text} />,
          title: 'SUPERFICIAL HAIRLINE DISTRESS',
          subtext: 'Within standard safety margin (<1.0mm)',
        };

  return (
    <View style={styles.card}>
      {/* Top Header Badge */}
      <View style={styles.headerRow}>
        <Animated.View
          style={[
            styles.badge,
            {
              backgroundColor: config.badge.bg,
              borderColor: config.badge.border,
            },
            animatedPulse,
          ]}
        >
          {config.icon}
          <Text style={[styles.badgeText, { color: config.badge.text }]}>
            {config.badge.label.toUpperCase()}
          </Text>
        </Animated.View>

        <View style={styles.confidenceChip}>
          <Text style={styles.confidenceLabel}>AI Match</Text>
          <Text style={styles.confidenceVal}>{(confidence * 100).toFixed(0)}%</Text>
        </View>
      </View>

      {/* Main Metric Focus: Google Pay styled bold number */}
      <View style={styles.metricContainer}>
        <View style={styles.widthBox}>
          <Text style={styles.metricLabel}>MEASURED APERTURE</Text>
          <View style={styles.widthRow}>
            <Text style={[styles.metricValue, { color: config.badge.text }]}>
              {crackWidthMm.toFixed(2)}
            </Text>
            <Text style={styles.metricUnit}>mm</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.componentBox}>
          <Text style={styles.metricLabel}>COMPONENT</Text>
          <Text style={styles.componentValue}>
            {structuralType.replace('_', ' ')}
          </Text>
          <Text style={styles.componentSub}>{config.subtext}</Text>
        </View>
      </View>

      {/* Suggested Action summary */}
      {suggestedAction ? (
        <View style={styles.actionNotice}>
          <Text style={styles.actionTitle}>System Recommendation:</Text>
          <Text style={styles.actionBody}>{suggestedAction}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  confidenceLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  confidenceVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  widthBox: {
    flex: 1.2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  widthRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 14,
  },
  componentBox: {
    flex: 1.5,
  },
  componentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  componentSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  actionNotice: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});
