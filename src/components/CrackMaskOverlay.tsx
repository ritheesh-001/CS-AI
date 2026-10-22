import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Svg, { Polyline, Circle, Rect } from 'react-native-svg';
import { BoundingBox, CrackPolylinePoint, SeverityLevel } from '../types/inspection';
import { Colors } from '../theme/colors';

interface CrackMaskOverlayProps {
  imageUri: string;
  boundingBox?: BoundingBox;
  crackPolyline?: CrackPolylinePoint[];
  crackWidthMm: number;
  severity: SeverityLevel;
  confidence: number;
}

export const CrackMaskOverlay: React.FC<CrackMaskOverlayProps> = ({
  imageUri,
  boundingBox = { ymin: 20, xmin: 25, ymax: 75, xmax: 75 },
  crackPolyline = [
    { x: 30, y: 24 },
    { x: 42, y: 40 },
    { x: 48, y: 56 },
    { x: 65, y: 72 },
  ],
  crackWidthMm,
  severity,
  confidence,
}) => {
  const strokeColor =
    severity === 'HIGH'
      ? Colors.severity.high.main
      : severity === 'MEDIUM'
      ? Colors.severity.medium.main
      : Colors.severity.low.main;

  // Convert percentage points to SVG points string
  const pointsString = crackPolyline.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      {/* SVG Vector Mask Overlay */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100">
          {/* Bounding Box Rect */}
          <Rect
            x={boundingBox.xmin}
            y={boundingBox.ymin}
            width={boundingBox.xmax - boundingBox.xmin}
            height={boundingBox.ymax - boundingBox.ymin}
            fill="rgba(56, 189, 248, 0.08)"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeDasharray="2, 1"
            rx="2"
          />

          {/* Crack Fracture Polyline */}
          <Polyline
            points={pointsString}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Polyline Key Anchor Dots */}
          {crackPolyline.map((p, index) => (
            <Circle
              key={index}
              cx={p.x}
              cy={p.y}
              r="1.2"
              fill="#FFFFFF"
              stroke={strokeColor}
              strokeWidth="0.6"
            />
          ))}
        </Svg>
      </View>

      {/* Bounding tag label */}
      <View
        style={[
          styles.calloutTag,
          {
            top: `${boundingBox.ymin}%`,
            left: `${boundingBox.xmin}%`,
            backgroundColor: strokeColor,
          },
        ]}
      >
        <Text style={styles.calloutText}>
          {crackWidthMm.toFixed(2)}mm • {(confidence * 100).toFixed(0)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  calloutTag: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    transform: [{ translateY: -12 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  calloutText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});
