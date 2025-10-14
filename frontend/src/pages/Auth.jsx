import RegisterForm from '../components/common/inputs/RegisterForm';
import LoginForm from '../components/common/inputs/LoginForm';
import ForgotPasswordForm from '../components/common/inputs/ForgotPasswordForm';
import StatsPanel from '../components/auth/StatsPanel';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Auth() {
  const location = useLocation();
  const [formType, setFormType] = useState('login');
  const [initialRole, setInitialRole] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const form = params.get('form');
    const role = params.get('role');
    if (form === 'register') setFormType('register');
    if (role) setInitialRole(Number(role));
  }, [location.search]);
  return (
   <div className="min-h-screen flex flex-col md:flex-row bg-[#eaf2fb] h-screen overflow-hidden">
      {/* Cột trái: Form đăng ký */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl px-6 py-6 sm:px-10 sm:py-4 flex flex-col">
          {formType === 'login' && (
            <LoginForm
              onShowRegister={() => setFormType('register')}
              onForgotPassword={() => setFormType('forgotPassword')}
            />
          )}
          {formType === 'register' && (
            <RegisterForm initialRole={initialRole} onShowLogin={() => setFormType('login')} />
          )}
          {formType === 'forgotPassword' && (
            <ForgotPasswordForm onShowLogin={() => setFormType('login')} />
          )}
        </div>
      </div>
      {/* Cột phải: StatsPanel */}
  <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden bg-[#1a2332]">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`${
                i % 2 === 0 ? 'bg-[#2563eb]/30' : 'bg-[#1a2332]/10'
              }`}
            />
          ))}
        </div>
        <div className="relative z-10">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
}