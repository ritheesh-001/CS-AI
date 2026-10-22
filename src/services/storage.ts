import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrackReport } from '../types/inspection';
import { UserProfile } from '../types/user';

const STORAGE_KEYS = {
  REPORTS: '@cracksense_reports_v2',
  USER_PROFILE: '@cracksense_user_profile_v2',
  OFFLINE_QUEUE: '@cracksense_offline_queue_v2',
};

const INITIAL_SEED_REPORTS: CrackReport[] = [
  {
    id: 'CRK-2026-081',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    latitude: 13.0827,
    longitude: 80.2707,
    address: 'Pier #4, Anna Salai Flyover, Chennai',
    imageUri: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH',
    crackWidthMm: 5.8,
    criticalityFactor: 3.5,
    severityIndex: 20.3, // 5.8 * 3.5
    crackLengthCm: 65,
    crackDepthMm: 12.0,
    structuralType: 'BRIDGE_PIER_GIRDER',
    confidence: 0.96,
    status: 'ACKNOWLEDGED',
    syncStatus: 'SYNCED',
    suggestedAction: 'Immediate structural bracing required. Highway division alerted.',
    detailedAdvice: 'Shear distress on bridge girder exceeds 4.5mm safety threshold. Traffic weight restrictions recommended.',
    materials: ['High-Modulus Structural Epoxy Grout', 'Carbon fiber composite wrap', 'Steel jacketing'],
    assignedTeam: 'PWD Structural Strike Team Alpha',
    emergencyDispatched: true,
    priorityScore: 95,
    boundingBox: { ymin: 15, xmin: 20, ymax: 85, xmax: 80 },
    crackPolyline: [
      { x: 35, y: 18 },
      { x: 42, y: 32 },
      { x: 48, y: 45 },
      { x: 55, y: 65 },
      { x: 62, y: 82 },
    ],
    progressionDelta: {
      previousReportId: 'CRK-2026-062',
      previousWidthMm: 5.2,
      currentWidthMm: 5.8,
      deltaWidthMm: 0.6,
      daysElapsed: 45,
      growthRateMmPerMonth: 0.4,
      isEscalated: true,
      growthBadge: '+0.6 mm in 45 days',
      previousImageUri:
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      currentImageUri:
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    },
    diyEstimate: {
      crackLengthCm: 65,
      crackWidthMm: 5.8,
      crackDepthMm: 12.0,
      volumeMl: 543,
      cartridgesNeeded: 2,
      recommendedCompound: 'High-Modulus Structural Epoxy Grout (Class 1 Injection)',
      applicationGuidance: 'Adhere injection ports at 15cm intervals, pressure-inject epoxy.',
      hardwareStoresSearchQuery:
        'https://www.google.com/maps/search/hardware+and+construction+chemical+stores+near+me',
    },
    proofOfWork: {
      initialScanPhotoUri:
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
      citizenNotified: false,
    },
  },
  {
    id: 'CRK-2026-082',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    latitude: 13.0405,
    longitude: 80.2503,
    address: 'East Boundary Wall, Ward 112 Community Hall',
    imageUri: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    severity: 'MEDIUM',
    crackWidthMm: 2.4,
    criticalityFactor: 1.2,
    severityIndex: 2.88, // 2.4 * 1.2
    crackLengthCm: 40,
    crackDepthMm: 5.5,
    structuralType: 'RESIDENTIAL_WALL',
    confidence: 0.91,
    status: 'INSPECTED',
    syncStatus: 'SYNCED',
    suggestedAction: 'Low-pressure polymer sealant injection. Routed to civic maintenance queue.',
    detailedAdvice: 'Thermal expansion crack propagating through brick mortar joint. Repair before monsoon.',
    materials: ['Polyurethane injection foam', 'Flexible acrylic caulk', 'Fiberglass mesh reinforcement'],
    assignedTeam: 'Ward 112 Municipal Maintenance Crew',
    priorityScore: 65,
    boundingBox: { ymin: 25, xmin: 30, ymax: 75, xmax: 70 },
    crackPolyline: [
      { x: 48, y: 28 },
      { x: 50, y: 44 },
      { x: 53, y: 60 },
      { x: 51, y: 72 },
    ],
    diyEstimate: {
      crackLengthCm: 40,
      crackWidthMm: 2.4,
      crackDepthMm: 5.5,
      volumeMl: 63,
      cartridgesNeeded: 1,
      recommendedCompound: 'Flexible Polyurethane Sealant (PU 40)',
      applicationGuidance: 'V-notch crack, vacuum dust thoroughly, inject PU sealant flush with surface.',
      hardwareStoresSearchQuery:
        'https://www.google.com/maps/search/hardware+and+construction+chemical+stores+near+me',
    },
    proofOfWork: {
      initialScanPhotoUri:
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      citizenNotified: false,
    },
  },
  {
    id: 'CRK-2026-083',
    timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
    latitude: 13.0601,
    longitude: 80.2304,
    address: 'Service Lane, Ring Road km 14.2',
    imageUri: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
    severity: 'LOW',
    crackWidthMm: 0.65,
    criticalityFactor: 1.0,
    severityIndex: 0.65, // 0.65 * 1.0
    crackLengthCm: 25,
    crackDepthMm: 2.0,
    structuralType: 'ASPHALT_ROAD',
    confidence: 0.88,
    status: 'REPAIRED',
    syncStatus: 'SYNCED',
    suggestedAction: 'Surface asphalt slurry seal completed during routine road resurfacing.',
    detailedAdvice: 'Transverse fatigue hairline crack. Self-sealing bitumen emulsion applied.',
    materials: ['Hot-pour rubberized bitumen', 'Aggregate mineral filler'],
    assignedTeam: 'Municipal Road Works Div 4',
    priorityScore: 25,
    boundingBox: { ymin: 30, xmin: 25, ymax: 70, xmax: 75 },
    crackPolyline: [
      { x: 30, y: 50 },
      { x: 45, y: 52 },
      { x: 60, y: 49 },
      { x: 74, y: 51 },
    ],
    proofOfWork: {
      initialScanPhotoUri:
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
      repairProofPhotoUri:
        'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      repairedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      verifiedByOfficer: 'Er. R. Senthil Kumar',
      certificationNotes: 'Hot-pour bitumen application verified. Friction coefficient restored.',
      citizenNotified: true,
      workOrderNumber: 'WO-083-ROAD',
    },
    diyEstimate: {
      crackLengthCm: 25,
      crackWidthMm: 0.65,
      crackDepthMm: 2.0,
      volumeMl: 39,
      cartridgesNeeded: 1,
      recommendedCompound: 'Hot-Pour Polymer Modified Bitumen Sealant',
      applicationGuidance: 'Clean fissure with compressed air, squeegee rubberized compound.',
      hardwareStoresSearchQuery:
        'https://www.google.com/maps/search/hardware+and+construction+chemical+stores+near+me',
    },
  },
];

