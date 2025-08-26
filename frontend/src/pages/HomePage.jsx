import MainLayout from '../components/layout/MainLayout';

export default function HomePage() {
  // Đổi role để test các layout khác nhau: 'guest', 'employee', 'employer', 'staff', 'admin'
  const role = 'admin';

  return (
    <MainLayout role={role}>
      <div className="max-w-3xl mx-auto text-center mt-16">
        <h1 className="text-4xl font-bold text-[#2563eb] mb-6">Chào mừng đến với WorkVerse!</h1>
        <p className="text-lg text-gray-700 mb-8">
          Đây là trang homepage để kiểm tra giao diện tổng với header, sidebar và footer.<br />
          Bạn có thể đổi biến <span className="font-mono bg-gray-100 px-2 py-1 rounded">role</span> để xem layout cho từng loại người dùng.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-[#2563eb] mb-2">Tìm việc part-time</h2>
            <p className="text-gray-600">Khám phá hàng ngàn công việc bán thời gian phù hợp với bạn.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-[#2563eb] mb-2">Dành cho nhà tuyển dụng</h2>
            <p className="text-gray-600">Đăng tin tuyển dụng, quản lý ứng viên và tìm kiếm nhân sự hiệu quả.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}