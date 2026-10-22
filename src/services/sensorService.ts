import { Accelerometer, Gyroscope } from 'expo-sensors';
import { PatrolJoltEvent } from '../types/inspection';
import { LocationService } from './location';

type JoltCallback = (event: PatrolJoltEvent) => void;

let accelerometerSubscription: any = null;
let lastTriggerTime = 0;
const JOLT_THRESHOLD_G = 2.5; // > 2.5g vertical shock
const COOLDOWN_MS = 3500; // 3.5s cooldown between consecutive pothole triggers

export const SensorService = {
  isAvailableAsync: async (): Promise<boolean> => {
    try {
      return await Accelerometer.isAvailableAsync();
    } catch {
      return false;
    }
  },

  startPatrolMonitoring: (onJoltDetected: JoltCallback) => {
    // Set fast update interval (100ms) for road shock detection
    Accelerometer.setUpdateInterval(100);

    accelerometerSubscription = Accelerometer.addListener(async (data) => {
      const { x, y, z } = data;
      // Total acceleration magnitude or absolute vertical Z-axis spike
      const totalG = Math.sqrt(x * x + y * y + z * z);
      const verticalG = Math.abs(z);

      const now = Date.now();
      if ((verticalG > JOLT_THRESHOLD_G || totalG > JOLT_THRESHOLD_G) && now - lastTriggerTime > COOLDOWN_MS) {
        lastTriggerTime = now;

        // Obtain instant GPS anchor
        const location = await LocationService.getCurrentLocation();

        const joltEvent: PatrolJoltEvent = {
          id: `JOLT-${now.toString().slice(-6)}`,
          timestamp: new Date().toISOString(),
          zAcceleration: Number(Math.max(verticalG, totalG).toFixed(2)),
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || 'Roadway Distress Sector',
          status: 'DETECTED',
          speedKmh: Math.round(35 + Math.random() * 25), // simulated commute vehicle speed
          imageUri:
            'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
        };

        onJoltDetected(joltEvent);
      }
    });
  },

  stopPatrolMonitoring: () => {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      accelerometerSubscription = null;
    }
  },

  simulateJoltTrigger: async (customG = 3.2): Promise<PatrolJoltEvent> => {
    const now = Date.now();
    const location = await LocationService.getCurrentLocation();
    return {
      id: `JOLT-SIM-${now.toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      zAcceleration: customG,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || 'Grand Southern Trunk Rd, Chennai',
      status: 'CAPTURED',
      speedKmh: 48,
      imageUri:
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
    };
  },
};
