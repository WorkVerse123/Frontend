export default function GuestEmployeeSidebar({ mobile }) {
  return (
    <nav className={`flex flex-col gap-4 ${mobile ? 'mt-8' : ''}`}>
      <a href="#" className={`text-[#2563eb] font-semibold hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Trang chủ</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tìm việc full-time</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tìm việc part-time</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Việc theo khu vực</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Nhà tuyển dụng nổi bật</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Đăng nhập</a>
      <a href="#" className={`text-white bg-[#2563eb] px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-center ${mobile ? 'text-lg w-full' : ''}`}>Đăng ký</a>
    </nav>
  );
}