import React, { memo } from 'react';
import { CloudRain, Droplets, Flame, Sprout, Sun, Thermometer } from 'lucide-react';

const SOIL_DRY = 30; // < 30% là khô -> ESP32 tự tưới
const SOIL_MOIST = 40; // >= 40% là đủ ẩm
const FLAME_THRESHOLD = 15; // ADC < 15 là có lửa (Active-LOW)

const oneDecimal = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const integer = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const clampPercent = (v) => Math.min(100, Math.max(0, v));

const TONES = {
  orange: { icon: 'bg-orange-500/15 text-orange-400', value: 'text-orange-400' },
  sky: { icon: 'bg-sky-500/15 text-sky-400', value: 'text-sky-400' },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-400', value: 'text-emerald-400' },
  amber: { icon: 'bg-amber-500/15 text-amber-400', value: 'text-amber-400' },
  red: { icon: 'bg-red-500/20 text-red-400', value: 'text-red-400' },
  slate: { icon: 'bg-slate-800 text-slate-400', value: 'text-slate-300' }
};

/** Khung chung cho 1 thẻ cảm biến */
function SensorCard({ title, source, value, unit, tone, Icon, status, alert = false, children }) {
  const t = TONES[tone];
  return (
    <article
      className={`rounded-2xl border p-4 flex flex-col gap-3 min-w-0 transition-colors ${
        alert ? 'bg-red-950/60 border-red-500' : 'bg-slate-900 border-slate-800'
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-200 truncate">{title}</h3>
          <p className="text-[11px] text-slate-500" translate="no">
            {source}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.icon}`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </header>

      <p className={`text-3xl font-extrabold tabular-nums leading-none ${t.value}`}>
        {value}
        {unit ? <span className="ml-1 text-lg font-bold opacity-80">{unit}</span> : null}
      </p>

      {children}

      {status ? <p className="text-xs text-slate-400">{status}</p> : null}
    </article>
  );
}

function getTempStatus(temp) {
  if (!isNumber(temp)) return 'Chưa có dữ liệu';
  if (temp >= 35) return 'Rất nóng, nên bật quạt';
  if (temp > 33) return 'Khá nóng';
  if (temp < 18) return 'Lạnh';
  return 'Dễ chịu';
}

const TempCard = memo(function TempCard({ temp }) {
  return (
    <SensorCard
      title="Nhiệt độ phòng"
      source="DHT20 (I2C 0x38)"
      value={isNumber(temp) ? oneDecimal.format(temp) : '--'}
      unit="°C"
      tone="orange"
      Icon={Thermometer}
      status={getTempStatus(temp)}
    />
  );
});

function getHumStatus(hum) {
  if (!isNumber(hum)) return 'Chưa có dữ liệu';
  if (hum < 40) return 'Không khí khô';
  if (hum > 75) return 'Độ ẩm cao';
  return 'Độ ẩm lý tưởng';
}

const HumCard = memo(function HumCard({ hum }) {
  return (
    <SensorCard
      title="Độ ẩm không khí"
      source="DHT20 (I2C 0x38)"
      value={isNumber(hum) ? integer.format(hum) : '--'}
      unit="%"
      tone="sky"
      Icon={Droplets}
      status={getHumStatus(hum)}
    />
  );
});

function getSoilInfo(soil) {
  if (!isNumber(soil)) return { tone: 'slate', bar: 'bg-slate-600', status: 'Chưa có dữ liệu' };
  if (soil < SOIL_DRY) {
    return { tone: 'amber', bar: 'bg-amber-500', status: `Đất khô (< ${SOIL_DRY}%), bơm sẽ tự tưới` };
  }
  if (soil < SOIL_MOIST) return { tone: 'emerald', bar: 'bg-lime-500', status: 'Hơi khô' };
  return { tone: 'emerald', bar: 'bg-emerald-500', status: `Đủ ẩm (≥ ${SOIL_MOIST}%)` };
}

const SoilCard = memo(function SoilCard({ soil }) {
  const { tone, bar, status } = getSoilInfo(soil);
  const percent = isNumber(soil) ? clampPercent(soil) : 0;

  return (
    <SensorCard
      title="Độ ẩm đất vườn"
      source="LM393 (IO35)"
      value={isNumber(soil) ? integer.format(soil) : '--'}
      unit="%"
      tone={tone}
      Icon={Sprout}
      status={status}
    >
      <div
        role="progressbar"
        aria-label="Độ ẩm đất"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isNumber(soil) ? percent : undefined}
        className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden"
      >
        <div
          className={`h-full origin-left transition-transform duration-500 ${bar}`}
          style={{ transform: `scaleX(${percent / 100})` }}
        />
        {/* Vạch ngưỡng tưới 30% */}
        <span
          aria-hidden="true"
          className="absolute top-0 h-full w-px bg-slate-400/70"
          style={{ left: `${SOIL_DRY}%` }}
        />
      </div>
    </SensorCard>
  );
});

const FlameRainCard = memo(function FlameRainCard({ flame, fireAlert, rain }) {
  const hasFlame = isNumber(flame);
  return (
    <SensorCard
      title="An toàn lửa & thời tiết"
      source="MKE-S04 (IO34) · HS0217V (IO23)"
      value={fireAlert ? 'Có lửa!' : hasFlame ? 'An toàn' : '--'}
      tone={fireAlert ? 'red' : hasFlame ? 'emerald' : 'slate'}
      Icon={Flame}
      alert={fireAlert}
      status={
        hasFlame
          ? `Chỉ số lửa ADC: ${integer.format(flame)} (báo cháy khi < ${FLAME_THRESHOLD})`
          : 'Chưa có dữ liệu'
      }
    >
      <p
        className={`inline-flex items-center gap-1.5 self-start text-xs font-semibold px-2 py-1 rounded-lg ${
          rain ? 'bg-sky-500/15 text-sky-300' : 'bg-amber-500/10 text-amber-300'
        }`}
      >
        {rain ? (
          <CloudRain className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <Sun className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {rain ? 'Đang mưa' : 'Trời khô ráo'}
      </p>
    </SensorCard>
  );
});

/**
 * 4 thẻ cảm biến thời gian thực. Mỗi thẻ được memo và chỉ nhận giá trị nguyên thủy,
 * nên gói Telemetry 1 giây/lần chỉ vẽ lại đúng thẻ có số liệu thay đổi.
 */
function SensorCards({ temp, hum, soil, flame, fireAlert, rain }) {
  return (
    <section aria-label="Cảm biến thời gian thực" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <TempCard temp={temp} />
      <HumCard hum={hum} />
      <SoilCard soil={soil} />
      <FlameRainCard flame={flame} fireAlert={fireAlert} rain={rain} />
    </section>
  );
}

export default memo(SensorCards);

