import React from 'react';
import { 
  Users, 
  Sliders, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

interface AdminOverviewProps {
  allUsers: any[];
  registrations: any[];
  customForms: any[];
  customSubmissions: any[];
  chartDataBatch: any[];
  chartDataPayments: any[];
}

const PIE_COLORS = ['#0F4C81', '#E63946'];

export const AdminOverview: React.FC<AdminOverviewProps> = ({ 
  allUsers, 
  registrations, 
  customForms, 
  customSubmissions, 
  chartDataBatch, 
  chartDataPayments 
}) => {
  return (
    <div className="space-y-10">
      
      {/* Quick numbers cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* Active Register Form Highlight Card (NEW) */}
        {customForms.find(f => f.registerNowActive) && (
          <div className="bg-primary rounded-xl shadow-lg border border-primary p-5 flex items-center space-x-4 text-white xl:col-span-1">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="leading-tight text-left overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">Register Now Form</span>
              <span className="text-sm font-extrabold block truncate mb-1">
                {customForms.find(f => f.registerNowActive)?.title}
              </span>
              <span className="text-xl font-black font-mono block">
                {customSubmissions.filter(s => s.formId === customForms.find(f => f.registerNowActive)?.formId).length}
              </span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০১. সর্বমোট ইউজার</span>
            <span className="text-2xl font-extrabold text-gray-900 font-mono block">{allUsers.length || registrations.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
          <div className="p-3 bg-violet-50 rounded-lg text-violet-600">
            <Sliders className="h-6 w-6" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০২. মোট তৈরি ফর্ম</span>
            <span className="text-2xl font-extrabold text-gray-900 font-mono block">{customForms.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০৩. মোট সাবমিশন</span>
            <span className="text-2xl font-extrabold text-gray-900 font-mono block">{customSubmissions.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০৪. অ্যাক্টিভ ফর্ম</span>
            <span className="text-2xl font-extrabold text-gray-900 font-mono block">{customForms.filter(f => f.status === 'active').length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০৫. পেন্ডিং ডাটা</span>
            <span className="text-2xl font-extrabold text-gray-900 font-mono block">{registrations.filter(r => r.approvalStatus === 'pending').length}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-gray-800">অ্যালামনাই ব্যাচ ডিস্ট্রিবিউশন (Decade Wise)</h3>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataBatch}>
                <XAxis dataKey="decade" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="Registrations" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartDataBatch.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Stat Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-gray-800">পেমেন্ট কালেকশন স্ট্যাটাস</h3>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataPayments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartDataPayments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Form Wise Summary */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">ফর্ম ওয়াইজ কালেকশন সামারি</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {customForms.map(form => {
            const subsForForm = customSubmissions.filter(s => s.formId === form.formId && s.status === 'approved');
            const totalAmount = subsForForm.reduce((sum, s) => sum + (Number(s.data?.amount) || 0), 0);
            return (
              <div key={form.formId} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600">{form.title}</span>
                <span className="text-sm font-black text-primary">{totalAmount.toLocaleString()} ৳</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
