import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Device,
  formatSpeed,
  formatLastUpdate,
  getStatusColor,
  filterDevicesWithCoordinates,
} from "../../utils/traccar";

// Fix for default markers in react-leaflet
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom icon for online devices
const onlineIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for offline devices
const offlineIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DeviceMapProps {
  devices: Device[];
}

export default function DeviceMap({ devices }: DeviceMapProps) {
  // Filter devices with valid coordinates
  const validDevices = filterDevicesWithCoordinates(devices);

  // Calculate center point from device locations
  const getMapCenter = () => {
    if (validDevices.length === 0) {
      return [8.48, -13.23] as [number, number]; // Default center (Freetown, Sierra Leone)
    }

    if (validDevices.length === 1) {
      return [validDevices[0].latitude!, validDevices[0].longitude!] as [
        number,
        number
      ];
    }

    // Calculate center point for multiple devices
    const totalLat = validDevices.reduce((sum, d) => sum + d.latitude!, 0);
    const totalLng = validDevices.reduce((sum, d) => sum + d.longitude!, 0);

    return [totalLat / validDevices.length, totalLng / validDevices.length] as [
      number,
      number
    ];
  };

  const center = getMapCenter();

  // Show message if no devices have valid coordinates
  if (validDevices.length === 0) {
    return (
      <div className="w-full h-[70vh] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Location Data Available
          </h3>
          <p className="text-gray-600 text-sm">
            None of the devices have valid coordinates to display on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={validDevices.length > 1 ? 11 : 14}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {validDevices.map((device) => {
          const icon = device.status === "online" ? onlineIcon : offlineIcon;

          return (
            <Marker
              key={device.id}
              position={[device.latitude!, device.longitude!]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-lg mb-2">
                    {device.name}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device ID:</span>
                      <span className="font-mono">{device.uniqueId}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-medium ${getStatusColor(
                          device.status
                        )}`}
                      >
                        {device.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span>
                        {device.speed !== null
                          ? formatSpeed(device.speed)
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span>
                        {device.course !== null ? `${device.course}°` : "N/A"}
                      </span>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="text-gray-600 text-xs mb-1">
                        Last Update:
                      </div>
                      <div className="text-xs">
                        {formatLastUpdate(device.lastUpdate)}
                      </div>
                    </div>

                    {device.address && (
                      <div className="border-t pt-2 mt-2">
                        <div className="text-gray-600 text-xs mb-1">
                          Address:
                        </div>
                        <div className="text-xs">{device.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
