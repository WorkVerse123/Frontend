import React, { useEffect, useState, cloneElement } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography } from '@mui/material';
import useSubscriptionPlans from '../../hooks/useSubscriptionPlans';
import { formatPrice } from '../../utils/formatPrice';
import JobForm from '../common/inputs/JobForm';

export default function CreateJobWithSubscription({ onCreated = () => {}, children = null }) {
  const [open, setOpen] = useState(false);
  const hookRes = (typeof useSubscriptionPlans === 'function') ? useSubscriptionPlans() : { plans: [], loading: false };
  // Hook may initialize plans as null; coerce to array to avoid runtime errors when mapping
  const plansList = Array.isArray(hookRes.plans) ? hookRes.plans : (hookRes.plans ? Object.values(hookRes.plans) : []);
  const plansLoading = !!hookRes.loading;

  // Filter out falsy/null items and normalize a safe array for rendering
  const safePlans = Array.isArray(plansList) ? plansList.filter(Boolean) : [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle(''); setDescription(''); setSalaryMin(''); setSalaryMax(''); setSelectedPlan(''); setSubmitting(false);
    }
  }, [open]);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      // Build a local job object. Integration with backend can be added by replacing this with an API call.
      const job = {
        jobId: `tmp-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        status: 'open',
        featured: false,
        createdAt: new Date().toISOString(),
        packageId: selectedPlan || null,
      };

      // Notify parent page so it can insert/update state or call API
      onCreated(job);
      closeDialog();
    } finally {
      setSubmitting(false);
    }
  };

  // If children provided, use it as trigger. Otherwise render a default button.
  const trigger = children ? (
    cloneElement(children, { onClick: openDialog })
  ) : (
    <Button variant="contained" color="primary" onClick={openDialog}>Tạo Tin Tuyển</Button>
  );

  return (
    <>
      {trigger}

  <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth ModalProps={{ disableScrollLock: true }}>
        <DialogTitle>Tạo tin tuyển dụng</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <JobForm packageId={selectedPlan} onSuccess={(res) => {
              // JobForm returns API response; try to extract created job object
              let job = res?.data || res || null;
              // If API didn't include packageId in response, augment with selectedPlan so parent state reflects chosen package
              if (job && selectedPlan && !(job.packageId || job.package_id || job.package)) {
                job = { ...job, packageId: selectedPlan, package_id: selectedPlan };
              }
              if (job) onCreated(job);
              closeDialog();
            }} />

            {/* <FormControl fullWidth>
              <InputLabel id="plan-select-label">Gói dịch vụ</InputLabel>
              <Select
                labelId="plan-select-label"
                value={selectedPlan}
                label="Gói dịch vụ"
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                {plansLoading && <MenuItem value="">Đang tải...</MenuItem>}
                {!plansLoading && safePlans.length === 0 && <MenuItem value="">Không có gói</MenuItem>}
                {safePlans.map(p => {
                  const keyVal = p?.plan_id ?? p?.id ?? p?.planId ?? p?.name ?? '';
                  const label = p?.plan_name ?? p?.name ?? p?.title ?? 'Gói';
                  const priceLabel = p?.price ? formatPrice(p.price, p?.currency || p?.currencyCode || 'VND') : (p?.price_display ?? '');
                  return (
                    <MenuItem key={String(keyVal)} value={keyVal}>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-gray-500">{priceLabel}</span>
                      </div>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Typography variant="caption" color="textSecondary">Chọn gói nếu bạn muốn đăng kèm dịch vụ nổi bật hoặc tính phí.</Typography> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
