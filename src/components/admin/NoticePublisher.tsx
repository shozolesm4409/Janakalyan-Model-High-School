import React from 'react';
import { 
  Plus, 
  Trash2, 
  Bell, 
  Search,
  X
} from 'lucide-react';
import { Notice } from '../../types';

interface NoticePublisherProps {
  notices: Notice[];
  handleAddNotice: (e: React.FormEvent) => Promise<void>;
  handleDeleteNotice: (nId: string) => Promise<void>;
  newNoticeTitle: string;
  setNewNoticeTitle: (val: string) => void;
  newNoticeDesc: string;
  setNewNoticeDesc: (val: string) => void;
}

export const NoticePublisher: React.FC<NoticePublisherProps & { isModalOpen: boolean; setIsModalOpen: (val: boolean) => void }> = ({ 
  notices, 
  handleAddNotice, 
  handleDeleteNotice,
  newNoticeTitle,
  setNewNoticeTitle,
  newNoticeDesc,
  setNewNoticeDesc,
  isModalOpen,
  setIsModalOpen
}) => {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-gray-800 text-sm font-sans">ঘোষণা ও নোটিশ (Notice Management)</h3>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন নোটিশ পাবলিশ করুন</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 font-sans">
          {notices.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium font-sans">এখনও কোনো নোটিশ পাবলিশ করা হয়নি।</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notices.sort((a,b) => (b.noticeId > a.noticeId ? 1 : -1)).map((n) => (
                <div key={n.noticeId} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition relative group text-left">
                  <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => handleDeleteNotice(n.noticeId)}
                      className="p-1.5 bg-white shadow-xs border border-gray-100 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition"
                      title="Delete Notice"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-primary font-bold font-mono">
                    <span className="bg-primary/10 px-1.5 py-0.5 rounded">📢 Official</span>
                    <span>{n.publishDate || 'Recent'}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-sm mt-2">{n.title}</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-1 line-clamp-3">{n.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Notice Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-950 text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>নতুন নোটিশ পাবলিশ করুন</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddNotice}>
              <div className="p-6 space-y-4 text-left">
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">নোটিশ শিরোনাম (Notice Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ চূড়ান্ত গেস্ট তালিকা প্রকাশ সংক্রান্ত"
                      value={newNoticeTitle}
                      onChange={e => setNewNoticeTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">বিস্তারিত বার্তা (Brief Message) *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="অ্যালামনাইদের উদ্দেশ্যে বিস্তারিত ঘোষণাটি এখানে প্রদান করুন..."
                      value={newNoticeDesc}
                      onChange={e => setNewNoticeDesc(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border text-gray-500 hover:bg-gray-100 px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transform active:scale-95 transition cursor-pointer"
                >
                  পাবলিশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
