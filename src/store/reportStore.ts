import { create } from 'zustand';
import {
  CrackReport,
  ReportStatus,
  SeverityLevel,
  PatrolJoltEvent,
  CivicKarmaProfile,
  UtilityDiscountCoupon,
  CivicBadgeTier,
} from '../types/inspection';
import { UserProfile, AppLanguage } from '../types/user';
import { StorageService } from '../services/storage';
import { InspectionEngine } from '../services/inspectionEngine';
import { SyncQueue } from '../services/syncQueue';

const INITIAL_COUPONS: UtilityDiscountCoupon[] = [
  {
    id: 'CPN-TAX-500',
    code: 'CIVIC500',
    title: '₹500 Property Tax Rebate',
    discountAmount: 500,
    requiredKarmaPoints: 150,
    isRedeemed: false,
    expiresAt: '2026-12-31',
    description: 'Redeemable on official municipal property tax assessment portal.',
  },
  {
    id: 'CPN-WATER-250',
    code: 'WATER250',
    title: '₹250 Metro Water Subsidy',
    discountAmount: 250,
    requiredKarmaPoints: 80,
    isRedeemed: false,
    expiresAt: '2026-11-30',
    description: 'Credit applied directly to residential water & drainage bill.',
  },
];

interface ReportStoreState {
  reports: CrackReport[];
  userProfile: UserProfile;
  karmaProfile: CivicKarmaProfile;
  patrolJolts: PatrolJoltEvent[];
  isLoading: boolean;
  selectedSeverityFilter: 'ALL' | SeverityLevel;
  selectedStatusFilter: 'ALL' | ReportStatus;
  searchQuery: string;
  offlineQueueCount: number;
  isOnline: boolean;

  // Actions
  initializeStore: () => Promise<void>;
  addReport: (report: CrackReport, isRescan?: boolean) => Promise<void>;
  updateReport: (id: string, updates: Partial<CrackReport>) => Promise<void>;
  updateReportStatus: (
    id: string,
    status: ReportStatus,
    assignedTeam?: string,
    notes?: string,
    repairPhotoUri?: string
  ) => Promise<void>;
  checkNearbyCrackForRescan: (lat: number, lon: number) => CrackReport | null;
  addPatrolJolt: (jolt: PatrolJoltEvent) => Promise<void>;
  redeemCoupon: (couponId: string) => Promise<boolean>;
  setSeverityFilter: (filter: 'ALL' | SeverityLevel) => void;
  setStatusFilter: (filter: 'ALL' | ReportStatus) => void;
  setSearchQuery: (query: string) => void;
  setUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  toggleRole: () => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  getReportById: (id: string) => CrackReport | undefined;
}

