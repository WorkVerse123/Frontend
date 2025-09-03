export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white bg-opacity-100">
      <div
        className="flex flex-col items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <span className="dot bg-indigo-600" />
          <span className="dot bg-teal-400" />
          <span className="dot bg-green-400" />
        </div>

        <div className="mt-4 text-sm text-slate-700">Đang tải, vui lòng chờ...</div>

        <style>{`
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          display: inline-block;
          opacity: 0.25;
          transform: translateY(0);
          animation: dot-bounce 0.9s ease-in-out infinite;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes dot-bounce {
          0% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0.25; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .dot { animation: none !important; transform: none !important; opacity: 1; }
        }
      `}</style>
      </div>
    </div>
  );
}