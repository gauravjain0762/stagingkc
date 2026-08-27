// Shared "Location" + "Radius" filter section — used identically by
// EventsPage's and CalendarPage's filter panels so the two never drift out
// of sync with each other again. Purely a controlled-input view: the parent
// owns `pendingF`/`setPendingF` (the panel's staged filter state) and the
// useRadiusFilter() hook results (geoResolving/geoSearchFailed).
function MapPinIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }

const MIN_RADIUS = 5;
const MAX_RADIUS = 300;

export default function LocationRadiusFilter({
  pendingF, setPendingF, onUseMyLocation, locatingMe,
  radiusFilterActive, geoResolving, geoSearchFailed,
}) {
  return (
    <div className="ev-filter-section">
      <h4 className="ev-filter-section-title">Location</h4>
      <div className="ev-filter-location-row">
        <MapPinIcon />
        <input
          className="ev-filter-location-input"
          placeholder="Enter an address, city, or ZIP code"
          value={pendingF.location}
          onChange={e => setPendingF(p => ({ ...p, location: e.target.value }))}
        />
      </div>
      <button type="button" className="ev-filter-use-location-btn" onClick={onUseMyLocation} disabled={locatingMe}>
        <MapPinIcon /> {locatingMe ? 'Locating…' : 'Use my current location'}
      </button>
      {pendingF.location.trim() && (
        <div className="ev-filter-radius-block">
          <div className="ev-filter-radius-head">
            <span className="ev-filter-radius-title">Radius</span>
            <span className="ev-filter-radius-value">{pendingF.radius} {pendingF.radiusUnit}</span>
          </div>
          <input
            type="range"
            className="ev-filter-radius-slider"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            step={5}
            value={pendingF.radius}
            onChange={e => setPendingF(p => ({ ...p, radius: Number(e.target.value) }))}
            style={{ '--fill': `${((pendingF.radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100}%` }}
          />
          <div className="ev-filter-radius-scale">
            <span>{MIN_RADIUS} {pendingF.radiusUnit}</span>
            <span>{MAX_RADIUS} {pendingF.radiusUnit}</span>
          </div>
          <div className="ev-filter-unit-toggle">
            {['mi', 'km'].map(u => (
              <button
                key={u}
                type="button"
                className={`ev-filter-unit-btn${pendingF.radiusUnit === u ? ' ev-filter-unit-btn--active' : ''}`}
                onClick={() => setPendingF(p => ({ ...p, radiusUnit: u }))}
              >{u === 'mi' ? 'Miles' : 'KM'}</button>
            ))}
          </div>
        </div>
      )}
      {radiusFilterActive && geoResolving && <p className="ev-filter-geo-status">Locating events…</p>}
      {radiusFilterActive && geoSearchFailed && <p className="ev-filter-geo-status ev-filter-geo-status--error">Couldn't find that location — try a different city, ZIP, or address.</p>}
    </div>
  );
}
