import React, { useEffect, useState } from 'react';

export default function FeaturedCompanies({setIsLoading}) {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let mounted = true;
    import('../../services/MocksService')
      .then((M) => M.fetchMock('/mocks/JSON_DATA/responses/get_featured_companies.json'))
      .then(parsed => {
        if (!mounted) return;
        // If the mock returns { data: { companies: [...] } }, use that; otherwise fall back to array shapes
        const arr = Array.isArray(parsed?.data?.companies)
          ? parsed.data.companies
          : Array.isArray(parsed?.data)
          ? parsed.data
          : Array.isArray(parsed)
          ? parsed
          : [];
        console.log('Featured companies:', arr);
        setCompanies(arr);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setCompanies([]);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [setIsLoading]);

  return (
    <section className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-[#042852]">Doanh nghiệp tiêu biểu</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {companies.map(company => (
          <div key={company.companyId} className="bg-white rounded-xl shadow p-4 items-center border">
            <div className='grid grid-cols-3 grid-flow-col gap-2'>
              <img src={company.logo} alt={company.name} className="w-10 h-10 rounded mb-2 col-span-1" />
              <div className='col-span-2'>
                <div className="font-semibold mb-1">{company.name}</div>
                <div className="text-sm text-gray-500">{company.location}</div>
              </div>
            </div>
            <button className="bg-[#E7F0FA] text-[#0A65CC] px-10 py-1 rounded text-xs font-semibold mt-2 hover:text-white hover:bg-blue-500">Đang Tuyển Nhân Viên</button>
          </div>
        ))}
      </div>
    </section>
  );
}