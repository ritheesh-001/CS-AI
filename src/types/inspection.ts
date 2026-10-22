export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type StructuralType =
  | 'ASPHALT_ROAD'
  | 'RESIDENTIAL_WALL'
  | 'RETAINING_WALL'
  | 'BRIDGE_PIER_GIRDER'
  | 'UNKNOWN';

export const STRUCTURAL_CRITICALITY_FACTORS: Record<StructuralType, number> = {
  ASPHALT_ROAD: 1.0,
  RESIDENTIAL_WALL: 1.2,
  RETAINING_WALL: 2.0,
  BRIDGE_PIER_GIRDER: 3.5,
  UNKNOWN: 1.0,
};

export type ReportStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'INSPECTED'
  | 'REPAIRED';

export type SyncStatus = 'SYNCED' | 'OFFLINE_PENDING' | 'SYNCING';

export interface BoundingBox {
  ymin: number; // percentage 0 - 100
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface CrackPolylinePoint {
  x: number; // percentage 0 - 100
  y: number;
}

export interface HistoricalRecord {
  id: string;
  timestamp: string;
  crackWidthMm: number;
  severityIndex: number;
  imageUri: string;
}

export interface ProgressionDelta {
  previousReportId: string;
  previousWidthMm: number;
  currentWidthMm: number;
  deltaWidthMm: number; // W_current - W_prev
  daysElapsed: number;
  growthRateMmPerMonth: number;
  isEscalated: boolean; // Delta > 0.5mm over 30 days
  growthBadge: string; // e.g. "+0.6 mm in 45 days"
  previousImageUri: string;
  currentImageUri: string;
}

export interface DIYMaterialEstimate {
  crackLengthCm: number;
  crackWidthMm: number;
  crackDepthMm: number;
  volumeMl: number; // Formula: (Length(cm) * Width(mm) * Depth(mm) / 1000) * 1.2
  cartridgesNeeded: number; // 300mL cartridges
  recommendedCompound: string;
  applicationGuidance: string;
  hardwareStoresSearchQuery: string;
}

export interface ProofOfWork {
  initialScanPhotoUri: string;
  repairProofPhotoUri?: string;
  repairedAt?: string;
  verifiedByOfficer?: string;
  certificationNotes?: string;
  citizenNotified: boolean;
  workOrderNumber?: string;
}

export interface CrackReport {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address?: string;
  imageUri: string;
  severity: SeverityLevel;
  severityIndex: number; // Width * CriticalityFactor
  criticalityFactor: number;
  crackWidthMm: number;
  crackLengthCm?: number;
  crackDepthMm?: number;
  structuralType: StructuralType;
  confidence: number;
  status: ReportStatus;
  syncStatus: SyncStatus;
  suggestedAction: string;
  detailedAdvice?: string;
  materials?: string[];
  notes?: string;
  assignedTeam?: string;
  boundingBox?: BoundingBox;
  crackPolyline?: CrackPolylinePoint[];
  emergencyDispatched?: boolean;
  priorityScore?: number;

  // Module 1: Progression Tracking
  progressionDelta?: ProgressionDelta;
  historyTimeline?: HistoricalRecord[];

  // Module 6: Proof of Work
  proofOfWork?: ProofOfWork;

  // Module 7: DIY Material Estimation
  diyEstimate?: DIYMaterialEstimate;
}

export interface PatrolJoltEvent {
  id: string;
  timestamp: string;
  zAcceleration: number; // in g-units, threshold > 2.5g
  latitude: number;
  longitude: number;
  address?: string;
  imageUri?: string;
  status: 'DETECTED' | 'CAPTURED' | 'QUEUED' | 'SYNCED';
  speedKmh?: number;
}

export type CivicBadgeTier =
  | 'Cadet Sentinel'
  | 'Ward Inspector'
  | 'Chief Structural Guardian';

export interface UtilityDiscountCoupon {
  id: string;
  code: string;
  title: string;
  discountAmount: number; // in Rupees ₹
  requiredKarmaPoints: number;
  isRedeemed: boolean;
  expiresAt: string;
  description: string;
}

export interface CivicKarmaProfile {
  totalPoints: number;
  currentBadge: CivicBadgeTier;
  nextTierPoints: number;
  uniqueReportsCount: number; // +50 pts each
  rescanProgressionCount: number; // +10 pts each
  workOrdersTriggeredCount: number; // +100 pts each
  availableCoupons: UtilityDiscountCoupon[];
}
