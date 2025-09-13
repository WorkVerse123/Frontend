import { useState } from 'react';
import { TextField, Button, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';

export default function LoginForm({ onShowRegister, onForgotPassword }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({ email: '', password: '' });

    const validate = () => {
        const next = { email: '', password: '' };
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) next.email = 'Email là bắt buộc';
        else if (!emailRe.test(email)) next.email = 'Email không hợp lệ';
        if (!password) next.password = 'Mật khẩu là bắt buộc';
        setErrors(next);
        return !Object.values(next).some(v => v);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            console.error('Validation failed', errors);
            return;
        }
        const data = { email: email.trim(), password };
        console.log('Login form data:', data);
        // TODO: gọi API login ở đây
    };

    const isSubmitDisabled = !email.trim() || !password;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Đăng nhập</h2>
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
                Đăng nhập
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