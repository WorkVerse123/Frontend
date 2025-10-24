import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import AboutPage from './pages/AboutPage'
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
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import AdminRoute from './components/admin/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import NoAuthRoute from './components/NoAuthRoute'

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
        <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={['employer']}><EmployerJobs /></ProtectedRoute>} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/jobs/create" element={<ProtectedRoute allowedRoles={['employer']}><CreateJob /></ProtectedRoute>} />
        <Route path="/jobs/edit/:jobId" element={<ProtectedRoute allowedRoles={['employer']}><EditJob /></ProtectedRoute>} />
        <Route path="/employer/:id" element={<EmployerProfile />} />
        <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employer/:id/edit" element={<ProtectedRoute allowedRoles={['employer']}><EditEmployer /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute allowedRoles={['employee', 'employer']}><Subscription /></ProtectedRoute>} />
  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
  <Route path="/payment/success" element={<ProtectedRoute allowedRoles={['employee', 'employer']}><PaymentSuccess /></ProtectedRoute>} />
  <Route path="/payment/cancel" element={<ProtectedRoute allowedRoles={['employee', 'employer']}><PaymentCancel /></ProtectedRoute>} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
