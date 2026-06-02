import React from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { Event } from '../../types';

interface JubileeEventsProps {
  events: Event[];
  isApproved: boolean;
}

export const JubileeEvents: React.FC<JubileeEventsProps> = ({ events, isApproved }) => {
  return (
    <motion.div
      key="subtab-events"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6"
    >
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
        <Calendar className="h-5.5 w-5.5 text-primary" />
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-800">সুবর্ণ জয়ন্তী উৎসব ইভেন্ট ও কর্মসূচী</h3>
          <p className="text-[11px] text-gray-400">মিলনমেলায় আয়োজিত উদযাপন ও সাংস্কৃতিক ইভেন্টগুলোর তালিকা</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-450 font-mono text-xs">কোন কর্মসূচীর বিবরণ এখনো তৈরি করা হয়নি।</div>
        ) : (
          events.map((event) => (
            <div key={event.eventId} className="border border-gray-100 rounded-xl p-5 hover:border-primary/20 transition-all duration-300 flex items-start space-x-4 bg-gray-50 hover:bg-white hover:shadow-sm text-left">
              <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0 mt-0.5">
                <Calendar className={`h-5 w-5 ${isApproved ? 'animate-bounce' : ''}`} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{event.title}</h4>
                <p className="text-xs text-gray-500 font-sans leading-relaxed pt-0.5">{event.description}</p>
                <div className="pt-2 text-[10px] text-amber-700 font-extrabold font-mono flex flex-wrap gap-x-3">
                  <span>📅 {event.eventDate}</span>
                  <span>📍 {event.location}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
