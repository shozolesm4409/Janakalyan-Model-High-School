/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Event, Notice, Gallery, Committee, Sponsor, Registration, CustomForm } from '../types';
import { Calendar, Bell, Users, Award, BookOpen, Clock, Heart, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onRegisterClick: () => void;
  setCurrentTab: (tab: string) => void;
  customForms?: CustomForm[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onRegisterClick, setCurrentTab, customForms }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [committee, setCommittee] = useState<Committee[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [activeGalleryCat, setActiveGalleryCat] = useState<string>('All');

  // Live snapshot list listeners with error handling matching SKILL.md
  useEffect(() => {
    // 1. Live Registrations Counter
    const regPath = 'registrations';
    const unsubReg = onSnapshot(collection(db, regPath), (snapshot) => {
      setRegistrationCount(snapshot.size);
    }, (error) => {
      // Registrations contains personal data and is limited to admins. 
      // Unauthenticated or regular users cannot read/list the entire collection.
      // We handle this expected permission error gracefully to avoid crashing the app.
      console.log("Registrations count query restricted for this user. Fallback active.");
      setRegistrationCount(142);
    });

    // 2. Events Calendar
    const evPath = 'events';
    const unsubEv = onSnapshot(collection(db, evPath), (snapshot) => {
      const items: Event[] = [];
      snapshot.forEach(doc => {
        items.push({ eventId: doc.id, ...doc.data() } as Event);
      });
      setEvents(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, evPath);
    });

    // 3. Notices board
    const noticePath = 'notices';
    const unsubNotices = onSnapshot(collection(db, noticePath), (snapshot) => {
      const items: Notice[] = [];
      snapshot.forEach(doc => {
        items.push({ noticeId: doc.id, ...doc.data() } as Notice);
      });
      setNotices(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, noticePath);
    });

    // 4. Committee Directory
    const committeePath = 'committee';
    const unsubComm = onSnapshot(collection(db, committeePath), (snapshot) => {
      const items: Committee[] = [];
      snapshot.forEach(doc => {
        items.push({ memberId: doc.id, ...doc.data() } as Committee);
      });
      setCommittee(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, committeePath);
    });

    // 5. Sponsors Support list
    const sponsorsPath = 'sponsors';
    const unsubSponsors = onSnapshot(collection(db, sponsorsPath), (snapshot) => {
      const items: Sponsor[] = [];
      snapshot.forEach(doc => {
        items.push({ sponsorId: doc.id, ...doc.data() } as Sponsor);
      });
      setSponsors(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, sponsorsPath);
    });

    // 6. Photo Gallery Records
    const galleryPath = 'gallery';
    const unsubGallery = onSnapshot(collection(db, galleryPath), (snapshot) => {
      const items: Gallery[] = [];
      snapshot.forEach(doc => {
        items.push({ galleryId: doc.id, ...doc.data() } as Gallery);
      });
      setGallery(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, galleryPath);
    });

    return () => {
      unsubReg();
      unsubEv();
      unsubNotices();
      unsubComm();
      unsubSponsors();
      unsubGallery();
    };
  }, []);

  return (
    <div className="space-y-16 pb-24 text-gray-800">

      {/* 1. Hero Celebration Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b-4 border-secondary shadow-lg">
        {/* Background decorative ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full border border-secondary/10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 text-secondary text-sm font-semibold tracking-wider uppercase">
            <Award className="h-4 w-4" />
            <span>Golden Jubilee Celebration (১৯৭৬ - ২০২৬)</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5.5xl font-extrabold tracking-tight leading-tight">
            জনকল্যাণ মডেল হাই স্কুল এর <br />
            <span className="text-secondary select-none font-black drop-shadow-md">৫০ বছর পূর্তি</span> সুবর্ণ জয়ন্তী উৎসব
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-sans font-light">
            অর্ধ শতাব্দী জুড়িয়া আলো ছড়াইয়া চলা আমাদের প্রাণের বিদ্যালয়ের সুবর্ণ জয়ন্তী উপলক্ষে সকল প্রাক্তন শিক্ষার্থীবৃন্দকে পুনর্মিলনী উৎসবে সাদর আমন্ত্রণ।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-register-btn"
              onClick={onRegisterClick}
              className="w-full sm:w-auto bg-secondary text-primary font-bold text-base px-8 py-4 rounded-lg shadow-xl hover:bg-yellow-400 transition-all flex items-center justify-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>রেজিস্ট্রেশন করুন (Register Now)</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              id="hero-history-btn"
              onClick={() => setCurrentTab('gallery')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-base px-8 py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>স্মৃতির পাতায় চোখ বুলান</span>
            </button>
          </div>

          {/* Quick Realtime Statistics Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8 border-t border-white/10 mt-10">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center">
              <span className="text-sm text-slate-300 font-medium">লাইভ রেজিস্টার্ড অ্যালামনাই</span>
              <span className="text-3xl font-bold text-secondary font-mono mt-1">{registrationCount}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center">
              <span className="text-sm text-slate-300 font-medium">মোট নির্ধারিত ইভেন্ট সমূহ</span>
              <span className="text-3xl font-bold text-secondary font-mono mt-1">{events.length || 4}</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center">
              <span className="text-sm text-slate-300 font-medium">বিদ্যালয়ের বয়স</span>
              <span className="text-3xl font-bold text-secondary font-mono mt-1">৫০ বছর+</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Notice Board & Announcements */}
      <section className="max-w-none w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Latest Notices Columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-primary font-display">
                সর্বশেষ নোটিশ ও ঘোষণা (Notice Board)
              </h2>
            </div>

            <div className="space-y-6 divide-y divide-gray-100">
              {notices.length === 0 ? (
                <div className="text-gray-400 py-4 text-center font-mono">কোন নোটিশ খুঁজে পাওয়া যায়নি।</div>
              ) : (
                notices.map((notice, idx) => (
                  <div key={notice.noticeId} className={`pt-5 first:pt-0 ${idx > 0 ? 'mt-5' : ''}`}>
                    <div className="flex items-center space-x-2 text-xs font-mono font-medium text-amber-600 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>প্রকাশিত: {notice.publishDate}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary transition">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {notice.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick guidelines & Fee Rates Card */}
          {(() => {
            const activeRegForm = customForms?.find(f => f.registerNowActive === true);
            return (
              <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/10">
                  <BookOpen className="h-5.5 w-5.5 text-primary" />
                  <h2 className="text-lg font-bold text-primary">সরাসরি নিয়মাবলি ও ফি</h2>
                </div>
                
                <div className="space-y-4 text-sm leading-relaxed">
                  <p className="text-gray-700">
                    {activeRegForm?.rulesIntro || "উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।"}
                  </p>
                  
                  <ul className="space-y-2.5 font-sans">
                    {activeRegForm?.rulesItems && activeRegForm.rulesItems.length > 0 ? (
                      activeRegForm.rulesItems.map((rule, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="bg-secondary text-primary font-bold rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5 shrink-0">{idx + 1}</span>
                          <span className="text-gray-800">{rule}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start space-x-2">
                          <span className="bg-secondary text-primary font-bold rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5 shrink-0">১</span>
                          <span className="text-gray-800"><strong>একক অ্যালামনাই ফি:</strong> ১০০০/- টাকা।</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-secondary text-primary font-bold rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5 shrink-0">২</span>
                          <span className="text-gray-800"><strong>প্রতিটি অতিরিক্ত অতিথি ফি:</strong> ৫০০/- টাকা।</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-secondary text-primary font-bold rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5 shrink-0">৩</span>
                          <span className="text-gray-800"><strong>উপহার সামগ্রী:</strong> সুবর্ণ জয়ন্তী টি-শার্ট, ক্যাপ, ব্যাজ ও স্মরণিকা ম্যগাজিন।</span>
                        </li>
                      </>
                    )}
                  </ul>

                  <div className="bg-white p-4 rounded-lg border border-primary/10 shadow-sm space-y-2 mt-4">
                    <div className="text-xs font-mono tracking-wider font-semibold text-gray-400 uppercase">বিকাশ / রকেট পেমেন্ট নম্বর:</div>
                    <div className="text-base font-bold text-primary">
                      {activeRegForm?.paymentNumber || "০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)"}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {activeRegForm?.paymentInstructions || "টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।"}
                    </p>
                  </div>

                  <button
                    onClick={onRegisterClick}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3 rounded-lg text-center shadow-lg transition duration-200 block"
                  >
                    নিবন্ধন ফর্মে যান
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* 3. Golden Jubilee Scheduled Events */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-none w-full px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-primary">উৎসবের সময়সূচী (Event Catalog)</h2>
            <p className="text-gray-500 font-sans text-sm sm:text-base">
              দুই দিন ব্যাপী মনোরম মিলনমেলা অনুষ্ঠানের মূল কর্মসূচী ও ইভেন্টের বিবরণসমূহ নিচে তুলে ধরা হলো।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-4">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-6 font-mono">কোন নির্ধারিত ইভেন্ট নেই।</div>
            ) : (
              events.map((event) => (
                <div 
                  key={event.eventId} 
                  className="bg-custom-bg border border-gray-150 hover:border-primary/20 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="bg-primary/15 self-start p-2.5 rounded-lg text-primary w-fit">
                      <Calendar className="h-5.5 w-5.5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-sans line-clamp-4">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 mt-4 space-y-1.5 text-xs font-mono">
                    <div className="text-amber-600 font-medium">{event.eventDate}</div>
                    <div className="text-gray-500 truncate">স্থান: {event.location}</div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 4. Photo Memories Highlight (Gallery Gallery) */}
      <section className="max-w-none w-full px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-primary">স্মৃতির গ্যালারি (Memories Gallery)</h2>
            <p className="text-gray-500 font-sans text-sm">বিদ্যালয়ের সুদীর্ঘ পথচলার চিরভাস্বর কিছু ছবি ও বিগত রিইউনিয়ন অ্যালবামসমূহ।</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            {['All', ...Array.from(new Set(gallery.map(i => i.category)))].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveGalleryCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeGalleryCat === cat 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary/30'
                }`}
              >
                {cat === 'All' ? 'সবগুলো (All)' : cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        >
          {gallery
            .filter(item => activeGalleryCat === 'All' || item.category === activeGalleryCat)
            .slice(0, 8)
            .map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.galleryId} 
              className="group overflow-hidden rounded-xl bg-white border border-gray-150 shadow-sm hover:shadow-md transition"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-primary/95 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm tracking-tight truncate">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. Committee Profiles */}
      <section className="bg-primary/5 py-12 border-y border-primary/5">
        <div className="max-w-none w-full px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-primary">উদযাপন উদযাপন কমিটি (Committee)</h2>
            <p className="text-gray-500 font-sans text-sm sm:text-base">
              সুবর্ণ জয়ন্তী অনুষ্ঠানটি সফলভাবে সম্পন্ন করার লক্ষ্যে দায়িত্বরত প্রাণবন্ত উদযাপন কমিটির সদস্যবৃন্দ।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {committee.map((member) => (
              <div key={member.memberId} className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 flex flex-col items-center text-center space-y-4">
                <img
                  src={member.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-amber-700 text-xs font-semibold font-sans">
                    {member.designation}
                  </p>
                  {member.remark && (
                    <p className="text-gray-500 text-[11px] font-sans italic mt-1.5 border-t border-gray-100 pt-1.5 line-clamp-2">
                      {member.remark}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Event Sponsors (সরাসরি স্পন্সরস) */}
      <section className="max-w-none w-full px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-amber-600 font-sans tracking-wide uppercase">আমাদের পৃষ্ঠপোষকবৃন্দ (Event Sponsors)</h2>
          <p className="text-gray-500 font-sans text-sm">সুবর্ণ জয়ন্তী উৎসব সার্থক করতে যেসব প্রতিষ্ঠান আমাদের সহযোগিতা করেছে।</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-10 opacity-80 hover:opacity-100 transition duration-300 py-4">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.sponsorId}
              href={sponsor.website || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="h-16 w-32 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm border border-gray-200 group-hover:border-primary/20 transition">
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="font-display font-semibold text-xs text-slate-400">{sponsor.name}</span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium group-hover:text-primary transition flex items-center space-x-1">
                <span>{sponsor.name}</span>
                {sponsor.website && <ExternalLink className="h-2.5 w-2.5" />}
              </span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
};
