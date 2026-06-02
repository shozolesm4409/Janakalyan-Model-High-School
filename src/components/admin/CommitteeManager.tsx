import React from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Award,
  Search,
  User as UserIcon,
  X
} from 'lucide-react';
import { Committee } from '../../types';

interface CommitteeManagerProps {
  committee: Committee[];
  handleDeleteCommittee: (memberId: string) => Promise<void>;
  handleEditCommitteeStart: (member: Committee) => void;
  setIsCommModalOpen: (val: boolean) => void;
  commSearchQuery: string;
  setCommSearchQuery: (val: string) => void;
  isCommModalOpen: boolean;
  handleCancelCommitteeEdit: () => void;
  editingCommMemberId: string | null;
  newCommName: string;
  setNewCommName: (val: string) => void;
  newCommDesignation: string;
  setNewCommDesignation: (val: string) => void;
  newCommRemark: string;
  setNewCommRemark: (val: string) => void;
  newCommPhoto: string;
  isCommPhotoUploading?: boolean;
  handleCommPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddOrEditCommittee: (e: React.FormEvent) => Promise<void>;
}

export const CommitteeManager: React.FC<CommitteeManagerProps> = ({ 
  committee, 
  handleDeleteCommittee, 
  handleEditCommitteeStart,
  setIsCommModalOpen,
  commSearchQuery,
  setCommSearchQuery,
  isCommModalOpen,
  handleCancelCommitteeEdit,
  editingCommMemberId,
  newCommName,
  setNewCommName,
  newCommDesignation,
  setNewCommDesignation,
  newCommRemark,
  setNewCommRemark,
  newCommPhoto,
  isCommPhotoUploading,
  handleCommPhotoUpload,
  handleAddOrEditCommittee
}) => {
  const filteredComm = committee.filter(m => 
    m.name.toLowerCase().includes(commSearchQuery.toLowerCase()) || 
    m.designation.toLowerCase().includes(commSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-gray-800 text-sm font-sans">কমিটি মেম্বার ডিরেক্টরি (Committee Management)</h3>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="সদস্য খুঁজুন..." 
                value={commSearchQuery}
                onChange={e => setCommSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-primary"
              />
            </div>
            <button 
              onClick={() => setIsCommModalOpen(true)}
              className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">সদস্য যোগ করুন</span>
            </button>
          </div>
        </div>

        {filteredComm.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold text-xs">কোন কমিটি সদস্য পাওয়া যায়নি।</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComm.map((member) => (
              <div key={member.memberId} className="bg-gray-50/50 border rounded-2xl p-4 hover:bg-white hover:shadow-md transition group relative text-left">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm ring-1 ring-gray-100">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <UserIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="font-extrabold text-gray-900 text-sm truncate">{member.name}</h4>
                    <p className="text-primary font-bold text-[11px] truncate">{member.designation}</p>
                    <p className="text-gray-400 text-[10px] italic line-clamp-1">{member.remark || 'সদস্য, সুবর্ণ জয়ন্তী কমিটি'}</p>
                  </div>
                </div>
                
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                  <button 
                    onClick={() => handleEditCommitteeStart(member)}
                    className="p-1.5 bg-white shadow-sm border border-gray-100 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCommittee(member.memberId)}
                    className="p-1.5 bg-white shadow-sm border border-gray-100 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Creation/Edit Modal Overlay */}
      {isCommModalOpen && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-950 text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>{editingCommMemberId ? 'সদস্যের তথ্য আপডেট' : 'নতুন কমিটি সদস্য যুক্তকরণ'}</span>
              </h3>
              <button 
                onClick={handleCancelCommitteeEdit}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrEditCommittee}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center justify-center space-y-3 pb-2">
                  <div className="h-24 w-24 bg-gray-100 rounded-2xl ring-4 ring-gray-50 overflow-hidden relative group border border-gray-200">
                    {newCommPhoto ? (
                      <img src={newCommPhoto} alt="Preview" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <UserIcon className="h-10 w-10" />
                      </div>
                    )}
                    {isCommPhotoUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold">
                      পরিবর্তন করুন
                      <input type="file" className="hidden" accept="image/*" onChange={handleCommPhotoUpload} />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans">সদস্যের ফরমাল ছবি আপলোড করুন (Square image preferred)</p>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">সদস্যের পূর্ণ নাম *</label>
                    <input 
                      type="text" 
                      required 
                      value={newCommName}
                      onChange={e => setNewCommName(e.target.value)}
                      placeholder="উদাঃ মোঃ আব্দুল করিম"
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">কমিটি পদবী *</label>
                    <input 
                      type="text" 
                      required 
                      value={newCommDesignation}
                      onChange={e => setNewCommDesignation(e.target.value)}
                      placeholder="উদাঃ আহবায়ক, সুবর্ণ জয়ন্তী উদযাপন উপ-কমিটি"
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">অতিরিক্ত রিমার্ক / ব্যাচ ট্যাগ (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      value={newCommRemark}
                      onChange={e => setNewCommRemark(e.target.value)}
                      placeholder="উদাঃ ব্যাচ ২০১৫ অথবা বিশেষ দায়িত্ব"
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCancelCommitteeEdit}
                  className="bg-white border text-gray-500 hover:bg-gray-100 px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transform active:scale-95 transition cursor-pointer"
                >
                  {editingCommMemberId ? 'আপডেট করুন' : 'সদস্য সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
