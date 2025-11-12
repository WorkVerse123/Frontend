import { useState } from 'react';
import { TextField, Button, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';
import { post } from '../../../services/ApiClient';
import ApiEndpoints from '../../../services/ApiEndpoints';
import { handleAsync } from '../../../utils/HandleAPIResponse';
import { setCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onShowRegister, onForgotPassword }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({ email: '', password: '' });
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const validate = () => {
        const next = { email: '', password: '' };
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) next.email = 'Email là bắt buộc';
        else if (!emailRe.test(email)) next.email = 'Email không hợp lệ';
        if (!password) next.password = 'Mật khẩu là bắt buộc';
        setErrors(next);
        return !Object.values(next).some(v => v);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;
        setLoading(true);
        const payload = { email: email.trim(), password};
        try {
            // Use handleAsync to normalize responses
            const result = await handleAsync(post(ApiEndpoints.LOGIN, payload));
            if (!result.success) {
                setSubmitError(result.message || 'Đăng nhập thất bại');
                setLoading(false);
                return;
            }

            const data = result.data;

            // server may return shapes like: 'token', { data: 'token' }, { token, user }, { data: { userId, token } }
            const serverData = (data && typeof data === 'object' && data.data !== undefined) ? data.data : data;

            // Resolve token when serverData is a string or contains token fields
            const resolvedToken = typeof serverData === 'string' ? serverData : (serverData && (serverData.token || serverData.accessToken)) || null;

            // Prefer explicit user object when provided by server (try multiple places)
            let user = null;
            if (data && typeof data === 'object') {
                user = data.user || data.userData || data?.data?.user || null;
            }
            if (!user && serverData && typeof serverData === 'object') {
                if ('id' in serverData || 'email' in serverData || 'userId' in serverData) user = serverData;
            }

            // Small helper to decode JWT payload safely
            const parseJwtPayload = (t) => {
                if (!t || typeof t !== 'string') return null;
                try {
                    const parts = t.split('.');
                    if (parts.length < 2) return null;
                    const payload = parts[1];
                    const json = decodeURIComponent(atob(payload).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    return JSON.parse(json);
                } catch (e) {
                    try { return JSON.parse(atob((t.split('.')[1] || ''))); } catch (_) { return null; }
                }
            };

            // If no explicit user provided, try parse token payload to obtain user info
            if (!user && resolvedToken) {
                const payload = parseJwtPayload(resolvedToken);
                if (payload) user = payload;
            }

            // Normalize user object: ensure employeeId/employerId and RoleId + role name
            if (user && typeof user === 'object') {
                // Normalize numeric ids: backend may send "0" when absent — treat <=0 as null
                const EmployeeRaw = user.EmployeeId ?? user.employeeId ?? user.EmployeeID ?? user.employee_id ?? null;
                const EmployerRaw = user.EmployerId ?? user.employerId ?? user.EmployerID ?? user.employer_id ?? null;
                const rawRoleId = user.RoleId ?? user.roleId ?? user.role ?? user.Role ?? user.role_id ?? null;

                const toPositiveIntOrNull = (v) => {
                    if (v === null || v === undefined) return null;
                    const n = Number(v);
                    return Number.isFinite(n) && n > 0 ? n : null;
                };

                const EmployeeId = toPositiveIntOrNull(EmployeeRaw);
                const EmployerId = toPositiveIntOrNull(EmployerRaw);
                const roleId = rawRoleId != null ? Number(rawRoleId) : null;

                const mapRole = (id) => {
                    switch (id) {
                        case 1: return 'admin';
                        case 2: return 'staff';
                        case 3: return 'employer';
                        case 4: return 'employee';
                        case 8: return 'finance';
                        default: return 'guest';
                    }
                };

                // Determine role by presence of positive employeeId/employerId first
                let finalRole = 'guest';
                let finalRoleId = roleId;
                if (EmployeeId !== null) { finalRole = 'employee'; finalRoleId = finalRoleId || 4; }
                else if (EmployerId !== null) { finalRole = 'employer'; finalRoleId = finalRoleId || 3; }
                else finalRole = mapRole(roleId);

                user = { ...user, employeeId: EmployeeId, employerId: EmployerId, roleId: finalRoleId, role: finalRole };
            }

            // Persist token cookie
            if (resolvedToken) setCookie('token', resolvedToken, 7);

            // Persist user cookie when available and update in-memory auth
            if (user) {
                try { setCookie('user', JSON.stringify(user), 7); } catch (e) { /* ignore */ }
                try { setUser(user); } catch (e) { /* ignore */ }
            }

            // Nếu là employee/employer mà chưa có profile thì chuyển sang trang tạo profile
            if (user && user.role === 'employee' && (!user.employeeId || user.employeeId <= 0)) {
                navigate('/employee/profile', { state: { forceCreate: true, userId: user.id || user.userId } });
                return;
            }
            if (user && user.role === 'employer' && (!user.employerId || user.employerId <= 0)) {
                navigate('/employer/profile', { state: { forceCreate: true, userId: user.id || user.userId } });
                return;
            }
            // Navigate to home (no full reload)
            navigate('/');
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Có lỗi khi đăng nhập';
            setSubmitError(message);
        } finally {
            setLoading(false);
        }
    };

    const isSubmitDisabled = !email.trim() || !password || loading;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Đăng nhập</h2>
            {submitError && <div className="text-sm text-red-600 text-center">{submitError}</div>}
            <TextField
                required
                label="Địa chỉ email"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: 2 }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email || ''}
            />
            <div className="relative">
                <TextField
                    required
                    label="Mật khẩu"
                    variant="outlined"
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </div>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />}
                disabled={isSubmitDisabled}
                sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: 16,
                    borderRadius: 2,
                    boxShadow: 2,
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' }
                }}
            >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
            <div className="flex justify-between items-center mt-4">
                <button
                    type="button"
                    className="text-sm text-[#2563eb] hover:underline"
                    onClick={onForgotPassword}
                >
                    Quên mật khẩu?
                </button>
                <span className="text-sm text-gray-500">Chưa có tài khoản?
                    <button
                        type="button"
                        className='text-blue-700 font-semibold underline'
                        onClick={onShowRegister}
                    >
                        Đăng ký
                    </button>
                </span>
            </div>
        </form>
    );
}