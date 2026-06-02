import React from 'react';
import { Committee as CommitteeType } from '../types';

interface CommitteePageProps {
  committee: CommitteeType[];
}

export const CommitteePage: React.FC<CommitteePageProps> = ({ committee }) => {
  return (
    <div className="max-w-none w-full px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3.5xl font-display font-extrabold text-primary">উৎসব কমিটি ও সহযোগী সংগঠকবৃন্দ</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">অর্ধশতাব্দীর এই মিলনমেলাকে স্বার্থক করার লক্ষ্যে নিরলসভাবে পরিশ্রম করে চলা উদযাপন বা সাজসজ্জা কমিটি।</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {committee.map((member) => (
          <div key={member.memberId} className="bg-white rounded-xl shadow-xs border border-gray-150 p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition duration-200">
            <img
              src={member.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
              alt={member.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-md"
            />
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">{member.name}</h3>
              <p className="text-amber-700 text-xs font-semibold font-sans">{member.designation}</p>
              {member.remark && (
                <p className="text-gray-500 text-[11px] font-sans italic mt-1.5 border-t border-gray-100 pt-1.5 line-clamp-2">
                  {member.remark}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
