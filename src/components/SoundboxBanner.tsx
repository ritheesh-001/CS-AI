import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Volume2, VolumeX, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { SeverityLevel } from '../types/inspection';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/typography';
import { SpeechService } from '../services/speechService';
import { AppLanguage } from '../types/user';

interface SoundboxBannerProps {
  severity: SeverityLevel;
  severityIndex: number;
  crackWidthMm: number;
  language?: AppLanguage;
  autoAnnounce?: boolean;
}

export const SoundboxBanner: React.FC<SoundboxBannerProps> = ({
  severity,
  severityIndex,
  crackWidthMm,
  language = 'en',
  autoAnnounce = true,
}) => {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (autoAnnounce) {
      SpeechService.speakVerdict(severity, language);
    }

    if (severity === 'HIGH') {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = 1;
    }

    return () => {
      SpeechService.stop();
    };
  }, [severity, autoAnnounce, language, pulseAnim]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handleReplayAudio = () => {
    SpeechService.speakVerdict(severity, language);
  };

  const config =
    severity === 'HIGH'
      ? {
          ringColor: '#DC2626',
          ringBg: '#FEE2E2',
          cardBg: '#FEF2F2',
          badgeText: 'CRITICAL HAZARD',
          verdict: 'Warning. Critical structural crack detected. Alerting authorities.',
          icon: <AlertTriangle size={32} color="#DC2626" />,
        }
      : severity === 'MEDIUM'
      ? {
          ringColor: '#D97706',
          ringBg: '#FEF3C7',
          cardBg: '#FFFBEB',
          badgeText: 'MODERATE CRACK',
          verdict: 'Scan complete. Moderate crack. Chemical repair recommended.',
          icon: <AlertCircle size={32} color="#D97706" />,
        }
      : {
          ringColor: '#059669',
          ringBg: '#D1FAE5',
          cardBg: '#ECFDF5',
          badgeText: 'SAFE / MINOR',
          verdict: 'Scan complete. Minor surface crack. Structure is safe.',
          icon: <ShieldCheck size={32} color="#059669" />,
        };

  return (
    <View style={[styles.container, { backgroundColor: config.cardBg }]}>
      {/* Dominant Google Pay Style High-Contrast Status Ring */}
      <View style={styles.leftRingCol}>
        <Animated.View
          style={[
            styles.outerRing,
            { borderColor: config.ringColor, backgroundColor: config.ringBg },
            animatedRingStyle,
          ]}
        >
          {config.icon}
        </Animated.View>
        <Text style={[styles.indexScoreText, { color: config.ringColor }]}>
          INDEX {severityIndex.toFixed(1)}
        </Text>
      </View>

      {/* Voice & Verdict Readout Box */}
      <View style={styles.rightContentCol}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: config.ringColor }]}>
            <Text style={styles.badgeLabel}>{config.badgeText}</Text>
          </View>

          {/* Replay Audio Trigger Button */}
          <TouchableOpacity
            style={styles.speakerBtn}
            onPress={handleReplayAudio}
            activeOpacity={0.7}
          >
            <Volume2 size={16} color="#0F172A" />
            <Text style={styles.speakerBtnText}>Voice Readout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.verdictQuote}>"{config.verdict}"</Text>
        <Text style={styles.apertureSub}>
          Calibrated Width: <Text style={styles.boldText}>{crackWidthMm.toFixed(2)} mm</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 16,
    ...Shadows.card,
  },
  leftRingCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexScoreText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  rightContentCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  speakerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  verdictQuote: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
  },
  apertureSub: {
    fontSize: 12,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
});
