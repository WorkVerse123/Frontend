import { useState } from 'react';
import { TextField, Button, IconButton, Checkbox, FormControlLabel, InputAdornment, Select, MenuItem } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';
import SocialLogin from '../buttons/SocicalLogin';

export default function RegisterForm({onShowLogin}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [role, setRole] = useState('Ứng Viên');

    return (
        <div className="flex flex-col gap-4 w-full">
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
                <Select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'white', minWidth: 110, borderRadius: 2, fontWeight: 600 }}
                >
                    <MenuItem value="Ứng Viên">Ứng Viên</MenuItem>
                    <MenuItem value="Nhà Tuyển Dụng">Nhà Tuyển Dụng</MenuItem>
                </Select>
            </div>
            <div className="flex gap-2">
                <TextField label="Họ và tên" variant="outlined" size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }} />
            </div>
            <TextField label="Địa chỉ email" variant="outlined" size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }} />
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
            <TextField
                label="Xác nhận mật khẩu"
                variant="outlined"
                size="small"
                type={showConfirm ? 'text' : 'password'}
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: 2 }}
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
            <FormControlLabel
                control={<Checkbox />}
                label={<span className="text-[#2563eb] text-sm">Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật</span>}
            />
            <Button
                variant="contained"
                color="primary"
                fullWidth
                endIcon={<ArrowForward />}
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
        </div>
    );
}