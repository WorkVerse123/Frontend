import { useState } from 'react';
import { TextField, Button, IconButton, Checkbox, FormControlLabel, InputAdornment, Select, MenuItem } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';

export default function LoginForm({ onShowRegister, onForgotPassword }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form className="flex flex-col gap-6 w-full">
            <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Đăng nhập</h2>
            <TextField label="Địa chỉ email" variant="outlined" size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }} />
            <div className="relative">
                <TextField
                    label="Mật khẩu"
                    variant="outlined"
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
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
            <button
                type="submit"
                className="bg-[#2563eb] text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Đăng nhập
            </button>
            <div className="flex justify-between items-center mt-4">
                <button 
                type="button" 
                className="text-sm text-[#2563eb] hover:underline" 
                onClick={onForgotPassword}>
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