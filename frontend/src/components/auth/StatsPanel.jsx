import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function StatsPanel() {
  return (
    <div className="flex flex-col justify-center items-center h-full text-white">
      <div className="text-2xl font-bold mb-8 text-center drop-shadow-lg">
        1.753.240+ Ứng viên đang<br />chờ việc làm
      </div>
      <div className="flex gap-12">
        <div className="flex flex-col items-center">
          <AssignmentIcon sx={{ fontSize: 32, mb: 1 }} />
          <span className="text-xl font-bold">1,75,324</span>
          <span className="text-sm">Tuyển Nhân Sự</span>
        </div>
        <div className="flex flex-col items-center">
          <BusinessIcon sx={{ fontSize: 32, mb: 1 }} />
          <span className="text-xl font-bold">97,354</span>
          <span className="text-sm">Công ty / Doanh Nghiệp</span>
        </div>
        <div className="flex flex-col items-center">
          <WorkIcon sx={{ fontSize: 32, mb: 1 }} />
          <span className="text-xl font-bold">7,532</span>
          <span className="text-sm">Công việc mới mỗi tuần</span>
        </div>
      </div>
    </div>
  );
}