import { useState } from 'react';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <form className="flex flex-col gap-6 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#2563eb] text-center">Đổi mật khẩu</h2>
      <TextField
        label="Mật khẩu hiện tại"
        variant="outlined"
        size="small"
        type={showOld ? 'text' : 'password'}
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        fullWidth
        sx={{ bgcolor: 'white', borderRadius: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowOld(v => !v)} edge="end">
                {showOld ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <TextField
        label="Mật khẩu mới"
        variant="outlined"
        size="small"
        type={showNew ? 'text' : 'password'}
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        fullWidth
        sx={{ bgcolor: 'white', borderRadius: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNew(v => !v)} edge="end">
                {showNew ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
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
        Đổi mật khẩu
      </Button>
    </form>
  );
}