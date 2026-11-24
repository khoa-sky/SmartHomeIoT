// =========================================================================
// [MẢNG 4 - MOBILE REACT NATIVE] Kết nối REST API & SignalR với Backend C#
// Lưu ý: Trên điện thoại thật, "localhost" chính là chiếc điện thoại,
// nên cần điền IP Wi-Fi LAN của máy tính chạy Backend C# (ví dụ: 192.168.1.31)
// =========================================================================

export const DEFAULT_SERVER_IP = '192.168.1.31';
export const DEFAULT_SERVER_PORT = '5000';

export function buildBaseUrl(serverIp = DEFAULT_SERVER_IP) {
  const cleanIp = (serverIp || DEFAULT_SERVER_IP).trim();
  return `http://${cleanIp}:${DEFAULT_SERVER_PORT}`;
}

export function buildSignalRUrl(serverIp = DEFAULT_SERVER_IP) {
  return `${buildBaseUrl(serverIp)}/hubs/smarthome`;
}

export async function fetchMobileDeviceStatus(serverIp) {
  const res = await fetch(`${buildBaseUrl(serverIp)}/api/device/status`);
  return res.json();
}

export async function sendMobileCommand(serverIp, cmd, value) {
  const res = await fetch(`${buildBaseUrl(serverIp)}/api/device/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd, value })
  });
  return res.json();
}
