import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Volume2 } from 'lucide-react-native';
import { SpeechService } from '../services/speechService';
import { AppLanguage } from '../types/user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RETICLE_SIZE = Math.min(SCREEN_WIDTH * 0.76, 320);

interface CameraReticleProps {
  isScanning?: boolean;
  tooltipText?: string;
  language?: AppLanguage;
  onAudioPromptTriggered?: (cue: string) => void;
}

export const CameraReticle: React.FC<CameraReticleProps> = ({
  isScanning = false,
  tooltipText = 'Align crack within frame & keep phone ~30cm away',
  language = 'en',
  onAudioPromptTriggered,
}) => {
  const scanLineTranslateY = useSharedValue(0);

  useEffect(() => {
    scanLineTranslateY.value = withRepeat(
      withTiming(RETICLE_SIZE - 4, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [scanLineTranslateY]);

  const animatedLaserStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineTranslateY.value }],
    };
  });

  const handleSpeakCue = (cue: 'moveCloser' | 'holdSteady' | 'turnOnFlash') => {
    SpeechService.speakGuidance(cue, language);
    if (onAudioPromptTriggered) {
      onAudioPromptTriggered(cue);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Helper Tooltip with audio speak trigger */}
      <View style={styles.tooltipCard}>
        <View style={styles.pulseDot} />
        <Text style={styles.tooltipText}>{tooltipText}</Text>
        <TouchableOpacity
          onPress={() => handleSpeakCue('holdSteady')}
          style={styles.audioHintBtn}
          activeOpacity={0.7}
        >
          <Volume2 size={13} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      {/* Main Reticle Target */}
      <View style={[styles.reticleBox, { width: RETICLE_SIZE, height: RETICLE_SIZE }]}>
        {/* Corner Brackets */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Center Crosshair */}
        <View style={styles.crosshairContainer}>
          <View style={styles.crosshairHorizontal} />
          <View style={styles.crosshairVertical} />
          <View style={styles.centerRing} />
        </View>

        {/* Dynamic Scanning Laser Bar */}
        <Animated.View style={[styles.laserBar, animatedLaserStyle]}>
          <View style={styles.laserBeam} />
          <View style={styles.laserGlow} />
        </Animated.View>

        {/* Metric Scale Guide */}
        <View style={styles.scaleGuideLeft}>
          <Text style={styles.scaleText}>0mm</Text>
          <View style={styles.scaleTick} />
          <View style={styles.scaleTickSmall} />
          <View style={styles.scaleTick} />
          <Text style={styles.scaleText}>10mm</Text>
        </View>

        <View style={styles.scaleGuideRight}>
          <Text style={styles.focalPlaneText}>FOCAL: 30CM</Text>
        </View>
      </View>

      {/* Quick audio guidance buttons for user feedback */}
      <View style={styles.cuesBar} pointerEvents="auto">
        <TouchableOpacity
          style={styles.cuePill}
          onPress={() => handleSpeakCue('moveCloser')}
          activeOpacity={0.7}
        >
          <Volume2 size={11} color="#FFFFFF" />
          <Text style={styles.cuePillText}>"Move Closer"</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cuePill}
          onPress={() => handleSpeakCue('holdSteady')}
          activeOpacity={0.7}
        >
          <Volume2 size={11} color="#FFFFFF" />
          <Text style={styles.cuePillText}>"Hold Steady"</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cuePill}
          onPress={() => handleSpeakCue('turnOnFlash')}
          activeOpacity={0.7}
        >
          <Volume2 size={11} color="#FFFFFF" />
          <Text style={styles.cuePillText}>"Turn On Flash"</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CORNER_SIZE = 28;
const BORDER_WIDTH = 3.5;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill as any,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipCard: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: SCREEN_WIDTH * 0.9,
    zIndex: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  tooltipText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  audioHintBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  reticleBox: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderTopLeftRadius: 14,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomRightRadius: 14,
  },
  crosshairContainer: {
    ...StyleSheet.absoluteFill as any,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairHorizontal: {
    width: 32,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  crosshairVertical: {
    position: 'absolute',
    height: 32,
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  centerRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  laserBar: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 3,
    zIndex: 5,
  },
  laserBeam: {
    height: 2,
    backgroundColor: '#38BDF8',
    borderRadius: 1,
  },
  laserGlow: {
    height: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    marginTop: -6,
    borderRadius: 6,
  },
  scaleGuideLeft: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    alignItems: 'flex-start',
    gap: 2,
  },
  scaleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  scaleTick: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  scaleTickSmall: {
    width: 6,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  scaleGuideRight: {
    position: 'absolute',
    bottom: 12,
    right: 10,
  },
  focalPlaneText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  cuesBar: {
    position: 'absolute',
    bottom: 170,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  cuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cuePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
