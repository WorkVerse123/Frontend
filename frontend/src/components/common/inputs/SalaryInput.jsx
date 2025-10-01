import React from 'react';
import TextField from '@mui/material/TextField';

export default function SalaryInput({ min = '', max = '', onChange, minError = false, maxError = false, minHelper = '', maxHelper = '' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextField
        label="Lương tối thiểu"
        value={min}
        onChange={(e) => onChange(e.target.value, max)}
        fullWidth
        type="number"
        inputProps={{ min: 0 }}
        error={minError}
        helperText={minHelper}
      />
      <TextField
        label="Lương tối đa"
        value={max}
        onChange={(e) => onChange(min, e.target.value)}
        fullWidth
        type="number"
        inputProps={{ min: 0 }}
        error={maxError}
        helperText={maxHelper}
      />
    </div>
  );
}
