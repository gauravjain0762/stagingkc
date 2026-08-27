// A ticketed event is "paid" only if at least one ticket tier actually
// charges something — no tickets at all, or every tier priced at 0, both
// count as free (matches the "Free" label used in EventsPage's join flow).
export function isEventFree(ev) {
  if (!ev?.tickets || ev.tickets.length === 0) return true;
  return ev.tickets.every(t => !parseFloat(t.price));
}
