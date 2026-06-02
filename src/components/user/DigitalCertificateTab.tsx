import React from 'react';
import { motion } from 'motion/react';
import { Award, PlusCircle } from 'lucide-react';
import { AppCertificate } from '../AppCertificate';
import { Registration, Payment } from '../../types';

interface DigitalCertificateTabProps {
  currentUser: any;
  registration: Registration | null;
  payment: Payment | null;
  isApproved: boolean;
  setCurrentTab?: (tab: string) => void;
}

export const DigitalCertificateTab: React.FC<DigitalCertificateTabProps> = ({ 
  currentUser, 
  registration, 
  payment, 
  isApproved, 
  setCurrentTab 
}) => {
  return (
    <motion.div
      key="subtab-certificate"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {isApproved ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Award className="h-5.5 w-5.5" />
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-primary font-display">স্মারক ডিজিটাল প্রশংসাপত্র (Attendance Certificate)</h2>
                <p className="text-[11px] text-gray-400 font-sans">পুনর্মিলনী নিবন্ধন ও পেমেন্ট সফলভাবে এপ্রুভ ও ভেরিফায়েড হয়েছে। অভিনন্দন!</p>
              </div>
            </div>
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('register')}
                className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>নতুন রেজিস্ট্রেশন করুন (Register Now)</span>
              </button>
            )}
          </div>
          
          <AppCertificate
            recipientName={currentUser.name}
            batch={currentUser.batch || '2026'}
            registrationId={registration?.registrationId || 'REG-PENDING'}
          />
        </div>
      ) : (
        <div className="border border-amber-200 bg-amber-50/15 rounded-2xl p-5 sm:p-6 text-center space-y-4 max-w-xl mx-auto my-4 shadow-sm">
          <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner transform rotate-12">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-tight">সার্টিফিকেট সাময়িকভাবে লক করা আছে (Certificate Locked)</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              আপনার দাখিলকৃত ইনফরমেশন ও ট্রানজেকশন স্ক্রিনশট যাচাইধীন রয়েছে। অ্যাডমিন প্যানেল এটি এপ্রুভ করার সাথে সাথে আপনার জন্য স্মারক ডিজিটাল প্রশংসাপত্রটি এখানে সয়ংক্রিয়ভাবে জেনারেট হয়ে যাবে।
            </p>
          </div>
          
          <div className="pt-2 bg-gray-50 border rounded-xl p-4 text-left space-y-1.5 max-w-xs mx-auto font-mono text-[10px] text-gray-500">
            <div className="flex justify-between">
              <span>নিবন্ধন অবস্থা:</span>
              <strong className="text-amber-700 uppercase font-semibold">{registration?.approvalStatus || 'Not Joined'}</strong>
            </div>
            <div className="flex justify-between border-t pt-1.5">
              <span>পেমেন্ট অবস্থা:</span>
              <strong className="text-amber-700 uppercase font-semibold">{payment?.paymentStatus || 'No Record'}</strong>
            </div>
          </div>

          <div className="pt-4 flex flex-col items-center justify-center space-y-2">
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('register')}
                className="bg-amber-550 hover:bg-amber-600 active:scale-95 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center space-x-2 transition duration-200 cursor-pointer"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>রেজিস্ট্রেশন করুন (Register Now)</span>
              </button>
            )}
            <p className="text-[10px] text-gray-400">ইতিমধ্যে কোনো তথ্য জমা না দিয়ে থাকলে দয়া করে রেজিস্ট্রেশন ফর্মটি পূরণ করুন।</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
