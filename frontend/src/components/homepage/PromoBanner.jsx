import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function PromoBanner({ imageUrl }) {
  const navigate = useNavigate();
  const src = imageUrl || 'https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-6/555736342_122168935118590474_6570772927044831720_n.png?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHiXZxTnukOM-_srDGpDCIOUJd_mi3Kc6lQl3-aLcpzqX0NELkNxainqOAnZRsylWmLD3eJyKplNrt5lqFTRanU&_nc_ohc=fWh4pazPQjsQ7kNvwGaqFTK&_nc_oc=AdkzNkindFUDe3xDSwJaie5i5FTRJP7mHyaX5bt4pkIZqWQ4dvvfLoVRZFj65gRRt1eIF6N9SnUUei-KRtd2mLsC&_nc_zt=23&_nc_ht=scontent.fsgn2-3.fna&_nc_gid=FEq7ev26bmlvnMz-yWcyzg&oh=00_AfbFzSLc3Zkx36SO6CwgleRLJod5K9BEMK6Rr12lpdJgzw&oe=68E2CBA3';

  const goToJobs = () => navigate('/jobs');

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToJobs();
    }
  };

  return (
    <section className="w-full px-4 py-4">
      <div
        role="link"
        tabIndex={0}
        onClick={goToJobs}
        onKeyDown={onKeyDown}
        className="mx-auto max-w-7xl rounded-lg overflow-hidden shadow-md relative cursor-pointer"
        aria-label="Banner quảng cáo Workverse - Tìm việc part-time"
      >
        {/* The img keeps its natural aspect ratio; overlay sits on top */}
        <img src={src} alt="Workverse Promo" className="w-full h-auto block" />

       
      </div>
    </section>
  );
}

