import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useReportStore } from '@/src/store/reportStore';
import { Header } from '@/src/components/Header';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import { getTranslation } from '@/src/utils/i18n';
import { CrackReport } from '@/src/types/inspection';
import {
  Scan,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const reports = useReportStore((state: any) => state.reports as CrackReport[]);
  const userProfile = useReportStore((state: any) => state.userProfile);
  const initializeStore = useReportStore((state: any) => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const t = getTranslation(userProfile.language);

  // Computed metrics
  const totalReports = reports.length;
  const criticalCount = reports.filter((r: CrackReport) => r.severity === 'HIGH').length;
  const repairedCount = reports.filter((r: CrackReport) => r.status === 'REPAIRED').length;
  const recentCritical = reports.find((r: CrackReport) => r.severity === 'HIGH');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nearby Critical Alerts Ticker */}
        {recentCritical ? (
          <TouchableOpacity
            style={styles.alertTicker}
            onPress={() => router.push(`/inspection/${recentCritical.id}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.alertIconCircle}>
              <AlertTriangle size={16} color="#DC2626" />
            </View>
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTickerTag}>CRITICAL ALERT NEARBY</Text>
              <Text style={styles.alertTickerTitle} numberOfLines={1}>
                {recentCritical.address || 'Bridge Pier Distress Detected'} (
                {recentCritical.crackWidthMm}mm)
              </Text>
            </View>
            <ChevronRight size={18} color="#991B1B" />
          </TouchableOpacity>
        ) : null}

        {/* Hero Trigger: Google Pay Style Large Action Card */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.9}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBox}>
              <Scan size={36} color="#FFFFFF" />
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AI READY</Text>
            </View>
          </View>

          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{t.scanInfrastructure}</Text>
            <Text style={styles.heroSubtitle}>{t.scanSubtitle}</Text>
          </View>

          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Launch Camera Scanner</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Civic Statistics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.civicStats}</Text>
          <View style={styles.badgePulse}>
            <TrendingUp size={13} color="#10B981" />
            <Text style={styles.badgePulseText}>Live City Feed</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {/* Card 1: Total Scans */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Scan size={18} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{totalReports}</Text>
            <Text style={styles.statLabel}>{t.totalCracks}</Text>
          </View>

          {/* Card 2: Critical Threats */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <AlertTriangle size={18} color="#DC2626" />
            </View>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>
              {criticalCount}
            </Text>
            <Text style={styles.statLabel}>{t.criticalThreats}</Text>
          </View>

          {/* Card 3: Repaired & Safe */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <ShieldCheck size={18} color="#059669" />
            </View>
            <Text style={[styles.statNumber, { color: '#059669' }]}>
              {repairedCount}
            </Text>
            <Text style={styles.statLabel}>{t.repairedSafe}</Text>
          </View>

          {/* Card 4: Active Crews */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Wrench size={18} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Active PWD Crews</Text>
          </View>
        </View>

        {/* Recent Civic Reports Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Civic Reports</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')}>
            <Text style={styles.viewAllText}>View All ({totalReports})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {reports.slice(0, 4).map((item: CrackReport) => {
            const severityColor =
              item.severity === 'HIGH'
                ? Colors.severity.high
                : item.severity === 'MEDIUM'
                ? Colors.severity.medium
                : Colors.severity.low;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.recentItem}
                onPress={() => router.push(`/inspection/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.severityStripe,
                    { backgroundColor: severityColor.main },
                  ]}
                />
                <View style={styles.recentDetails}>
                  <View style={styles.recentTopRow}>
                    <Text style={styles.recentComponent}>
                      {item.structuralType.replace('_', ' ')}
                    </Text>
                    <View
                      style={[
                        styles.severityPill,
                        { backgroundColor: severityColor.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityPillText,
                          { color: severityColor.text },
                        ]}
                      >
                        {item.severity}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recentLocationRow}>
                    <MapPin size={12} color="#64748B" />
                    <Text style={styles.recentLocation} numberOfLines={1}>
                      {item.address || 'Chennai Municipal Area'}
                    </Text>
                  </View>

                  <View style={styles.recentBottomRow}>
                    <Text style={styles.recentWidth}>
                      Aperture: <Text style={styles.widthBold}>{item.crackWidthMm}mm</Text>
                    </Text>
                    <View style={styles.timeRow}>
                      <Clock size={11} color="#94A3B8" />
                      <Text style={styles.timeText}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <ChevronRight size={18} color="#CBD5E1" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  alertTicker: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTickerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  alertTickerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F1D1D',
    marginTop: 1,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    ...Shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroBody: {
    marginTop: 18,
    marginBottom: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgePulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgePulseText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.sm,
  },
  severityStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  recentDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  recentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentComponent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  recentLocation: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  recentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentWidth: {
    fontSize: 12,
    color: '#475569',
  },
  widthBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
