import React, { useEffect, useState } from 'react';
import { get as apiGet } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';

// Small, dependency-free SVG line chart for numeric series
function LineChart({ points = [], height = 120, color = '#3b82f6' }) {
  if (!points || points.length === 0) return <div className="text-sm text-gray-500">Không có dữ liệu biểu đồ</div>;
  const dates = points.map(p => p.date);
  const values = points.map(p => Number(p.totalJobs ?? p.TotalJobs ?? p.total_jobs ?? 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const len = values.length;
  const vw = 600; // viewBox width
  const pad = 30;
  const innerW = vw - pad * 2;
  const stepX = innerW / (len - 1 || 1);
  const scaleY = (v) => {
    if (max === min) return height / 2;
    return ((max - v) / (max - min)) * (height - 20) + 10;
  };
  const pointsAttr = values.map((v, i) => `${pad + i * stepX},${scaleY(v)}`).join(' ');
  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${vw} ${height}`} className="w-full h-32">
        <polyline fill="none" stroke={color} strokeWidth="2" points={pointsAttr} strokeLinecap="round" strokeLinejoin="round" />
        {/* markers */}
        {values.map((v, i) => (
          <circle key={i} cx={pad + i * stepX} cy={scaleY(v)} r="2.5" fill={color} />
        ))}
      </svg>
      <div className="flex text-xs text-gray-500 justify-between mt-1">
        <span>{dates[0]}</span>
        <span>{dates[dates.length - 1]}</span>
      </div>
    </div>
  );
}

// Simple bar chart for payments

import AdminIncomePanel from './AdminIncomePanel';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';




export default function OverviewPanel() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const s = await apiGet(ApiEndpoints.ADMIN_STATS);
        if (!mounted) return;
        setStats(s?.data?.data || s?.data || s);

        // request chart without date filters by default (backend may return sensible default)
        const chartRes = await apiGet(ApiEndpoints.ADMIN_CHART);
        if (!mounted) return;
        setChart(chartRes?.data?.data || chartRes?.data || chartRes);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Đang tải...</div>;

  // Normalize user stats: some endpoints return { userStats: { ... } }
  const userStats = stats?.userStats || stats?.user_stats || stats || chart?.userStats || chart?.user_stats || {};
  // Compute job totals from stats first, else from chart arrays
  const jobStatsArray = stats?.jobStats || stats?.job_stats || chart?.jobStats || chart?.job_stats || [];
  const aggregatedJobsTotal = stats?.totalJobs ?? stats?.TotalJobs ?? stats?.jobsTotal ?? stats?.jobTotals ?? null;
  const aggregatedApplicationsTotal = stats?.totalApplications ?? stats?.TotalApplications ?? stats?.applicationsTotal ?? null;

  const jobsTotal = aggregatedJobsTotal != null
    ? aggregatedJobsTotal
    : (Array.isArray(jobStatsArray) ? jobStatsArray.reduce((s, r) => s + (r.totalJobs || r.TotalJobs || 0), 0) : '-');

  const applicationsTotal = aggregatedApplicationsTotal != null
    ? aggregatedApplicationsTotal
    : (Array.isArray(jobStatsArray) ? jobStatsArray.reduce((s, r) => s + (r.applications || r.Applications || 0), 0) : '-');

  const formatNumber = (v) => (v === null || v === undefined || v === '-') ? '-' : v;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 rounded shadow p-4">Người dùng: <div className="font-bold">{formatNumber(userStats?.totalUsers ?? userStats?.TotalUsers ?? userStats?.totalUsersCount ?? '-')}</div></div>
        <div className="bg-green-100 rounded shadow p-4">Việc làm: <div className="font-bold">{formatNumber(jobsTotal)}</div></div>
        <div className="bg-yellow-100 rounded shadow p-4">Ứng tuyển: <div className="font-bold">{formatNumber(applicationsTotal)}</div></div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2">Thống kê người dùng</h3>
        {/* Biểu đồ tròn PieChart */}
        {(() => {
          const totalEmployers = Number(userStats?.totalEmployers ?? userStats?.TotalEmployers ?? 0);
          const totalEmployees = Number(userStats?.totalEmployees ?? userStats?.TotalEmployees ?? 0);
          const pieData = [
            { name: 'Nhà tuyển dụng', value: totalEmployers },
            { name: 'Người tìm việc', value: totalEmployees },
          ];
          const pieColors = ['#1adfaf', '#ae8ff7'];
          // Tính tổng để lấy phần trăm
          const total = totalEmployers + totalEmployees;
          // Hàm hiển thị label phần trăm trên PieChart
          const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return (
              <text x={x} y={y} fill="#222" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight={600}>
                {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
              </text>
            );
          };
          return (
            <div className="w-full flex flex-col sm:flex-row items-center justify-center">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="ml-6 text-sm">
                <li className="flex items-center mb-1">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: pieColors[0] }}></span>
                  Nhà tuyển dụng: <span className="ml-1 font-semibold">{formatNumber(totalEmployers)}</span>
                  {total > 0 && <span className="ml-2 text-xs text-gray-500">({((totalEmployers/total)*100).toFixed(1)}%)</span>}
                </li>
                <li className="flex items-center mb-1">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: pieColors[1] }}></span>
                  Người tìm việc: <span className="ml-1 font-semibold">{formatNumber(totalEmployees)}</span>
                  {total > 0 && <span className="ml-2 text-xs text-gray-500">({((totalEmployees/total)*100).toFixed(1)}%)</span>}
                </li>
                <li className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">Tổng người dùng: </span>
                  <span className="ml-1 font-bold">{formatNumber(userStats?.totalUsers ?? userStats?.TotalUsers ?? '-')}</span>
                </li>
              </ul>
            </div>
          );
        })()}
      </div>
 {/* Shared date filter for job & payment charts */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Từ</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-1 border rounded text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Đến</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-1 border rounded text-sm" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
              onClick={async () => {
                try {
                  setLoading(true);
                  let url = ApiEndpoints.ADMIN_CHART;
                  const params = [];
                  if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
                  if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
                  if (params.length) url = `${url}?${params.join('&')}`;
                  const chartRes = await apiGet(url);
                  setChart(chartRes?.data?.data || chartRes?.data || chartRes);
                } catch (e) {
                  // ignore
                } finally { setLoading(false); }
              }}
            >Áp dụng</button>

            <button
              className="bg-gray-200 px-3 py-1 text-sm rounded"
              onClick={async () => {
                setStartDate(''); setEndDate('');
                try { setLoading(true); const chartRes = await apiGet(ApiEndpoints.ADMIN_CHART); setChart(chartRes?.data?.data || chartRes?.data || chartRes); } catch (e) {} finally { setLoading(false); }
              }}
            >Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Thống kê việc làm (theo ngày)</h3>
        {/* Chart */}
        <div className="mb-3">
          <LineChart points={(chart?.jobStats || jobStatsArray || []).map(r => ({ date: r.date || r.Date, totalJobs: Number(r.totalJobs ?? r.TotalJobs ?? 0) }))} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th>Ngày</th>
              <th>Tổng</th>
              <th>Hoạt động</th>
              <th>Đóng</th>
              <th>Ứng tuyển</th>
            </tr>
          </thead>
          <tbody>
            {(chart?.jobStats || []).map((r) => (
              <tr key={r.date} className="border-t">
                <td className="py-2">{r.date}</td>
                <td>{r.totalJobs}</td>
                <td>{r.activeJobs}</td>
                <td>{r.closedJobs}</td>
                <td>{r.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminIncomePanel chart={chart} />
    </div>
  );
}
