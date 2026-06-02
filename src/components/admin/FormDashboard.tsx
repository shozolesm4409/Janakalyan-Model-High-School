
import React, { useState } from 'react';
import { CustomForm, CustomFormField, CustomFormSubmission } from '../../types';
import { LayoutDashboard, FileText, CheckCircle, Clock } from 'lucide-react';

interface FormDashboardProps {
  forms: CustomForm[];
  fields: CustomFormField[];
  submissions: CustomFormSubmission[];
}

export const FormDashboard: React.FC<FormDashboardProps> = ({ forms, fields, submissions }) => {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const selectedForm = forms.find(f => f.formId === selectedFormId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-gray-900">ডাইনামিক ফর্ম ড্যাশবোর্ড</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.filter(form => form.status === 'active').map(form => {
          const formSubs = submissions.filter(s => s.formId === form.formId);
          const approved = formSubs.filter(s => s.status === 'approved').length;
          const pending = formSubs.filter(s => s.status === 'pending' || !s.status).length;
          const totalAmount = formSubs.reduce((acc, sub) => {
            const amount = parseFloat(sub.data?.amount || 0);
            return acc + (isNaN(amount) ? 0 : amount);
          }, 0);

          return (
            <div 
              key={form.formId} 
              className={`bg-white border rounded-xl p-5 cursor-pointer hover:shadow-md transition ${selectedFormId === form.formId ? 'ring-2 ring-primary border-primary' : ''}`}
              onClick={() => setSelectedFormId(form.formId)}
            >
              <h3 className="font-bold text-gray-800">{form.title}</h3>
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                <div className="text-gray-500">মোট জমা: <span className="font-bold text-gray-900">{formSubs.length}</span></div>
                <div className="text-gray-500">পেমেন্ট: <span className="font-bold text-emerald-600">{totalAmount} ৳</span></div>
              </div>
              <div className="flex gap-2 mt-4 text-[10px] font-bold">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Approved: {approved}</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">Pending: {pending}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedForm && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                <FileText className="h-5 w-5 text-primary" />
                {selectedForm.title} - বিস্তারিত সামারি ও রিপোর্ট
            </h3>
            
            {/* Detailed Summary Stats per Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 italic">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">মোট সাবমিশন</span>
                <span className="text-2xl font-black text-gray-800 font-mono">
                  {submissions.filter(s => s.formId === selectedForm.formId).length}
                </span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 italic">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">মোট কালেকশন</span>
                <span className="text-2xl font-black text-emerald-700 font-mono uppercase">
                  {submissions.filter(s => s.formId === selectedForm.formId && s.status === 'approved')
                    .reduce((acc, sub) => acc + (Number(sub.data?.amount) || 0), 0).toLocaleString()} ৳
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 italic">
                <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">অনুমোদিত (Approved)</span>
                <span className="text-2xl font-black text-blue-700 font-mono">
                  {submissions.filter(s => s.formId === selectedForm.formId && s.status === 'approved').length}
                </span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
                <span className="text-[10px] text-amber-600 font-bold uppercase block mb-1">যাচাইাধীন (Pending)</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {submissions.filter(s => s.formId === selectedForm.formId && (s.status === 'pending' || !s.status)).length}
                </span>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-black tracking-wider text-[9px]">
                        <tr>
                            <th className="p-4 border-b">ব্যবহারকারী (User Name)</th>
                            <th className="p-4 border-b">মোবাইল / আইডি</th>
                            <th className="p-4 border-b">দাখিলকৃত সময়</th>
                            <th className="p-4 border-b">স্ট্যাটাস</th>
                            <th className="p-4 border-b text-right">পেমেন্ট (Amount)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.filter(s => s.formId === selectedForm.formId).map(sub => (
                            <tr key={sub.submissionId} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 font-bold text-gray-900">{sub.userName || 'Unknown'}</td>
                                <td className="p-4 text-gray-500 font-mono">#{sub.userId?.slice(-6)}</td>
                                <td className="p-4 text-gray-400 font-mono">{new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="p-4 font-mono">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                      sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        <span className={`h-1 w-1 rounded-full ${sub.status === 'approved' ? 'bg-emerald-600' : sub.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600'}`} />
                                        {sub.status || 'pending'}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-black text-emerald-800 text-sm">
                                  {sub.data?.amount ? `${Number(sub.data.amount).toLocaleString()} ৳` : '0 ৳'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
