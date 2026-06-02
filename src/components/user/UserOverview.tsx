import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User as UserIcon 
} from 'lucide-react';
import { Registration, Payment } from '../../types';

interface UserOverviewProps {
  currentUser: any;
  registration: Registration | null;
  payment: Payment | null;
}

export const UserOverview: React.FC<UserOverviewProps> = ({ currentUser, registration, payment }) => {
  return (
    <motion.div
      key="subtab-overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Greeting Hero card */}
      <div className="bg-radial-gradient bg-primary text-white p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg border border-primary/20">
        <div className="absolute top-0 right-0 h-40 w-40 bg-secondary/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
        <div className="relative z-10 space-y-2">
          <span className="bg-secondary/20 text-secondary border border-secondary/25 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded inline-block font-sans">
            অ্যালামনাই পোর্টাল (Status Overview)
          </span>
          <h2 className="text-2.5xl sm:text-3.xl font-display font-black leading-tight text-white mb-1">
            স্বাগতম, {currentUser.name}!
          </h2>
          <p className="text-sm text-gray-200 font-sans max-w-xl leading-relaxed">
            জনকল্যাণ হাই স্কুলের সুবর্ণ জয়ন্তী উদযাপন প্যানেলে আপনাকে স্বাগত। নিচে আপনার আবেদনপত্র এবং পেমেন্ট স্লিপের বর্তমান লাইভ অগ্রগতি এবং ভেরিফিকেশন স্ট্যাটাস ট্র্যাক করুন।
          </p>
        </div>
      </div>

      {/* Progress Tracking Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Registration tracking detail */}
        <div className="bg-white rounded-xl border border-gray-150 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-48 md:h-52 group hover:shadow-md transition duration-200">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 bg-primary/5 rounded-full transform group-hover:scale-110 transition-transform duration-300" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">ধাপ ১: পুনর্মিলনী রেজিস্ট্রেশন</div>
            
            {registration ? (
              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  {registration.approvalStatus === 'approved' ? (
                    <div className="h-9 w-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : registration.approvalStatus === 'rejected' ? (
                    <div className="h-9 w-9 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <strong className="text-sm font-bold text-gray-900 block">
                      {registration.approvalStatus === 'approved' ? 'রেজিস্ট্রেশন আবেদন অনুমোদিত' :
                       registration.approvalStatus === 'rejected' ? 'আবেদন বাতিল করা হয়েছে' :
                       'নিবন্ধন খসড়া ভেরিফাই হচ্ছে'}
                    </strong>
                    <span className="text-xs text-gray-400 font-sans font-medium">আবেদন আইডি - #{registration.registrationId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-1">
                <h4 className="text-sm font-bold text-amber-700">কোন রেজিস্ট্রেশন আবেদন পাওয়া যায়নি</h4>
                <p className="text-xs text-gray-500 font-sans max-w-xs leading-relaxed">সুবর্ণ জয়ন্তী অনুষ্ঠান উদযাপনে স্বপ্রণোদিত অংশ নিতে আজই নিবন্ধিত হয়ে নিন।</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-400">দাখিলকৃত গেস্ট: {registration?.participationInfo?.guestCount || 0} জন</span>
            <span className="text-primary font-mono bg-secondary/15 px-2 py-0.5 rounded">টি-শার্ট: {registration?.participationInfo?.tshirtSize || 'XL'}</span>
          </div>
        </div>

        {/* Payment tracking details */}
        <div className="bg-white rounded-xl border border-gray-150 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-48 md:h-52 group hover:shadow-md transition duration-200">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 bg-pink-50 rounded-full transform group-hover:scale-110 transition-transform duration-300" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">ধাপ ২: ব্যাংক / মোবাইল পেমেন্ট স্লিপ</div>
            
            {payment ? (
              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  {payment.paymentStatus === 'approved' ? (
                    <div className="h-9 w-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : payment.paymentStatus === 'rejected' ? (
                    <div className="h-9 w-9 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <strong className="text-sm font-bold text-gray-900 block">
                      {payment.paymentStatus === 'approved' ? 'পেমেন্ট স্লিপ এপ্রুভ হয়েছে' :
                       payment.paymentStatus === 'rejected' ? 'পেমেন্ট ত্রুটিপূর্ণ (Rejected)' :
                       'লেনদেন রসিদ মেলাানো হচ্ছে'}
                    </strong>
                    <span className="text-xs text-gray-400 font-mono font-medium">TrxID: {payment.trxId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-1">
                <h4 className="text-sm font-bold text-gray-500">কোন পেমেন্ট স্লিপ পাওয়া যায়নি</h4>
                <p className="text-xs text-gray-500 font-sans max-w-xs leading-relaxed">রেজিস্ট্রেশন ফি পরিশোধ করার পর তার বিবরণ এবং স্ক্রিনশট রসিদ আপলোড করুন।</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-gray-400">পরিশোধিত ফি পরিমাণ:</span>
            <strong className="text-sm text-pink-600 font-extrabold font-mono tracking-wide">{payment?.amount || 0} BDT</strong>
          </div>
        </div>

      </div>

      {/* Important alert instructions guidelines */}
      <div className="border border-blue-150 bg-blue-50/20 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-gray-600 leading-relaxed flex items-start space-x-4">
        <span className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <strong className="text-gray-900 font-bold block mb-1 text-sm">সাপোর্ট ও ভেরিফিকেশন সংক্রান্ত জরুরী নির্দেশনা:</strong>
          <p className="leading-relaxed">
            আবেদন আপলোড করার পর উৎসব উপ-কমিটির দায়িত্বপ্রাপ্ত প্রাক্তনীরা ২৪ ঘণ্টার মধ্যে আপনার এসএসসি পাসিং ব্যাচ, নাম এবং ট্রানজেকশন স্ক্রিনশট মিলিয়ে আবেদনটির সত্যতা যাচাই করবেন। অনুমোদন সম্পন্ন হওয়ার সাথে সাথেই সাইডবারের <strong>স্মারক প্রশংসাপত্র (Digital Certificate)</strong> অপশনটি আনলক হয়ে যাবে, যেখানে নিজের নাম ও ব্যাচ খোদাইকৃত উৎসব সার্টিফিকেট পেয়ে যাবেন।
          </p>
        </div>
      </div>

      {/* Quick Profile Read-Only Widget */}
      <div className="bg-white rounded-2xl border border-gray-150 p-4 sm:p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
          <UserIcon className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-gray-800">অ্যালামনাই মূল প্রোফাইল সংক্ষিপ্ত বিবরণ</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-600">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-medium block">প্রাক্তনী ইমেইল ঠিকানা</span>
            <strong className="text-gray-900 font-mono mt-1 font-bold text-sm block truncate">{currentUser.email}</strong>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-medium block">যোগাযোগ মোবাইল নং</span>
            <strong className="text-gray-900 font-mono mt-1 font-bold text-sm block">{currentUser.mobile || '০১৭xxxxxxxx'}</strong>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-medium block">এসএসসি পাসের ব্যাচ</span>
            <strong className="text-gray-950 mt-1 font-bold text-sm block">SSC Batch {currentUser.batch}</strong>
          </div>
        </div>
      </div>

    </motion.div>
  );
};
