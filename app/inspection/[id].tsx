import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReportStore } from '@/src/store/reportStore';
import { CrackMaskOverlay } from '@/src/components/CrackMaskOverlay';
import { SoundboxBanner } from '@/src/components/SoundboxBanner';
import { ProgressionSlider } from '@/src/components/ProgressionSlider';
import { DIYCalculatorModal } from '@/src/components/DIYCalculatorModal';
import { SOSModal } from '@/src/components/SOSModal';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import {
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Send,
  PhoneCall,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  FileCheck,
  Calculator,
  ShieldCheck,
  Layers,
} from 'lucide-react-native';

export default function InspectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getReportById = useReportStore((state: any) => state.getReportById);
  const updateReportStatus = useReportStore((state: any) => state.updateReportStatus);
  const userLanguage = useReportStore((state: any) => state.userProfile.language);

  const report = getReportById(id as string);

  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showDIYModal, setShowDIYModal] = useState(false);
  const [isSubmittingPWD, setIsSubmittingPWD] = useState(false);
  const [pwdSubmitted, setPwdSubmitted] = useState(
    report?.status === 'ACKNOWLEDGED' || report?.status === 'INSPECTED'
  );

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Inspection Details</Text>
        </View>
        <View style={styles.notFoundBox}>
          <Text style={styles.notFoundTitle}>Report Not Found</Text>
          <Text style={styles.notFoundSub}>
            The inspection report with ID "{id}" could not be located.
          </Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.backHomeBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: `CrackSense Report: ${report.id}`,
        message: `[CrackSense Civic Safety]\nInspection Report #${report.id}\nComponent: ${report.structuralType}\nWidth: ${report.crackWidthMm}mm\nSeverity Index: ${report.severityIndex} (${report.severity})\nLocation: ${report.address || 'Geo-Anchored'}\nTimestamp: ${new Date(report.timestamp).toLocaleString()}`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleSubmitToPWD = async () => {
    setIsSubmittingPWD(true);
    await new Promise((r) => setTimeout(r, 700));
    await updateReportStatus(
      report.id,
      'ACKNOWLEDGED',
      'PWD Regional Division 1',
      'Assigned to field survey queue.'
    );
    setIsSubmittingPWD(false);
    setPwdSubmitted(true);
    Alert.alert(
      'Routed to PWD Queue',
      `Ticket #${report.id} has been transmitted to the Municipal Engineer. Status changed to ACKNOWLEDGED.`
    );
  };

  const handleDirectCallHelpline = () => {
    Linking.openURL('tel:112');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.navTitle}>Structural Report</Text>
          <Text style={styles.navSubtitle}>{report.id}</Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          style={styles.actionIconBtn}
          activeOpacity={0.7}
        >
          <Share2 size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Module 3: Google Pay Style Soundbox Banner & High-Contrast Ring */}
        <View style={styles.sectionWrap}>
          <SoundboxBanner
            severity={report.severity}
            severityIndex={report.severityIndex}
            crackWidthMm={report.crackWidthMm}
            language={userLanguage}
          />
        </View>

        {/* Photo View with Bounding Mask & Crack Contour */}
        <View style={styles.photoContainer}>
          <CrackMaskOverlay
            imageUri={report.imageUri}
            boundingBox={report.boundingBox}
            crackPolyline={report.crackPolyline}
            crackWidthMm={report.crackWidthMm}
            severity={report.severity}
            confidence={report.confidence}
          />
        </View>

        {/* Module 1: Time-Series Progression Slider & Comparison */}
        {report.progressionDelta && (
          <View style={styles.sectionWrap}>
            <ProgressionSlider delta={report.progressionDelta} />
          </View>
        )}

        {/* Module 6: Closed-Loop Proof of Work (Initial vs Repaired) */}
        {report.status === 'REPAIRED' && report.proofOfWork?.repairProofPhotoUri && (
          <View style={styles.proofCard}>
            <View style={styles.proofHeader}>
              <ShieldCheck size={20} color="#059669" />
              <Text style={styles.proofTitle}>VERIFIED PROOF OF WORK</Text>
            </View>
            <Text style={styles.proofSub}>
              "Your report fixed this structural hazard. Verified by PWD Inspection Engineer."
            </Text>

            <View style={styles.dualProofRow}>
              <View style={styles.proofCol}>
                <Image
                  source={{ uri: report.proofOfWork.initialScanPhotoUri }}
                  style={styles.proofThumb}
                />
                <Text style={styles.proofLabel}>BEFORE (Initial)</Text>
              </View>

              <View style={styles.proofCol}>
                <Image
                  source={{ uri: report.proofOfWork.repairProofPhotoUri }}
                  style={styles.proofThumb}
                />
                <Text style={[styles.proofLabel, { color: '#059669' }]}>
                  AFTER (Repaired) ✓
                </Text>
              </View>
            </View>

            <View style={styles.certBadge}>
              <Text style={styles.certText}>
                Order: {report.proofOfWork.workOrderNumber || 'WO-4091-PWD'} • Closed on{' '}
                {new Date(report.proofOfWork.repairedAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Structural Classification & Criticality Breakdown */}
        <View style={styles.metaCard}>
          <Text style={styles.cardHeaderTitle}>STRUCTURAL SPECIFICATION</Text>

          <View style={styles.componentRow}>
            <View style={styles.componentBox}>
              <Text style={styles.specLabel}>COMPONENT TYPE</Text>
              <Text style={styles.specValue}>{report.structuralType.replace('_', ' ')}</Text>
            </View>
            <View style={styles.factorBox}>
              <Text style={styles.specLabel}>CRITICALITY FACTOR</Text>
              <Text style={styles.factorValue}>{report.criticalityFactor}x</Text>
            </View>
          </View>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Severity Index = {report.crackWidthMm}mm × {report.criticalityFactor} ={' '}
              <Text style={{ fontWeight: '800' }}>{report.severityIndex}</Text>
            </Text>
          </View>

          {/* Location details */}
          <View style={styles.locationRow}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.locationTextBold}>
              {report.address || 'Chennai Municipal Area'}
            </Text>
          </View>

          <View style={styles.coordsRow}>
            <Text style={styles.coordsText}>
              LAT: {report.latitude.toFixed(5)}° N | LNG: {report.longitude.toFixed(5)}° E
            </Text>
          </View>

          <View style={styles.timeRow}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.timeText}>
              Timestamp: {new Date(report.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Module 7: DIY Material Quantity Estimator Trigger Card */}
        <View style={styles.diyBannerCard}>
          <View style={styles.diyHeaderRow}>
            <View style={styles.diyIconWrap}>
              <Calculator size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.diyCardTitle}>DIY Material Estimator</Text>
              <Text style={styles.diyCardSub}>
                Calculate chemical sealant volume (mL) & cartridges for repair
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.openCalculatorBtn}
            onPress={() => setShowDIYModal(true)}
            activeOpacity={0.85}
          >
            <Wrench size={16} color="#0F172A" />
            <Text style={styles.openCalculatorBtnText}>
              Open Material Calculator & Hardware Locator
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Action CTAs (Low, Medium, High) */}
        {report.severity === 'LOW' && (
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <CheckCircle2 size={24} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Minor Surface Distress</Text>
                <Text style={styles.actionSub}>
                  No immediate structural danger. Standard preventative seal advised.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveLogBtn}
              onPress={() => {
                Alert.alert(
                  'Saved to Local History',
                  'This baseline has been logged for quarterly re-scan tracking.'
                );
              }}
              activeOpacity={0.85}
            >
              <FileCheck size={18} color="#FFFFFF" />
              <Text style={styles.saveLogBtnText}>Save to Personal Civic Log</Text>
            </TouchableOpacity>
          </View>
        )}

        {report.severity === 'MEDIUM' && (
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Wrench size={24} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Moderate Distress — PWD Dispatch</Text>
                <Text style={styles.actionSub}>
                  Polyurethane or chemical grout injection recommended to prevent moisture intrusion.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.mediumSubmitButton,
                pwdSubmitted && styles.mediumSubmitButtonDone,
              ]}
              onPress={handleSubmitToPWD}
              disabled={isSubmittingPWD || pwdSubmitted}
              activeOpacity={0.85}
            >
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.mediumSubmitButtonText}>
                {pwdSubmitted
                  ? 'Transmitted to Municipal Queue ✓'
                  : isSubmittingPWD
                  ? 'Routing to PWD...'
                  : 'Submit to PWD Repair Queue'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {report.severity === 'HIGH' && (
          <View style={[styles.actionCard, styles.highActionCard]}>
            <View style={styles.actionHeader}>
              <ShieldAlert size={26} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: '#DC2626' }]}>
                  CRITICAL HAZARD PROTOCOL ACTIVE
                </Text>
                <Text style={styles.actionSub}>
                  Aperture and structural multiplier exceed civic safety index (&gt; 8.0).
                </Text>
              </View>
            </View>

            <View style={styles.highButtonWrap}>
              <TouchableOpacity
                style={styles.sosTriggerBtn}
                onPress={() => setShowSOSModal(true)}
                activeOpacity={0.85}
              >
                <ShieldAlert size={20} color="#FFFFFF" />
                <Text style={styles.sosTriggerBtnText}>
                  Initiate 10-Sec SOS Emergency Alert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callHelplineBtn}
                onPress={handleDirectCallHelpline}
                activeOpacity={0.85}
              >
                <PhoneCall size={18} color="#DC2626" />
                <Text style={styles.callHelplineBtnText}>
                  Direct Call Disaster Helpline (112)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Module 7: DIY Material Estimator Modal */}
      <DIYCalculatorModal
        visible={showDIYModal}
        onClose={() => setShowDIYModal(false)}
        initialEstimate={report.diyEstimate}
        structuralType={report.structuralType}
        latitude={report.latitude}
        longitude={report.longitude}
      />

      {/* High-Severity SOS Modal */}
      <SOSModal
        visible={showSOSModal}
        reportId={report.id}
        crackWidthMm={report.crackWidthMm}
        address={report.address}
        onCancel={() => setShowSOSModal(false)}
        onDispatched={() => {
          updateReportStatus(
            report.id,
            'ACKNOWLEDGED',
            'Emergency Strike Team Alpha',
            'Automated 10s SOS protocol dispatched.'
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  titleWrap: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  navSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  actionIconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionWrap: {
    marginBottom: 16,
  },
  photoContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.card,
  },
  proofCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Shadows.sm,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proofTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  proofSub: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 14,
    lineHeight: 18,
  },
  dualProofRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  proofCol: {
    flex: 1,
  },
  proofThumb: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  proofLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    textAlign: 'center',
  },
  certBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  certText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    fontFamily: 'monospace',
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.sm,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  componentBox: {
    flex: 1,
  },
  factorBox: {
    alignItems: 'flex-end',
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  factorValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  formulaBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
  },
  formulaText: {
    fontSize: 12,
    color: '#1E40AF',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  coordsRow: {
    marginBottom: 6,
    paddingLeft: 24,
  },
  coordsText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 24,
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
  },
  diyBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.sm,
  },
  diyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  diyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diyCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  diyCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  openCalculatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 14,
  },
  openCalculatorBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  highActionCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFDFD',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  saveLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveLogBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mediumSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  mediumSubmitButtonDone: {
    backgroundColor: '#059669',
  },
  mediumSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  highButtonWrap: {
    gap: 10,
  },
  sosTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 15,
    borderRadius: 14,
  },
  sosTriggerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  callHelplineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 14,
  },
  callHelplineBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  notFoundBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  backHomeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
