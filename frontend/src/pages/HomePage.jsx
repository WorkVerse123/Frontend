import MainLayout from '../components/layout/MainLayout';
import BannerSearch from '../components/homepage/BannerSearch';
import StatsPanel from '../components/homepage/StatsPanel';
import RegisterBox from '../components/homepage/RegisterBox';
import PlatformSteps from '../components/homepage/PlatformSteps';
import FeaturedJobs from '../components/homepage/FeaturedJobs';
import FeaturedCompanies from '../components/homepage/FeaturedCompanies';
import Loading from '../components/common/loading/Loading';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const roleCandidate = user?.RoleId || user?.roleId || user?.role || user?.role_id || null;
  const normalizedRole = (() => {
    if (roleCandidate === null || roleCandidate === undefined) return 'guest';
    const n = Number(roleCandidate);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return 'guest';
      }
    }
    return String(roleCandidate).toLowerCase();
  })();
  const [statsLoading, setStatsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const isLoading = statsLoading || jobsLoading || companiesLoading;

  


  return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
        {/* Each child component manages its own loading state now. Removed global Loading overlay to avoid full-page reloads when a single component paginates. */}
      <BannerSearch />
      <StatsPanel setIsLoading={setStatsLoading} />
      <RegisterBox />
      <PlatformSteps />
      <FeaturedJobs setIsLoading={setJobsLoading} />
      <FeaturedCompanies setIsLoading={setCompaniesLoading} />
    </MainLayout>
  );
}