export const useReportStore = create<ReportStoreState>((set, get) => ({
  reports: [],
  userProfile: {
    id: 'usr_cit_101',
    name: 'Arun Sundaram',
    phone: '+91 98401 23456',
    role: 'CITIZEN',
    language: 'en',
    reportsSubmitted: 7,
    criticalAlertsSent: 2,
    isLoggedIn: true,
  },
  karmaProfile: {
    totalPoints: 240,
    currentBadge: 'Ward Inspector',
    nextTierPoints: 300,
    uniqueReportsCount: 4,
    rescanProgressionCount: 2,
    workOrdersTriggeredCount: 1,
    availableCoupons: INITIAL_COUPONS,
  },
  patrolJolts: [],
  isLoading: true,
  selectedSeverityFilter: 'ALL',
  selectedStatusFilter: 'ALL',
  searchQuery: '',
  offlineQueueCount: 0,
  isOnline: true,

  initializeStore: async () => {
    set({ isLoading: true });
    try {
      const [reports, profile, queue] = await Promise.all([
        StorageService.getReports(),
        StorageService.getUserProfile(),
        StorageService.getOfflineQueue(),
      ]);

      // Initialize SyncQueue network listener
      SyncQueue.init((online, pending) => {
        set({ isOnline: online, offlineQueueCount: pending });
      });

      set({
        reports,
        userProfile: profile,
        offlineQueueCount: queue.length,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to initialize report store:', e);
      set({ isLoading: false });
    }
  },

  checkNearbyCrackForRescan: (lat: number, lon: number) => {
    return InspectionEngine.findNearbyCrack(lat, lon, get().reports);
  },

  addReport: async (report: CrackReport, isRescan = false) => {
    const isOnline = await SyncQueue.isOnline();
    const finalReport: CrackReport = {
      ...report,
      syncStatus: isOnline ? 'SYNCED' : 'OFFLINE_PENDING',
    };

    const currentReports = get().reports;
    const updated = [finalReport, ...currentReports.filter((r) => r.id !== finalReport.id)];
    set({ reports: updated });

    if (isOnline) {
      await StorageService.saveReport(finalReport);
    } else {
      await SyncQueue.enqueueReport(finalReport);
      set({ offlineQueueCount: get().offlineQueueCount + 1 });
    }

    // Module 8: Award Civic Karma points
    const currentKarma = get().karmaProfile;
    const pointsToAdd = isRescan ? 10 : 50;
    const newTotal = currentKarma.totalPoints + pointsToAdd;

    let badge: CivicBadgeTier = 'Cadet Sentinel';
    let nextTier = 100;
    if (newTotal >= 300) {
      badge = 'Chief Structural Guardian';
      nextTier = 500;
    } else if (newTotal >= 100) {
      badge = 'Ward Inspector';
      nextTier = 300;
    }

    const updatedKarma: CivicKarmaProfile = {
      ...currentKarma,
      totalPoints: newTotal,
      currentBadge: badge,
      nextTierPoints: nextTier,
      uniqueReportsCount: isRescan
        ? currentKarma.uniqueReportsCount
        : currentKarma.uniqueReportsCount + 1,
      rescanProgressionCount: isRescan
        ? currentKarma.rescanProgressionCount + 1
        : currentKarma.rescanProgressionCount,
    };

    set({ karmaProfile: updatedKarma });

    // Update user stats
    const profile = get().userProfile;
    const updatedProfile: UserProfile = {
      ...profile,
      reportsSubmitted: profile.reportsSubmitted + 1,
      criticalAlertsSent:
        finalReport.severity === 'HIGH'
          ? profile.criticalAlertsSent + 1
          : profile.criticalAlertsSent,
    };
    set({ userProfile: updatedProfile });
    await StorageService.saveUserProfile(updatedProfile);
  },

  updateReport: async (id: string, updates: Partial<CrackReport>) => {
    const updatedReports = get().reports.map((r) => (r.id === id ? { ...r, ...updates } : r));
    set({ reports: updatedReports });
    await StorageService.updateReport(id, updates);
  },

  updateReportStatus: async (
    id: string,
    status: ReportStatus,
    assignedTeam?: string,
    notes?: string,
    repairPhotoUri?: string
  ) => {
    const existing = get().getReportById(id);
    const updates: Partial<CrackReport> = { status };

    if (assignedTeam) updates.assignedTeam = assignedTeam;
    if (notes) updates.notes = notes;

    // Module 6: Proof of Work Gate
    if (status === 'REPAIRED') {
      updates.proofOfWork = {
        initialScanPhotoUri: existing?.proofOfWork?.initialScanPhotoUri || existing?.imageUri || '',
        repairProofPhotoUri:
          repairPhotoUri ||
          'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
        repairedAt: new Date().toISOString(),
        verifiedByOfficer: get().userProfile.name,
        certificationNotes: notes || 'Structural patch & sealant verified to safety code.',
        citizenNotified: true,
        workOrderNumber: `WO-${id.slice(-4)}-PWD`,
      };

      // Award +100 Work Order Karma
      const karma = get().karmaProfile;
      set({
        karmaProfile: {
          ...karma,
          totalPoints: karma.totalPoints + 100,
          workOrdersTriggeredCount: karma.workOrdersTriggeredCount + 1,
        },
      });
    }

    await get().updateReport(id, updates);
  },

  addPatrolJolt: async (jolt: PatrolJoltEvent) => {
    const current = get().patrolJolts;
    set({ patrolJolts: [jolt, ...current] });
    await SyncQueue.enqueuePatrolJolt(jolt);
  },

  redeemCoupon: async (couponId: string) => {
    const karma = get().karmaProfile;
    const coupon = karma.availableCoupons.find((c) => c.id === couponId);
    if (!coupon || coupon.isRedeemed || karma.totalPoints < coupon.requiredKarmaPoints) {
      return false;
    }

    const updatedCoupons = karma.availableCoupons.map((c) =>
      c.id === couponId ? { ...c, isRedeemed: true } : c
    );

    set({
      karmaProfile: {
        ...karma,
        totalPoints: karma.totalPoints - coupon.requiredKarmaPoints,
        availableCoupons: updatedCoupons,
      },
    });

    return true;
  },

  setSeverityFilter: (filter) => set({ selectedSeverityFilter: filter }),
  setStatusFilter: (filter) => set({ selectedStatusFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setUserProfile: async (updates) => {
    const updated = { ...get().userProfile, ...updates };
    set({ userProfile: updated });
    await StorageService.saveUserProfile(updated);
  },

  toggleRole: async () => {
    const current = get().userProfile;
    const nextRole = current.role === 'CITIZEN' ? 'AUTHORITY' : 'CITIZEN';
    const updated: UserProfile = {
      ...current,
      role: nextRole,
      department:
        nextRole === 'AUTHORITY'
          ? 'Public Works Department (PWD) - Structural Safety Cell'
          : undefined,
      officialId: nextRole === 'AUTHORITY' ? 'PWD-TN-4091' : undefined,
      designation: nextRole === 'AUTHORITY' ? 'Chief Structural Inspector' : undefined,
    };
    set({ userProfile: updated });
    await StorageService.saveUserProfile(updated);
  },

  setLanguage: async (lang: AppLanguage) => {
    const updated = { ...get().userProfile, language: lang };
    set({ userProfile: updated });
    await StorageService.saveUserProfile(updated);
  },

  syncOfflineQueue: async () => {
    const { syncedReports, syncedJolts } = await SyncQueue.flushQueue();
    // Refresh local reports
    const freshReports = await StorageService.getReports();
    set({ reports: freshReports, offlineQueueCount: 0 });
  },

  getReportById: (id: string) => {
    return get().reports.find((r) => r.id === id);
  },
}));
