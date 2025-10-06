import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import BookmarkButton from '../common/bookmark/BookmarkButton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CandidateProfileModal from './CandidateProfileModal';

/**
 * CandidateCard
 * Uses MUI Card for consistent styling and accessibility.
 */
export default function CandidateCard({ candidate }) {
  const [bookmarked, setBookmarked] = useState(Boolean(candidate?.bookmarked));
  const [openProfile, setOpenProfile] = useState(false);

  const handleToggle = async (next) => {
    // optimistic update
    setBookmarked(Boolean(next));
    try {
      // simulate async API call; replace with real API call later
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch (err) {
      // rollback on error
      setBookmarked((s) => !s);
    }
  };
  return (
    <>
    <Card variant="outlined" className="shadow-sm">
      <CardContent>
        <Box className="flex items-center gap-4">
          <Avatar variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'grey.200' }} />
          <Box className="flex-1">
            <Box className="flex items-center justify-between">
              <div>
                <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
                  {candidate.fullName || candidate.employeeFullName || 'Ứng viên'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {candidate.employeeLocation || candidate.location || ''}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton bookmarked={bookmarked} onToggle={handleToggle} size="small" />
                <Button variant="contained" size="small" color="primary" onClick={() => setOpenProfile(true)}>Xem Hồ Sơ</Button>
              </div>
            </Box>
            {candidate.employeeEducation ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginTop: 0.5 }}>
                Học vấn: {candidate.employeeEducation}
              </Typography>
            ) : null}
            {candidate.gender ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginTop: 0.5 }}>
                Giới tính: {candidate.gender}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </CardContent>
      <CardActions />
    </Card>
  <CandidateProfileModal open={openProfile} onClose={() => setOpenProfile(false)} employeeId={candidate?.employeeId || candidate?.id} />
    </>
  );
}
