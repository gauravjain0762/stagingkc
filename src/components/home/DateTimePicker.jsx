import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DateTimePicker.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function ChevLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function CalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ClockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

export function CustomDatePicker({ value, onChange, min, max, disabled, placeholder = 'Select date', name, hasError }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minDate = min ? (() => { const d = new Date(min + 'T00:00:00'); d.setHours(0,0,0,0); return d; })() : null;
  const maxDate = max ? (() => { const d = new Date(max + 'T00:00:00'); d.setHours(0,0,0,0); return d; })() : null;
  const selected = value ? (() => { const d = new Date(value + 'T00:00:00'); d.setHours(0,0,0,0); return d; })() : null;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    if (value) return new Date(value + 'T00:00:00');
    if (max) return new Date(max + 'T00:00:00');
    if (min) return new Date(min + 'T00:00:00');
    return new Date();
  });
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  // The dropdown itself is portaled to document.body (see below) so it's
  // never a DOM descendant of `ref` — the outside-click handler needs to
  // check both, or a click inside the (portaled) calendar would look like
  // a click "outside" and close it immediately.
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;

    const updatePos = () => {
      const fieldEl = ref.current?.querySelector('.dtp-field');
      if (!fieldEl) return;
      const rect = fieldEl.getBoundingClientRect();
      const dropdownHeight = 360;
      const dropdownWidth = 300;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + 2;
      if (spaceBelow < dropdownHeight + 20) {
        top = rect.top - dropdownHeight - 2;
      }

      // A field near the right edge (e.g. "End date" in a narrow side
      // panel) would otherwise push the fixed-width dropdown past the
      // viewport and get clipped — right-align it to the field instead of
      // letting it overflow.
      let left = rect.left;
      const maxLeft = window.innerWidth - dropdownWidth - 10;
      if (left > maxLeft) left = Math.max(10, rect.right - dropdownWidth);

      setDropdownPos({
        top: Math.max(10, top),
        left: Math.max(10, left),
      });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (value) setView(new Date(value + 'T00:00:00'));
  }, [value]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Facebook-style year jump — a plain prev/next month arrow makes picking an
  // old birth year require dozens of clicks, so expose Month/Year <select>s
  // in the calendar header instead.
  const nowYear = today.getFullYear();
  const minYear = minDate ? minDate.getFullYear() : nowYear - 100;
  const maxYear = maxDate ? maxDate.getFullYear() : nowYear + 10;
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) yearOptions.push(y);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push(date);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  function isDisabled(date) {
    if (!date) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }

  function selectDate(date) {
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    onChange({ target: { name, value: iso } });
    setOpen(false);
  }

  const displayValue = selected
    ? `${SHORT_MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
    : '';

  return (
    <div className={`dtp-wrap${disabled ? ' dtp-wrap--disabled' : ''}`} ref={ref}>
      <div
        className={`dtp-field${open ? ' dtp-field--open' : ''}${hasError ? ' dtp-field--error' : ''}`}
        onClick={() => !disabled && setOpen(v => !v)}
      >
        <CalIcon />
        <span className={`dtp-val${!displayValue ? ' dtp-val--ph' : ''}`}>
          {displayValue || placeholder}
        </span>
        <svg className={`dtp-chevron${open ? ' dtp-chevron--up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      {open && createPortal(
        <div className="dtp-dropdown dtp-dropdown--cal" ref={dropdownRef} style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}>
          <div className="dtp-cal-nav">
            <button type="button" className="dtp-nav-btn" onClick={() => setView(new Date(year, month - 1, 1))}><ChevLeft /></button>
            <div className="dtp-cal-nav-selects">
              <select
                className="dtp-nav-select"
                value={month}
                onChange={(e) => setView(new Date(year, Number(e.target.value), 1))}
                aria-label="Month"
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select
                className="dtp-nav-select dtp-nav-select--year"
                value={year}
                onChange={(e) => setView(new Date(Number(e.target.value), month, 1))}
                aria-label="Year"
              >
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button type="button" className="dtp-nav-btn" onClick={() => setView(new Date(year, month + 1, 1))}><ChevRight /></button>
          </div>
          <div className="dtp-day-names">
            {DAYS.map(d => <span key={d} className="dtp-day-name">{d}</span>)}
          </div>
          <div className="dtp-grid">
            {cells.map((date, i) => {
              if (!date) return <span key={i} className="dtp-cell dtp-cell--empty" />;
              const dis = isDisabled(date);
              const isSel = selected && date.toDateString() === selected.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              return (
                <button
                  key={i}
                  className={`dtp-cell${isSel ? ' dtp-cell--sel' : ''}${isToday && !isSel ? ' dtp-cell--today' : ''}${dis ? ' dtp-cell--dis' : ''}`}
                  disabled={dis}
                  onClick={() => selectDate(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {selected && (
            <div className="dtp-footer">
              <button className="dtp-clear-btn" type="button" onClick={() => { onChange({ target: { name, value: '' } }); setOpen(false); }}>Clear</button>
              <span className="dtp-selected-label">{displayValue}</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export function CustomTimePicker({ value, onChange, disabled, placeholder = 'Select time', name, min }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hrScrollRef = useRef(null);
  const minScrollRef = useRef(null);
  // Same fix as CustomDatePicker: this dropdown used to rely on plain CSS
  // (`position: fixed; right: 0`) to sit under its own field, which only
  // works when no ancestor has a `transform` — the step-wizard's slide
  // animation leaves one behind via `animation-fill-mode: both`, which was
  // making every open time field's dropdown render at the same fixed spot
  // instead of under whichever field (Start Time vs End Time) was actually
  // clicked. Portal to document.body with an explicit computed position,
  // same approach as the calendar dropdown.
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const updatePos = () => {
      const fieldEl = ref.current?.querySelector('.dtp-field');
      if (!fieldEl) return;
      const rect = fieldEl.getBoundingClientRect();
      const dropdownWidth = 240;
      const dropdownHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + 2;
      if (spaceBelow < dropdownHeight + 20) top = rect.top - dropdownHeight - 2;

      // Right-aligned to the field by default (matches the old CSS
      // `right: 0` intent), clamped so it never runs off either edge.
      let left = rect.right - dropdownWidth;
      const maxLeft = window.innerWidth - dropdownWidth - 10;
      left = Math.min(Math.max(10, left), maxLeft);

      setDropdownPos({ top: Math.max(10, top), left });
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const parsed = value ? value.split(':').map(Number) : [null, null];
  const [selH, selM] = parsed;

  const minParsed = min ? min.split(':').map(Number) : null;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  function isHourDis(h) {
    if (!minParsed) return false;
    return h < minParsed[0];
  }
  function isMinDis(m) {
    if (!minParsed || selH === null) return false;
    if (selH > minParsed[0]) return false;
    if (selH === minParsed[0]) return m < minParsed[1];
    return true;
  }

  function select(h, m) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    onChange({ target: { name, value: `${hh}:${mm}` } });
  }

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      if (hrScrollRef.current) {
        const target = hrScrollRef.current.querySelector('.dtp-time-item--sel') || hrScrollRef.current.querySelector('.dtp-time-item:not(.dtp-time-item--dis)');
        target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      if (minScrollRef.current) {
        const target = minScrollRef.current.querySelector('.dtp-time-item--sel') || minScrollRef.current.querySelector('.dtp-time-item:not(.dtp-time-item--dis)');
        target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 60);
  }, [open]);

  const displayValue = value ? (() => {
    const h = selH;
    const m = selM;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  })() : '';

  return (
    <div className={`dtp-wrap${disabled ? ' dtp-wrap--disabled' : ''}`} ref={ref}>
      <div
        className={`dtp-field${open ? ' dtp-field--open' : ''}`}
        onClick={() => !disabled && setOpen(v => !v)}
      >
        <ClockIcon />
        <span className={`dtp-val${!displayValue ? ' dtp-val--ph' : ''}`}>
          {displayValue || placeholder}
        </span>
        <svg className={`dtp-chevron${open ? ' dtp-chevron--up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      {open && createPortal(
        <div className="dtp-dropdown dtp-dropdown--time" ref={dropdownRef} style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}>
          <div className="dtp-time-header">
            <span>Hour</span>
            <span>Minute</span>
          </div>
          <div className="dtp-time-cols">
            <div className="dtp-time-scroll" ref={hrScrollRef}>
              {hours.map(h => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 === 0 ? 12 : h % 12;
                const dis = isHourDis(h);
                const sel = selH === h;
                return (
                  <button
                    key={h}
                    type="button"
                    className={`dtp-time-item${sel ? ' dtp-time-item--sel' : ''}${dis ? ' dtp-time-item--dis' : ''}`}
                    disabled={dis}
                    onClick={() => select(h, selM ?? 0)}
                  >
                    <span className="dtp-time-num">{String(h12).padStart(2,'0')}</span>
                    <span className="dtp-time-ampm">{ampm}</span>
                  </button>
                );
              })}
            </div>
            <div className="dtp-time-divider" />
            <div className="dtp-time-scroll" ref={minScrollRef}>
              {minutes.map(m => {
                const dis = isMinDis(m);
                const sel = selM !== null && selM === m;
                return (
                  <button
                    key={m}
                    type="button"
                    className={`dtp-time-item${sel ? ' dtp-time-item--sel' : ''}${dis ? ' dtp-time-item--dis' : ''}`}
                    disabled={dis}
                    onClick={() => select(selH ?? 0, m)}
                  >
                    <span className="dtp-time-num">:{String(m).padStart(2,'0')}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {value && (
            <div className="dtp-footer">
              <button className="dtp-clear-btn" type="button" onClick={() => { onChange({ target: { name, value: '' } }); setOpen(false); }}>Clear</button>
              <span className="dtp-selected-label">{displayValue}</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
