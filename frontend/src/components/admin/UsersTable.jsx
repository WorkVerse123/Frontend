import React, { useEffect, useState } from 'react';
import { get as apiGet, put as apiPut } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiGet(ApiEndpoints.ADMIN_USERS + '?pageNumber=1&pageSize=50');
        const data = res?.data || res;
        const items = data?.data || data?.items || data || [];
        if (mounted) setUsers(Array.isArray(items) ? items : items.items || []);
      } catch (e) {
        console.error('Load admin users failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await apiPut(ApiEndpoints.ADMIN_USER_STATUS(user.userId || user.id), { newStatus });
      setUsers(users.map(u => u.userId === user.userId ? { ...u, status: newStatus } : u));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-4 text-gray-500">Đang tải người dùng...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-gray-600">
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId || u.id} className="border-t">
              <td className="py-2">{u.userId || u.id}</td>
              <td className="py-2">{u.email}</td>
              <td className="py-2">{u.role || u.roleName || u.roleId}</td>
              <td className="py-2">{u.status || 'unknown'}</td>
              <td className="py-2">
                <button onClick={() => toggleStatus(u)} className="text-sm text-blue-600 underline">Toggle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
