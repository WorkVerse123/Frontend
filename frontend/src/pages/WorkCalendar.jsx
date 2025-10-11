import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format, parse, setHours, setMinutes } from 'date-fns';
import { parseDDMMYYYYToISO } from '../utils/formatDate';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Snackbar, Alert } from '@mui/material';
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = (msg, severity = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // move hook call here (hooks must be called at top-level of component)
    const { user } = useAuth();

    useEffect(() => {
        let mounted = true;
            setLoading(true);
            const ac = new AbortController();
        Promise.all([
            // no jobs fetch in this build; supply empty placeholder so destructuring stays stable
            Promise.resolve([]),
            (async () => { const { get: apiGet } = await import('../services/ApiClient'); const ApiEndpoints = (await import('../services/ApiEndpoints')).default; const empId = user?.employeeId ?? user?._raw?.EmployeeId ?? null; if (!empId) return []; return handleAsync(apiGet(ApiEndpoints.EMPLOYEE_BUSY_TIMES(empId), { signal: ac.signal })); })(),
        ]).then(([jobsRes, busyRes]) => {
                if (!mounted) return;
                const jobEvents = mapApiTimesToEvents(jobsRes?.data || jobsRes, 'jobTimes', 'job');
                // busyRes may include explicit dates (YYYY-MM-DD). Map each busy item to a calendar event
                const busyList = busyRes?.data?.data ?? busyRes?.data ?? busyRes ?? [];
                const busyEvents = Array.isArray(busyList) ? busyList.map((b, i) => {
                    const dateStr = b.date || b.day || '';
                    const startRaw = (b.startTime || b.start || '00:00:00').slice(0,5); // 'HH:mm'
                    const endRaw = (b.endTime || b.end || '23:59:59').slice(0,5);
                    let startDt = null;
                    let endDt = null;
                    try {
                        startDt = parse(`${dateStr} ${startRaw}`, 'yyyy-MM-dd HH:mm', new Date());
                        endDt = parse(`${dateStr} ${endRaw}`, 'yyyy-MM-dd HH:mm', new Date());
                    } catch (e) {
                        const base = parse(dateStr, 'yyyy-MM-dd', new Date());
                        const [sh = 0, sm = 0] = String(startRaw).split(':').map(v => Number(v) || 0);
                        const [eh = 0, em = 0] = String(endRaw).split(':').map(v => Number(v) || 0);
                        startDt = setMinutes(setHours(base, sh), sm);
                        endDt = setMinutes(setHours(base, eh), em);
                    }
                    // Ensure valid dates
                    if (!startDt || !endDt) return null;
                    return {
                        id: b.busyTimeId ?? b.id ?? `busy-${i}-${dateStr}`,
                        title: b.title || 'Bận',
                        start: startDt,
                        end: endDt,
                        type: 'busy',
                        raw: b,
                    };
                }).filter(Boolean) : [];
                // debug: log counts to help diagnose missing events in UI
                // debug removed
                // debug removed
                setEvents([...jobEvents, ...busyEvents]);
            }).catch(err => {
                // debug removed
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
                showSnackbar('Không thể thêm lịch bận cho thời gian đã qua.', 'error');
                return;
            }
            const date = format(slotInfo.start, 'yyyy-MM-dd');
            const st = format(slotInfo.start, 'HH:mm');
            const ed = format(slotInfo.end, 'HH:mm');
            // Reset any existing id/raw when opening for a new slot so Delete won't appear
            setForm({ title: '', date, start: st, end: ed, type: 'busy' });
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
        // Include explicit ISO date (yyyy-MM-dd) and send times with seconds (HH:mm:ss)
        // so the server receives a concrete date instead of inferring from dayOfWeek.
        const payload = {
            busyTimes: [
                {
                    // date the busy slot applies to (server expects YYYY-MM-DD in many endpoints)
                    date: format(base, 'yyyy-MM-dd'),
                    // keep dayOfWeek for backward compatibility if needed by the API
                    dayOfWeek: format(base, 'EEEE'), // e.g. "Monday"
                    // send full time with seconds
                    startTime: `${form.start}:00`, // "HH:mm:00"
                    endTime: `${form.end}:00`,
                    title: form.title || 'Bận'
                }
            ]
        };
        // Try to POST to the API if we have an employee id from auth
        try {
            const empId = user?.employeeId ?? user?._raw?.EmployeeId ?? null;
            if (empId) {
                const { post } = await import('../services/ApiClient');
                const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
                const res = await handleAsync(post(ApiEndpoints.EMPLOYEE_BUSY_TIMES(empId), payload));
                // debug removed
            } else {
                // debug removed
            }
        } catch (err) {
            // debug removed
        } finally {
            setDialogOpen(false);
        }
    };

    const onSaveClick = () => {
        if (!isTimeRangeValid()) {
            // show quick feedback
            showSnackbar('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.', 'error');
            return;
        }
        saveForm();
    };

    const deleteBusyTime = async () => {
        // derive busy id from form.raw or form.id
        const serverBusyId = form?.raw?.busyTimeId ?? form?.raw?.id ?? null;
        const localId = form?.id ?? null; // id assigned to local events

        // Nothing to delete: neither server id nor local id
        if (!serverBusyId && !localId) {
            showSnackbar('Không có lịch để xóa.', 'error');
            return;
        }

        // If it's only a local event (no server id), remove that specific event
        if (!serverBusyId && localId) {
            setEvents(ev => ev.filter(e => e.id !== localId));
            setDialogOpen(false);
            showSnackbar('Đã xóa lịch bận (local)', 'success');
            return;
        }

        const busyId = serverBusyId;
        const empId = user?.employeeId ?? user?._raw?.EmployeeId ?? null;
        if (!empId) {
            showSnackbar('Không có employee id, không thể xóa lịch bận trên server.', 'error');
            return;
        }
        try {
            const { del } = await import('../services/ApiClient');
            const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
            const res = await handleAsync(del(ApiEndpoints.EMPLOYEE_BUSY_TIME(empId, busyId)));
            // debug removed
            // remove matching events
            setEvents(ev => ev.filter(e => {
                const bid = e?.raw?.busyTimeId ?? e?.raw?.id ?? e?.id;
                if (bid == null) return true;
                return String(bid) !== String(busyId);
            }));
            // clear form to avoid stale delete button if dialog remains open
            setForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), start: '09:00', end: '10:00', type: 'busy' });
            showSnackbar('Đã xóa lịch bận', 'success');
        } catch (err) {
            // debug removed
            showSnackbar('Xóa lịch bận thất bại', 'error');
        } finally {
            setDialogOpen(false);
        }
    };

    // If dialog is open for an event that was deleted from `events`, close and clear it.
    useEffect(() => {
        if (!dialogOpen) return;
        const currentId = form?.id ?? null;
        if (!currentId) return;
        const stillExists = events.some(e => {
            const bid = e?.raw?.busyTimeId ?? e?.raw?.id ?? e?.id;
            return String(bid) === String(currentId) || String(e?.id) === String(currentId);
        });
        if (!stillExists) {
            // event was removed from state, close dialog and clear form to keep UI consistent
            setDialogOpen(false);
            setForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), start: '09:00', end: '10:00', type: 'busy' });
            showSnackbar('Sự kiện đã bị xóa.', 'info');
        }
    }, [events, dialogOpen, form?.id]);

    return (
        <MainLayout role={normalizedRole} hasSidebar={false}>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">Lịch công việc</h2>
                        {/* <div>
                            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>Thêm sự kiện</Button>
                        </div> */}
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
                                    // include raw and id so we can delete server-side busy times if present
                                    setForm({
                                        title: e.title,
                                        date: format(e.start, 'yyyy-MM-dd'),
                                        start: format(e.start, 'HH:mm'),
                                        end: format(e.end, 'HH:mm'),
                                        type: 'busy',
                                        raw: e.raw ?? null,
                                        id: e.id,
                                    });
                                    setDialogOpen(true);
                                }}
                                eventStyleGetter={eventStyleGetter}
                                height={650}
                                culture={'vi'}
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
                onDelete={deleteBusyTime}
                isTimeRangeValid={isTimeRangeValid}
                isStartInPast={isStartInPast}
            />

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
}