# Tracking Components

This directory contains components for the device tracking functionality that uses the backend API instead of direct Traccar API calls.

## Components

### DeviceMap.tsx

- Interactive map showing device locations
- Custom markers for online/offline devices
- Detailed popups with device information
- Auto-centering based on device locations

### DeviceList.tsx

- List view of all devices
- Status indicators (online/offline)
- Device selection functionality
- Real-time updates

## Usage

The tracking system now uses your backend API endpoints:

1. **GET `/api/traccar/locations`** - Fetch all device locations
2. **GET `/api/traccar/device/{id}/location`** - Fetch specific device location

## Environment Configuration

Set the `REACT_APP_API_BASE_URL` environment variable to point to your backend:

```bash
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

## Features

- ✅ Real-time polling every 10 seconds
- ✅ No CORS issues (uses backend proxy)
- ✅ Better security (no direct API calls)
- ✅ Enhanced UI with device list and map
- ✅ Error handling and loading states
- ✅ Responsive design
- ✅ Device status indicators
- ✅ Speed and course information
- ✅ Last update timestamps
