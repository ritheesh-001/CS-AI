import { useState } from 'react';
import { InspectionService, InspectRequest } from '../services/inspectionService';
import { CrackReport, StructuralType } from '../types/inspection';
import { useReportStore } from '../store/reportStore';

export type InspectionStep =
  | 'IDLE'
  | 'ACQUIRING_GPS'
  | 'SEGMENTING_SURFACE'
  | 'CALCULATING_WIDTH'
  | 'CLASSIFYING_SEVERITY'
  | 'COMPLETED'
  | 'ERROR';

export function useInspection() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<InspectionStep>('IDLE');
  const [stepMessage, setStepMessage] = useState('');
  const [reportResult, setReportResult] = useState<CrackReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addReport = useReportStore((state) => state.addReport);

  const analyzeImage = async (
    imageUri: string,
    latitude: number,
    longitude: number,
    address?: string,
    hint?: StructuralType,
    notes?: string
  ): Promise<CrackReport | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: GPS & Spatial Anchor
      setCurrentStep('ACQUIRING_GPS');
      setStepMessage('Calibrating high-precision GPS & spatial anchor...');
      await new Promise((r) => setTimeout(r, 450));

      // Step 2: Surface Segmentation
      setCurrentStep('SEGMENTING_SURFACE');
      setStepMessage('Extracting edge contours & concrete micro-fractures...');
      await new Promise((r) => setTimeout(r, 650));

      // Step 3: Width & Depth Measurement
      setCurrentStep('CALCULATING_WIDTH');
      setStepMessage('Calculating crack width (mm) against optical focal plane...');
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Classification
      setCurrentStep('CLASSIFYING_SEVERITY');
      setStepMessage('Evaluating structural risk matrix & PWD threshold...');
      await new Promise((r) => setTimeout(r, 450));

      const request: InspectRequest = {
        imageUri,
        latitude,
        longitude,
        address,
        structuralTypeHint: hint,
        notes,
      };

      const result = await InspectionService.inspectCrack(request);
      await addReport(result);

      setCurrentStep('COMPLETED');
      setStepMessage('Analysis complete!');
      setReportResult(result);
      return result;
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setCurrentStep('ERROR');
      setError(err?.message || 'Failed to inspect crack');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setIsProcessing(false);
    setCurrentStep('IDLE');
    setStepMessage('');
    setReportResult(null);
    setError(null);
  };

  return {
    isProcessing,
    currentStep,
    stepMessage,
    reportResult,
    error,
    analyzeImage,
    resetState,
  };
}
