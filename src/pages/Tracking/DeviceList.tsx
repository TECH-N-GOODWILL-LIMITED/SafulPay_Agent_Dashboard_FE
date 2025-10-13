import {
  Device,
  formatSpeed,
  formatLastUpdate,
  hasValidCoordinates,
} from "../../utils/traccar";

interface DeviceListProps {
  devices: Device[];
  onDeviceSelect?: (device: Device) => void;
}

export default function DeviceList({
  devices,
  onDeviceSelect,
}: DeviceListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Devices</h3>
        <p className="text-sm text-gray-600">
          {devices.length} device{devices.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {devices.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No devices found</div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                onDeviceSelect ? "cursor-pointer" : ""
              }`}
              onClick={() => onDeviceSelect?.(device)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {device.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        device.status === "online"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {device.status}
                    </span>
                    {!hasValidCoordinates(device) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        No Location
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    ID: {device.uniqueId}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Speed:</span>
                      <span className="ml-1 font-medium">
                        {device.speed !== null
                          ? formatSpeed(device.speed)
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Course:</span>
                      <span className="ml-1 font-medium">
                        {device.course !== null ? `${device.course}°` : "N/A"}
                      </span>
                    </div>
                  </div>

                  {hasValidCoordinates(device) ? (
                    <div className="mt-2 text-xs text-green-600">
                      ✓ Location available
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-yellow-600">
                      ⚠ No location data
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Last update: {formatLastUpdate(device.lastUpdate)}
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      device.status === "online" ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
