import { useState, useEffect, useCallback } from 'react';
import { LocationService, LocationCoordinates } from '../services/location';

export function useLocation() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    const granted = await LocationService.requestPermissions();
    setHasPermission(granted);

    const coords = await LocationService.getCurrentLocation();
    setLocation(coords);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    hasPermission,
    isLoading,
    refreshLocation: fetchLocation,
  };
}
