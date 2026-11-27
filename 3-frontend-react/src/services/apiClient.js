// Kết nối đồng bộ với Backend C# qua Vite Reverse Proxy (cổng 5173/5174..., không lo lỗi CORS)
// Nếu chạy bản build độc lập ngoài Vite dev server thì tự động fallback sang cổng 5000 của Server C#
const getBackendBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  if (import.meta.env.DEV || window.location.port === '5173' || window.location.port === '5174') {
    return ''; // Dùng đường dẫn tương đối đi qua Vite Proxy (/api & /hubs)
  }
  const host = window.location.hostname || 'localhost';
  return `http://${host}:5000`;
};

export const API_BASE_URL = getBackendBaseUrl();
export const SIGNALR_HUB_URL = `${API_BASE_URL}/hubs/smarthome`;

export function getLanDirectBackendUrl() {
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:5000`;
}

export async function fetchServerRootInfo() {
  try {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    const res = await fetch(`http://${host}:5000/`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchDeviceStatus() {
  const res = await fetch(`${API_BASE_URL}/api/device/status`);
  if (!res.ok) throw new Error('Không thể tải trạng thái thiết bị');
  return res.json();
}

export async function fetchConnectionInfo() {
  const res = await fetch(`${API_BASE_URL}/api/device/connection`);
  if (!res.ok) throw new Error('Không thể tải trạng thái kết nối MQTT');
  return res.json();
}

export async function sendDeviceCommand(cmd, value) {
  const res = await fetch(`${API_BASE_URL}/api/device/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd, value })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Gửi lệnh điều khiển thất bại');
  }
  return data;
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/api/analytics/summary`);
  if (!res.ok) throw new Error('Không thể tải thống kê KPI');
  return res.json();
}

export async function fetchSensorHistory(limit = 30) {
  const res = await fetch(`${API_BASE_URL}/api/analytics/history?limit=${limit}`);
  if (!res.ok) throw new Error('Không thể tải lịch sử cảm biến');
  return res.json();
}

export async function fetchEventLogs(category = 'ALL', limit = 100, keyword = '') {
  const params = new URLSearchParams({
    category,
    limit: String(limit)
  });
  if (keyword && keyword.trim()) {
    params.set('keyword', keyword.trim());
  }
  const res = await fetch(`${API_BASE_URL}/api/analytics/logs?${params.toString()}`);
  if (!res.ok) throw new Error('Không thể tải nhật ký sự kiện');
  return res.json();
}

export async function clearEventLogs() {
  const res = await fetch(`${API_BASE_URL}/api/analytics/logs`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Không thể xóa nhật ký sự kiện');
  return res.json();
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/api/analytics/export-csv`;
}
