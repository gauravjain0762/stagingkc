import { useState } from 'react';
import './MiniSiteCalendarPage.css';

function ChevronLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}

function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_HEIGHT = 80;
const GRID_START = 9;

const DEMO_EVENTS = [
  { id: 1, title: 'Team Meeting', startDate: '2026-09-03', startTime: '10:00', endTime: '11:00', category: 'Meeting', color: 'blue' },
  { id: 2, title: 'Project Discussion', startDate: '2026-09-03', startTime: '14:00', endTime: '15:30', category: 'Meeting', color: 'teal' },
  { id: 3, title: 'Design Review', startDate: '2026-09-04', startTime: '09:00', endTime: '10:00', category: 'Review', color: 'slate' },
  { id: 4, title: 'Client Call', startDate: '2026-09-05', startTime: '15:00', endTime: '16:00', category: 'Call', color: 'red' },
  { id: 5, title: 'Budget Planning', startDate: '2026-09-08', startTime: '13:00', endTime: '14:00', category: 'Planning', color: 'blue' },
  { id: 6, title: 'Product Launch', startDate: '2026-09-10', startTime: '11:00', endTime: '12:30', category: 'Launch', color: 'teal' },
];

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDays(monday) {
  return WEEK_DAY_NAMES.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    return { label, date: d.getDate(), isToday, iso: toISODate(d) };
  });
}

function formatWeekRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${MONTH_NAMES[monday.getMonth()]} ${monday.getDate()} — ${sunday.getDate()}, ${monday.getFullYear()}`;
}

function formatHourLabel(h) {
  if (h === 12) return '12:00 PM';
  if (h > 12) return `${String(h - 12).padStart(2, '0')}:00 PM`;
  return `${String(h).padStart(2, '0')}:00 AM`;
}

function fmtT(h, m) {
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(dh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseHM(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return { h, m: Number.isNaN(m) ? 0 : m };
}

function evTop(sH, sM) {
  return ((sH - GRID_START) + sM / 60) * HOUR_HEIGHT;
}

function evH(sH, sM, eH, eM) {
  return ((eH * 60 + eM) - (sH * 60 + sM)) / 60 * HOUR_HEIGHT;
}

function getMonthGrid(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ day: prevTotal - i, current: false, isToday: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({
      day: d,
      current: true,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === d,
    });
  let next = 1;
  while (cells.length < 42) cells.push({ day: next++, current: false, isToday: false });
  return cells;
}

function buildWeekEvents(events, weekDays) {
  const out = [];
  for (const ev of events) {
    const dayIdx = weekDays.findIndex(d => d.iso === ev.startDate);
    if (dayIdx === -1) continue;
    const start = parseHM(ev.startTime) ?? { h: GRID_START, m: 0 };
    const endRaw = parseHM(ev.endTime);
    const end = endRaw ?? { h: start.h + 1, m: start.m };
    out.push({
      id: ev.id,
      dayIdx,
      title: ev.title,
      sH: Math.max(start.h, GRID_START),
      sM: start.h < GRID_START ? 0 : start.m,
      eH: Math.min(end.h, GRID_START + HOURS.length),
      eM: end.h > GRID_START + HOURS.length ? 0 : end.m,
      realStartH: start.h,
      realStartM: start.m,
      realEndH: end.h,
      realEndM: end.m,
      color: ev.color || 'blue',
    });
  }
  return out;
}

function formatMonthHeader(date) {
  return `${MONTH_NAMES[date.getMonth()]}, ${date.getFullYear()}`;
}

function buildMonthEvents(events, year, month) {
  const out = [];
  for (const ev of events) {
    if (!ev.startDate) continue;
    const s = new Date(ev.startDate + 'T00:00');
    if (isNaN(s) || s.getFullYear() !== year || s.getMonth() !== month) continue;
    out.push({
      id: ev.id,
      title: ev.title,
      startDay: s.getDate(),
      color: ev.color || 'blue',
    });
  }
  return out;
}

export default function MiniSiteCalendarPage({ siteName }) {
  const [view, setView] = useState('week');
  const [monday, setMonday] = useState(getMondayOf(new Date()));
  const [monthDate, setMonthDate] = useState(new Date());

  const weekDays = getWeekDays(monday);
  const weekEvents = buildWeekEvents(DEMO_EVENTS, weekDays);
  const monthGrid = getMonthGrid(monthDate.getFullYear(), monthDate.getMonth());
  const monthWeeks = Array.from({ length: 6 }, (_, i) => monthGrid.slice(i * 7, i * 7 + 7));
  const monthEvents = buildMonthEvents(DEMO_EVENTS, monthDate.getFullYear(), monthDate.getMonth());

  const headerLabel = view === 'week' ? formatWeekRange(monday) : formatMonthHeader(monthDate);

  function prevPeriod() {
    if (view === 'week') {
      const d = new Date(monday);
      d.setDate(d.getDate() - 7);
      setMonday(d);
    } else {
      const d = new Date(monthDate);
      d.setMonth(d.getMonth() - 1);
      setMonthDate(d);
    }
  }

  function nextPeriod() {
    if (view === 'week') {
      const d = new Date(monday);
      d.setDate(d.getDate() + 7);
      setMonday(d);
    } else {
      const d = new Date(monthDate);
      d.setMonth(d.getMonth() + 1);
      setMonthDate(d);
    }
  }

  return (
    <div className="msg-cal-page">
      <div className="msg-cal-header">
        <h1 className="msg-cal-title">Calendar</h1>
        <div className="msg-cal-header-row">
          <div className="msg-cal-view-toggle">
            <button className={`msg-cal-view-btn${view === 'week' ? ' msg-cal-view-btn--active' : ''}`} onClick={() => setView('week')}>Week</button>
            <button className={`msg-cal-view-btn${view === 'month' ? ' msg-cal-view-btn--active' : ''}`} onClick={() => setView('month')}>Month</button>
          </div>
          <div className="msg-cal-date-nav">
            <button className="msg-cal-arrow-btn" onClick={prevPeriod}><ChevronLeftIcon /></button>
            <span className="msg-cal-date-range">{headerLabel}</span>
            <button className="msg-cal-arrow-btn" onClick={nextPeriod}><ChevronRightIcon /></button>
          </div>
        </div>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="msg-cal-grid-wrap">
          <div className="msg-cal-col-headers">
            <div className="msg-cal-time-header">TIME</div>
            {weekDays.map((d, i) => (
              <div key={i} className={`msg-cal-day-header${d.isToday ? ' msg-cal-day-header--today' : ''}`}>
                <span className="msg-cal-day-label">{d.label}</span>
                <span className={`msg-cal-day-num${d.isToday ? ' msg-cal-day-num--today' : ''}`}>{d.date}</span>
              </div>
            ))}
          </div>
          <div className="msg-cal-body">
            <div className="msg-cal-time-col">
              {HOURS.map(h => (
                <div key={h} className="msg-cal-time-cell"><span>{formatHourLabel(h)}</span></div>
              ))}
            </div>
            <div className="msg-cal-days-area">
              {weekDays.map((d, dayIdx) => (
                <div key={dayIdx} className={`msg-cal-day-col${d.isToday ? ' msg-cal-day-col--today' : ''}`}>
                  {weekEvents.filter(ev => ev.dayIdx === dayIdx).map(ev => (
                    <div
                      key={ev.id}
                      className={`msg-cal-event msg-cal-event--${ev.color}`}
                      style={{
                        top: evTop(ev.sH, ev.sM),
                        height: evH(ev.sH, ev.sM, ev.eH, ev.eM),
                      }}
                    >
                      <p className="msg-cal-ev-title">{ev.title}</p>
                      <p className="msg-cal-ev-time">{fmtT(ev.realStartH, ev.realStartM)} –<br />{fmtT(ev.realEndH, ev.realEndM)}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="msg-cal-month-wrap">
          <div className="msg-cal-month-col-hdr">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="msg-cal-month-col-hdr-cell">{d}</div>
            ))}
          </div>
          <div className="msg-cal-month-body">
            {monthWeeks.map((week, wi) => (
              <div key={wi} className="msg-cal-month-week">
                {week.map((cell, ci) => (
                  <div key={ci} className={`msg-cal-month-cell${cell.isToday ? ' msg-cal-month-cell--today' : ''}${!cell.current ? ' msg-cal-month-cell--other' : ''}`}>
                    <span className={`msg-cal-month-num${cell.isToday ? ' msg-cal-month-num--today' : ''}`}>{cell.day}</span>
                    <div className="msg-cal-month-events">
                      {monthEvents
                        .filter(ev => ev.startDay === cell.day)
                        .slice(0, 2)
                        .map(ev => (
                          <div key={ev.id} className={`msg-cal-month-ev msg-cal-month-ev--${ev.color}`}>
                            <span className="msg-cal-month-ev-title">{ev.title}</span>
                          </div>
                        ))}
                      {monthEvents.filter(ev => ev.startDay === cell.day).length > 2 && (
                        <div className="msg-cal-month-ev-more">+{monthEvents.filter(ev => ev.startDay === cell.day).length - 2} more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
