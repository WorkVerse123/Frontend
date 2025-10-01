import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format, parse, setHours, setMinutes } from 'date-fns';
import { parseDDMMYYYYToISO } from '../utils/formatDate';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { handleAsync } from '../utils/HandleAPIResponse';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import EventDialog from '../components/calendar/EventDialog';
import CalendarBoard from '../components/calendar/CalendarBoard';
import { mapApiTimesToEvents } from '../utils/calendarMapper';



export default function WorkCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), start: '09:00', end: '10:00', type: 'busy' });

    // move hook call here (hooks must be called at top-level of component)
    const { user } = useAuth();

    useEffect(() => {
        let mounted = true;
            setLoading(true);
            const ac = new AbortController();
            Promise.all([
                    (async () => { const { get: apiGet } = await import('../services/ApiClient'); const ApiEndpoints = (await import('../services/ApiEndpoints')).default; return handleAsync(apiGet(ApiEndpoints.JOBS + '/times', { signal: ac.signal })); })(),
                    (async () => { const { get: apiGet } = await import('../services/ApiClient'); const ApiEndpoints = (await import('../services/ApiEndpoints')).default; const empId = user?.employeeId ?? user?._raw?.EmployeeId ?? null; if (!empId) return []; return handleAsync(apiGet(ApiEndpoints.EMPLOYEE_BUSY_TIMES(empId), { signal: ac.signal })); })(),
            ]).then(([jobsRes, busyRes]) => {
                if (!mounted) return;
                const jobEvents = mapApiTimesToEvents(jobsRes?.data || jobsRes, 'jobTimes', 'job');
                const busyEvents = mapApiTimesToEvents(busyRes?.data || busyRes, 'busyTimes', 'busy');
                setEvents([...jobEvents, ...busyEvents]);
            }).catch(err => {
                console.error(err);
            }).finally(() => mounted && setLoading(false));
            return () => { mounted = false; ac.abort(); };
    }, [user]);

    // normalize role from auth (user is provided by the top-level useAuth call above)
    const normalizeRole = (r) => {
        if (!r) return 'guest';
        if (typeof r === 'number') {
            if (r === 1) return 'admin';
            if (r === 2) return 'staff';
            if (r === 3) return 'employer';
            if (r === 4) return 'employee';
            return 'guest';
        }
        if (typeof r === 'string') return r.toLowerCase();
        if (typeof r === 'object') {
            const id = r.roleId || r.RoleId || r.role_id || r.roleID;
            if (id) return normalizeRole(Number(id));
            const name = r.role || r.roleName || r.role_name;
            if (name) return String(name).toLowerCase();
        }
        return 'guest';
    };
    const normalizedRole = normalizeRole(user?.roleId || user);

    const eventStyleGetter = (event) => {
        const base = { borderRadius: 8, padding: '4px 6px', color: '#fff' };
        if (event.type === 'job') return { style: { ...base, backgroundColor: '#2563eb' } };
        return { style: { ...base, backgroundColor: '#f59e0b' } };
    };

    const openDialog = (slotInfo) => {
        // không cho mở dialog nếu slot được chọn nằm trong quá khứ
        if (slotInfo?.start) {
            const now = new Date();
            if (slotInfo.start.getTime() < now.getTime()) {
                alert('Không thể thêm lịch bận cho thời gian đã qua.');
                return;
            }
            const date = format(slotInfo.start, 'yyyy-MM-dd');
            const st = format(slotInfo.start, 'HH:mm');
            const ed = format(slotInfo.end, 'HH:mm');
            setForm(f => ({ ...f, date, start: st, end: ed }));
        }
        setDialogOpen(true);
    };

    const parseHM = (s = '') => {
        const [h = 0, m = 0] = String(s).split(':').map(Number);
        return h * 60 + m;
    };

    const combineDateTime = (dateStr, timeStr) =>
        parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());

    const isStartInPast = () => {
        if (!form.date || !form.start) return false;
        const startDt = combineDateTime(form.date, form.start);
        return startDt.getTime() < Date.now();
    };

    const isTimeRangeValid = () => {
        if (!form.start || !form.end || !form.date) return false;
        const startMinutes = parseHM(form.start);
        const endMinutes = parseHM(form.end);
        if (!(startMinutes < endMinutes)) return false;
        // không cho start trong quá khứ
        if (isStartInPast()) return false;
        return true;
    };

    const saveForm = async () => {
        // build Dates
        // normalize date: accept ISO (YYYY-MM-DD) or dd/mm/yyyy from the dialog helper
        let dateIso = form.date;
        if (dateIso && dateIso.indexOf('/') !== -1) {
            const parsed = parseDDMMYYYYToISO(dateIso);
            if (parsed) dateIso = parsed;
        }
        const [sh, sm] = form.start.split(':').map(Number);
        const [eh, em] = form.end.split(':').map(Number);
        const base = parse(dateIso, 'yyyy-MM-dd', new Date());
        const start = setMinutes(setHours(base, sh), sm);
        const end = setMinutes(setHours(base, eh), em);
        // luôn tạo event kiểu "busy"
        const newEvent = {
            id: `local-${Date.now()}`,
            title: form.title || 'Bận',
            start, end, type: 'busy',
        };
        setEvents(e => [...e, newEvent]);
        // format payload for API: top-level busyTimes array
        const payload = {
            busyTimes: [
                {
                    dayOfWeek: format(base, 'EEEE'), // e.g. "Monday"
                    startTime: form.start, // "HH:mm"
                    endTime: form.end
                }
            ]
        };
        console.log('POST payload:', JSON.stringify(payload, null, 2));
        // Try to POST to the API if we have an employee id from auth
        try {
            const empId = user?.employeeId ?? user?._raw?.EmployeeId ?? null;
            if (empId) {
                const { post } = await import('../services/ApiClient');
                const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
                const res = await handleAsync(post(ApiEndpoints.EMPLOYEE_BUSY_TIMES(empId), payload));
                console.log('Saved busy times response:', res);
            } else {
                console.warn('No employee id available, skipped POST to EMPLOYEE_BUSY_TIMES');
            }
        } catch (err) {
            console.error('Failed to POST busy times:', err);
        } finally {
            setDialogOpen(false);
        }
    };

    const onSaveClick = () => {
        if (!isTimeRangeValid()) {
            // show quick feedback
            alert('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.');
            return;
        }
        saveForm();
    };

    return (
        <MainLayout role={normalizedRole} hasSidebar={false}>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">Lịch công việc</h2>
                        <div>
                            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>Thêm sự kiện</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow p-4">
                        {loading ? (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white bg-opacity-100">
                                <Loading />
                            </div>
                        ) : (
                            <CalendarBoard
                                events={events}
                                onSelectSlot={openDialog}
                                onSelectEvent={(e) => {
                                    setForm({
                                        title: e.title,
                                        date: format(e.start, 'yyyy-MM-dd'),
                                        start: format(e.start, 'HH:mm'),
                                        end: format(e.end, 'HH:mm'),
                                        type: 'busy'
                                    });
                                    setDialogOpen(true);
                                }}
                                eventStyleGetter={eventStyleGetter}
                                height={650}
                            />
                        )}
                    </div>
                </div>
            </div>

            <EventDialog
                open={dialogOpen}
                value={form}
                onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))}
                onClose={() => setDialogOpen(false)}
                onSave={onSaveClick}
                isTimeRangeValid={isTimeRangeValid}
                isStartInPast={isStartInPast}
            />
        </MainLayout>
    );
}