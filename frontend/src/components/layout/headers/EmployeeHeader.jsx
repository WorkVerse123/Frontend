export default function EmployeeHeader() {
  return (
    <nav className="flex gap-6 items-center flex-col md:flex-row md:gap-6">
      <a href="#" className="text-white hover:underline text-lg md:text-base py-2 md:py-0 w-full md:w-auto text-center">Việc của tôi</a>
      <a href="#" className="text-white hover:underline text-lg md:text-base py-2 md:py-0 w-full md:w-auto text-center">Thông báo</a>
      <a href="#" className="text-white hover:underline text-lg md:text-base py-2 md:py-0 w-full md:w-auto text-center">Hồ sơ cá nhân</a>
      <a href="#" className="text-[#2563eb] bg-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-lg md:text-base w-full md:w-auto text-center">Đăng xuất</a>
    </nav>
  );
}