import * as signalR from '@microsoft/signalr';

// Tự động nhận diện địa chỉ Backend C# (cổng 5000) kể cả khi mở trên Laptop hay Điện thoại trong cùng Wi-Fi
const getBackendBaseUrl = () => {
  const host = window.location.hostname || 'localhost';
  return `http://${host}:5000`;
};

export const API_BASE_URL = getBackendBaseUrl();
export const SIGNALR_HUB_URL = `${API_BASE_URL}/hubs/smarthome`;

// Tên sự kiện SignalR theo docs/MQTT_API_CONTRACT.md
export const HUB_EVENTS = {
  TELEMETRY: 'ReceiveTelemetry',
  EVENT_LOG: 'NewEventLog'
};

async function requestJson(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} khi gọi ${path}`);
  }
  return res.json();
}

/**
 * Tạo kết nối SignalR tới Hub /hubs/smarthome.
 * Tự kết nối lại theo các mốc 0s, 2s, 5s, 10s rồi cứ 10s một lần.
 */
export function createHubConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (ctx) => [0, 2000, 5000, 10000][ctx.previousRetryCount] ?? 10000
    })
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export function fetchDeviceStatus() {
  return requestJson('/api/device/status');
}

export function sendDeviceCommand(cmd, value) {
  return requestJson('/api/device/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd, value })
  });
}

export function fetchAnalyticsSummary() {
  return requestJson('/api/analytics/summary');
}

export function fetchSensorHistory(limit = 30) {
  return requestJson(`/api/analytics/history?limit=${limit}`);
}

export function fetchEventLogs(category = 'ALL', limit = 100) {
  return requestJson(
    `/api/analytics/logs?category=${encodeURIComponent(category)}&limit=${limit}`
  );
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/api/analytics/export-csv`;
}
