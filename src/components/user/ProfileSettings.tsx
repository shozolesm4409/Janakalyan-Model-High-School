import React from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Settings, 
  Camera, 
  Save, 
  Clock,
  Image as ImageIcon 
} from 'lucide-react';

interface ProfileSettingsProps {
  currentUser: any;
  name: string;
  setName: (val: string) => void;
  mobile: string;
  setMobile: (val: string) => void;
  batch: string;
  setBatch: (val: string) => void;
  photo: string;
  saving: boolean;
  handleSaveProfile: (e: React.FormEvent) => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  currentUser, 
  name, 
  setName, 
  mobile, 
  setMobile, 
  batch, 
  setBatch, 
  photo, 
  saving, 
  handleSaveProfile, 
  handleFileChange,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop
}) => {
  return (
    <motion.div
      key="subtab-profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-10 space-y-8 font-sans"
    >
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
        <Settings className="h-5.5 w-5.5 text-primary" />
        <h3 className="text-lg font-bold text-gray-800">অ্যালামনাই প্রোফাইল সম্পাদন করুন</h3>
      </div>
      
      <form onSubmit={handleSaveProfile} className="space-y-8 text-left">
        {/* Avatar Upload Dropzone */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-32 w-32 rounded-3xl relative group overflow-hidden ring-4 transition ${
              isDragging ? 'ring-primary bg-primary/5' : 'ring-gray-100 bg-gray-50'
            }`}
          >
            {photo ? (
              <img src={photo} alt="P" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-300">
                <UserIcon className="h-12 w-12" />
              </div>
            )}
            
            <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-bold uppercase">Change Photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-sm font-bold text-gray-800">অফিশিয়াল প্রোফাইল ছবি</h4>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed">ছবির সাইজ ২ মেগাবাইটের কম হতে হবে এবং ফরমাল ছবি বাঞ্ছনীয়।</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" /> পূর্ণ নাম (Full Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:bg-white transition"
              placeholder="আপনার নাম লিখুন..."
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> এসএসসি ব্যাচ (Passing Batch) *
            </label>
            <input
              type="text"
              required
              value={batch}
              onChange={e => setBatch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-primary focus:bg-white transition"
              placeholder="উদাঃ ২০১৫"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <Settings className="h-3.5 w-3.5" /> আপডেট মোবাইল নম্বর (Mobile) *
          </label>
          <input
            type="tel"
            required
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-primary focus:bg-white transition"
            placeholder="০১৭xxxxxxxx"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-2xl cursor-pointer transition shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
        >
          {saving ? (
            <span className="flex items-center space-x-2">
              <Clock className="h-4.5 w-4.5 animate-spin" />
              <span>পরিবর্তন সংরক্ষণ হচ্ছে...</span>
            </span>
          ) : (
            <>
              <Save className="h-4.5 w-4.5 group-hover:scale-110 transition shrink-0" />
              <span>প্রোফাইল তথ্য আপডেট করুন</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
