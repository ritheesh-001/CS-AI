import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Header } from '@/src/components/Header';
import { SensorService } from '@/src/services/sensorService';
import { SpeechService } from '@/src/services/speechService';
import { useReportStore } from '@/src/store/reportStore';
import { PatrolJoltEvent } from '@/src/types/inspection';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import {
  Car,
  Activity,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  Square,
  Radio,
} from 'lucide-react-native';

export default function CommuteScreen() {
  const [isPatrolActive, setIsPatrolActive] = useState(false);
  const [currentZForce, setCurrentZForce] = useState(1.0);
  const [recentEvents, setRecentEvents] = useState<PatrolJoltEvent[]>([]);

  const addPatrolJolt = useReportStore((state: any) => state.addPatrolJolt);
  const userLanguage = useReportStore((state: any) => state.userProfile.language);

  useEffect(() => {
    if (isPatrolActive) {
      SensorService.startPatrolMonitoring((event) => {
        setCurrentZForce(event.zAcceleration);
        setRecentEvents((prev) => [event, ...prev]);
        addPatrolJolt(event);
        SpeechService.speakJoltDetected(userLanguage);
      });
    } else {
      SensorService.stopPatrolMonitoring();
    }

    return () => {
      SensorService.stopPatrolMonitoring();
    };
  }, [isPatrolActive, userLanguage, addPatrolJolt]);

  const handleTogglePatrol = () => {
    setIsPatrolActive((prev) => !prev);
  };

  const handleSimulateJolt = async () => {
    const simulated = await SensorService.simulateJoltTrigger(3.4);
    setCurrentZForce(simulated.zAcceleration);
    setRecentEvents((prev) => [simulated, ...prev]);
    await addPatrolJolt(simulated);
    SpeechService.speakJoltDetected(userLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dashcam Patrol Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBox}>
              <Car size={32} color="#FFFFFF" />
            </View>
            <View
              style={[
                styles.statusIndicator,
                isPatrolActive ? styles.statusActive : styles.statusIdle,
              ]}
            >
              <Radio size={14} color={isPatrolActive ? '#4ADE80' : '#94A3B8'} />
              <Text
                style={[
                  styles.statusText,
                  { color: isPatrolActive ? '#FFFFFF' : '#94A3B8' },
                ]}
              >
                {isPatrolActive ? 'PATROL ACTIVE' : 'PATROL STANDBY'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Commute Dashcam Patrol Mode</Text>
          <Text style={styles.heroSubtitle}>
            Continuous background accelerometer monitoring. Automatically geotags and captures
            severe potholes & road fractures when vertical shock exceeds 2.5g.
          </Text>

          {/* Primary Toggle CTA */}
          <TouchableOpacity
            style={[
              styles.patrolToggleBtn,
              isPatrolActive ? styles.stopBtn : styles.startBtn,
            ]}
            onPress={handleTogglePatrol}
            activeOpacity={0.85}
          >
            {isPatrolActive ? (
              <>
                <Square size={18} color="#FFFFFF" />
                <Text style={styles.patrolBtnText}>Stop Patrol Monitoring</Text>
              </>
            ) : (
              <>
                <Play size={18} color="#FFFFFF" />
                <Text style={styles.patrolBtnText}>Start Commute Patrol</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Real-time G-Force Live Gauge */}
        <View style={styles.gaugeCard}>
          <View style={styles.gaugeHeader}>
            <View style={styles.gaugeTitleRow}>
              <Activity size={18} color={Colors.primary} />
              <Text style={styles.gaugeTitle}>VERTICAL ACCELERATION SENSOR (Z-AXIS)</Text>
            </View>
            <Text style={styles.gaugeThreshold}>Trigger: &gt; 2.5g</Text>
          </View>

          <View style={styles.gaugeMeterRow}>
            <Text style={styles.gaugeNumber}>{currentZForce.toFixed(2)}</Text>
            <Text style={styles.gaugeUnit}>g</Text>
          </View>

          {/* Meter progress bar */}
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.min(100, (currentZForce / 4.0) * 100)}%`,
                  backgroundColor:
                    currentZForce > 2.5 ? '#DC2626' : Colors.primary,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.simButton}
            onPress={handleSimulateJolt}
            activeOpacity={0.8}
          >
            <Zap size={16} color="#D97706" />
            <Text style={styles.simButtonText}>Test Simulate 3.4g Pothole Impact</Text>
          </TouchableOpacity>
        </View>

        {/* Passive Capture Queue */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Passive Patrol Captures ({recentEvents.length})</Text>
          <View style={styles.syncBadge}>
            <ShieldCheck size={12} color="#059669" />
            <Text style={styles.syncBadgeText}>Batch Wi-Fi Sync</Text>
          </View>
        </View>

        {recentEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Car size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Road Jolt Events Logged Yet</Text>
            <Text style={styles.emptySub}>
              Start patrol mode while driving or tap "Test Simulate" to trigger a pothole bump.
            </Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {recentEvents.map((item) => (
              <View key={item.id} style={styles.eventItem}>
                <Image source={{ uri: item.imageUri }} style={styles.eventThumb} />
                <View style={styles.eventBody}>
                  <View style={styles.eventTop}>
                    <Text style={styles.eventId}>{item.id}</Text>
                    <View style={styles.gBadge}>
                      <Text style={styles.gBadgeText}>{item.zAcceleration}g SHOCK</Text>
                    </View>
                  </View>

                  <View style={styles.eventAddressRow}>
                    <MapPin size={12} color="#64748B" />
                    <Text style={styles.eventAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>

                  <View style={styles.eventTimeRow}>
                    <Clock size={11} color="#94A3B8" />
                    <Text style={styles.eventTime}>
                      {new Date(item.timestamp).toLocaleTimeString()} • Speed ~{item.speedKmh} km/h
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    ...Shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  statusIdle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  patrolToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  startBtn: {
    backgroundColor: Colors.primary,
  },
  stopBtn: {
    backgroundColor: '#DC2626',
  },
  patrolBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Shadows.sm,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gaugeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gaugeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  gaugeThreshold: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  gaugeMeterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  gaugeNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
  },
  gaugeUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  meterTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  simButtonText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
  },
  eventsList: {
    gap: 10,
  },
  eventItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Shadows.sm,
  },
  eventThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  eventBody: {
    flex: 1,
  },
  eventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  gBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
  },
  eventAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  eventAddress: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
