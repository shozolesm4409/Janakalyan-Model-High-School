import React from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar,
  Search,
  X
} from 'lucide-react';
import { Event } from '../../types';

interface EventManagerProps {
  events: Event[];
  handleAddEvent: (e: React.FormEvent) => Promise<void>;
  handleDeleteEvent: (evId: string) => Promise<void>;
  newEventTitle: string;
  setNewEventTitle: (val: string) => void;
  newEventDesc: string;
  setNewEventDesc: (val: string) => void;
  newEventDate: string;
  setNewEventDate: (val: string) => void;
  newEventLoc: string;
  setNewEventLoc: (val: string) => void;
}

export const EventManager: React.FC<EventManagerProps & { isModalOpen: boolean; setIsModalOpen: (val: boolean) => void }> = ({ 
  events, 
  handleAddEvent, 
  handleDeleteEvent,
  newEventTitle,
  setNewEventTitle,
  newEventDesc,
  setNewEventDesc,
  newEventDate,
  setNewEventDate,
  newEventLoc,
  setNewEventLoc,
  isModalOpen,
  setIsModalOpen
}) => {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-gray-800 text-sm font-sans">কর্মসূচী ম্যানেজার (Event Management)</h3>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন কর্মসূচী যোগ করুন</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 font-sans">
          {events.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium font-sans">এখনও কোনো কর্মসূচী নির্ধারণ করা হয়নি।</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.sort((a,b) => (a.eventDate > b.eventDate ? 1 : -1)).map((ev) => (
                <div key={ev.eventId} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition relative group text-left">
                  <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => handleDeleteEvent(ev.eventId)}
                      className="p-1.5 bg-white shadow-xs border border-gray-100 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition"
                      title="Delete Event"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-primary font-bold font-mono">
                    <span className="bg-primary/10 px-1.5 py-0.5 rounded">📅 Schedule</span>
                    <span>{ev.eventDate}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-sm mt-2">{ev.title}</h4>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">{ev.location}</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-1 line-clamp-2">{ev.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-950 text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>নতুন কর্মসূচী যোগ করুন</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent}>
              <div className="p-6 space-y-4 text-left">
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">কর্মসূচীর নাম (Event Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ সুবর্ণ জয়ন্তী রিইউনিয়ন ২০২৫"
                      value={newEventTitle}
                      onChange={e => setNewEventTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">তারিখ (Event Date) *</label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={e => setNewEventDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">স্থান (Location)</label>
                    <input
                      type="text"
                      placeholder="উদাঃ স্কুল প্রাঙ্গণ"
                      value={newEventLoc}
                      onChange={e => setNewEventLoc(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">সংক্ষিপ্ত বিস্তারিত (Description)</label>
                    <textarea
                      rows={3}
                      placeholder="কর্মসূচী সম্পর্কে সংক্ষেপে লিখুন..."
                      value={newEventDesc}
                      onChange={e => setNewEventDesc(e.target.value)}
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
                  ইভেন্ট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
