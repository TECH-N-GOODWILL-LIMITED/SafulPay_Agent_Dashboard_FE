export interface GeolocationOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
  progressiveFallback?: boolean;
}

export interface GeolocationResult {
  latitude: string;
  longitude: string;
  success: boolean;
  error?: string;
  accuracy?: number;
  method?: "high" | "low" | "cached";
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
      timeout: 15000, // Increased timeout to 15 seconds
      maximumAge: 300000, // Increased cache age to 5 minutes
      enableHighAccuracy: true,
      progressiveFallback: true,
      ...options,
    };

    // Progressive fallback strategy
    const tryGeolocation = (highAccuracy: boolean, timeout: number) => {
      const geolocationOptions = {
        timeout,
        maximumAge: defaultOptions.maximumAge,
        enableHighAccuracy: highAccuracy,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = formatCoordinate(position.coords.latitude);
          const lon = formatCoordinate(position.coords.longitude);
          const accuracy = position.coords.accuracy;

          resolve({
            latitude: lat,
            longitude: lon,
            success: true,
            accuracy,
            method: highAccuracy ? "high" : "low",
          });
        },
        (error) => {
          let errorMessage = "An error occurred while fetching location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Permission to access location was denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is currently unavailable. Please try again or check your GPS settings.";
              break;
            case error.TIMEOUT:
              if (highAccuracy && defaultOptions.progressiveFallback) {
                // Try with low accuracy if high accuracy times out
                console.log("High accuracy timeout, trying low accuracy...");
                tryGeolocation(false, 10000);
                return;
              }
              errorMessage =
                "Location request timed out. Please check your GPS signal or try again.";
              break;
          }

          resolve({
            latitude: "",
            longitude: "",
            success: false,
            error: errorMessage,
          });
        },
        geolocationOptions
      );
    };

    // Start with high accuracy
    tryGeolocation(true, defaultOptions.timeout);
  });
};

// Enhanced geolocation with multiple fallback strategies
export const getCurrentPositionWithFallback = async (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  try {
    // First attempt: High accuracy with longer timeout
    const result = await getCurrentPosition({
      ...options,
      timeout: 20000, // 20 seconds for high accuracy
      enableHighAccuracy: true,
    });

    if (result.success) {
      return result;
    }

    // Second attempt: Low accuracy with shorter timeout
    if (
      result.error?.includes("timeout") ||
      result.error?.includes("unavailable")
    ) {
      console.log("Trying low accuracy fallback...");
      const lowAccuracyResult = await getCurrentPosition({
        ...options,
        timeout: 10000, // 10 seconds for low accuracy
        enableHighAccuracy: false,
      });

      if (lowAccuracyResult.success) {
        return {
          ...lowAccuracyResult,
          method: "low",
        };
      }
    }

    return result;
  } catch {
    return {
      latitude: "",
      longitude: "",
      success: false,
      error:
        "Failed to get location after multiple attempts. Please try again or enter coordinates manually.",
    };
  }
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

// Get cached location if available
export const getCachedLocation = (): GeolocationResult | null => {
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem("lastKnownLocation");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        // Return cached location if less than 1 hour old
        if (age < 3600000) {
          return {
            ...parsed,
            method: "cached",
          };
        }
      } catch {
        // Invalid cache, ignore
      }
    }
  }
  return null;
};

// Cache location for future use
export const cacheLocation = (latitude: string, longitude: string): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(
      "lastKnownLocation",
      JSON.stringify({
        latitude,
        longitude,
        timestamp: Date.now(),
      })
    );
  }
};
