import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ProgressionDelta } from '../types/inspection';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/typography';
import { TrendingUp, AlertTriangle, ArrowRight, Calendar, Layers } from 'lucide-react-native';

interface ProgressionSliderProps {
  delta: ProgressionDelta;
}

export const ProgressionSlider: React.FC<ProgressionSliderProps> = ({ delta }) => {
  const [activeView, setActiveView] = useState<'SPLIT' | 'BEFORE' | 'CURRENT'>('SPLIT');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Layers size={18} color={Colors.primary} />
          <Text style={styles.title}>TIME-SERIES PROGRESSION</Text>
        </View>

        {/* Growth Badge */}
        <View
          style={[
            styles.growthBadge,
            delta.isEscalated ? styles.growthBadgeEscalated : styles.growthBadgeNormal,
          ]}
        >
          <TrendingUp
            size={12}
            color={delta.isEscalated ? '#DC2626' : Colors.primary}
          />
          <Text
            style={[
              styles.growthBadgeText,
              delta.isEscalated ? styles.textEscalated : styles.textNormal,
            ]}
          >
            {delta.growthBadge}
          </Text>
        </View>
      </View>

      {/* Auto-escalation warning callout if threshold breached */}
      {delta.isEscalated && (
        <View style={styles.escalationWarningBox}>
          <AlertTriangle size={16} color="#DC2626" />
          <Text style={styles.escalationWarningText}>
            Priority Auto-Escalated: Growth rate exceeds 0.5 mm / 30-day safety limit!
          </Text>
        </View>
      )}

      {/* View Mode Switcher Pills */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeView === 'SPLIT' && styles.tabActive]}
          onPress={() => setActiveView('SPLIT')}
        >
          <Text style={[styles.tabText, activeView === 'SPLIT' && styles.tabTextActive]}>
            Side-by-Side Comparison
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeView === 'BEFORE' && styles.tabActive]}
          onPress={() => setActiveView('BEFORE')}
        >
          <Text style={[styles.tabText, activeView === 'BEFORE' && styles.tabTextActive]}>
            Baseline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeView === 'CURRENT' && styles.tabActive]}
          onPress={() => setActiveView('CURRENT')}
        >
          <Text style={[styles.tabText, activeView === 'CURRENT' && styles.tabTextActive]}>
            Current
          </Text>
        </TouchableOpacity>
      </View>

      {/* Visual Photo Area */}
      <View style={styles.photoContainer}>
        {activeView === 'SPLIT' ? (
          <View style={styles.splitRow}>
            {/* Before Photo */}
            <View style={styles.splitCol}>
              <Image source={{ uri: delta.previousImageUri }} style={styles.photo} />
              <View style={styles.photoTag}>
                <Text style={styles.photoTagLabel}>INITIAL SCAN</Text>
                <Text style={styles.photoTagMetric}>{delta.previousWidthMm} mm</Text>
              </View>
            </View>

            <View style={styles.splitDivider} />

            {/* Current Photo */}
            <View style={styles.splitCol}>
              <Image source={{ uri: delta.currentImageUri }} style={styles.photo} />
              <View style={[styles.photoTag, styles.photoTagCurrent]}>
                <Text style={styles.photoTagLabel}>LATEST RESCAN</Text>
                <Text style={[styles.photoTagMetric, { color: '#DC2626' }]}>
                  {delta.currentWidthMm} mm
                </Text>
              </View>
            </View>
          </View>
        ) : activeView === 'BEFORE' ? (
          <View style={styles.singlePhotoWrap}>
            <Image source={{ uri: delta.previousImageUri }} style={styles.photoLarge} />
            <View style={styles.photoTagOverlay}>
              <Text style={styles.photoTagLabel}>HISTORICAL BASELINE</Text>
              <Text style={styles.photoTagMetric}>{delta.previousWidthMm} mm</Text>
            </View>
          </View>
        ) : (
          <View style={styles.singlePhotoWrap}>
            <Image source={{ uri: delta.currentImageUri }} style={styles.photoLarge} />
            <View style={[styles.photoTagOverlay, styles.photoTagCurrent]}>
              <Text style={styles.photoTagLabel}>CURRENT RESCAN</Text>
              <Text style={[styles.photoTagMetric, { color: '#DC2626' }]}>
                {delta.currentWidthMm} mm
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Growth Metric Calculation Summary */}
      <View style={styles.metricsSummaryBox}>
        <View style={styles.metricItem}>
          <Text style={styles.metricItemLabel}>Initial Width</Text>
          <Text style={styles.metricItemValue}>{delta.previousWidthMm} mm</Text>
        </View>
        <ArrowRight size={16} color="#94A3B8" />
        <View style={styles.metricItem}>
          <Text style={styles.metricItemLabel}>Current Width</Text>
          <Text style={[styles.metricItemValue, { color: '#0F172A' }]}>
            {delta.currentWidthMm} mm
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricItemLabel}>Net Expansion</Text>
          <Text style={[styles.metricItemValue, { color: '#DC2626' }]}>
            +{delta.deltaWidthMm} mm
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  growthBadgeNormal: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  growthBadgeEscalated: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  growthBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textNormal: {
    color: Colors.primary,
  },
  textEscalated: {
    color: '#DC2626',
  },
  escalationWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  escalationWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  photoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: 14,
  },
  splitRow: {
    flexDirection: 'row',
    height: 180,
  },
  splitCol: {
    flex: 1,
    position: 'relative',
  },
  splitDivider: {
    width: 2,
    backgroundColor: '#FFFFFF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoTagCurrent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  photoTagLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  photoTagMetric: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  singlePhotoWrap: {
    height: 200,
    position: 'relative',
  },
  photoLarge: {
    width: '100%',
    height: '100%',
  },
  photoTagOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metricsSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricItemLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metricItemValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
});
