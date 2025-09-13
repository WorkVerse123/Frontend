import { useState, useEffect } from 'react';

export default function PlatformSteps() {
  // check auth from cookies (token or user)
  const getAuthFromCookie = () => {
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .some(c => c.startsWith('token=') || c.startsWith('user='));
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => getAuthFromCookie());

  useEffect(() => {
    let last = document.cookie;
    const id = setInterval(() => {
      if (document.cookie !== last) {
        last = document.cookie;
        setIsLoggedIn(getAuthFromCookie());
      }
    }, 1000);
    const onFocus = () => setIsLoggedIn(getAuthFromCookie());
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (isLoggedIn) return null;
  
  return (
    <section className="bg-white py-8 border-t">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Nền Tảng <span className="text-[#2563eb]">WorkVerse</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {/* ...Các bước như mẫu... */}
          <div>
            <div className="bg-[#eaf2fb] rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-[#2563eb] text-2xl font-bold">1</div>
            <div className="font-semibold mb-1">Tạo tài khoản</div>
            <div className="text-gray-500 text-sm">Chỉ mất 1 phút để bắt đầu. Đăng ký miễn phí, an toàn, bảo mật.</div>
          </div>
          <div>
            <div className="bg-[#eaf2fb] rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-[#2563eb] text-2xl font-bold">2</div>
            <div className="font-semibold mb-1">Tải lên Hồ sơ cá nhân</div>
            <div className="text-gray-500 text-sm">Giới thiệu bản thân và kỹ năng để gây ấn tượng với nhà tuyển dụng.</div>
          </div>
          <div>
            <div className="bg-[#eaf2fb] rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-[#2563eb] text-2xl font-bold">3</div>
            <div className="font-semibold mb-1">Tìm công việc phù hợp</div>
            <div className="text-gray-500 text-sm">Lọc công việc theo sở thích, kỹ năng, mức lương mong muốn, địa điểm.</div>
          </div>
          <div>
            <div className="bg-[#eaf2fb] rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-[#2563eb] text-2xl font-bold">4</div>
            <div className="font-semibold mb-1">Ứng tuyển nhanh chóng</div>
            <div className="text-gray-500 text-sm">Chỉ với một cú click, gửi hồ sơ ứng tuyển ngay lập tức.</div>
          </div>
        </div>
      </div>
    </section>
  );
}