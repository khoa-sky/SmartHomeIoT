import { useEffect, useRef, useState } from 'react';
import { HUB_EVENTS, createHubConnection, fetchDeviceStatus } from '../services/apiClient';

const HISTORY_LIMIT = 25;
const START_RETRY_MS = 5000;

// 15 trường Telemetry theo docs/MQTT_API_CONTRACT.md (+ online, lastUpdated do Backend C# bổ sung).
// Các giá trị cảm biến để null cho tới khi nhận gói tin thật, tránh hiển thị số giả.
export const INITIAL_TELEMETRY = {
  temp: null,
  hum: null,
  soil: null,
  flame: null,
  fireAlert: false,
  pir: false,
  pirLocked: false,
  rain: false,
  servoAngle: 15,
  servoMode: 'AUTO',
  lightOn: false,
  redLedOn: false,
  pumpOn: false,
  pumpLocked: false,
  pumpCount: 0,
  online: false,
  lastUpdated: null
};

/**
 * Quản lý kết nối SignalR thời gian thực với Backend C#.
 *
 * hubStatus: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
 */
export function useSmartHomeHub({ onEventLog } = {}) {
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [history, setHistory] = useState([]);
  const [hubStatus, setHubStatus] = useState('connecting');

  // Giữ callback mới nhất trong ref để effect kết nối chỉ chạy đúng 1 lần
  const onEventLogRef = useRef(onEventLog);
  useEffect(() => {
    onEventLogRef.current = onEventLog;
  });

  useEffect(() => {
    let disposed = false;
    let retryTimer = null;
    const connection = createHubConnection();

    const mergeTelemetry = (data) => {
      if (!data || disposed) return;
      setTelemetry((prev) => ({ ...prev, ...data }));
    };

    const syncLatestStatus = () =>
      fetchDeviceStatus()
        .then(mergeTelemetry)
        .catch(() => {});

    connection.on(HUB_EVENTS.TELEMETRY, (data) => {
      mergeTelemetry(data);
      // Chỉ ghi lịch sử khi mạch thật sự gửi dữ liệu (Backend cũng bắn gói offline)
      if (!data?.online) return;
      setHistory((prev) => {
        const point = {
          timestamp: data.lastUpdated || new Date().toISOString(),
          temp: data.temp,
          hum: data.hum,
          soil: data.soil
        };
        return prev.length >= HISTORY_LIMIT
          ? [...prev.slice(prev.length - HISTORY_LIMIT + 1), point]
          : [...prev, point];
      });
    });

    connection.on(HUB_EVENTS.EVENT_LOG, (log) => {
      onEventLogRef.current?.(log);
    });

    connection.onreconnecting(() => {
      if (!disposed) setHubStatus('reconnecting');
    });
    connection.onreconnected(() => {
      if (disposed) return;
      setHubStatus('connected');
      syncLatestStatus();
    });
    connection.onclose(() => {
      if (disposed) return;
      setHubStatus('disconnected');
      retryTimer = setTimeout(start, START_RETRY_MS);
    });

    // withAutomaticReconnect chỉ hoạt động sau lần kết nối thành công đầu tiên,
    // nên tự thử lại khi Backend chưa bật lúc mở trang.
    let startPromise = Promise.resolve();
    function start() {
      if (disposed) return;
      setHubStatus((s) => (s === 'disconnected' ? 'reconnecting' : s));
      startPromise = connection
        .start()
        .then(() => {
          if (disposed) return;
          setHubStatus('connected');
          syncLatestStatus();
        })
        .catch(() => {
          if (disposed) return;
          setHubStatus('disconnected');
          retryTimer = setTimeout(start, START_RETRY_MS);
        });
    }

    syncLatestStatus();
    start();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      // Đợi start() xong rồi mới stop, tránh lỗi "stopped during negotiation" (React StrictMode)
      startPromise.finally(() => connection.stop());
    };
  }, []);

  return { telemetry, setTelemetry, history, setHistory, hubStatus };
}

