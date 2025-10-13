import { useEffect, useState } from "react";
import DeviceMap from "../../components/maps/DeviceMap";
import DeviceList from "./DeviceList";
import {
  startLocationPolling,
  Device,
  filterDevicesWithCoordinates,
  getDevicesWithoutCoordinates,
} from "../../utils/traccar";

export default function Tracking() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    let pollingController: { start: () => void; stop: () => void } | null =
      null;
    let isMounted = true;

    const initializeTracking = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Start polling for location updates every 10 seconds
        pollingController = startLocationPolling(
          (updatedDevices: Device[]) => {
            console.log("Received device updates:", updatedDevices);

            if (isMounted) {
              setDevices(updatedDevices);
              setLastUpdate(new Date().toLocaleTimeString());
            }
          },
          10000 // Poll every 10 seconds
        );

        // Start the polling
        pollingController.start();
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing tracking:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to initialize tracking"
          );
          setIsLoading(false);
        }
      }
    };

    initializeTracking();

    return () => {
      isMounted = false;
      if (pollingController) {
        pollingController.stop();
      }
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading device locations...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-2">Failed to load tracking data</p>
            <p className="text-gray-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (devices.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">📍</div>
            <p className="text-gray-600">No devices found</p>
            <p className="text-gray-500 text-sm">
              Make sure devices are registered and online
            </p>
          </div>
        </div>
      );
    }

    const devicesWithCoordinates = filterDevicesWithCoordinates(devices);
    const devicesWithoutCoordinates = getDevicesWithoutCoordinates(devices);

    return (
      <div className="space-y-6">
        {/* Warning for devices without coordinates */}
        {devicesWithoutCoordinates.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 text-lg mr-3">⚠️</div>
              <div>
                <h3 className="text-yellow-800 font-medium">
                  {devicesWithoutCoordinates.length} device
                  {devicesWithoutCoordinates.length !== 1 ? "s" : ""} without
                  location data
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  The following devices are online but don't have valid
                  coordinates:{" "}
                  {devicesWithoutCoordinates.map((d) => d.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <DeviceMap devices={devicesWithCoordinates} />
          </div>

          {/* Device List Section */}
          <div className="lg:col-span-1">
            <DeviceList devices={devices} onDeviceSelect={setSelectedDevice} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Live Device Tracking</h2>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <div className="text-sm text-gray-600">
              Last updated: {lastUpdate}
            </div>
          )}
          <div className="text-sm text-gray-500">
            {devices.length} device{devices.length !== 1 ? "s" : ""} online
            {filterDevicesWithCoordinates(devices).length !==
              devices.length && (
              <span className="ml-2 text-yellow-600">
                ({filterDevicesWithCoordinates(devices).length} with location)
              </span>
            )}
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
