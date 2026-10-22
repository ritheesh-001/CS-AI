import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  address?: string;
}

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('LocationService permission request error:', e);
      return false;
    }
  },

  async getCurrentLocation(): Promise<LocationCoordinates> {
    // Default fallback coordinates (Chennai Civic Center)
    const fallback: LocationCoordinates = {
      latitude: 13.0827,
      longitude: 80.2707,
      accuracy: 10,
      address: 'Anna Salai, Chennai, Tamil Nadu',
    };

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return fallback;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      let formattedAddress = `${location.coords.latitude.toFixed(4)}° N, ${location.coords.longitude.toFixed(4)}° E`;

      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const item = reverseGeocode[0];
          const parts = [
            item.name || item.street,
            item.district || item.subregion,
            item.city,
            item.region,
          ].filter(Boolean);
          if (parts.length > 0) {
            formattedAddress = parts.join(', ');
          }
        }
      } catch (geoError) {
        console.warn('Reverse geocode failed, using coordinates string:', geoError);
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        address: formattedAddress,
      };
    } catch (error) {
      console.warn('LocationService.getCurrentLocation failed, using fallback:', error);
      return fallback;
    }
  },
};
