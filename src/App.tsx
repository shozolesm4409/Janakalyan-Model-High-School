/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RegistrationForm } from './components/RegistrationForm';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './AdminDashboard';
import { checkAndSeedDatabase } from './seeding';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Gallery as GalleryType, Committee as CommitteeType } from './types';
import { 
  Award, 
  LogIn, 
  Mail, 
  Phone, 
  Lock, 
  Sparkles, 
  Globe, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  UserPlus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AlumniAppContent() {
  const { currentUser, loginWithGoogle, signUpWithEmail, loginWithEmail } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Loaded database items for general tabs (Gallery & Committee)
  const [gallery, setGallery] = useState<GalleryType[]>([]);
  const [committee, setCommittee] = useState<CommitteeType[]>([]);
  const [galleryFilter, setGalleryFilter] = useState('All');

  // Login forms local states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [batchInput, setBatchInput] = useState('2010');
  const [passwordInput, setPasswordInput] = useState('');

  // Auto redirect on authentication state change
  useEffect(() => {
    if (currentUser) {
      if (currentTab === 'home' || currentTab === 'register') {
        const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
        setCurrentTab(isAdmin ? 'admin-dash' : 'user-dash');
      }
    } else {
      if (currentTab === 'admin-dash' || currentTab === 'user-dash' || currentTab === 'register') {
        setCurrentTab('home');
      }
    }
  }, [currentUser]);

  // Trigger seeding on application start
  useEffect(() => {
    checkAndSeedDatabase();
  }, []);

  // Listen to Gallery and Committee for dedicated public pages (conforming to SKILL.md error rules)
  useEffect(() => {
    const galleryCol = collection(db, 'gallery');
    const unsubGallery = onSnapshot(galleryCol, (snapshot) => {
      const items: GalleryType[] = [];
      snapshot.forEach(doc => {
        items.push({ galleryId: doc.id, ...doc.data() } as GalleryType);
      });
      setGallery(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });

    const commCol = collection(db, 'committee');
    const unsubComm = onSnapshot(commCol, (snapshot) => {
      const items: CommitteeType[] = [];
      snapshot.forEach(doc => {
        items.push({ memberId: doc.id, ...doc.data() } as CommitteeType);
      });
      setCommittee(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'committee');
    });

    return () => {
      unsubGallery();
      unsubComm();
    };
  }, []);

  const handleRegisterNavigation = () => {
    if (!currentUser) {
      setAuthMode('signup');
      setShowLoginModal(true);
    } else {
      setCurrentTab('register');
    }
  };

  const handleEmailSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) return;
    try {
      await signUpWithEmail(nameInput, emailInput, mobileInput, batchInput, 'Alumni/User', passwordInput || 'password123');
      setShowLoginModal(false);
      setCurrentTab('register');
    } catch (err: any) {
      alert("নিবন্ধনে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      await loginWithEmail(emailInput, passwordInput || 'password123');
      setShowLoginModal(false);
    } catch (err: any) {
      alert("লগইন ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const categories = ['All', 'Historic Campus', 'Reunions', 'Old Memories', 'Golden Jubilee'];
  const filteredGallery = galleryFilter === 'All' 
    ? gallery 
    : gallery.filter(item => item.category === galleryFilter);

  return (
    <div className="min-h-screen bg-custom-bg flex flex-col justify-between selection:bg-secondary/30 selection:text-primary leading-relaxed font-sans">
      
      {/* 1. Header Navbar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        openLoginModal={() => { setAuthMode('login'); setShowLoginModal(true); }} 
      />

      {/* 2. Main Tab router panel */}
      <main className="flex-grow pt-8">
        <AnimatePresence mode="wait">
          
          {/* TAB: Home (LandingPage) */}
          {currentTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage 
                onRegisterClick={handleRegisterNavigation} 
                setCurrentTab={setCurrentTab}
              />
            </motion.div>
          )}

          {/* TAB: Album Gallery (Multi-decades filterable grid) */}
          {currentTab === 'gallery' && (
            <motion.div
              key="tab-gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-none w-full px-4 sm:px-10 lg:px-16 space-y-10 pb-20"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3.5xl font-display font-extrabold text-primary">ঐতিহাসিক ছবি অ্যালবাম (Walk down Memory Lane)</h1>
                <p className="text-sm text-gray-500 max-w-lg mx-auto">বিদ্যালয় প্রতিষ্ঠার পর থেকে আজ পর্যন্ত জমা হওয়া সোনালী স্মৃতির গ্যালারি কালেকশন।</p>
              </div>

              {/* Filters list buttons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 border-b pb-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition duration-200 ${
                      galleryFilter === cat
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-gray-600 border hover:bg-gray-50'
                    }`}
                  >
                    {cat === 'All' ? 'সব স্মৃতি' :
                     cat === 'Historic Campus' ? 'ক্যাম্পাস রূপ' :
                     cat === 'Reunions' ? 'রিইউনিয়ন snaps' :
                     cat === 'Old Memories' ? 'পুরনো স্মৃতি' : 'জয়ন্তী অ্যালবাম'}
                  </button>
                ))}
              </div>

              {/* Images Grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredGallery.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-400 font-mono">কোন ছবি আপলোড করা নাই।</div>
                ) : (
                  filteredGallery.map((item) => (
                    <motion.div
                      layout
                      key={item.galleryId}
                      className="bg-white rounded-xl overflow-hidden border border-gray-150 shadow-xs hover:shadow-md transition group"
                    >
                      <div className="aspect-video relative overflow-hidden bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-primary/95 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight group-hover:text-primary transition">{item.title}</h4>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: Organizing Committee Profiles list */}
          {currentTab === 'committee' && (
            <motion.div
              key="tab-committee"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-none w-full px-4 sm:px-10 lg:px-16 space-y-12 pb-20"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3.5xl font-display font-extrabold text-primary">উৎসব কমিটি ও সহযোগী সংগঠকবৃন্দ</h1>
                <p className="text-sm text-gray-500 max-w-lg mx-auto">অর্ধশতাব্দীর এই মিলনমেলাকে স্বার্থক করার লক্ষ্যে নিরলসভাবে পরিশ্রম করে চলা উদযাপন বা সাজসজ্জা কমিটি।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {committee.map((member) => (
                  <div key={member.memberId} className="bg-white rounded-xl shadow-xs border border-gray-150 p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition duration-200">
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-md"
                    />
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">{member.name}</h3>
                      <p className="text-amber-700 text-xs font-semibold font-sans">{member.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: Multi-steps formal registration form */}
          {currentTab === 'register' && (
            <motion.div
              key="tab-register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {regSuccess ? (
                <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-lg border border-gray-150 p-8 text-center space-y-5">
                  <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <h2 className="text-2.5xl font-extrabold text-gray-900 leading-tight">আবেদন সফল হয়েছে! (Registration Pending)</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    আপনার রেজিস্ট্রেশন বিবরণ এবং বিকাশ লেনদেনের স্ক্রিনশটটি সফলভাবে দাখিল করা হয়েছে। অ্যাডমিনদের যাচাইকরণ শেষে এটি অনুমোদিত হলে আপনার ড্যাশবোর্ডে প্রশংসাপত্র রিলিজ হবে।
                  </p>
                  <button
                    onClick={() => { setRegSuccess(false); setCurrentTab('user-dash'); }}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-lg font-bold shadow transition flex items-center justify-center space-x-1.5"
                  >
                    <span>আমার প্যানেলে যান (Go to Dashboard)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <RegistrationForm onSuccess={() => setRegSuccess(true)} />
              )}
            </motion.div>
          )}

          {/* TAB: Alumni workspace dashboard */}
          {currentTab === 'user-dash' && (
            <motion.div
              key="tab-user-dash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <UserDashboard setCurrentTab={setCurrentTab} />
            </motion.div>
          )}

          {/* TAB: Administrative desk */}
          {currentTab === 'admin-dash' && (
            <motion.div
              key="tab-admin-dash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. Global Decorative Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 font-sans">
        <div className="max-w-none w-full px-4 sm:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3 text-center md:text-left">
            <h3 className="font-display font-bold text-lg text-secondary">জনকল্যাণ মডেল হাই স্কুল সুবর্ণ জয়ন্তী</h3>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
               ৫০ বছর পূর্তি সুবর্ণ জয়ন্তী বা পুনর্মিলনী ২০২৬। এটি সম্পূর্ণ ক্লাউড ফায়ারস্টোর ডাটাবেজ সমন্বিত একটি আধুনিক অ্যালামনাই পোর্টাল।
            </p>
          </div>

          <div className="text-center space-y-2">
            <h4 className="text-sm font-semibold tracking-wide text-white uppercase">যোগাযোগ ও হেল্পডেস্ক</h4>
            <p className="text-xs text-gray-400 flex items-center justify-center space-x-1 font-mono">
              <Phone className="h-3 w-3 text-secondary" />
              <span>+৮৮০১৭১২-৩৪৫৬৭৮</span>
            </p>
            <p className="text-xs text-gray-400 flex items-center justify-center space-x-1 font-mono">
              <Mail className="h-3 w-3 text-secondary" />
              <span>jubilee@janakalyan-school.edu</span>
            </p>
          </div>

          <div className="text-center md:text-right space-y-3">
            <div className="text-xs text-gray-400">© 2026 Janakalyan Model High School Jubilee Committee.</div>
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              Built with React, Vite & Firebase BaaS
            </div>
          </div>

        </div>
      </footer>

      {/* 4. Global Interactive Sign-In/Register Modal Dialog */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border max-w-md w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-gray-800"
            >
              
              {/* Headings */}
              <div className="text-center space-y-2 relative">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute -right-2 -top-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 h-7 w-7 rounded-full flex items-center justify-center text-sm font-black transition"
                >
                  X
                </button>
                
                <div className="bg-amber-100 text-amber-800 p-2 rounded-full w-fit mx-auto mb-1 flex items-center justify-center">
                  <Award className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-primary">
                  {authMode === 'login' ? 'অ্যালামনাই পোর্টাল লগইন' : 'নতুন অ্যালামনাই একাউন্ট'}
                </h3>
                <p className="text-xs text-gray-500">
                  {authMode === 'login' 
                    ? 'গুগল পপআপ অথবা টেস্ট একাউন্ট সুইচ দিয়ে অবিলম্বে লগইন করুন।' 
                    : 'আপনার ব্যক্তিগত ও পাসের ব্যাচ উল্লেখ করে রেজিস্ট্রেশন সম্পন্ন করুন'}
                </p>
              </div>

              {/* Login/Signup Tab selector */}
              <div className="flex border-b text-xs font-bold font-sans">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 text-center py-2 border-b-2 transition ${
                    authMode === 'login' ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                  }`}
                >
                  লগইন (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 text-center py-2 border-b-2 transition ${
                    authMode === 'signup' ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                  }`}
                >
                  নতুন একাউন্ট (Sign Up)
                </button>
              </div>

              {/* Content forms */}
              {authMode === 'signup' ? (
                <form onSubmit={handleEmailSignUpSubmit} className="space-y-4 text-sm font-medium">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase">আপনার সম্পূর্ণ নাম *</label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      placeholder="উদাঃ মোহাম্মদ আব্দুল্লাহ"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:border-primary placeholder:text-gray-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase">ইউজার ইমেল ঠিকানা *</label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:border-primary placeholder:text-gray-400 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase">মোবাইল ফোন নাম্বার *</label>
                    <input
                      id="signup-mobile"
                      type="tel"
                      required
                      placeholder="০১৭xxxxxxxx"
                      value={mobileInput}
                      onChange={e => setMobileInput(e.target.value)}
                      className="w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:border-primary placeholder:text-gray-400 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase">এসএসসি পাসের ব্যাচ *</label>
                    <select
                      id="signup-batch"
                      value={batchInput}
                      onChange={e => setBatchInput(e.target.value)}
                      className="w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:border-primary text-sm font-mono"
                    >
                      {Array.from({ length: 51 }, (_, i) => String(1976 + i)).map(year => (
                        <option key={year} value={year}>{year} (SSC Batch)</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase">পাসওয়ার্ড (Password) *</label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      placeholder="পছন্দের পাসওয়ার্ড লিখুন (কমপক্ষে ৬ ডিজিট)"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      className="w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:border-primary placeholder:text-gray-400 text-sm font-mono"
                    />
                  </div>
                  <button
                    id="submit-register-form"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-lg font-bold shadow transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="h-4.5 w-4.5" />
                    <span>একাউন্ট তৈরি করুন</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Real Email & Password Login Form */}
                  <form onSubmit={handleEmailLoginSubmit} className="space-y-3 px-0.5 text-sm font-medium">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 uppercase font-bold">আপনার ইমেল (Login Email)</label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:border-primary placeholder:text-gray-400 text-sm font-mono bg-white shadow-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-gray-500 uppercase">
                        <label className="font-bold">পাসওয়ার্ড (Password)</label>
                        <span className="text-[10px] text-gray-400 font-sans normal-case">(ডিফল্ট: password123)</span>
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:border-primary placeholder:text-gray-400 text-sm font-mono bg-white shadow-xs"
                      />
                    </div>
                    <button
                      id="submit-login-form"
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-lg font-bold shadow transition flex items-center justify-center space-x-1.5 cursor-pointer text-sm"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Firebase দিয়ে সঠিক উপায়ে লগইন</span>
                    </button>
                  </form>

                  <div className="text-center text-xs text-slate-300 uppercase tracking-widest relative">
                    <span className="bg-white px-2.5 z-10 relative text-gray-450 font-bold">অথবা গুগল লগইন</span>
                    <hr className="absolute top-1/2 left-0 right-0 border-gray-150 z-0" />
                  </div>

                  {/* Google Login popup */}
                  <button
                    id="btn-google-login"
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                        setShowLoginModal(false);
                      } catch (err) {
                        alert("গুগল পপআপে সমস্যা হয়েছে। দয়া করে সঠিক ভাবে পপআপ উইন্ডো অ্যালাউ করুন।");
                      }
                    }}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2.5 rounded-lg font-bold shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer text-xs"
                  >
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span>Google দিয়ে সরাসরি লগইন (Google Auth)</span>
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlumniAppContent />
    </AuthProvider>
  );
}
