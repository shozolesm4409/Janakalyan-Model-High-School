import React from 'react';
import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { Notice } from '../../types';

interface NoticeBoardProps {
  notices: Notice[];
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices }) => {
  return (
    <motion.div
      key="subtab-notices"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6"
    >
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
        <Bell className="h-5.5 w-5.5 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-gray-800">ঘোষণা ও নোটিশ বোর্ড (Notice Board)</h3>
          <p className="text-[11px] text-gray-400 font-sans">সুবর্ণ জয়ন্তী উদযাপন কমিটির সর্বশেষ অফিশিয়াল সিদ্ধান্ত ও সাধারণ নোটিশসমূহ</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 font-sans">
        {notices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-sans text-xs">কোন নোটিশ বা ঘোষণা এই মুহূর্তে পাওয়া যায়নি। নতুন সিদ্ধান্তের জন্য পরবর্তীতে চেক করুন।</div>
        ) : (
          notices.map((notice) => (
            <div 
              key={notice.noticeId} 
              className="border border-gray-150 rounded-xl p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition duration-200 border-l-4 border-l-primary text-left"
            >
              <div className="flex justify-between items-center text-[10px] text-primary font-bold font-mono">
                <span className="bg-primary/10 px-2.5 py-0.5 rounded">📢 অফিসিয়াল ঘোষণা</span>
                <span>published: {notice.publishDate || 'Today'}</span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm mt-3.5 leading-snug">{notice.title}</h4>
              <p className="text-gray-600 text-xs whitespace-pre-line leading-relaxed mt-2">{notice.description}</p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
