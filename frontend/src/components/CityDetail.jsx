import React from 'react';

function cToF(c) { return (c * 9) / 5 + 32; }
function formatTemp(temp, unit) {
  if (temp === null || temp === undefined) return '—';
  return unit === 'C' ? `${Math.round(temp)}°C` : `${Math.round(cToF(temp))}°F`;
}
function timeFromUnix(unix, tzOffset = 0) {
  if (!unix) return '—';
  try {
    const d = new Date((unix + tzOffset) * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}
function capitalize(s = '') { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function CityDetail({ city, unit = 'C', onClose = () => {} }) {
  const d = city?.data || {};
  const raw = d.raw || {};
  const tz = raw.timezone || 0;
  const weather = raw.weather?.[0] || {};
  const icon = weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@4x.png` : null;
  const cityTitle = raw.name ? `${raw.name}${raw.sys?.country ? `, ${raw.sys.country}` : ''}` : d.name || `City ${d.id}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="city-detail-large" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="detail-back" onClick={onClose} aria-label="Back">←</button>

        <div className="detail-top-panel">
          <div className="detail-top-inner">
            <div className="detail-top-title">
              <div className="detail-city-large">{cityTitle}</div>
              <div className="detail-time-small">{new Date().toLocaleString()}</div>
            </div>

            <div className="detail-core">
              <div className="detail-icon-block">
                {icon ? <img src={icon} alt={weather.description || ''} className="detail-icon-large" /> : null}
                <div className="detail-desc">{weather.description ? capitalize(weather.description) : '—'}</div>
              </div>

              <div className="detail-divider" />

              <div className="detail-temp-block">
                <div className="detail-temp-large">{formatTemp(d.temp, unit)}</div>
                <div className="detail-minmax">
                  <div>Temp Min: {raw.main?.temp_min ? `${Math.round(raw.main.temp_min)}°c` : '—'}</div>
                  <div>Temp Max: {raw.main?.temp_max ? `${Math.round(raw.main.temp_max)}°c` : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-bottom-panel">
          <div className="detail-bottom-inner">
            <div className="detail-col left">
              <div><strong>Pressure:</strong> {raw.main?.pressure ?? '—'}hPa</div>
              <div><strong>Humidity:</strong> {raw.main?.humidity ?? '—'}%</div>
              <div><strong>Visibility:</strong> {raw.visibility ? `${(raw.visibility/1000).toFixed(1)}km` : '—'}</div>
            </div>

            <div className="detail-col center">
              <div className="wind-icon">🧭</div>
              <div className="wind-text">{raw.wind?.speed ?? '—'} m/s · {raw.wind?.deg ?? '—'}°</div>
            </div>

            <div className="detail-col right">
              <div><strong>Sunrise:</strong> {timeFromUnix(raw.sys?.sunrise, tz)}</div>
              <div><strong>Sunset:</strong> {timeFromUnix(raw.sys?.sunset, tz)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
