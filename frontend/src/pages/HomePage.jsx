import MainLayout from '../components/layout/MainLayout';
import BannerSearch from '../components/homepage/BannerSearch';
import StatsPanel from '../components/homepage/StatsPanel';
import RegisterBox from '../components/homepage/RegisterBox';
import PlatformSteps from '../components/homepage/PlatformSteps';
import FeaturedJobs from '../components/homepage/FeaturedJobs';
import FeaturedCandidates from '../components/homepage/FeaturedCandidates';
import FeaturedCompanies from '../components/homepage/FeaturedCompanies';
import Loading from '../components/common/loading/Loading';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PromoBanner from '../components/homepage/PromoBanner';

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
      {/* Banner section with gradient background */}
      <div className="bg-gradient-to-r from-blue-100 via-white to-blue-50 py-6">
        <BannerSearch />
        <PromoBanner imageUrl={"https://res.cloudinary.com/dwkw9pfjq/image/upload/v1761277994/555736342_122168935118590474_6570772927044831720_n_ayvsw9.png"} />
      </div>

      {/* Stats section in card */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <StatsPanel setIsLoading={setStatsLoading} />
        </div>
      </div>

      {/* Register and steps section: only show for guests */}
      {normalizedRole === 'guest' && (
        <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center">
            <RegisterBox />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <PlatformSteps />
          </div>
        </div>
      )}

      {/* Featured Jobs & Candidates section */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#042852] flex items-center gap-2 mb-4">
            <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2"><i className="fas fa-briefcase"></i></span>
            Việc làm nổi bật
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <FeaturedJobs setIsLoading={setJobsLoading} />
          </div>
        </div>
        {(normalizedRole === 'admin' || normalizedRole === 'staff' || normalizedRole === 'employer') && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#042852] flex items-center gap-2 mb-4">
              <span className="inline-block bg-green-100 text-green-600 rounded-full p-2"><i className="fas fa-user-tie"></i></span>
              Ứng viên nổi bật
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <FeaturedCandidates setIsLoading={setJobsLoading} />
            </div>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#042852] flex items-center gap-2 mb-4">
            <span className="inline-block bg-yellow-100 text-yellow-600 rounded-full p-2"><i className="fas fa-building"></i></span>
            Công ty nổi bật
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <FeaturedCompanies setIsLoading={setCompaniesLoading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}