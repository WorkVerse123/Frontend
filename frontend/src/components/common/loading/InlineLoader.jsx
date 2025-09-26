import React from 'react';

export default function InlineLoader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce delay-150" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-bounce delay-300" />
      </div>
      {text && <div className="mt-3 text-sm text-slate-600">{text}</div>}

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: .4 } 50% { transform: translateY(-6px); opacity: 1 } }
        .animate-bounce { animation: bounce 0.9s infinite ease-in-out }
        .delay-150 { animation-delay: .15s }
        .delay-300 { animation-delay: .3s }
      `}</style>
    </div>
  );
}
