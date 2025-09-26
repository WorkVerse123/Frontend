import React from 'react';
import { useLocation } from 'react-router-dom';
import EmployeeProfilePanel from '../components/employee/EmployeeProfilePanel';
import EmployeeProfileForm from '../components/employee/EmployeeProfileForm';

export default function EmployeeProfilePage() {
  const location = useLocation();
  const state = location.state || {};
  const forceCreate = !!state.forceCreate;
  const passedUserId = state.userId || null;

  return (
    <div className="p-6">
      <EmployeeProfileForm userId={passedUserId} mode={forceCreate ? 'create' : 'update'} />
    </div>
  );
}
