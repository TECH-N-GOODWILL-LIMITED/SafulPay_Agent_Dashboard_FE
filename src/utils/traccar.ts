// Backend API configuration
// const BASE_URL =
//   process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";
const BASE_URL = import.meta.env.VITE_AGENCY_BASE_URL;
const TRACKCAR_TOKEN = import.meta.env.VITE_TRACKCAR_TOKEN;

// Types for the backend API responses
export interface BackendLocation {
  device_id: number;
  device_name: string;
  unique_id: string;
  status: "online" | "offline";
  last_update: string;
  position: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    address: string | null;
    fix_time: string;
  } | null;
}

export interface AllLocationsResponse {
  status: boolean;
  message: string;
  data: {
    total_devices: number;
    locations: BackendLocation[];
    fetched_at: string;
  };
}

export interface BackendDeviceLocationResponse {
  status: boolean;
  message: string;
  data: {
    device: {
      id: number;
      name: string;
      unique_id: string;
      status: "online" | "offline";
      last_update: string;
    };
    position: {
      latitude: number;
      longitude: number;
      speed: number;
      course: number;
      address: string | null;
      fix_time: string;
    };
    fetched_at: string;
  };
}

// Convert backend location to frontend device format
export interface Device {
  id: number;
  name: string;
  uniqueId: string;
  status: "online" | "offline";
  lastUpdate: string;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  course: number | null;
  address: string | null;
  fixTime: string | null;
}

// Utility function to check if device has valid coordinates
export function hasValidCoordinates(device: Device): boolean {
  return (
    device.latitude !== null &&
    device.longitude !== null &&
    typeof device.latitude === "number" &&
    typeof device.longitude === "number" &&
    !isNaN(device.latitude) &&
    !isNaN(device.longitude) &&
    device.latitude >= -90 &&
    device.latitude <= 90 &&
    device.longitude >= -180 &&
    device.longitude <= 180
  );
}

// Utility function to filter devices with valid coordinates
export function filterDevicesWithCoordinates(devices: Device[]): Device[] {
  return devices.filter(hasValidCoordinates);
}

// Utility function to get devices without coordinates
export function getDevicesWithoutCoordinates(devices: Device[]): Device[] {
  return devices.filter((device) => !hasValidCoordinates(device));
}

// Utility function to validate backend location data
function validateBackendLocation(
  location: unknown
): location is BackendLocation {
  if (!location || typeof location !== "object") {
    return false;
  }

  const loc = location as Record<string, unknown>;

  return (
    typeof loc.device_id === "number" &&
    typeof loc.device_name === "string" &&
    typeof loc.unique_id === "string" &&
    typeof loc.status === "string" &&
    typeof loc.last_update === "string" &&
    (loc.position === null || typeof loc.position === "object")
  );
}

// Session management for Traccar API
let traccarSessionInitialized = false;
let sessionInitAttempts = 0;
const MAX_SESSION_INIT_ATTEMPTS = 3;

