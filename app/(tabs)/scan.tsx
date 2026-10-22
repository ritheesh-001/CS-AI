import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CameraReticle } from '@/src/components/CameraReticle';
import { useLocation } from '@/src/hooks/useLocation';
import { useReportStore } from '@/src/store/reportStore';
import { InspectionEngine } from '@/src/services/inspectionEngine';
import { SpeechService } from '@/src/services/speechService';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import {
  Zap,
  ZapOff,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Camera as CameraIcon,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { StructuralType, CrackReport } from '@/src/types/inspection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_CRACK_PHOTOS = [
  'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80',
];

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { location, refreshLocation } = useLocation();

  const reports = useReportStore((state: any) => state.reports as CrackReport[]);
  const addReport = useReportStore((state: any) => state.addReport);
  const checkNearbyCrackForRescan = useReportStore(
    (state: any) => state.checkNearbyCrackForRescan
  );
  const userLanguage = useReportStore((state: any) => state.userProfile.language);

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [selectedType, setSelectedType] = useState<StructuralType>('RESIDENTIAL_WALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Module 1: Re-scan Proximity Detection Modal State
  const [nearbyCrackPrompt, setNearbyCrackPrompt] = useState<CrackReport | null>(null);
  const [activeParentRescanId, setActiveParentRescanId] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);

  // Proximity check when location updates
  useEffect(() => {
    if (location && reports.length > 0) {
      const match = checkNearbyCrackForRescan(location.latitude, location.longitude);
      if (match && !activeParentRescanId) {
        setNearbyCrackPrompt(match);
      }
    }
  }, [location, reports, checkNearbyCrackForRescan, activeParentRescanId]);

  const handleCapture = async () => {
    setIsProcessing(true);
    setProcessingStep('Calibrating high-precision GPS & spatial anchor...');
    SpeechService.speakGuidance('scanning', userLanguage);

    let photoUri: string | null = null;
    if (cameraRef.current && permission?.granted) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        photoUri = photo.uri;
      } catch (e) {
        console.warn('Camera capture error, falling back to sample:', e);
      }
    }

    if (!photoUri) {
      photoUri =
        SAMPLE_CRACK_PHOTOS[
          Math.floor(Math.random() * SAMPLE_CRACK_PHOTOS.length)
        ];
    }

    await new Promise((r) => setTimeout(r, 600));
    setProcessingStep('Segmenting edge contours & concrete micro-fractures...');
    await new Promise((r) => setTimeout(r, 700));
    setProcessingStep('Computing severity index (Width × Criticality Factor)...');
    await new Promise((r) => setTimeout(r, 600));

    const lat = location?.latitude || 13.0827;
    const lng = location?.longitude || 80.2707;
    const addr = location?.address || 'Anna Salai Flyover, Pier #4, Chennai';

    // Run Inspection Engine
    const report = InspectionEngine.processScan({
      imageUri: photoUri,
      latitude: lat,
      longitude: lng,
      address: addr,
      structuralType: selectedType,
      reScanParentReportId: activeParentRescanId || undefined,
      existingReports: reports,
    });

    await addReport(report, !!activeParentRescanId);
    setIsProcessing(false);
    setActiveParentRescanId(null);

    // Announce Soundbox Verdict
    SpeechService.speakVerdict(report.severity, userLanguage);

    router.push(`/inspection/${report.id}` as any);
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setIsProcessing(true);
        setProcessingStep('Processing image through structural computer vision...');

        const lat = location?.latitude || 13.0827;
        const lng = location?.longitude || 80.2707;
        const addr = location?.address || 'Civic Infrastructure Location';

        const report = InspectionEngine.processScan({
          imageUri: pickedUri,
          latitude: lat,
          longitude: lng,
          address: addr,
          structuralType: selectedType,
          reScanParentReportId: activeParentRescanId || undefined,
          existingReports: reports,
        });

        await addReport(report, !!activeParentRescanId);
        setIsProcessing(false);
        setActiveParentRescanId(null);
        SpeechService.speakVerdict(report.severity, userLanguage);
        router.push(`/inspection/${report.id}` as any);
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Viewport: Camera or Interactive Simulation View */}
      <View style={styles.viewport}>
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill as any}
            enableTorch={torchEnabled}
            facing="back"
          />
        ) : (
          <View style={styles.fallbackCamera}>
            <Image
              source={{ uri: SAMPLE_CRACK_PHOTOS[0] }}
              style={StyleSheet.absoluteFill as any}
              resizeMode="cover"
            />
            <View style={styles.fallbackOverlay}>
              <View style={styles.permissionBox}>
                <CameraIcon size={24} color="#FFFFFF" />
                <Text style={styles.permissionText}>Simulated Optical Viewport Active</Text>
                {!permission?.granted && (
                  <TouchableOpacity
                    style={styles.permissionBtn}
                    onPress={requestPermission}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.permissionBtnText}>Enable Device Camera</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Viewfinder Reticle with Laser Beam & Audio Feedback */}
        <CameraReticle
          tooltipText="Align crack within frame & keep phone ~30cm away"
          language={userLanguage}
        />

        {/* Active Rescan Banner indicator if user confirmed re-scan */}
        {activeParentRescanId && (
          <View style={styles.rescanActiveBanner}>
            <Layers size={14} color="#FFFFFF" />
            <Text style={styles.rescanActiveText}>
              RE-SCAN MODE ACTIVE: Measuring Delta vs #{activeParentRescanId}
            </Text>
          </View>
        )}

        {/* Top Controls: Flash, GPS coordinates, Sound toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.iconButton, torchEnabled && styles.iconButtonActive]}
            onPress={() => setTorchEnabled(!torchEnabled)}
            activeOpacity={0.7}
          >
            {torchEnabled ? (
              <Zap size={20} color="#F59E0B" />
            ) : (
              <ZapOff size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationChip}
            onPress={refreshLocation}
            activeOpacity={0.8}
          >
            <MapPin size={13} color="#38BDF8" />
            <Text style={styles.locationText} numberOfLines={1}>
              {location
                ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`
                : 'Acquiring GPS...'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Structural Component Selector Tabs (Module 2 Criticality Engine) */}
        <View style={styles.typeSelectorBar}>
          {[
            { key: 'ASPHALT_ROAD', label: 'Road (1.0x)' },
            { key: 'RESIDENTIAL_WALL', label: 'Wall (1.2x)' },
            { key: 'RETAINING_WALL', label: 'Retain (2.0x)' },
            { key: 'BRIDGE_PIER_GIRDER', label: 'Bridge (3.5x)' },
          ].map((item) => {
            const isSelected = selectedType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.typeTab,
                  isSelected && styles.typeTabSelected,
                ]}
                onPress={() => setSelectedType(item.key as StructuralType)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    isSelected && styles.typeTabTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Shutter & Gallery Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handlePickFromGallery}
            activeOpacity={0.8}
          >
            <ImageIcon size={22} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Gallery</Text>
          </TouchableOpacity>

          {/* Large Shutter Button */}
          <TouchableOpacity
            style={styles.shutterOuter}
            onPress={handleCapture}
            activeOpacity={0.85}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCapture}
            activeOpacity={0.8}
          >
            <Sparkles size={22} color="#38BDF8" />
            <Text style={[styles.actionBtnText, { color: '#38BDF8' }]}>Sample</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Module 1: Re-scan Proximity Detection Modal Prompt */}
      <Modal visible={!!nearbyCrackPrompt} transparent animationType="fade">
        <View style={styles.promptBackdrop}>
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <View style={styles.promptIconCircle}>
                <Layers size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptTitle}>Existing Crack Nearby!</Text>
                <Text style={styles.promptSub}>Within 15 meters of previous inspection</Text>
              </View>
              <TouchableOpacity onPress={() => setNearbyCrackPrompt(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.promptDetailsBox}>
              <Text style={styles.promptRecordId}>
                Ticket: {nearbyCrackPrompt?.id} ({nearbyCrackPrompt?.structuralType})
              </Text>
              <Text style={styles.promptRecordMetric}>
                Previous Aperture: {nearbyCrackPrompt?.crackWidthMm} mm
              </Text>
              <Text style={styles.promptQuestion}>
                "Existing crack detected at this spot. Rescan to measure growth?"
              </Text>
            </View>

            <View style={styles.promptButtonsGroup}>
              {/* Option A: Rescan to measure growth (Module 1) */}
              <TouchableOpacity
                style={styles.rescanConfirmBtn}
                onPress={() => {
                  setActiveParentRescanId(nearbyCrackPrompt!.id);
                  setNearbyCrackPrompt(null);
                }}
                activeOpacity={0.85}
              >
                <Layers size={16} color="#FFFFFF" />
                <Text style={styles.rescanConfirmBtnText}>
                  Yes, Re-scan to Measure Growth (+10 Karma)
                </Text>
              </TouchableOpacity>

              {/* Option B: New independent report */}
              <TouchableOpacity
                style={styles.newReportBtn}
                onPress={() => {
                  setActiveParentRescanId(null);
                  setNearbyCrackPrompt(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.newReportBtnText}>
                  No, Log as New Independent Crack (+50 Karma)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Processing Step-by-Step Overlay */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.processingBackdrop}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.processingTitle}>ANALYZING STRUCTURAL CRACK</Text>
            <Text style={styles.processingStep}>{processingStep}</Text>
            <View style={styles.processingBarTrack}>
              <View style={styles.processingBarFill} />
            </View>
            <Text style={styles.processingSub}>
              Google Pay Soundbox audio verdict ready on completion...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  fallbackCamera: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: '#0F172A',
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  permissionBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rescanActiveBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 86,
    left: 20,
    right: 20,
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 25,
    ...Shadows.card,
  },
  rescanActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 36,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#F59E0B',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  typeSelectorBar: {
    position: 'absolute',
    bottom: 120,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 20,
  },
  typeTab: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeTabSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typeTabText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  typeTabTextSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 20,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 60,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...Shadows.lg,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  promptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 360,
    ...Shadows.card,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  promptIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  promptSub: {
    fontSize: 11,
    color: '#64748B',
  },
  promptDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  promptRecordId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  promptRecordMetric: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  promptQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    fontStyle: 'italic',
  },
  promptButtonsGroup: {
    gap: 10,
  },
  rescanConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  rescanConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  newReportBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  newReportBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  processingBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Shadows.card,
  },
  processingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  processingStep: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 36,
  },
  processingBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  processingBarFill: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.primary,
  },
  processingSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
