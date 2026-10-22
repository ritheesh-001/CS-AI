import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Vibration,
  Linking,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { AlertTriangle, PhoneCall, X, ShieldAlert, CheckCircle } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/typography';

interface SOSModalProps {
  visible: boolean;
  reportId: string;
  crackWidthMm: number;
  address?: string;
  onCancel: () => void;
  onDispatched?: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  visible,
  reportId,
  crackWidthMm,
  address,
  onCancel,
  onDispatched,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [isDispatched, setIsDispatched] = useState(false);
  const timerRef = useRef<any>(null);

  const progressAnim = useSharedValue(1);
  const sirenPulse = useSharedValue(1);

  useEffect(() => {
    if (visible && !isDispatched) {
      setSecondsRemaining(10);
      progressAnim.value = 1;

      // Start progress bar animation: from 1 to 0 over 10 seconds
      progressAnim.value = withTiming(0, {
        duration: 10000,
        easing: Easing.linear,
      });

      // Siren pulse animation
      sirenPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );

      // Light haptic burst on open
      try {
        Vibration.vibrate(Platform.OS === 'android' ? [0, 150, 100, 150] : 200);
      } catch {}

      // Start countdown
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoDispatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible, isDispatched]);

  const handleAutoDispatch = () => {
    setIsDispatched(true);
    try {
      Vibration.vibrate([0, 300, 150, 300, 150, 400]);
    } catch {}
    if (onDispatched) {
      onDispatched();
    }
  };

  const handleCancel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  };

  const handleCallHelpline = () => {
    Linking.openURL('tel:112');
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const animatedSirenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sirenPulse.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetCard}>
          {/* Top red header banner */}
          <View style={styles.headerBanner}>
            <Animated.View style={[styles.sirenCircle, animatedSirenStyle]}>
              <ShieldAlert size={28} color="#FFFFFF" />
            </Animated.View>
            <View style={styles.headerTexts}>
              <Text style={styles.bannerTitle}>CRITICAL HAZARD ESCALATION</Text>
              <Text style={styles.bannerSub}>Automated Civic SOS Protocol Active</Text>
            </View>
          </View>

          {/* Body Content */}
          <View style={styles.content}>
            {!isDispatched ? (
              <>
                <Text style={styles.warningDesc}>
                  Detected aperture of{' '}
                  <Text style={styles.highlightText}>{crackWidthMm.toFixed(2)}mm</Text>{' '}
                  violates civic infrastructure safety thresholds. Auto-dispatching municipal rescue & PWD emergency strike team.
                </Text>

                {address ? (
                  <View style={styles.locationChip}>
                    <Text style={styles.locationLabel}>Geo-Anchor:</Text>
                    <Text style={styles.locationVal} numberOfLines={1}>
                      {address}
                    </Text>
                  </View>
                ) : null}

                {/* 10-Second Countdown Display */}
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownNumber}>{secondsRemaining}</Text>
                  <Text style={styles.countdownUnit}>seconds remaining</Text>
                </View>

                {/* Visual Progress Bar */}
                <View style={styles.progressBarTrack}>
                  <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
                </View>

                {/* Primary Buttons */}
                <View style={styles.buttonGroup}>
                  {/* Cancel Escalation Button (Primary abort button) */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                  >
                    <X size={20} color="#0F172A" />
                    <Text style={styles.cancelButtonText}>Cancel Escalation (Abort SOS)</Text>
                  </TouchableOpacity>

                  {/* Immediate Emergency Call Button */}
                  <TouchableOpacity
                    style={styles.helplineButton}
                    onPress={handleCallHelpline}
                    activeOpacity={0.8}
                  >
                    <PhoneCall size={20} color="#FFFFFF" />
                    <Text style={styles.helplineButtonText}>Direct Call Disaster Rescue (112)</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Dispatched Confirmation State */
              <View style={styles.dispatchedBox}>
                <View style={styles.successIconCircle}>
                  <CheckCircle size={42} color="#10B981" />
                </View>
                <Text style={styles.dispatchedTitle}>EMERGENCY ALERT DISPATCHED</Text>
                <Text style={styles.dispatchedSub}>
                  Municipal Disaster Response Cell & PWD Structural Division have received telemetry and GPS coordinates.
                </Text>
                <View style={styles.ticketBadge}>
                  <Text style={styles.ticketLabel}>TICKET REF:</Text>
                  <Text style={styles.ticketCode}>{reportId}-EMG</Text>
                </View>

                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dismissButtonText}>Done & View Ticket</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  headerBanner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  sirenCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  warningDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 14,
  },
  highlightText: {
    fontWeight: '700',
    color: '#DC2626',
  },
  locationChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  locationVal: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  countdownBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  countdownNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 58,
  },
  countdownUnit: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  buttonGroup: {
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  cancelButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  helplineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    ...Shadows.card,
  },
  helplineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dispatchedBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dispatchedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 6,
  },
  dispatchedSub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 20,
  },
  ticketLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  dismissButton: {
    backgroundColor: '#0F172A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