// Function to initiate Traccar session
async function initiateTraccarSession(): Promise<void> {
  if (sessionInitAttempts >= MAX_SESSION_INIT_ATTEMPTS) {
    throw new Error("Maximum session initiation attempts reached");
  }

  try {
    sessionInitAttempts++;
    console.log(
      `Initiating Traccar session (attempt ${sessionInitAttempts}/${MAX_SESSION_INIT_ATTEMPTS})...`
    );

    // Import the getResponseCookies function to get the token
    const { getResponseCookies } = await import("./authCookies");
    const responseData = getResponseCookies();

    if (!responseData?.access_token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${BASE_URL}/auth/traccar/session?token=${TRACKCAR_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to initiate Traccar session:",
        response.status,
        errorText
      );
      throw new Error(
        `Failed to initiate Traccar session: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();

    if (!result.status) {
      throw new Error(result.message || "Failed to initiate Traccar session");
    }

    console.log("Traccar session initiated successfully");
    traccarSessionInitialized = true;
    sessionInitAttempts = 0; // Reset attempts on success
  } catch (error) {
    console.error("Error initiating Traccar session:", error);
    traccarSessionInitialized = false;
    throw error;
  }
}

// Function to reset session state (useful for retries)
export function resetTraccarSessionState(): void {
  traccarSessionInitialized = false;
  sessionInitAttempts = 0;
}

// Function to check if Traccar session is initialized
export function isTraccarSessionInitialized(): boolean {
  return traccarSessionInitialized;
}

// Fetch all device locations from backend
export async function fetchAllLocations(): Promise<Device[]> {
  const fetchLocations = async (): Promise<Device[]> => {
    console.log("Fetching all locations from backend...");

    const response = await fetch(`${BASE_URL}/auth/traccar/locations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API Error:", response.status, errorText);

      // If we get a 401 error and haven't tried initiating session yet, try that
      if (
        response.status === 401 &&
        !traccarSessionInitialized &&
        sessionInitAttempts < MAX_SESSION_INIT_ATTEMPTS
      ) {
        console.log(
          "Received 401 error, attempting to initiate Traccar session..."
        );
        try {
          await initiateTraccarSession();
          // Retry the request after session initiation
          return fetchLocations();
        } catch (sessionError) {
          console.error(
            "Failed to initiate session, cannot retry:",
            sessionError
          );
          throw new Error(
            `Authentication failed: Unable to establish Traccar session. ${sessionError}`
          );
        }
      }

      throw new Error(
        `Failed to fetch locations: ${response.status} ${errorText}`
      );
    }

    const result: AllLocationsResponse = await response.json();

    if (!result.status) {
      throw new Error(result.message || "Failed to fetch locations");
    }

    console.log("Received locations from backend:", result.data);
    console.log("Sample location data:", result.data.locations[0]);

    // Convert backend format to frontend format
    const devices: Device[] = result.data.locations
      .filter(validateBackendLocation)
      .map((location: BackendLocation) => {
        console.log("Processing location:", location);
        return {
          id: location.device_id,
          name: location.device_name,
          uniqueId: location.unique_id,
          status: location.status,
          lastUpdate: location.last_update,
          latitude: location.position?.latitude || null,
          longitude: location.position?.longitude || null,
          speed: location.position?.speed || null,
          course: location.position?.course || null,
          address: location.position?.address || null,
          fixTime: location.position?.fix_time || null,
        };
      });

    console.log(`Successfully processed ${devices.length} devices:`, devices);
    console.log(
      `Devices with coordinates: ${
        filterDevicesWithCoordinates(devices).length
      }`
    );
    console.log(
      `Devices without coordinates: ${
        getDevicesWithoutCoordinates(devices).length
      }`
    );

    return devices;
  };

  try {
    return await fetchLocations();
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
}

// Fetch specific device location from backend
export async function fetchDeviceLocation(
  deviceId: number
): Promise<Device | null> {
  const fetchDeviceLocationInternal = async (): Promise<Device | null> => {
    console.log(`Fetching location for device ${deviceId} from backend...`);

    const response = await fetch(
      `${BASE_URL}/auth/traccar/device/${deviceId}/location`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API Error:", response.status, errorText);

      // If we get a 401 error and haven't tried initiating session yet, try that
      if (
        response.status === 401 &&
        !traccarSessionInitialized &&
        sessionInitAttempts < MAX_SESSION_INIT_ATTEMPTS
      ) {
        console.log(
          "Received 401 error, attempting to initiate Traccar session..."
        );
        try {
          await initiateTraccarSession();
          // Retry the request after session initiation
          return fetchDeviceLocationInternal();
        } catch (sessionError) {
          console.error(
            "Failed to initiate session, cannot retry:",
            sessionError
          );
          throw new Error(
            `Authentication failed: Unable to establish Traccar session. ${sessionError}`
          );
        }
      }

      throw new Error(
        `Failed to fetch device location: ${response.status} ${errorText}`
      );
    }

    const result: BackendDeviceLocationResponse = await response.json();

    if (!result.status) {
      throw new Error(result.message || "Failed to fetch device location");
    }

    console.log(`Received location for device ${deviceId}:`, result.data);

    // Convert backend format to frontend format
    const device: Device = {
      id: result.data.device.id,
      name: result.data.device.name,
      uniqueId: result.data.device.unique_id,
      status: result.data.device.status,
      lastUpdate: result.data.device.last_update,
      latitude: result.data.position?.latitude || null,
      longitude: result.data.position?.longitude || null,
      speed: result.data.position?.speed || null,
      course: result.data.position?.course || null,
      address: result.data.position?.address || null,
      fixTime: result.data.position?.fix_time || null,
    };

    return device;
  };

  try {
    return await fetchDeviceLocationInternal();
  } catch (error) {
    console.error(`Error fetching location for device ${deviceId}:`, error);
    throw error;
  }
}

// Polling controller for location updates
export function startLocationPolling(
  onUpdate: (devices: Device[]) => void,
  intervalMs: number = 10000 // Default 10 seconds
) {
  let isPolling = false;
  let pollInterval: NodeJS.Timeout | null = null;

  const poll = async () => {
    if (isPolling) {
      try {
        console.log("Polling for device locations...");
        const devices = await fetchAllLocations();
        console.log("Received devices:", devices);
        onUpdate(devices);
      } catch (error) {
        console.error("Error polling locations:", error);
        // Continue polling even if one request fails
      }
    }
  };

  const start = () => {
    if (!isPolling) {
      isPolling = true;
      console.log(`Starting location polling every ${intervalMs}ms`);

      // Poll immediately
      poll();

      // Then poll at intervals
      pollInterval = setInterval(poll, intervalMs);
    }
  };

  const stop = () => {
    if (isPolling) {
      isPolling = false;
      console.log("Stopping location polling");

      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }
  };

  return { start, stop };
}

// Utility function to format speed (convert from m/s to km/h)
export function formatSpeed(speedMs: number): string {
  const speedKmh = speedMs * 3.6;
  return `${speedKmh.toFixed(1)} km/h`;
}

// Utility function to format last update time
export function formatLastUpdate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

// Utility function to get status color
export function getStatusColor(status: "online" | "offline"): string {
  return status === "online" ? "text-green-500" : "text-red-500";
}
