import React from 'react';

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

export default function AdminIncomePanel({ chart = {}, className = '' }) {
  return (
    <div className={`bg-white rounded shadow p-4 mb-4 ${className}`}>
      <h3 className="font-semibold mb-2">Thu nhập</h3>
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
              <td className="py-2">{r.date}</td>
              <td>{r.totalRevenue}</td>
              <td>{r.totalTransactions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
