import React, { useState, useEffect } from 'react';
import { get as apiGet } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';

// Simple bar chart for payments (copied from OverviewPanel)
function BarChart({ points = [], height = 120, color = '#10b981' }) {
  if (!points || points.length === 0) return <div className="text-sm text-gray-500">Không có dữ liệu biểu đồ</div>;
  const values = points.map(p => Number(p.totalRevenue ?? p.TotalRevenue ?? p.total_revenue ?? 0));
  const labels = points.map(p => p.date);
  const max = Math.max(...values, 1);
  const vw = 600;
  const pad = 20;
  const innerW = vw - pad * 2;
  const barW = Math.max(8, innerW / values.length - 6);
  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${vw} ${height}`} className="w-full h-32">
        {values.map((v, i) => {
          const x = pad + i * (barW + 6);
          const h = (v / max) * (height - 20);
          const y = height - h - 10;
          return <rect key={i} x={x} y={y} width={barW} height={h} fill={color} />;
        })}
      </svg>
      <div className="flex text-xs text-gray-500 justify-between mt-1">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

export default function AdminIncomePanel({ className = '' }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (start = '', end = '') => {
    try {
      setLoading(true);
      let url = ApiEndpoints.ADMIN_CHART;
      const params = [];
      if (start) params.push(`startDate=${encodeURIComponent(start)}`);
      if (end) params.push(`endDate=${encodeURIComponent(end)}`);
      if (params.length) url = `${url}?${params.join('&')}`;
      const res = await apiGet(url);
      setChart(res?.data?.data || res?.data || res);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    fetchData(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchData('', '');
  };

  return (
    <div className={`bg-white rounded shadow p-4 mb-4 ${className}`}>
      <h3 className="font-semibold mb-2">Doanh thu</h3>
      
      {/* Date Filter */}
      <div className="bg-gray-50 p-3 rounded mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Từ ngày</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="p-1 border rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Đến ngày</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="p-1 border rounded text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
              onClick={handleApply}
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Áp dụng'}
            </button>
            <button
              className="bg-gray-200 px-3 py-1 text-sm rounded hover:bg-gray-300"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <BarChart points={(chart?.paymentStats || []).map(r => ({ date: r.date || r.Date, totalRevenue: Number(r.totalRevenue ?? r.TotalRevenue ?? 0) }))} />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th>Ngày</th>
            <th>Tổng doanh thu</th>
            <th>Giao dịch</th>
          </tr>
        </thead>
        <tbody>
          {(chart?.paymentStats || []).map((r) => (
            <tr key={r.date} className="border-t">
              <td className="py-2">{r.date? (() => { const d = new Date(r.date); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })() : ''}</td>
              <td>{r.totalRevenue}</td>
              <td>{r.totalTransactions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
