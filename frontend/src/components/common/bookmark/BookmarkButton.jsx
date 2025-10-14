import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * BookmarkButton
 * Reusable bookmark toggle button.
 * Props:
 * - bookmarked: boolean - current state
 * - onToggle: async function(newState) or sync function
 * - size: 'small'|'medium'
 * - disabled: boolean
 * - tooltip: boolean
 */
export default function BookmarkButton({ bookmarked = false, onToggle, size = 'small', disabled = false, tooltip = true }) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (disabled || loading) return;
    if (typeof onToggle !== 'function') return;
    try {
      setLoading(true);
      // allow onToggle to be async or sync
      await onToggle(!bookmarked);
    } finally {
      setLoading(false);
    }
  };

  const icon = loading ? (
    <CircularProgress size={18} />
  ) : bookmarked ? (
    <BookmarkIcon fontSize={size === 'small' ? 'small' : 'medium'} />
  ) : (
    <BookmarkBorderIcon fontSize={size === 'small' ? 'small' : 'medium'} />
  );

  const button = (
    <IconButton
      size={size}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
    >
      {icon}
    </IconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}>
        {button}
      </Tooltip>
    );
  }
  return button;
}