export const StorageService = {
  async getReports(): Promise<CrackReport[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
      if (data) {
        return JSON.parse(data);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_SEED_REPORTS));
      return INITIAL_SEED_REPORTS;
    } catch {
      return INITIAL_SEED_REPORTS;
    }
  },

  async saveReport(report: CrackReport): Promise<void> {
    try {
      const existing = await this.getReports();
      const updated = [report, ...existing.filter((r) => r.id !== report.id)];
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    } catch (e) {
      console.error('StorageService.saveReport error:', e);
    }
  },

  async updateReport(id: string, updates: Partial<CrackReport>): Promise<CrackReport | null> {
    try {
      const existing = await this.getReports();
      const index = existing.findIndex((r) => r.id === id);
      if (index === -1) return null;
      const updatedReport = { ...existing[index], ...updates };
      existing[index] = updatedReport;
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(existing));
      return updatedReport;
    } catch (e) {
      console.error('StorageService.updateReport error:', e);
      return null;
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
      const defaultUser: UserProfile = {
        id: 'usr_cit_101',
        name: 'Arun Sundaram',
        phone: '+91 98401 23456',
        email: 'arun.civic@example.com',
        role: 'CITIZEN',
        language: 'en',
        reportsSubmitted: 7,
        criticalAlertsSent: 2,
        isLoggedIn: true,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return {
        id: 'usr_cit_101',
        name: 'Arun Sundaram',
        phone: '+91 98401 23456',
        role: 'CITIZEN',
        language: 'en',
        reportsSubmitted: 7,
        criticalAlertsSent: 2,
        isLoggedIn: true,
      };
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('StorageService.saveUserProfile error:', e);
    }
  },

  async getOfflineQueue(): Promise<CrackReport[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addToOfflineQueue(report: CrackReport): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push(report);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('StorageService.addToOfflineQueue error:', e);
    }
  },

  async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (e) {
      console.error('StorageService.clearOfflineQueue error:', e);
    }
  },
};
