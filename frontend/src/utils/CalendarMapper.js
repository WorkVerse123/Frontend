import { startOfWeek, addDays, setHours, setMinutes } from 'date-fns';
import { DAY_MAP } from './emun/Enum';

/**
 * mapApiTimesToEvents(apiResponse, key, typeLabel)
 * - apiResponse is the object returned from handleAsync(fetch(...))
 * - key: 'jobTimes' | 'busyTimes'
 */
export function mapApiTimesToEvents(apiResponse, key, typeLabel) {
  const arr = apiResponse?.data?.[key] || [];
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return arr.map((it, idx) => {
    // Expect backend dayOfWeek string that maps via DAY_MAP
    const dayIndex = DAY_MAP[it.dayOfWeek];
    const dayOffset = (typeof dayIndex === 'number') ? (dayIndex - 1) : 0;
    const base = addDays(weekStart, dayOffset);
    const [sh, sm] = (it.startTime || '09:00').split(':').map(Number);
    const [eh, em] = (it.endTime || '17:00').split(':').map(Number);
    const start = setMinutes(setHours(base, sh), sm);
    const end = setMinutes(setHours(base, eh), em);
    return {
      id: `${typeLabel}-${it.jobTimeId ?? it.busyTimeId ?? idx}`,
      title: typeLabel === 'job' ? (it.jobTitle || 'Công việc') : 'Bận',
      start,
      end,
      type: typeLabel,
      raw: it,
    };
  });
}