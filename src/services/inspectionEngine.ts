import {
  CrackReport,
  SeverityLevel,
  StructuralType,
  STRUCTURAL_CRITICALITY_FACTORS,
  ProgressionDelta,
  HistoricalRecord,
  DIYMaterialEstimate,
  BoundingBox,
  CrackPolylinePoint,
} from '../types/inspection';

export interface InspectionInput {
  imageUri: string;
  latitude: number;
  longitude: number;
  address?: string;
  structuralType?: StructuralType;
  crackWidthMm?: number;
  crackLengthCm?: number;
  crackDepthMm?: number;
  reScanParentReportId?: string;
  existingReports?: CrackReport[];
}

export const InspectionEngine = {
  /**
   * Distance between two coordinate pairs in meters using the Haversine formula.
   */
  calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  /**
   * Checks if an existing recorded crack is within 15 meters of the given coordinates.
   */
  findNearbyCrack(
    lat: number,
    lon: number,
    existingReports: CrackReport[]
  ): CrackReport | null {
    const PROXIMITY_THRESHOLD_METERS = 15;
    for (const report of existingReports) {
      const distance = this.calculateDistanceMeters(
        lat,
        lon,
        report.latitude,
        report.longitude
      );
      if (distance <= PROXIMITY_THRESHOLD_METERS) {
        return report;
      }
    }
    return null;
  },

  /**
   * Core Mathematical Severity Index:
   * Severity Index = Crack Width (mm) * Structural Criticality Factor
   * Index < 2.0 -> LOW
   * 2.0 <= Index < 8.0 -> MEDIUM
   * Index >= 8.0 -> HIGH / CRITICAL
   */
  computeSeverity(
    crackWidthMm: number,
    structuralType: StructuralType,
    growthEscalated: boolean = false
  ): { severity: SeverityLevel; severityIndex: number; criticalityFactor: number } {
    const factor = STRUCTURAL_CRITICALITY_FACTORS[structuralType] || 1.0;
    const index = Number((crackWidthMm * factor).toFixed(2));

    if (growthEscalated || index >= 8.0) {
      return { severity: 'HIGH', severityIndex: index, criticalityFactor: factor };
    }
    if (index >= 2.0) {
      return { severity: 'MEDIUM', severityIndex: index, criticalityFactor: factor };
    }
    return { severity: 'LOW', severityIndex: index, criticalityFactor: factor };
  },

  /**
   * Module 1: Progression Delta & Growth Calculation
   * If delta > 0.5 mm over 30 days, auto-escalates priority.
   */
  calculateProgressionDelta(
    currentWidthMm: number,
    currentImageUri: string,
    previousReport: CrackReport
  ): ProgressionDelta {
    const prevWidth = previousReport.crackWidthMm;
    const deltaMm = Number((currentWidthMm - prevWidth).toFixed(2));
    const prevDate = new Date(previousReport.timestamp).getTime();
    const currDate = Date.now();
    const daysElapsed = Math.max(1, Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24)));

    // Monthly normalized growth rate: (delta / days) * 30
    const monthlyRate = Number(((deltaMm / daysElapsed) * 30).toFixed(2));

    // Escalation rule: Delta > 0.5mm in 30 days (or equivalent rate)
    const isEscalated = deltaMm >= 0.5 || monthlyRate >= 0.5;

    const sign = deltaMm >= 0 ? '+' : '';
    const growthBadge = `${sign}${deltaMm} mm in ${daysElapsed} days`;

    return {
      previousReportId: previousReport.id,
      previousWidthMm: prevWidth,
      currentWidthMm,
      deltaWidthMm: deltaMm,
      daysElapsed,
      growthRateMmPerMonth: monthlyRate,
      isEscalated,
      growthBadge,
      previousImageUri: previousReport.imageUri,
      currentImageUri,
    };
  },

  /**
   * Module 7: DIY Material Quantity & Volume Calculator
   * Volume (mL) = [Length(cm) * Width(mm) * Depth(mm) / 1000] * 1.2
   */
  calculateDIYMaterials(
    lengthCm: number,
    widthMm: number,
    depthMm: number,
    structuralType: StructuralType
  ): DIYMaterialEstimate {
    const rawVolume = (lengthCm * widthMm * depthMm) / 1000;
    const volumeMl = Math.max(10, Math.round(rawVolume * 1.2)); // 20% waste factor
    const CARTRIDGE_VOLUME_ML = 300;
    const cartridgesNeeded = Math.ceil(volumeMl / CARTRIDGE_VOLUME_ML);

    let recommendedCompound = 'Flexible Polyurethane Sealant (PU 40)';
    let applicationGuidance =
      'V-notch crack with masonry chisel, vacuum dust thoroughly, insert foam backer rod if depth > 8mm, inject PU sealant flush with surface.';

    if (structuralType === 'BRIDGE_PIER_GIRDER' || structuralType === 'RETAINING_WALL') {
      recommendedCompound = 'High-Modulus Structural Epoxy Grout (Class 1 Injection)';
      applicationGuidance =
        'Seal surface with epoxy paste, adhere mechanical injection ports at 15cm intervals, pressure-inject epoxy until port bleeding occurs.';
    } else if (structuralType === 'ASPHALT_ROAD') {
      recommendedCompound = 'Hot-Pour Polymer Modified Bitumen Sealant';
      applicationGuidance =
        'Clean fissure with compressed air, heat reservoir to 180°C, squeegee hot-pour rubberized compound over road joint.';
    }

    return {
      crackLengthCm: lengthCm,
      crackWidthMm: widthMm,
      crackDepthMm: depthMm,
      volumeMl,
      cartridgesNeeded,
      recommendedCompound,
      applicationGuidance,
      hardwareStoresSearchQuery:
        'https://www.google.com/maps/search/hardware+and+construction+chemical+stores+near+me',
    };
  },

  /**
   * Comprehensive Computer Vision Mock Inference & Processing Pipeline
   */
  processScan(input: InspectionInput): CrackReport {
    const structuralType: StructuralType =
      input.structuralType && input.structuralType !== 'UNKNOWN'
        ? input.structuralType
        : this.randomStructuralType();

    // Crack dimensions: provided or realistically simulated
    const crackWidthMm =
      input.crackWidthMm !== undefined
        ? input.crackWidthMm
        : Number((0.6 + Math.random() * 4.2).toFixed(2));
    const crackLengthCm =
      input.crackLengthCm !== undefined
        ? input.crackLengthCm
        : Math.round(20 + Math.random() * 65);
    const crackDepthMm =
      input.crackDepthMm !== undefined
        ? input.crackDepthMm
        : Number((crackWidthMm * (1.8 + Math.random() * 1.5)).toFixed(1));

    // Module 1 Check: Re-scan historical linkage
    let progressionDelta: ProgressionDelta | undefined;
    let historyTimeline: HistoricalRecord[] = [];
    let isGrowthEscalated = false;

    if (input.reScanParentReportId && input.existingReports) {
      const parentReport = input.existingReports.find(
        (r) => r.id === input.reScanParentReportId
      );
      if (parentReport) {
        progressionDelta = this.calculateProgressionDelta(
          crackWidthMm,
          input.imageUri,
          parentReport
        );
        isGrowthEscalated = progressionDelta.isEscalated;
        historyTimeline = [
          ...(parentReport.historyTimeline || []),
          {
            id: parentReport.id,
            timestamp: parentReport.timestamp,
            crackWidthMm: parentReport.crackWidthMm,
            severityIndex: parentReport.severityIndex,
            imageUri: parentReport.imageUri,
          },
        ];
      }
    }

    // Module 2: Dynamic Severity Index
    const { severity, severityIndex, criticalityFactor } = this.computeSeverity(
      crackWidthMm,
      structuralType,
      isGrowthEscalated
    );

    // Module 7: DIY Estimate
    const diyEstimate = this.calculateDIYMaterials(
      crackLengthCm,
      crackWidthMm,
      crackDepthMm,
      structuralType
    );

    // Bounding Box & Vector Polyline
    const boundingBox: BoundingBox = {
      ymin: 20 + Math.floor(Math.random() * 8),
      xmin: 22 + Math.floor(Math.random() * 8),
      ymax: 76 + Math.floor(Math.random() * 8),
      xmax: 74 + Math.floor(Math.random() * 8),
    };

    const crackPolyline: CrackPolylinePoint[] = [
      { x: boundingBox.xmin + 4, y: boundingBox.ymin + 4 },
      { x: boundingBox.xmin + 16, y: boundingBox.ymin + 20 },
      { x: (boundingBox.xmin + boundingBox.xmax) / 2, y: 50 },
      { x: boundingBox.xmax - 12, y: boundingBox.ymax - 16 },
      { x: boundingBox.xmax - 2, y: boundingBox.ymax - 2 },
    ];

    const reportId = `CRK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const suggestedAction =
      severity === 'HIGH'
        ? 'Critical fracture detected. Emergency alert triggered. Potential structural instability.'
        : severity === 'MEDIUM'
        ? 'Moderate structural crack. Recommend chemical grout injection and routing to PWD queue.'
        : 'Hairline surface distress. Within safe threshold. Monitor quarterly.';

    return {
      id: reportId,
      timestamp: new Date().toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address || 'Chennai Civic District, Ward 112',
      imageUri: input.imageUri,
      severity,
      severityIndex,
      criticalityFactor,
      crackWidthMm,
      crackLengthCm,
      crackDepthMm,
      structuralType,
      confidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
      status: severity === 'HIGH' ? 'ACKNOWLEDGED' : 'PENDING',
      syncStatus: 'SYNCED',
      suggestedAction,
      detailedAdvice: diyEstimate.applicationGuidance,
      materials: [
        diyEstimate.recommendedCompound,
        'Surface preparation wire brush',
        'Backer rod',
      ],
      boundingBox,
      crackPolyline,
      emergencyDispatched: severity === 'HIGH',
      priorityScore: severity === 'HIGH' ? 95 : severity === 'MEDIUM' ? 65 : 25,
      progressionDelta,
      historyTimeline,
      diyEstimate,
      proofOfWork: {
        initialScanPhotoUri: input.imageUri,
        citizenNotified: false,
      },
    };
  },

  randomStructuralType(): StructuralType {
    const list: StructuralType[] = [
      'ASPHALT_ROAD',
      'RESIDENTIAL_WALL',
      'RETAINING_WALL',
      'BRIDGE_PIER_GIRDER',
    ];
    return list[Math.floor(Math.random() * list.length)];
  },
};
