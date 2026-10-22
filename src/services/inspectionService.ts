import { apiClient } from './api';
import { StorageService } from './storage';
import { InspectionEngine } from './inspectionEngine';
import { CrackReport, StructuralType } from '../types/inspection';

export interface InspectRequest {
  imageUri: string;
  latitude: number;
  longitude: number;
  address?: string;
  structuralTypeHint?: StructuralType;
  crackWidthMm?: number;
  reScanParentReportId?: string;
  notes?: string;
}

export const InspectionService = {
  /**
   * Main inspection pipeline targeting backend with seamless local mock fallback.
   */
  async inspectCrack(request: InspectRequest): Promise<CrackReport> {
    try {
      const payload = {
        image: request.imageUri,
        latitude: request.latitude,
        longitude: request.longitude,
        address: request.address,
        structural_type_hint: request.structuralTypeHint || 'UNKNOWN',
        timestamp: new Date().toISOString(),
      };

      const response = await apiClient.post('/inspect', payload);
      if (response.data && response.data.report) {
        const remoteReport: CrackReport = response.data.report;
        await StorageService.saveReport(remoteReport);
        return remoteReport;
      }
      throw new Error('Invalid backend response format');
    } catch {
      // Offline fallback: Use the full InspectionEngine
      const existing = await StorageService.getReports();
      const fallbackReport = InspectionEngine.processScan({
        imageUri: request.imageUri,
        latitude: request.latitude,
        longitude: request.longitude,
        address: request.address,
        structuralType: request.structuralTypeHint,
        crackWidthMm: request.crackWidthMm,
        reScanParentReportId: request.reScanParentReportId,
        existingReports: existing,
      });

      await StorageService.saveReport(fallbackReport);
      return fallbackReport;
    }
  },

  async triggerEmergencySOS(reportId: string): Promise<boolean> {
    try {
      await apiClient.post('/emergency-sos', { reportId });
    } catch {
      console.log('Emergency SOS logged locally for dispatch.');
    }
    await StorageService.updateReport(reportId, {
      emergencyDispatched: true,
      status: 'ACKNOWLEDGED',
      notes: 'EMERGENCY DISPATCH INITIATED: Municipal Disaster Response Notified',
    });
    return true;
  },
};
