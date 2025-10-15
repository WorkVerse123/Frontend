import { useState, useEffect } from 'react';
import { TextField, Button, IconButton, Checkbox, InputAdornment, Select, MenuItem, FormControl, FormHelperText, FormControlLabel } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmailVerification from '../../auth/EmailVerification';
import { OtpPurpose } from '../../../utils/emun/Enum';

export default function RegisterForm({ onShowLogin, initialRole = 1 }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // role ids used by backend: 4 = Ứng Viên (candidate), 3 = Nhà Tuyển Dụng (employer)
    // support older initialRole values (1/2) by mapping: 1 -> 4, 2 -> 3
    const normalizeInitialRole = (r) => {
        if (!r) return 4;
        const num = Number(r);
        if (num === 1) return 4;
        if (num === 2) return 3;
        if (num === 3 || num === 4) return num;
        return 4;
    };
    const [role, setRole] = useState(normalizeInitialRole(initialRole));

    // update if initialRole changes (e.g., from query param)
    useEffect(() => {
        setRole(normalizeInitialRole(initialRole));
    }, [initialRole]);

    // Added states for form fields
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const navigate = useNavigate();
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [otpError, setOtpError] = useState('');

    // validation errors
    const [errors, setErrors] = useState({
        email: '',
        phoneNumber: '',
        password: '',
        confirm: '',
        agreed: ''
    });

    const validate = () => {
        const next = { email: '', phoneNumber: '', password: '', confirm: '', agreed: '' };
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) next.email = 'Email là bắt buộc';
        else if (!emailRe.test(email)) next.email = 'Email không hợp lệ';
        if (!password) next.password = 'Mật khẩu là bắt buộc';
        else if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
        if (!confirm) next.confirm = 'Xác nhận mật khẩu là bắt buộc';
        else if (password !== confirm) next.confirm = 'Mật khẩu không khớp';
        if (!agreed) next.agreed = 'Bạn phải đồng ý với điều khoản';
        if (!phoneNumber || String(phoneNumber).trim().length < 6) next.phoneNumber = 'Số điện thoại là bắt buộc';
        setErrors(next);
        // return true nếu không có lỗi
        return !Object.values(next).some(v => v);
    };

    const handleSendOtp = async () => {
        setLoading(true);
        setOtpError('');
        try {
            // Gửi OTP thực sự qua API
            const res = await post(ApiEndpoints.OTP_REQUEST, { email, purpose: OtpPurpose.AccountVerification });
            if (res.data.statusCode !== 200) {
                setOtpError(res.data.message || 'Không gửi được OTP. Vui lòng thử lại.');
                return;
            }
            setShowVerifyModal(true);
        } catch (err) {
            setOtpError(
                err?.response?.data?.message ||
                err?.message ||
                'Không gửi được OTP. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        // Khi chưa xác thực OTP thì gửi OTP và mở modal xác thực
        handleSendOtp();
    };

    const isSubmitDisabled = !email.trim() || !phoneNumber.trim() || !password || !confirm || !agreed || loading;

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Tạo tài khoản</h2>
                {submitError && <div className="text-sm text-red-600 text-center">{submitError}</div>}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                        Bạn đã có tài khoản?
                        <button
                            type="button"
                            className="text-blue-700 font-semibold underline"
                            onClick={onShowLogin}
                        >
                            Đăng Nhập
                        </button>
                    </span>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                        <Select
                            value={role}
                            onChange={e => setRole(Number(e.target.value))}
                            displayEmpty
                            sx={{ bgcolor: 'white', borderRadius: 2, fontWeight: 600 }}
                            inputProps={{ 'aria-label': 'role' }}
                            MenuProps={{ disableScrollLock: true }}
                        >
                            <MenuItem value={4}>Ứng Viên</MenuItem>
                            <MenuItem value={3}>Nhà Tuyển Dụng</MenuItem>
                        </Select>
                        {/* role luôn có value mặc định; nếu cần validate role, có thể bật FormHelperText */}
                    </FormControl>
                </div>

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
                <div className="flex gap-2">
                    <TextField
                        required
                        label="Số điện thoại"
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ bgcolor: 'white', borderRadius: 2 }}
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber || ''}
                    />
                </div>
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
                <TextField
                    required
                    label="Xác nhận mật khẩu"
                    variant="outlined"
                    size="small"
                    type={showConfirm ? 'text' : 'password'}
                    fullWidth
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    error={!!errors.confirm}
                    helperText={errors.confirm || ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                <div>
                    <FormControl error={!!errors.agreed} component="fieldset" variant="standard">
                        <FormControlLabel
                            control={<Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} />}
                            label={<span className="text-[#2563eb] text-sm">Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật</span>}
                        />
                        {errors.agreed && <FormHelperText>{errors.agreed}</FormHelperText>}
                    </FormControl>
                </div>
                {otpError && (
                    <div className="text-sm text-red-600 text-center mb-2">{otpError}</div>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    endIcon={<ArrowForward />}
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
                    {loading ? 'Đang tạo...' : 'Xác thực Email'}
                </Button>
                {/* <div className="flex items-center my-2">
                <span className="flex-1 border-t border-gray-300"></span>
                <span className="mx-2 text-gray-400">hoặc</span>
                <span className="flex-1 border-t border-gray-300"></span>
            </div> */}
                {/* <SocialLogin /> */}

            </form>
            {showVerifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <EmailVerification
                            email={email}
                            purpose={OtpPurpose.AccountVerification}
                            registerPayload={{
                                email: email.trim(),
                                phoneNumber: String(phoneNumber).trim(),
                                password,
                                roleId: Number(role),
                                status: 'active'
                            }}
                            initialMessage={"Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư."}
                        />
                    </div>
                </div>
            )}

        </>
    );
}