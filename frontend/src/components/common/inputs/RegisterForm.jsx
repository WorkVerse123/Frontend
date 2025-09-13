import { useState } from 'react';
import { TextField, Button, IconButton, Checkbox, FormControlLabel, InputAdornment, Select, MenuItem, FormControl, FormHelperText } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';
import SocialLogin from '../buttons/SocicalLogin';

export default function RegisterForm({onShowLogin}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // lưu role dưới dạng roleId: 1 = Ứng Viên, 2 = Nhà Tuyển Dụng
    const [role, setRole] = useState(1);

    // Added states for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [agreed, setAgreed] = useState(false);

    // validation errors
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirm: '',
        agreed: ''
    });

    const validate = () => {
        const next = { name: '', email: '', password: '', confirm: '', agreed: '' };
        if (!name.trim()) next.name = 'Họ và tên là bắt buộc';
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) next.email = 'Email là bắt buộc';
        else if (!emailRe.test(email)) next.email = 'Email không hợp lệ';
        if (!password) next.password = 'Mật khẩu là bắt buộc';
        else if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
        if (!confirm) next.confirm = 'Xác nhận mật khẩu là bắt buộc';
        else if (password !== confirm) next.confirm = 'Mật khẩu không khớp';
        if (!agreed) next.agreed = 'Bạn phải đồng ý với điều khoản';
        setErrors(next);
        // return true nếu không có lỗi
        return !Object.values(next).some(v => v);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            console.error('Validation failed', errors);
            return;
        }
        // gửi roleId thay vì chuỗi
        const data = { name: name.trim(), email: email.trim(), password, roleId: role };
        console.log('Register form data:', data);
        // TODO: replace console.log with API call
    };

    const isSubmitDisabled = !name.trim() || !email.trim() || !password || !confirm || !agreed;
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Tạo tài khoản</h2>
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
                    >
                        <MenuItem value={1}>Ứng Viên</MenuItem>
                        <MenuItem value={2}>Nhà Tuyển Dụng</MenuItem>
                    </Select>
                    {/* role luôn có value mặc định; nếu cần validate role, có thể bật FormHelperText */}
                </FormControl>
            </div>
            <div className="flex gap-2">
                <TextField
                    required
                    label="Họ và tên"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name || ''}
                />
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
                Tạo Tài Khoản
            </Button>
            <div className="flex items-center my-2">
                <span className="flex-1 border-t border-gray-300"></span>
                <span className="mx-2 text-gray-400">hoặc</span>
                <span className="flex-1 border-t border-gray-300"></span>
            </div>
            <SocialLogin />
        </form>
    );
}