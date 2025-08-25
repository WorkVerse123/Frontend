import { useState } from 'react';
import { TextField, Button } from '@mui/material';

export default function ForgotPasswordForm({ onShowLogin }) {
  const [email, setEmail] = useState('');

  return (
    <form className="flex flex-col gap-6 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Quên mật khẩu</h2>
      <TextField
        type="email"
        label="Nhập địa chỉ email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        variant="outlined"
        size="small"
        fullWidth
        sx={{ bgcolor: 'white', borderRadius: 2 }}
        required
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          fontWeight: 'bold',
          py: 1.5,
          borderRadius: 2,
          bgcolor: '#2563eb',
          '&:hover': { bgcolor: '#1d4ed8' }
        }}
      >
        Gửi yêu cầu lấy lại mật khẩu
      </Button>
      <div className="flex justify-center mt-4">
        <Button
          type="button"
          variant="text"
          className="text-blue-700 font-semibold underline"
          onClick={onShowLogin}
        >
          Quay lại đăng nhập
        </Button>
      </div>
    </form>
  );
}