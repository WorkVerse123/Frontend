import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import CompaniesPage from './pages/CompaniesPage'
import EmployerSetup from './pages/EmployerSetup'
import EmployeeProfilePage from './pages/EmployeeProfilePage'
import WorkCalendar from './pages/WorkCalendar'
import EmployerJobs from './pages/EmployerJobs'
import CandidatesPage from './pages/CandidatesPage'
import CandidateDetail from './pages/CandidateDetail'
import CreateJob from './pages/creates/CreateJob/CreateJob'
import EditJob from './pages/edits/EditJob'
import EmployerProfile from './pages/EmployerProfile'
import EmployeeDashboard from './pages/EmployeeDashboard'
import JobDetail from './pages/JobDetail'
import EditEmployer from './pages/edits/EditEmployer'
import Subscription from './pages/Subscription'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/employer/setup" element={<EmployerSetup />} />
        <Route path="/employee/profile" element={<EmployeeProfilePage />} />
        <Route path="/calendar" element={<WorkCalendar />} />
        <Route path="/employer/jobs" element={<EmployerJobs />} />
        <Route path="/candidates" element={<CandidatesPage />} />
  <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/jobs/create" element={<CreateJob />} />
  <Route path="/jobs/edit/:jobId" element={<EditJob />} />
        <Route path="/employer/:id" element={<EmployerProfile />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employer/:id/edit" element={<EditEmployer />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
