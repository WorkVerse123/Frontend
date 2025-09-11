import React from 'react';

export default function SavedJobs({ items = [], onOpen = () => {}, onRemove = () => {} }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">Công việc đã lưu</div>
        <div className="text-sm text-gray-500">Tổng {items.length}</div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <div className="text-sm text-gray-500">Bạn chưa lưu công việc nào.</div>}

        {items.map(b => (
          <div key={b.bookmarkId || b.bookmark_id} className="flex items-center justify-between bg-white border rounded px-3 py-3">
            <div>
              <div className="font-semibold">{b.jobTitle || b.title || 'Không có tiêu đề'}</div>
              <div className="text-sm text-gray-500">{b.jobLocation || ''} • {b.jobCategory || ''}</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => onOpen(b)} className="text-sm px-3 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600">Chi tiết</button>
              <button onClick={() => onRemove(b)} className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded">Bỏ lưu</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
