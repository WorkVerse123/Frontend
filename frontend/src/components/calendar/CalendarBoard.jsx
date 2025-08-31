import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

/**
 * Props:
 * - events, loading, onSelectSlot, onSelectEvent, eventStyleGetter, height
 */
export default function CalendarBoard({
  events = [], loading = false,
  onSelectSlot = () => {}, onSelectEvent = () => {},
  eventStyleGetter = () => ({}), height = 650,
}) {
  if (loading) return null;
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height }}
      eventPropGetter={eventStyleGetter}
      selectable
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
    />
  );
}