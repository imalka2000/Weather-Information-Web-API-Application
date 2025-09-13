import React from 'react';

const PALETTE = [
  { top: ['#56CCF2', '#2F80ED'] },
  { top: ['#7C3AED', '#6D28D9'] },
  { top: ['#34D399', '#10B981'] },
  { top: ['#FB923C', '#F97316'] },
  { top: ['#EF4444', '#DC2626'] },
  { top: ['#F97316', '#F59E0B'] }
];

function cToF(c) { return (c * 9) / 5 + 32; }
function formatTemp(temp, unit) {
  if (temp === null || temp === undefined) return '—';
  return unit === 'C' ? `${Math.round(temp)}°C` : `${Math.round(cToF(temp))}°F`;
}

export default function CityCard({ item, unit = 'C', onClick = () => {}, onRemove }) {
  const d = item.data || {};
  const raw = d.raw || {};
  const name = raw.name || d.name || `ID ${d.id}`;
  const desc = (raw.weather && raw.weather[0] && raw.weather[0].description) || d.weatherDescription || '—';
  const temp = d.temp ?? raw.main?.temp ?? null;

  const idx = Math.abs(String(d.id || item.id).split('').reduce((s, ch) => s + ch.charCodeAt(0), 0)) % PALETTE.length;
  const palette = PALETTE[idx];
  const topGradient = `linear-gradient(135deg, ${palette.top[0]} 0%, ${palette.top[1]} 100%)`;

  const icon = raw.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null;

  return (
    <div className="card-hero" onClick={onClick} role="button" tabIndex={0}>
      <div className="card-top" style={{ background: topGradient }}>
        {onRemove && (
          <button
            className="card-close"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label="Remove"
            title="Remove"
          >
            ×
          </button>
        )}

        <div className="card-top-inner">
          <div className="card-top-left">
            <div className="city-large">{name}</div>
            <div className="time-small">{new Date().toLocaleString()}</div>

            <div className="desc-row">
              {iconUrl ? <img src={iconUrl} alt={desc} className="small-icon" /> : <span className="small-icon placeholder" />}
              <div className="desc-text">{desc}</div>
            </div>
          </div>

          <div className="card-top-right">
            <div className="temp-big">{formatTemp(temp, unit)}</div>
            <div className="minmax">
              <div>Temp Min: {raw.main?.temp_min ? `${Math.round(raw.main.temp_min)}°c` : '—'}</div>
              <div>Temp Max: {raw.main?.temp_max ? `${Math.round(raw.main.temp_max)}°c` : '—'}</div>
            </div>
          </div>
        </div>

        <svg className="clouds-illustration" viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden>
          <g fill="rgba(255,255,255,0.06)">
            <ellipse cx="80" cy="70" rx="80" ry="28"></ellipse>
            <ellipse cx="220" cy="60" rx="110" ry="36"></ellipse>
            <ellipse cx="420" cy="70" rx="100" ry="30"></ellipse>
            <ellipse cx="540" cy="62" rx="80" ry="28"></ellipse>
          </g>
        </svg>
      </div>

      <div className="card-bottom">
        <div className="bottom-left">
          <div><strong>Pressure:</strong> {raw.main?.pressure ?? '—'}hPa</div>
          <div><strong>Humidity:</strong> {raw.main?.humidity ?? '—'}%</div>
          <div><strong>Visibility:</strong> {raw.visibility ? `${(raw.visibility/1000).toFixed(1)}km` : '—'}</div>
        </div>

        <div className="bottom-center">
          <div className="wind-ico">🧭</div>
          <div className="wind-text">{raw.wind?.speed ?? '—'} m/s · {raw.wind?.deg ?? '—'}°</div>
        </div>

        <div className="bottom-right">
          <div><strong>Sunrise:</strong> {raw.sys?.sunrise ? new Date((raw.sys.sunrise + (raw.timezone||0)) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
          <div><strong>Sunset:</strong> {raw.sys?.sunset ? new Date((raw.sys.sunset + (raw.timezone||0)) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
        </div>
      </div>
    </div>
  );
}
