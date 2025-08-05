export interface GeolocationOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

export interface GeolocationResult {
  latitude: string;
  longitude: string;
  success: boolean;
  error?: string;
}

//  Validates if a string is a valid latitude coordinate
export const isValidLatitude = (lat: string): boolean => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

//  Validates if a string is a valid longitude coordinate
export const isValidLongitude = (lon: string): boolean => {
  const num = parseFloat(lon);
  return !isNaN(num) && num >= -180 && num <= 180;
};

export const formatCoordinate = (coord: number): string => {
  return coord.toFixed(6);
};

export const getCurrentPosition = (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: "",
        longitude: "",
        success: false,
        error: "Geolocation is not supported by this browser.",
      });
      return;
    }

    const defaultOptions = {
      timeout: 10000,
      maximumAge: 60000,
      enableHighAccuracy: true,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = formatCoordinate(position.coords.latitude);
        const lon = formatCoordinate(position.coords.longitude);

        resolve({
          latitude: lat,
          longitude: lon,
          success: true,
        });
      },
      (error) => {
        let errorMessage = "An error occurred while fetching location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission to access location was denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get location timed out.";
            break;
        }

        resolve({
          latitude: "",
          longitude: "",
          success: false,
          error: errorMessage,
        });
      },
      defaultOptions
    );
  });
};

//  Validates coordinate input for form fields
export const validateCoordinateInput = (
  value: string,
  type: "latitude" | "longitude"
): boolean => {
  if (!value) return false;

  const validator = type === "latitude" ? isValidLatitude : isValidLongitude;
  return validator(value);
};
