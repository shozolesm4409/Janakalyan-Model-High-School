import React from 'react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { CustomFormSubmission, CustomForm } from '../../types';
import { 
  FileText, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Search,
  Download,
  Mail,
  User,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FormSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = React.useState<CustomFormSubmission[]>([]);
  const [forms, setForms] = React.useState<CustomForm[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterFormId, setFilterFormId] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [selectedSubId, setSelectedSubId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'form_submissions'), orderBy('submittedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: CustomFormSubmission[] = [];
      snap.forEach(d => items.push(d.data() as CustomFormSubmission));
      setSubmissions(items);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'form_submissions'));

    const unsubForms = onSnapshot(collection(db, 'forms'), (snap) => {
      const items: CustomForm[] = [];
      snap.forEach(d => items.push(d.data() as CustomForm));
      setForms(items);
    });

    return () => { unsub(); unsubForms(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই আবেদনটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'form_submissions', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateDoc(doc(db, 'form_submissions', id), { status });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      (sub.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesForm = filterFormId === 'all' || sub.formId === filterFormId;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;

    return matchesSearch && matchesForm && matchesStatus;
  });

  const selectedSub = submissions.find(s => s.submissionId === selectedSubId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
             <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">কাস্টম ফরম সাবমিশন ডেটাবেজ</h2>
            <p className="text-xs text-gray-400">সকল ডায়নামিক ফরমের মাধ্যমে আসা আবেদনসমূহ যাচাই করুন</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
            <Download className="h-4 w-4" /> এক্সেল ডাউনলোড
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-150">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="আবেদনকারীর নাম বা ইমেইল..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select 
            value={filterFormId}
            onChange={e => setFilterFormId(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
          >
            <option value="all">সকল ফরম (All Forms)</option>
            {forms.map(f => (
              <option key={f.formId} value={f.formId}>{f.title}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
          >
            <option value="all">সকল স্ট্যাটাস (All Status)</option>
            <option value="pending">পেন্ডিং (Pending)</option>
            <option value="approved">এপ্রুভড (Approved)</option>
            <option value="rejected">রিজেক্টেড (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">আবেদনকারী ও ফরম</th>
                <th className="px-6 py-4">জমাদানের সময়</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.submissionId} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold">
                        {sub.userName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{sub.userName}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5" /> {sub.formTitle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{sub.submittedAt}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      sub.status === 'approved' ? 'bg-green-100 text-green-600' :
                      sub.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {sub.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                       <button 
                         onClick={() => setSelectedSubId(sub.submissionId)}
                         className="p-2 text-primary hover:bg-primary/5 rounded-lg transition"
                       >
                         <ExternalLink className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(sub.submissionId)}
                         className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                    কোন সাবমিশন ডাটা পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Overlay / Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white h-full w-full max-w-lg shadow-2xl p-8 overflow-y-auto space-y-8"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">আবেদনপত্রের ধরণ ও তথ্য</h3>
                   <p className="text-xs text-gray-400 mt-1">/{selectedSub.submissionId}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedSubId(null)}
                   className="h-10 w-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                 >
                   <XCircle className="h-6 w-6" />
                 </button>
              </div>

              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                     <User className="h-3 w-3" /> আবেদনকারী
                   </div>
                   <div className="text-sm font-bold text-gray-800">{selectedSub.userName}</div>
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                     <Mail className="h-3 w-3" /> ইমেইল
                   </div>
                   <div className="text-sm font-bold text-gray-800 break-all">{selectedSub.userEmail}</div>
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                     <Calendar className="h-3 w-3" /> তারিখ
                   </div>
                   <div className="text-sm font-bold text-gray-800">{selectedSub.submittedAt}</div>
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                     <FileText className="h-3 w-3" /> ফর্ম টাইপ
                   </div>
                   <div className="text-xs font-bold text-primary">{selectedSub.formTitle}</div>
                </div>
              </div>

              {/* Submitted Data Fields */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">দাখিলকৃত ইনফরমেশন বডি</h4>
                <div className="space-y-4">
                  {Object.entries(selectedSub.data || {}).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{key}</label>
                      {typeof value === 'string' && value.startsWith('data:image') ? (
                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-white">
                          <img src={value} alt={key} className="max-w-full h-auto block mx-auto" />
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Actions */}
              <div className="sticky bottom-0 pt-8 mt-auto bg-white border-t border-gray-100 flex items-center gap-3">
                 <button 
                   onClick={() => handleUpdateStatus(selectedSub.submissionId, 'approved')}
                   className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                     selectedSub.status === 'approved' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
                   }`}
                 >
                   <CheckCircle className="h-4 w-4" /> অনুমোদিত (Approve)
                 </button>
                 <button 
                   onClick={() => handleUpdateStatus(selectedSub.submissionId, 'rejected')}
                   className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                     selectedSub.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'
                   }`}
                 >
                   <XCircle className="h-4 w-4" /> নাকচ করুন (Reject)
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
