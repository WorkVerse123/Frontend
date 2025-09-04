import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SalaryInput from '../../../components/common/inputs/SalaryInput';
import RichTextEditor from '../../../pages/creates/CreateJob/RichTextEditor';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';

const MOCK_PATH = '/mocks/JSON_DATA/requests/post_employer_id_job.json';

export default function JobForm() {
  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    jobRequirements: '',
    jobLocation: '',
    jobSalaryMin: '',
    jobSalaryMax: '',
    jobSalaryCurrency: 'VND',
    jobTime: 'hours',
    jobCreateAt: new Date(),
    jobExpireAt: new Date(),
    jobStatus: 'opened',
  });

  // No mock fetch here — form starts from initial state and will POST current state on submit.
  // If you want dev-only prefill, fetch only when process.env.NODE_ENV === 'development'.

  function onChange(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleAsync(payload) {
    try {
      // Thay bằng endpoint thực tế của bạn
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      alert('Tạo tin thành công');
      return data;
    } catch (err) {
      console.error(err);
      alert('Tạo tin thất bại: ' + err.message);
      throw err;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const now = new Date();
    const payload = {
      ...form,
      // jobCreateAt luôn lấy thời điểm hiện tại khi tạo
      jobCreateAt: now.toISOString(),
      jobExpireAt: form.jobExpireAt ? form.jobExpireAt.toISOString() : null,
    };
    console.log('Submitting job:', payload);
    await handleAsync(payload);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Tiêu đề"
          value={form.jobTitle}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="Địa điểm"
          value={form.jobLocation}
          onChange={(e) => onChange('jobLocation', e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="currency-label">Loại tiền</InputLabel>
          <Select
            labelId="currency-label"
            label="Loại tiền"
            value={form.jobSalaryCurrency}
            onChange={(e) => onChange('jobSalaryCurrency', e.target.value)}
          >
            <MenuItem value="VND">VND</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="AUD">AUD</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="time-label">Đơn vị thời gian</InputLabel>
          <Select
            labelId="time-label"
            label="Đơn vị thời gian"
            value={form.jobTime}
            onChange={(e) => onChange('jobTime', e.target.value)}
          >
            <MenuItem value="hours">hours</MenuItem>
            <MenuItem value="days">days</MenuItem>
            <MenuItem value="months">months</MenuItem>
          </Select>
        </FormControl>
      </div>

      <SalaryInput
        min={form.jobSalaryMin}
        max={form.jobSalaryMax}
        onChange={(min, max) => {
          onChange('jobSalaryMin', min);
          onChange('jobSalaryMax', max);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl fullWidth>
          <InputLabel id="status-label">Trạng thái</InputLabel>
          <Select
            labelId="status-label"
            label="Trạng thái"
            value={form.jobStatus}
            onChange={(e) => onChange('jobStatus', e.target.value)}
          >
            <MenuItem value="opened">Opened</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Hạn nộp hồ sơ"
            value={form.jobExpireAt}
            onChange={(val) => onChange('jobExpireAt', val)}
            disablePast
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mô tả công việc</label>
        <RichTextEditor
          value={form.jobDescription}
          onChange={(val) => onChange('jobDescription', val)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Yêu cầu / Trách nhiệm</label>
        <RichTextEditor
          value={form.jobRequirements}
          onChange={(val) => onChange('jobRequirements', val)}
        />
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="contained" color="primary" type="submit">
          Đăng Tin
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setForm((s) => ({ ...s, jobTitle: '', jobDescription: '' }));
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
