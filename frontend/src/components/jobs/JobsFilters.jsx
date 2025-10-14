import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function JobsFilters(props) {
  const {
    keyword, setKeyword,
    category, setCategory, categories,
    type, setType, types,
    categoriesOptions,
    selectedCategories, setSelectedCategories,
    salaryMin, setSalaryMin, salaryMax, setSalaryMax,
    jobTimeFilter, setJobTimeFilter,
    onApply, onClear
  } = props;

  return (
    <div className="bg-white rounded-xl p-4 shadow border">
      <h3 className="font-semibold text-lg mb-3">Bộ lọc</h3>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Từ khóa</label>
        <input
          value={keyword}
          onChange={({ target: { value } }) => setKeyword(value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Chức danh hoặc công ty"
        />
      </div>

      {/* location filter removed per requirements */}

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Ngành nghề (chọn nhiều)</label>
        <Autocomplete
          multiple
          options={categoriesOptions}
          getOptionLabel={(opt) => opt.name || String(opt)}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          value={categoriesOptions.filter(o => selectedCategories.includes(o.id))}
          onChange={(e, val) => setSelectedCategories(val.map(v => v.id))}
          renderInput={(params) => <TextField {...params} placeholder="Chọn ngành" />}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Lương (VND)</label>
        <div className="flex gap-2">
          <input
            value={salaryMin}
            onChange={({ target: { value } }) => {
              if (value === '') return setSalaryMin('');
              const n = Number(value);
              if (Number.isNaN(n)) return;
              setSalaryMin(String(Math.max(0, n)));
            }}
            className="w-1/2 border rounded px-3 py-2"
            placeholder="Min"
            type="number"
            min="0"
          />
          <input
            value={salaryMax}
            onChange={({ target: { value } }) => {
              if (value === '') return setSalaryMax('');
              const n = Number(value);
              if (Number.isNaN(n)) return;
              setSalaryMax(String(Math.max(0, n)));
            }}
            className="w-1/2 border rounded px-3 py-2"
            placeholder="Max"
            type="number"
            min="0"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Hình thức làm việc</label>
        <select
          value={jobTimeFilter}
          onChange={({ target: { value } }) => setJobTimeFilter(value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Tất cả</option>
          <option value="0">Toàn thời gian</option>
          <option value="1">Bán thời gian</option>
        </select>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button variant="contained" color="primary" fullWidth onClick={onApply || (() => {})}>Áp dụng</Button>
        <Button variant="outlined" fullWidth onClick={onClear}>Xóa</Button>
      </div>
    </div>
  );
}
