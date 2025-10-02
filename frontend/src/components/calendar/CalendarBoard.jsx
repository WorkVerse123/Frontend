import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS, 'vi': vi };
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
// You can pass a `culture` prop (e.g. 'vi' or 'en-US'). Default is 'vi'.
export default function CalendarBoard({
  events = [], loading = false,
  onSelectSlot = () => {}, onSelectEvent = () => {},
  eventStyleGetter = () => ({}), height = 650,
  culture = 'vi',
}) {
  if (loading) return null;
  // Vietnamese translations for built-in toolbar and labels
  const messages = {
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    allDay: 'Cả ngày',
    week: 'Tuần',
    work_week: 'Tuần làm việc',
    day: 'Ngày',
    month: 'Tháng',
    previous: 'Trước',
    next: 'Tiếp',
    yesterday: 'Hôm qua',
    tomorrow: 'Ngày mai',
    today: 'Hôm nay',
    agenda: 'Lịch',
    showMore: total => `+${total} thêm`
  };
  return (
    <Calendar
      localizer={localizer}
      culture={culture}
      messages={messages}
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