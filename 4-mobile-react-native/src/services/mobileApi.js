// =========================================================================
// [MẢNG 4 - MOBILE REACT NATIVE] Kết nối REST API & SignalR với Backend C#
// Đồng bộ 100% hợp đồng API với 3-frontend-react/src/services/apiClient.js
// =========================================================================

export const DEFAULT_SERVER_IP = '192.168.1.31';
export const DEFAULT_SERVER_PORT = '5000';
const REQUEST_TIMEOUT_MS = 5000;

export function normalizeServerInput(rawInput = DEFAULT_SERVER_IP) {
  let clean = String(rawInput || DEFAULT_SERVER_IP).trim();
  clean = clean.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!clean) {
    return `${DEFAULT_SERVER_IP}:${DEFAULT_SERVER_PORT}`;
  }
  if (/:\d+$/.test(clean)) {
    return clean;
  }
  return `${clean}:${DEFAULT_SERVER_PORT}`;
}

export function extractHostOnly(rawInput = DEFAULT_SERVER_IP) {
  return normalizeServerInput(rawInput).replace(/:\d+$/, '');
}

export function buildBaseUrl(serverIp = DEFAULT_SERVER_IP) {
  return `http://${normalizeServerInput(serverIp)}`;
}

export function buildSignalRUrl(serverIp = DEFAULT_SERVER_IP) {
  return `${buildBaseUrl(serverIp)}/hubs/smarthome`;
}

export function getMobileExportCsvUrl(serverIp = DEFAULT_SERVER_IP) {
  return `${buildBaseUrl(serverIp)}/api/analytics/export-csv`;
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      const error = new Error(msg);
      error.status = res.status;
      throw error;
    }

    return data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'Quá thời gian phản hồi từ Server C# (5s). Hãy kiểm tra IP LAN và tường lửa cổng 5000.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchServerRootInfo(serverIp) {
  try {
    return await fetchJsonWithTimeout(`${buildBaseUrl(serverIp)}/`);
  } catch {
    return null;
  }
}

export async function fetchMobileDeviceStatus(serverIp) {
  return fetchJsonWithTimeout(`${buildBaseUrl(serverIp)}/api/device/status`);
}

export async function fetchMobileConnectionInfo(serverIp) {
  return fetchJsonWithTimeout(`${buildBaseUrl(serverIp)}/api/device/connection`);
}

export async function sendMobileCommand(serverIp, cmd, value) {
  const data = await fetchJsonWithTimeout(`${buildBaseUrl(serverIp)}/api/device/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd, value })
  });

  if (data && data.success === false) {
    throw new Error(data.error || 'Lệnh điều khiển không hợp lệ');
  }
  return data;
}

export async function fetchMobileAnalyticsSummary(serverIp) {
  return fetchJsonWithTimeout(`${buildBaseUrl(serverIp)}/api/analytics/summary`);
}

export async function fetchMobileSensorHistory(serverIp, limit = 30) {
  return fetchJsonWithTimeout(`${buildBaseUrl(serverIp)}/api/analytics/history?limit=${limit}`);
}

export async function fetchMobileEventLogs(
  serverIp,
  category = 'ALL',
  limit = 100,
  keyword = ''
) {
  const params = new URLSearchParams({
    category: category || 'ALL',
    limit: String(limit)
  });
  if (keyword && keyword.trim()) {
    params.set('keyword', keyword.trim());
  }
  return fetchJsonWithTimeout(
    `${buildBaseUrl(serverIp)}/api/analytics/logs?${params.toString()}`
  );
}

/**
 * Thử gọi DELETE /api/analytics/logs nếu Backend hỗ trợ;
 * nếu Backend trên nhánh master chưa mở endpoint DELETE (trả 404/405),
 * trả về { supported: false } để giao diện đặt lại danh sách hiển thị trên phiên Mobile mà không báo lỗi.
 */
export async function clearMobileEventLogs(serverIp) {
  try {
    const data = await fetchJsonWithTimeout(
      `${buildBaseUrl(serverIp)}/api/analytics/logs`,
      { method: 'DELETE' }
    );
    return { supported: true, ...(data || {}) };
  } catch {
    return { supported: false };
  }
}
