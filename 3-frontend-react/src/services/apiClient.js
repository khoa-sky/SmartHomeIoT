// Tự động nhận diện địa chỉ Backend C# (cổng 5000) kể cả khi mở trên Laptop hay Điện thoại trong cùng Wi-Fi
const getBackendBaseUrl = () => {
  const host = window.location.hostname || 'localhost';
  return `http://${host}:5000`;
};

export const API_BASE_URL = getBackendBaseUrl();
export const SIGNALR_HUB_URL = `${API_BASE_URL}/hubs/smarthome`;

export async function fetchDeviceStatus() {
  const res = await fetch(`${API_BASE_URL}/api/device/status`);
  return res.json();
}

export async function sendDeviceCommand(cmd, value) {
  const res = await fetch(`${API_BASE_URL}/api/device/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd, value })
  });
  return res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/api/analytics/summary`);
  return res.json();
}

export async function fetchSensorHistory(limit = 30) {
  const res = await fetch(`${API_BASE_URL}/api/analytics/history?limit=${limit}`);
  return res.json();
}

export async function fetchEventLogs(category = 'ALL', limit = 100) {
  const res = await fetch(`${API_BASE_URL}/api/analytics/logs?category=${category}&limit=${limit}`);
  return res.json();
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/api/analytics/export-csv`;
}
