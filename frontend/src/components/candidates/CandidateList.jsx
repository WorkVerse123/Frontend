import React from 'react';
import CandidateCard from './CandidateCard';
import Stack from '@mui/material/Stack';

/**
 * CandidateList
 * Uses MUI Stack for vertical spacing between cards.
 */
export default function CandidateList({ items }) {
  if (!items || items.length === 0) {
    return <div className="p-6 text-center text-slate-600">Không có ứng viên phù hợp.</div>;
  }

  return (
    <Stack spacing={2}>
      {items.map((c) => (
        <CandidateCard key={c.employeeId} candidate={c} />
      ))}
    </Stack>
  );
}
