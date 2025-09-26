import React, { useEffect, useState } from 'react';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';
import InlineLoader from '../common/loading/InlineLoader';
import { Link } from 'react-router-dom';

export default function FeaturedCompanies({ setIsLoading }) {
  const [companies, setCompanies] = useState([]);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (typeof setIsLoading === 'function') setIsLoading(true);
        const res = await handleAsync(apiGet(ApiEndpoints.COMPANIES(1, pageSize)));
        if (!mounted) return;
        // Server returns a wrapped payload: res.data => { statusCode, message, data: { paging, companies } }
        const arr = Array.isArray(res?.data?.data?.companies)
          ? res.data.data.companies
          : Array.isArray(res?.data?.companies)
          ? res.data.companies
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        // limit to pageSize
        setCompanies(arr.slice(0, pageSize));
      } catch (e) {
        if (!mounted) return;
        setCompanies([]);
      } finally {
        setLoading(false);
        if (typeof setIsLoading === 'function') setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setIsLoading, pageSize]);

  return (
    <section className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold mb-6 text-[#042852]">Doanh nghiệp tiêu biểu</h2>
        <div>
          <Link to="/companies" className="text-sm text-[#2563eb] font-semibold hover:underline">Xem tất cả</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full">
            <InlineLoader text="Đang tải doanh nghiệp..." />
          </div>
        ) : (
          companies.map(company => (
            <div key={company.companyId || company.id} className="bg-white rounded-xl shadow p-4 items-center border">
              <div className='grid grid-cols-3 grid-flow-col gap-2'>
                <img src={company.logo} alt={company.name} className="w-10 h-10 rounded mb-2 col-span-1" />
                <div className='col-span-2'>
                  <div className="font-semibold mb-1">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.location}</div>
                </div>
              </div>
              <button className="bg-[#E7F0FA] text-[#0A65CC] px-10 py-1 rounded text-xs font-semibold mt-2 hover:text-white hover:bg-blue-500">Đang Tuyển Nhân Viên</button>
            </div>
          ))
        )}
      </div>
      {/* No pagination — showing up to 10 companies */}
    </section>
  );
}