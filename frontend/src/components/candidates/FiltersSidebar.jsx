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
export default function FiltersSidebar({ query, setQuery, gender, setGender, education, setEducation }) {
  return (
    <aside className="bg-white p-4 rounded shadow-sm">
      <div>
        <FormControl fullWidth>
          <TextField
            size="small"
            label="Tìm nhanh"
            placeholder="Tên, vị trí, địa điểm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FormControl>
      </div>

      <div className="mt-4">
        <FormControl component="fieldset">
          <FormLabel component="legend" className="text-xs text-slate-600">Giới tính</FormLabel>
          <RadioGroup
            aria-label="gender"
            name="gender-group"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <FormControlLabel value="any" control={<Radio size="small" />} label="Tất cả" />
            <FormControlLabel value="male" control={<Radio size="small" />} label="Nam" />
            <FormControlLabel value="female" control={<Radio size="small" />} label="Nữ" />
          </RadioGroup>
        </FormControl>
      </div>

      <div className="mt-4">
        <FormControl fullWidth size="small">
          <InputLabel id="education-label">Trình độ</InputLabel>
          <Select
            labelId="education-label"
            label="Trình độ"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="any">Tất cả</MenuItem>
            <MenuItem value="THPT">THPT</MenuItem>
            <MenuItem value="Đại học">Đại học</MenuItem>
            <MenuItem value="Cao đẳng">Cao đẳng</MenuItem>
          </Select>
        </FormControl>
      </div>
    </aside>
  );
}
