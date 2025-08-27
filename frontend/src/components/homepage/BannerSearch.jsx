export default function BannerSearch() {
  return (
    <section className="w-full bg-white pt-8 pb-6 border-b">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">
        <div className="flex-1 text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#042852]">
            Tìm công việc phù hợp<br />với sở thích và <span className="text-[#2563eb]">kỹ năng</span> của bạn.
          </h1>
          <p className="text-gray-600 mb-6">Chào mừng đến với WorkVerse</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Chức danh công việc, từ khóa, công ty"
              className="border rounded-lg px-4 py-2 flex-1"
            />
            <input
              type="text"
              placeholder="Địa điểm"
              className="border rounded-lg px-4 py-2 flex-1"
            />
            <button className="bg-[#2563eb] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Tìm Việc
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}