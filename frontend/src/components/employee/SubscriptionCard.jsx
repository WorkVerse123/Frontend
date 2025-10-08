import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { formatPrice } from '../../utils/formatPrice';

// Presentational subscription card. Receives plan data and onSelect callback.
export default function SubscriptionCard({ plan, highlighted = false, onSelect = () => {}, isActive = false, onManage = () => {} }) {
  return (
    <div className={`flex-1 max-w-md mx-auto md:mx-0`}>
      <div className={`bg-white rounded-lg shadow-sm p-6 flex flex-col h-full relative ${highlighted ? 'ring-2 ring-[#2563eb]' : ''}`}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#042852]">{plan.name}</h3>
            {isActive && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Đang dùng</span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#2563eb] mt-2">
            {formatPrice(plan.price, plan.currency || 'VND')}
            <span className="text-base font-medium text-gray-500">{plan.period}</span>
          </div>
        </div>

        <ul className="flex-1 mb-6 text-sm text-gray-600 space-y-2">
          {/* normalize features: accept array, newline-separated string, comma-separated string, or missing */}
          {(() => {
            const raw = plan?.features;
            let features = [];
            if (Array.isArray(raw)) features = raw;
            else if (typeof raw === 'string') {
              if (raw.includes('\n')) features = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
              else if (raw.includes(',')) features = raw.split(',').map(s => s.trim()).filter(Boolean);
              else if (raw.trim()) features = [raw.trim()];
            }
            return features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#2563eb] font-bold">•</span>
                <span>{f}</span>
              </li>
            ));
          })()}
        </ul>

        <div className="mt-auto">
          <Button
            variant={highlighted ? 'contained' : 'outlined'}
            color={highlighted ? 'primary' : 'inherit'}
            fullWidth
            disabled={plan.price === 0 || isActive}
            onClick={() => onSelect(plan)}
          >
            {isActive ? 'Đang hoạt động' : (plan.price === 0 ? 'Gói miễn phí' : 'Chọn gói')}
          </Button>
          {/* {isActive && (
            <div className="mt-3">
              <Button variant="outlined" fullWidth onClick={() => onManage(plan)}>Quản lý gói</Button>
            </div>
          )} */}
        </div>
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
