import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { CrackReport, PatrolJoltEvent } from '../types/inspection';
import { StorageService } from './storage';

const SYNC_KEYS = {
  PENDING_REPORTS: '@cracksense_pending_sync_reports_v2',
  PATROL_JOLTS: '@cracksense_patrol_jolts_v2',
};

type SyncListener = (isOnline: boolean, pendingCount: number) => void;

let netInfoUnsubscribe: any = null;
const listeners: SyncListener[] = [];

export const SyncQueue = {
  async init(onSyncStatusChange?: SyncListener): Promise<void> {
    if (onSyncStatusChange) {
      listeners.push(onSyncStatusChange);
    }

    if (!netInfoUnsubscribe) {
      netInfoUnsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
        const isOnline = !!state.isConnected && !!state.isInternetReachable;
        if (isOnline) {
          await this.flushQueue();
        }
        const pendingCount = await this.getPendingCount();
        listeners.forEach((l) => l(isOnline, pendingCount));
      });
    }
  },

  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return !!state.isConnected && state.isInternetReachable !== false;
    } catch {
      return true; // web/fallback optimistic assumption
    }
  },

  async enqueueReport(report: CrackReport): Promise<void> {
    const offlineReport: CrackReport = {
      ...report,
      syncStatus: 'OFFLINE_PENDING',
    };
    try {
      const existingStr = await AsyncStorage.getItem(SYNC_KEYS.PENDING_REPORTS);
      const queue: CrackReport[] = existingStr ? JSON.parse(existingStr) : [];
      queue.push(offlineReport);
      await AsyncStorage.setItem(SYNC_KEYS.PENDING_REPORTS, JSON.stringify(queue));
      await StorageService.saveReport(offlineReport);
    } catch (e) {
      console.warn('SyncQueue.enqueueReport error:', e);
    }
  },

  async enqueuePatrolJolt(jolt: PatrolJoltEvent): Promise<void> {
    try {
      const existingStr = await AsyncStorage.getItem(SYNC_KEYS.PATROL_JOLTS);
      const queue: PatrolJoltEvent[] = existingStr ? JSON.parse(existingStr) : [];
      queue.push(jolt);
      await AsyncStorage.setItem(SYNC_KEYS.PATROL_JOLTS, JSON.stringify(queue));
    } catch (e) {
      console.warn('SyncQueue.enqueuePatrolJolt error:', e);
    }
  },

  async getPendingReports(): Promise<CrackReport[]> {
    try {
      const str = await AsyncStorage.getItem(SYNC_KEYS.PENDING_REPORTS);
      return str ? JSON.parse(str) : [];
    } catch {
      return [];
    }
  },

  async getPatrolJolts(): Promise<PatrolJoltEvent[]> {
    try {
      const str = await AsyncStorage.getItem(SYNC_KEYS.PATROL_JOLTS);
      return str ? JSON.parse(str) : [];
    } catch {
      return [];
    }
  },

  async getPendingCount(): Promise<number> {
    const [reports, jolts] = await Promise.all([
      this.getPendingReports(),
      this.getPatrolJolts(),
    ]);
    return reports.length + jolts.length;
  },

  async flushQueue(): Promise<{ syncedReports: number; syncedJolts: number }> {
    const reports = await this.getPendingReports();
    const jolts = await this.getPatrolJolts();

    let syncedReports = 0;
    let syncedJolts = 0;

    // Simulate batch sync upload
    if (reports.length > 0) {
      for (const report of reports) {
        await StorageService.updateReport(report.id, {
          syncStatus: 'SYNCED',
        });
        syncedReports++;
      }
      await AsyncStorage.removeItem(SYNC_KEYS.PENDING_REPORTS);
    }

    if (jolts.length > 0) {
      syncedJolts = jolts.length;
      await AsyncStorage.removeItem(SYNC_KEYS.PATROL_JOLTS);
    }

    return { syncedReports, syncedJolts };
  },
};
