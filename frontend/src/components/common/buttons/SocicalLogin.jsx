import { Button } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';

export default function SocialLogin() {
  return (
    <div className="flex gap-3 mt-2">
      <Button
        variant="outlined"
        fullWidth
        startIcon={<FacebookIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 600,
          bgcolor: 'white',
          color: '#2563eb',
          borderColor: '#2563eb',
          '&:hover': { bgcolor: '#eaf2fb', borderColor: '#2563eb' }
        }}
      >
        Đăng ký với Facebook
      </Button>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 600,
          bgcolor: 'white',
          color: '#2563eb',
          borderColor: '#2563eb',
          '&:hover': { bgcolor: '#eaf2fb', borderColor: '#2563eb' }
        }}
      >
        Đăng ký với Google
      </Button>
    </div>
  );
}