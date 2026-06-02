import React from 'react';
import { 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Eye, 
  AlertCircle,
  X,
  Image
} from 'lucide-react';
import { Registration, Payment } from '../../types';

interface VerificationQueueProps {
  registrations: Registration[];
  payments: Payment[];
  handleApproveRegistration: (regId: string) => Promise<void>;
  handleRejectRegistration: (regId: string) => Promise<void>;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({ 
  registrations, 
  payments, 
  handleApproveRegistration, 
  handleRejectRegistration 
}) => {
  const [selectedReg, setSelectedReg] = React.useState<Registration | null>(null);
  const [selectedPay, setSelectedPay] = React.useState<Payment | null>(null);

  const pendingRegistrations = registrations.filter(r => r.approvalStatus === 'pending');

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-gray-800 text-sm font-sans">পেন্ডিং ভেরিফিকেশন কিউ (Pending Verification Queue)</h3>
          </div>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
            {pendingRegistrations.length} Applications Waiting
          </span>
        </div>

        {pendingRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <CheckCircle className="h-10 w-10 text-green-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bold text-xs font-sans">সব আবেদন যাচাই করা হয়েছে। পেন্ডিং কোন রিকোয়েস্ট নেই!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b">
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Applicant Name</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Batch</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Applied Date</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Amount Paid</th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pendingRegistrations.map((reg) => {
                  const pay = payments.find(p => p.registrationId === reg.registrationId);
                  return (
                    <tr key={reg.registrationId} className="hover:bg-blue-50/30 transition">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <strong className="text-gray-900 font-extrabold">{reg.personalInfo?.fullName || reg.name || 'Unknown'}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {reg.registrationId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-bold">SSC {reg.academicInfo?.passingYear || 'N/A'}</td>
                      <td className="px-4 py-4 text-gray-500">{reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : 'Today'}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <strong className="text-pink-600 font-black">{pay?.amount || 0} BDT</strong>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{pay?.paymentMethod || 'Mobile'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => setSelectedReg(reg)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleApproveRegistration(reg.registrationId)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer shadow-sm active:scale-95"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectRegistration(reg.registrationId)}
                            className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal Overlay */}
      {selectedReg && (
         <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-950 text-white">
              <h3 className="font-black text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>আবেদনকারী বিস্তারিত তথ্য (Applicant Details)</span>
              </h3>
              <button onClick={() => setSelectedReg(null)} className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-6 border-b pb-6">
                <div className="h-20 w-20 bg-gray-100 rounded-xl ring-2 ring-indigo-50 overflow-hidden shrink-0 border border-indigo-100">
                  {selectedReg.personalInfo?.photo ? (
                    <img src={selectedReg.personalInfo.photo} alt="P" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-indigo-300">
                      <Users className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedReg.personalInfo?.fullName}</h2>
                  <p className="text-gray-500 text-sm font-sans flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> SSC Batch: <strong className="text-gray-950">{selectedReg.academicInfo?.passingYear}</strong>
                  </p>
                  <div className="flex items-center space-x-2 pt-1 font-mono text-[10px]">
                    <span className="bg-indigo-50 text-primary px-2 py-0.5 rounded-full font-bold">Registration-#{selectedReg.registrationId}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${selectedReg.approvalStatus === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700 uppercase'}`}>
                      {selectedReg.approvalStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <h4 className="font-black text-indigo-700 uppercase tracking-widest border-b pb-1">পার্সোনাল ডাটা (Personal)</h4>
                  <div className="space-y-2">
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400">মোবাইল নম্বর:</span> <strong className="font-mono">{selectedReg.personalInfo?.mobile}</strong></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400">বর্তমান ঠিকানা:</span> <strong className="text-right max-w-[150px]">{selectedReg.personalInfo?.currentAddress}</strong></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400">বাবার নাম:</span> <strong>{selectedReg.personalInfo?.fatherName || 'N/A'}</strong></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-pink-700 uppercase tracking-widest border-b pb-1">অংশগ্রহণ তথ্য (Event Info)</h4>
                  <div className="space-y-2">
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400">গেস্ট সংখ্যা:</span> <strong className="bg-pink-50 text-pink-700 px-2 rounded-full">{selectedReg.participationInfo?.guestCount || 0} জন</strong></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400">টি-শার্ট সাইজ:</span> <strong className="bg-gray-100 px-2 rounded font-mono uppercase">{selectedReg.participationInfo?.tshirtSize}</strong></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400">রেস্পন্স ফ্রিকোয়েন্সি:</span> <strong>{selectedReg.participationInfo?.participationDate || 'All Days'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Payment Detail Widget and Screenshot */}
              <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-200 pb-3">
                  <h4 className="font-black text-indigo-800 text-xs flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>পেমেন্ট স্লিপ ও ট্রানজেকশন রসিদ</span>
                  </h4>
                  {(() => {
                    const payDetail = payments.find(p => p.registrationId === selectedReg.registrationId);
                    return payDetail ? (
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm ring-1 ring-indigo-200">
                        Method: {payDetail.paymentMethod}
                      </span>
                    ) : null;
                  })()}
                </div>
                
                {(() => {
                  const payDetail = payments.find(p => p.registrationId === selectedReg.registrationId);
                  if(!payDetail) return <p className="text-center py-4 text-xs font-bold text-indigo-400 font-sans">এই আইডির বিপরীতে কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি!</p>;
                  
                  return (
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-grow space-y-2.5 text-xs text-indigo-900">
                        <div className="flex justify-between border-b border-indigo-100/50 pb-1.5"><span className="text-indigo-400">পরিমান (Amount):</span> <strong className="text-lg font-black text-pink-600 font-mono tracking-tighter">{payDetail.amount} BDT</strong></div>
                        <div className="flex justify-between border-b border-indigo-100/50 pb-1.5 font-mono"><span className="text-indigo-400">Transaction ID:</span> <strong className="bg-white px-2 py-0.5 rounded select-all shadow-xs">{payDetail.trxId}</strong></div>
                        <div className="flex justify-between border-b border-indigo-100/50 pb-1.5"><span className="text-indigo-400">প্রেরক নাম্বার:</span> <strong className="font-mono">{payDetail.senderNumber}</strong></div>
                        <div className="flex justify-between pb-1.5"><span className="text-indigo-400">পেমেন্ট টাইম:</span> <span>{payDetail.paymentDate || 'N/A'}</span></div>
                      </div>
                      
                      <div className="sm:w-1/2">
                        <span className="text-[10px] font-bold text-indigo-400/80 block mb-1.5 uppercase font-sans">Payment Screenshot:</span>
                        <div className="bg-white border ring-4 ring-indigo-100/30 rounded-xl overflow-hidden shadow-sm aspect-[4/3] group relative cursor-zoom-in">
                          {payDetail.screenshot ? (
                            <img 
                              src={payDetail.screenshot} 
                              alt="Payment proof" 
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain p-1"
                              onClick={() => {
                                // Fullscreen toggle logic or just open in new tab
                                window.open(payDetail.screenshot, '_blank');
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-indigo-200">
                              <Image className="h-10 w-10 mb-2 opacity-30" />
                              <span className="text-[10px]">No Attachment Found</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex items-center justify-between gap-4">
              <button 
                onClick={() => handleRejectRegistration(selectedReg.registrationId)}
                className="bg-white border-2 border-red-150 text-red-500 hover:bg-red-500 hover:text-white px-8 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex-grow"
              >
                বাতিল করুন (Reject)
              </button>
              <button 
                onClick={() => handleApproveRegistration(selectedReg.registrationId)}
                className="bg-primary hover:bg-primary/95 text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-primary/20 transform active:scale-95 transition cursor-pointer flex-grow"
              >
                এপ্রুভ করুন (Approve Now)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
