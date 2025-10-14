export default function StaffAdminSidebar({ isAdmin = false, mobile }) {
  return (
    <nav className={`flex flex-col gap-4 ${mobile ? 'mt-8' : ''}`}>
      <a href="#" className={`text-[#2563eb] font-semibold hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Dashboard</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý việc part-time</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý ứng viên</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý nhà tuyển dụng</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý bài đăng</a>
      {isAdmin && (
        <>
          <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý nhân sự</a>
          <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý hệ thống</a>
          <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Báo cáo & thống kê</a>
        </>
      )}
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tài khoản</a>
      <a href="#" className={`text-white bg-[#2563eb] px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-center ${mobile ? 'text-lg w-full' : ''}`}>Đăng xuất</a>
    </nav>
  );
}