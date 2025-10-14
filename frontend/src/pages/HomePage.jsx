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
        {/* Each child component manages its own loading state now. Removed global Loading overlay to avoid full-page reloads when a single component paginates. */}
      <BannerSearch />
      <PromoBanner imageUrl={"https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-6/555736342_122168935118590474_6570772927044831720_n.png?stp=dst-png_s960x960&_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHiXZxTnukOM-_srDGpDCIOUJd_mi3Kc6lQl3-aLcpzqX0NELkNxainqOAnZRsylWmLD3eJyKplNrt5lqFTRanU&_nc_ohc=E7kEW0UfAb4Q7kNvwGVm-dK&_nc_oc=Admk3cAW8C1zy1ha-FcipgmiqINS5NGuhFrSBSm-Tl6XmHBBIPzHPG9pGv0f6BF-LGwyMh-3B0t44Ex6nRFR_ULr&_nc_zt=23&_nc_ht=scontent.fsgn2-3.fna&_nc_gid=rxK4Sexb1isPOEcwZAxklg&oh=00_Afej9c5PV9PpfeTD9C1A4NjGplcpWMea1aQGtVxvvFKV0Q&oe=68F18463"} />
      <StatsPanel setIsLoading={setStatsLoading} />
      <RegisterBox />
      <PlatformSteps />
      { (normalizedRole === 'admin' || normalizedRole === 'staff') ? (
        // Admin/staff see both featured jobs and featured candidates
        <>
          <FeaturedJobs setIsLoading={setJobsLoading} />
          <FeaturedCandidates setIsLoading={setJobsLoading} />
        </>
      ) : normalizedRole === 'employer' ? (
        // Employers should also see featured jobs (and get a 'Xem' link instead of 'Ứng Tuyển')
       <>
        <FeaturedJobs setIsLoading={setJobsLoading} />
        <FeaturedCandidates setIsLoading={setJobsLoading} />
       </>
      ) : (
        <FeaturedJobs setIsLoading={setJobsLoading} />
      )}
      <FeaturedCompanies setIsLoading={setCompaniesLoading} />
    </MainLayout>
  );
}