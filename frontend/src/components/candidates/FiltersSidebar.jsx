import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/**
 * FiltersSidebar
 * Presentational filter controls for candidates list.
 * Uses MUI controls for visual consistency and reliable controlled behavior.
 * Props: query, setQuery, gender, setGender, education, setEducation
 */
export default function FiltersSidebar({ query, setQuery, gender, setGender, education, setEducation, locations, setLocations, onApply, onReset }) {
  // Options for education and locations (numeric keys as string to keep controlled inputs simple)
  const educationOptions = [
    { id: '1', label: 'Trung học phổ thông' },
    { id: '2', label: 'Cao đẳng' },
    { id: '3', label: 'Đại học' },
    { id: '4', label: 'Sau đại học' },
    { id: '5', label: 'Lao động phổ thông / Không bằng cấp' },
  ];

  const locationOptions = [
    { id: '1', label: 'Hà Nội' },
    { id: '2', label: 'Hồ Chí Minh' },
    { id: '3', label: 'Hải Phòng' },
    { id: '4', label: 'Đà Nẵng' },
    { id: '5', label: 'Cần Thơ' },
    { id: '6', label: 'An Giang' },
    { id: '7', label: 'Bà Rịa - Vũng Tàu' },
    { id: '8', label: 'Bắc Giang' },
    { id: '9', label: 'Bắc Ninh' },
    { id: '10', label: 'Bình Dương' },
    { id: '11', label: 'Bình Định' },
    { id: '12', label: 'Bình Phước' },
    { id: '13', label: 'Bình Thuận' },
    { id: '14', label: 'Cà Mau' },
    { id: '15', label: 'Đắk Lắk' },
    { id: '16', label: 'Đắk Nông' },
    { id: '17', label: 'Đồng Nai' },
    { id: '18', label: 'Đồng Tháp' },
    { id: '19', label: 'Gia Lai' },
    { id: '20', label: 'Hà Nam' },
    { id: '21', label: 'Hà Tĩnh' },
    { id: '22', label: 'Hải Dương' },
    { id: '23', label: 'Hòa Bình' },
    { id: '24', label: 'Hưng Yên' },
    { id: '25', label: 'Khánh Hòa' },
    { id: '26', label: 'Kiên Giang' },
    { id: '27', label: 'Kon Tum' },
    { id: '28', label: 'Lâm Đồng' },
    { id: '29', label: 'Long An' },
    { id: '30', label: 'Nam Định' },
    { id: '31', label: 'Nghệ An' },
    { id: '32', label: 'Ninh Bình' },
    { id: '33', label: 'Ninh Thuận' },
    { id: '34', label: 'Phú Thọ' },
  ];

  const genderOptions = [
    { id: '1', label: 'Male' },
    { id: '2', label: 'Female' },
    { id: '3', label: 'Others' },
  ];

  // Helper to render selected labels for multi-select
  const renderSelected = (selected, options) => {
    if (!selected || selected.length === 0) return 'Tất cả';
    return options.filter(o => selected.includes(o.id)).map(o => o.label).join(', ');
  };

  return (
    <aside className="bg-white p-4 rounded shadow-sm">
      <div>
        <FormControl fullWidth>
          <TextField
            size="small"
            label="Tìm nhanh"
            placeholder="Tên, kỹ năng, mô tả..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FormControl>
      </div>

      <div className="mt-4">
        <FormControl fullWidth size="small">
          <InputLabel id="gender-label">Giới tính</InputLabel>
          <Select
            labelId="gender-label"
            label="Giới tính"
            multiple
            value={gender || []}
            onChange={(e) => setGender(Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
            renderValue={(selected) => renderSelected(selected, genderOptions)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value={[]}>Tất cả</MenuItem>
            {genderOptions.map(g => (
              <MenuItem key={g.id} value={g.id}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-4">
        <FormControl fullWidth size="small">
          <InputLabel id="education-label">Trình độ</InputLabel>
          <Select
            labelId="education-label"
            label="Trình độ"
            multiple
            value={education || []}
            onChange={(e) => setEducation(Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
            renderValue={(selected) => renderSelected(selected, educationOptions)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value={[]}>Tất cả</MenuItem>
            {educationOptions.map(ed => (
              <MenuItem key={ed.id} value={ed.id}>{ed.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-4">
        <FormControl fullWidth size="small">
          <InputLabel id="location-label">Tỉnh/Thành</InputLabel>
          <Select
            labelId="location-label"
            label="Tỉnh/Thành"
            multiple
            value={locations || []}
            onChange={(e) => setLocations(Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
            renderValue={(selected) => renderSelected(selected, locationOptions)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value={[]}>Tất cả</MenuItem>
            {locationOptions.map(loc => (
              <MenuItem key={loc.id} value={loc.id}>{loc.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onApply && onApply()}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Áp dụng
        </button>
        <button
          type="button"
          onClick={() => onReset ? onReset() : (setQuery(''), setGender([]), setEducation([]), setLocations([]))}
          className="px-3 py-2 border rounded bg-white text-sm"
        >
          Đặt lại
        </button>
      </div>
    </aside>
  );
}
