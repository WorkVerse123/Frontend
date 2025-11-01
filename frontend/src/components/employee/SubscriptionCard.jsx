import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { formatPrice } from '../../utils/formatPrice';

// Presentational subscription card. Receives plan data and onSelect callback.
export default function SubscriptionCard({ plan, highlighted = false, onSelect = () => {}, isActive = false, onManage = () => {} }) {
  // normalize display values to avoid runtime errors when fields are missing
  const displayPrice = formatPrice(plan?.price ?? 0, plan?.currency ?? 'VND');
  const displayPeriod = plan?.period ?? '';

  return (
    <div className="w-full">
      <div className={`bg-white rounded-lg shadow-sm p-5 flex flex-col h-full relative overflow-hidden ${highlighted ? 'ring-2 ring-[#2563eb] shadow-md' : ''}`} style={{ minWidth: 0 }}>
        <div className="mb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[#042852] truncate">{plan?.name}</h3>
              {(() => {
                // Prefer explicit description; otherwise build a short summary from features
                const rawDesc = plan?.description ?? '';
                let summary = '';
                if (rawDesc && String(rawDesc).trim()) summary = String(rawDesc).trim();
                else {
                  const rawFeatures = plan?.features ?? '';
                  if (Array.isArray(rawFeatures)) summary = rawFeatures.slice(0, 2).join('; ');
                  else if (typeof rawFeatures === 'string') {
                    const parts = rawFeatures.split(/\r?\n|;|,/).map(s => s.trim()).filter(Boolean);
                    summary = parts.slice(0, 2).join('; ');
                  }
                }
                return summary ? <p className="text-sm text-gray-500 mt-1 truncate">{summary}</p> : null;
              })()}
            </div>
            {isActive && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">Đang dùng</span>
            )}
          </div>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <div className="text-3xl font-extrabold text-[#2563eb] leading-none">{displayPrice}</div>
            <div className="text-sm text-gray-500">{displayPeriod}</div>
          </div>
          <div className="w-36">
            <Button
              variant={highlighted ? 'contained' : 'outlined'}
              color={highlighted ? 'primary' : 'inherit'}
              fullWidth
              disabled={plan?.price === 0 || isActive}
              onClick={() => onSelect(plan)}
            >
              {isActive ? 'Đang hoạt động' : (plan?.price === 0 ? 'Gói miễn phí' : 'Chọn gói')}
            </Button>
          </div>
        </div>

        <ul className="flex-1 mb-4 text-sm text-gray-600 space-y-2 overflow-auto">
          {/* normalize features: accept array, newline-separated string, semicolon-separated, comma-separated, or missing */}
          {(() => {
            const raw = plan?.features;
            let features = [];
            if (Array.isArray(raw)) features = raw;
            else if (typeof raw === 'string') {
              if (raw.includes('\n')) features = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
              else if (raw.includes(';')) features = raw.split(';').map(s => s.trim()).filter(Boolean);
              else if (raw.includes(',')) features = raw.split(',').map(s => s.trim()).filter(Boolean);
              else if (raw.trim()) features = [raw.trim()];
            }
            return features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#2563eb] mt-1">•</span>
                <span className="break-words">{f}</span>
              </li>
            ));
          })()}
        </ul>

        {/* allow manage button when active, keep CTA visible at bottom */}
        {/* {isActive && (
          <div className="mt-2">
            <Button variant="outlined" fullWidth onClick={() => onManage(plan)}>Quản lý gói</Button>
          </div>
        )} */}
      </div>
    </div>
  );
}

SubscriptionCard.propTypes = {
  plan: PropTypes.object.isRequired,
  highlighted: PropTypes.bool,
  onSelect: PropTypes.func,
  isActive: PropTypes.bool,
  onManage: PropTypes.func,
};
