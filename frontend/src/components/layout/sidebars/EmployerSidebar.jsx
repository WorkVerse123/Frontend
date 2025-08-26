// START: EmployerSidebar.jsx
export default function EmployerSidebar({ mobile }) {
  return (
    <nav className={`flex flex-col gap-4 ${mobile ? 'mt-8' : ''}`}>
      <a href="#" className={`text-[#2563eb] font-semibold hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Trang chủ</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Quản lý tin tuyển dụng</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tìm ứng viên</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Danh sách ứng viên</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Công việc đã đăng</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tài khoản công ty</a>
      <a href="#" className={`text-white bg-[#2563eb] px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-center ${mobile ? 'text-lg w-full' : ''}`}>Đăng xuất</a>
      </nav>
  );
}
// END: EmployerSidebar.jsx