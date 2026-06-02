/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Swal from 'sweetalert2';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './AdminDashboard';
import { GalleryPage } from './components/GalleryPage';
import { CommitteePage } from './components/CommitteePage';
import { checkAndSeedDatabase } from './seeding';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
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
  ArrowRight,
  Send,
  CheckCircle,
  Upload,
  BookOpen
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

  // Real-time custom forms and fields
  const [customForms, setCustomForms] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, any>>({});
  const [paymentGateway, setPaymentGateway] = useState<string>('');
  const [paymentCashOption, setPaymentCashOption] = useState<string>('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [paymentTrxId, setPaymentTrxId] = useState<string>('');
  const [activeCustomFormStep, setActiveCustomFormStep] = useState<number>(1);
  const [formSubmitting, setFormSubmitting] = useState(false);

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
      if (currentTab === 'home') {
        const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
        setCurrentTab(isAdmin ? 'admin-dash' : 'user-dash');
      }
    } else {
      if (currentTab === 'admin-dash' || currentTab === 'user-dash' || currentTab === 'register') {
        setCurrentTab('home');
      }
    }
  }, [currentUser]);

  // Listen to Custom Forms & Fields in App
  useEffect(() => {
    const unsubForms = onSnapshot(collection(db, 'forms'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data());
      });
      setCustomForms(items);
    }, (error) => {
      console.error('App custom forms read error:', error);
    });

    const unsubFields = onSnapshot(collection(db, 'form_fields'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data());
      });
      setCustomFields(items);
    }, (error) => {
      console.error('App custom fields read error:', error);
    });

    return () => {
      unsubForms();
      unsubFields();
    };
  }, []);

  // Trigger seeding on application start
  useEffect(() => {
    checkAndSeedDatabase();
  }, []);

  // Auto-populate custom fields for name, profile image/photo, or file inputs
  useEffect(() => {
    if (!currentUser) return;
    const activeForm = customForms.find(f => f.registerNowActive === true);
    if (!activeForm) return;

    const fields = customFields.filter(f => f.formId === activeForm.formId);
    let updated = false;
    const newData = { ...dynamicFieldsData };

    fields.forEach(f => {
      const labelLower = (f.label || '').toLowerCase();
      
      // 1. Auto-fill applicant name
      const isNameField = labelLower.includes('নাম') || 
                          labelLower.includes('name') || 
                          labelLower.includes('আবেদনকারী') ||
                          (f.fieldType === 'text' && labelLower.includes('applicant'));
      if (isNameField && !newData[f.fieldId] && currentUser.name) {
        newData[f.fieldId] = currentUser.name;
        updated = true;
      }

      // 2. Auto-attach profile photo to image/file field
      const isFileField = f.fieldType === 'file' || 
                          labelLower.includes('ছবি') || 
                          labelLower.includes('photo') || 
                          labelLower.includes('image') || 
                          labelLower.includes('attachment') || 
                          labelLower.includes('সংযুক্তি');
      if (isFileField && !newData[f.fieldId] && currentUser.profilePhoto) {
        newData[f.fieldId] = currentUser.profilePhoto;
        updated = true;
      }

      // 3. Optional extra nice-to-have auto-fills: Mobile, Batch, Email if empty
      const isMobileField = f.fieldType === 'mobile' || labelLower.includes('mobile') || labelLower.includes('tel') || labelLower.includes('ফোন') || labelLower.includes('মোবাইল');
      if (isMobileField && !newData[f.fieldId] && currentUser.mobile) {
        newData[f.fieldId] = currentUser.mobile;
        updated = true;
      }

      const isEmailField = f.fieldType === 'email' || labelLower.includes('email') || labelLower.includes('ইমেইল');
      if (isEmailField && !newData[f.fieldId] && currentUser.email) {
        newData[f.fieldId] = currentUser.email;
        updated = true;
      }

      const isBatchField = labelLower.includes('batch') || labelLower.includes('ব্যাচ') || labelLower.includes('ssc');
      if (isBatchField && !newData[f.fieldId] && currentUser.batch) {
        newData[f.fieldId] = currentUser.batch;
        updated = true;
      }
    });

    if (updated) {
      setDynamicFieldsData(newData);
    }
  }, [currentUser, customForms, customFields]);

  const getFormTotalAmount = (activeForm: any, dynamicFieldsData: Record<string, any>) => {
    // Find guest count field value
    const guestField = customFields.find(f => {
      const lbl = (f.label || '').toLowerCase();
      return lbl.includes('guest') || lbl.includes('guestcount') || lbl.includes('guest count') || lbl.includes('guest_count') || lbl.includes('guestcount') || lbl.includes('অতিথি') || lbl.includes('মেহমান') || lbl.includes('অতিরিক্ত সদস্য');
    });
    
    let guestCount = 0;
    if (guestField) {
      const val = dynamicFieldsData[guestField.fieldId];
      if (val) {
        const parsed = parseInt(val, 10);
        guestCount = isNaN(parsed) ? 0 : parsed;
      }
    }

    const alumniFee = Number(activeForm.alumniFee) || 0;
    const guestFee = Number(activeForm.guestFee) || 0;
    const totalGuestFee = guestCount * guestFee;
    return alumniFee + totalGuestFee;
  };

  const handleCustomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeForm = customForms.find(f => f.registerNowActive === true);
    if (!activeForm) return;

    if (activeForm.permission === 'login_required' && !currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'অ্যাক্সেস ডিনাইড!',
        text: 'এই ফর্মটি পূরণের জন্য অনুগ্রহ করে অ্যাকাউন্ট লগইন বা সাইন আপ করুন।',
      });
      return;
    }

    if (activeForm.permission === 'batch_restricted') {
      const allowedBatch = activeForm.restrictedBatch?.trim();
      const userBatch = currentUser?.batch?.trim();
      if (allowedBatch && userBatch !== allowedBatch) {
        Swal.fire({
          icon: 'error',
          title: 'সীমাবদ্ধতা!',
          text: `দুঃখিত! এই ফর্মটি শুধুমাত্র এসএসসি ${allowedBatch} পাসের ব্যাচের শিক্ষার্থীদের জন্য সীমাবদ্ধ।`,
        });
        return;
      }
    }

    const currentFields = customFields.filter(f => f.formId === activeForm.formId);
    for (const f of currentFields) {
      if (f.required && !dynamicFieldsData[f.fieldId]) {
        Swal.fire({
          icon: 'warning',
          title: 'তথ্য ফিল্ড ফাঁকা!',
          text: `"${f.label}" ফিল্ডটি অবশ্যই পূরণ করতে হবে।`,
        });
        return;
      }
    }

    const isFeeRequired = ((Number(activeForm.alumniFee) || 0) > 0 || (Number(activeForm.guestFee) || 0) > 0);
    const hasAccounts = !!(activeForm.bkashNumber || activeForm.nagadNumber || activeForm.rocketNumber || (activeForm.cashOptions && activeForm.cashOptions.length > 0));
    if (isFeeRequired && hasAccounts) {
      if (!paymentGateway) {
        Swal.fire({
          icon: 'warning',
          title: 'পেমেন্ট গেটওয়ে!',
          text: 'অনুগ্রহ করে একটি মোবাইল পেমেন্ট গেটওয়ে (বিকাশ/নগদ/রকেট/ক্যাশ) সিলেক্ট করুন।',
        });
        return;
      }
      if (paymentGateway === 'Cash') {
         if (!paymentCashOption) {
            Swal.fire({
              icon: 'warning',
              title: 'ক্যাশ অপশন!',
              text: 'অনুগ্রহ করে একটি ক্যাশ অপশন সিলেক্ট করুন।',
            });
            return;
         }
      } else if (paymentGateway !== 'Cash' && !paymentScreenshot && !paymentTrxId.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'পেমেন্ট যাচাইকরণ!',
          text: 'অনুগ্রহ করে পেমেন্ট সফল হওয়ার স্ক্রিনশট আপলোড করুন অথবা ট্রানজেকশন আইডি (TrxID) প্রদান করুন।',
        });
        return;
      }
    }

    setFormSubmitting(true);
    try {
      const subId = `sub_${Date.now()}`;
      const finalData = { ...dynamicFieldsData };
      if (paymentGateway) {
        finalData['paymentGateway'] = paymentGateway;
      }
      if (paymentGateway === 'Cash' && paymentCashOption) {
        finalData['paymentCashOption'] = paymentCashOption;
      }
      if (paymentScreenshot) {
        finalData['paymentScreenshot'] = paymentScreenshot;
      }
      if (paymentTrxId.trim()) {
        finalData['paymentTrxId'] = paymentTrxId.trim();
      }
      finalData['amount'] = getFormTotalAmount(activeForm, dynamicFieldsData);

      await setDoc(doc(db, 'form_submissions', subId), {
        submissionId: subId,
        formId: activeForm.formId,
        userId: currentUser?.uid || 'anonymous',
        userName: currentUser?.name || 'Anonymous User',
        userEmail: currentUser?.email || 'N/A',
        data: finalData,
        submittedAt: new Date().toISOString()
      });

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: activeForm.successMessage || 'আপনার ডাটা সফলভাবে ফর্মে সাবমিট করা হয়েছে!',
      });
      setDynamicFieldsData({});
      setPaymentGateway('');
      setPaymentScreenshot('');
      setPaymentTrxId('');
      setRegSuccess(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'তথ্য সাবমিট করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

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
      Swal.fire({
        icon: 'error',
        title: 'নিবন্ধনে ত্রুটি!',
        text: err.message,
      });
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      await loginWithEmail(emailInput, passwordInput || 'password123');
      setShowLoginModal(false);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'লগইন ত্রুটি!',
        text: err.message,
      });
    }
  };

  const defaultCategories = ['All', 'Historic Campus', 'Reunions', 'Old Memories', 'Golden Jubilee'];
  const galleryItemCategories = Array.from(new Set(gallery.map(item => item.category).filter(Boolean)));
  const categories = Array.from(new Set([...defaultCategories, ...galleryItemCategories]));

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
                customForms={customForms}
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
            >
              <GalleryPage 
                categories={categories}
                galleryFilter={galleryFilter}
                setGalleryFilter={setGalleryFilter}
                filteredGallery={filteredGallery}
              />
            </motion.div>
          )}

          {/* TAB: Organizing Committee Profiles list */}
          {currentTab === 'committee' && (
            <motion.div
              key="tab-committee"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <CommitteePage committee={committee} />
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
              ) : customForms.find(f => f.registerNowActive === true) ? (
                (() => {
                  const activeForm = customForms.find(f => f.registerNowActive === true);
                  const targetFields = customFields
                    .filter(f => f.formId === activeForm.formId)
                    .sort((a,b) => a.sortOrder - b.sortOrder);
                  
                  const totalSteps = activeForm.totalSteps || 1;
                  let fieldsToRender = targetFields;
                  
                  if (totalSteps > 1) {
                    const chunkSize = Math.ceil(targetFields.length / totalSteps);
                    const startIndex = (activeCustomFormStep - 1) * chunkSize;
                    const endIndex = startIndex + chunkSize;
                    fieldsToRender = targetFields.slice(startIndex, endIndex);
                  }

                  return (
                    <div className="max-w-3xl mx-auto my-6 bg-white rounded-xl shadow-lg border border-gray-150 p-6 sm:p-8 space-y-6">
                      <div className="text-center space-y-2 pb-4 border-b">
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded inline-block font-sans">
                          সক্রিয় কাস্টম নিবন্ধন ফর্ম (Linked Active Form)
                        </span>
                        <h2 className="text-2xl sm:text-2.5xl font-extrabold text-primary font-display">{activeForm.title}</h2>
                        {activeForm.description && (
                          <p className="text-xs text-gray-500 max-w-lg mx-auto font-sans leading-relaxed">{activeForm.description}</p>
                        )}
                      </div>
                      
                      {/* Step Indicator */}
                      {totalSteps > 1 && (
                        <div className="flex items-center justify-between border-b border-gray-150 pb-3 mt-4">
                          <span className="text-xs font-extrabold text-gray-500 uppercase">ধাপ {activeCustomFormStep} / {totalSteps}</span>
                          <div className="flex space-x-1.5">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                              <div key={i} className={`h-2 w-8 rounded-full ${activeCustomFormStep >= i + 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <form onSubmit={handleCustomFormSubmit} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-gray-150 p-4.5 rounded-xl text-left">
                          
                          {/* Beautiful Guidelines & Fee Rates Card inside the Active Dynamic Form */}
                          {activeForm.showRulesWidget !== false && activeCustomFormStep === 1 && (
                            <div className="sm:col-span-2 bg-indigo-50/50 rounded-xl border border-indigo-150 p-5 space-y-4 text-left font-sans shadow-3xs mb-2">
                              <div className="flex items-center space-x-2 pb-2 border-b border-indigo-150">
                                <BookOpen className="h-5 w-5 text-indigo-700 font-bold" />
                                <h2 className="text-sm font-extrabold text-indigo-900">সরাসরি নিয়মাবলি ও ফি (Rules & Payment Guide)</h2>
                              </div>
                              
                              <div className="space-y-3.5 text-xs leading-relaxed text-gray-700">
                                <p className="font-semibold text-gray-750">
                                  {activeForm.rulesIntro || "উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।"}
                                </p>
                                
                                <ul className="space-y-2 font-sans">
                                  {activeForm.rulesItems && activeForm.rulesItems.length > 0 ? (
                                    activeForm.rulesItems.map((rule, index) => (
                                      <li key={index} className="flex items-start space-x-2">
                                        <span className="bg-indigo-600 text-white font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center text-[10px] shrink-0">{index + 1}</span>
                                        <span className="text-gray-850">{rule}</span>
                                      </li>
                                    ))
                                  ) : (
                                    <>
                                      <li className="flex items-start space-x-2">
                                        <span className="bg-indigo-600 text-white font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center text-[10px] shrink-0">১</span>
                                        <span className="text-gray-850"><strong>একক অ্যালামনাই ফি:</strong> ১০০০/- টাকা।</span>
                                      </li>
                                      <li className="flex items-start space-x-2">
                                        <span className="bg-indigo-600 text-white font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center text-[10px] shrink-0">২</span>
                                        <span className="text-gray-850"><strong>প্রতিটি অতিরিক্ত অতিথি ফি:</strong> ৫০০/- টাকা।</span>
                                      </li>
                                      <li className="flex items-start space-x-2">
                                        <span className="bg-indigo-600 text-white font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center text-[10px] shrink-0">৩</span>
                                        <span className="text-gray-850"><strong>উপহার সামগ্রী:</strong> সুবর্ণ জয়ন্তী টি-শার্ট, ক্যাপ, ব্যাজ ও স্মরণিকা ম্যাগাজিন।</span>
                                      </li>
                                    </>
                                  )}
                                </ul>

                                <div className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-3xs space-y-1.5 mt-2">
                                  <div className="text-[9.5px] font-mono tracking-wider font-extrabold text-gray-450 uppercase">বিকাশ / রকেট পেমেন্ট নম্বর:</div>
                                  <div className="text-sm font-extrabold text-indigo-800 font-mono">
                                    {activeForm.paymentNumber || "০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)"}
                                  </div>
                                  <p className="text-[10px] text-gray-500 leading-normal">
                                    {activeForm.paymentInstructions || "টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {fieldsToRender.map((f) => {
                              const isReq = !!f.required;
                              return (
                                <div key={f.fieldId} className={`space-y-1.5 ${
                                  ['textarea', 'address', 'signature'].includes(f.fieldType) ? 'sm:col-span-2' : ''
                                }`}>
                                  <label className="font-bold text-xs text-gray-700 block col-span-full">
                                    {f.label} {isReq && <span className="text-red-500">*</span>}
                                  </label>

                                  {f.fieldType === 'text' && (
                                    <input
                                      type="text"
                                      required={isReq}
                                      placeholder={f.placeholder || 'উত্তর লিখুন'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                    />
                                  )}

                                  {f.fieldType === 'textarea' && (
                                    <textarea
                                      rows={3}
                                      required={isReq}
                                      placeholder={f.placeholder || 'বিস্তারিত লিখুন...'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                    />
                                  )}

                                  {f.fieldType === 'number' && (
                                    <input
                                      type="number"
                                      required={isReq}
                                      placeholder={f.placeholder || 'সংখ্যা'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                    />
                                  )}

                                  {f.fieldType === 'email' && (
                                    <input
                                      type="email"
                                      required={isReq}
                                      placeholder={f.placeholder || 'example@mail.com'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                    />
                                  )}

                                  {f.fieldType === 'mobile' && (
                                    <input
                                      type="tel"
                                      required={isReq}
                                      placeholder={f.placeholder || '01XXXXXXXXX'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                    />
                                  )}

                                  {f.fieldType === 'password' && (
                                    <input
                                      type="password"
                                      required={isReq}
                                      placeholder="••••••••"
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                    />
                                  )}

                                  {f.fieldType === 'url' && (
                                    <input
                                      type="url"
                                      required={isReq}
                                      placeholder="https://example.com"
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                    />
                                  )}

                                  {f.fieldType === 'color' && (
                                    <input
                                      type="color"
                                      required={isReq}
                                      value={dynamicFieldsData[f.fieldId] || '#10B981'}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-16 h-8 border rounded-lg cursor-pointer bg-white"
                                    />
                                  )}

                                  {f.fieldType === 'date' && (
                                    <input
                                      type="date"
                                      required={isReq}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                    />
                                  )}

                                  {f.fieldType === 'time' && (
                                    <input
                                      type="time"
                                      required={isReq}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                    />
                                  )}

                                  {f.fieldType === 'datetime' && (
                                    <input
                                      type="datetime-local"
                                      required={isReq}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                    />
                                  )}

                                  {f.fieldType === 'dropdown' && (
                                    <select
                                      required={isReq}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer font-sans"
                                    >
                                      <option value="">-- নির্বাচন করুন (Select Option) --</option>
                                      {f.options?.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  )}

                                  {f.fieldType === 'address' && (
                                    <textarea
                                      rows={2}
                                      required={isReq}
                                      placeholder={f.placeholder || 'ঠিকানা বা লোকেশন লিখুন...'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                    />
                                  )}

                                  {f.fieldType === 'file' && (
                                    <div className="space-y-2">
                                      <input
                                        type="file"
                                        required={isReq && !dynamicFieldsData[f.fieldId]}
                                        accept="image/*,application/pdf"
                                        onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                            if (file.size > 3 * 1024 * 1024) {
                                              Swal.fire({
                                                icon: 'error',
                                                title: 'বড় ফাইল!',
                                                text: 'ফাইলের সাইজ অনেক বড়! সর্বোচ্চ ৩ মেগাবাইট (3MB) পর্যন্ত ফাইল আপলোড করতে পারবেন।',
                                              });
                                              return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: reader.result as string }));
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="w-full text-xs font-sans text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
                                      />
                                      {dynamicFieldsData[f.fieldId] && (
                                        <div className="border border-gray-200 rounded-lg p-2 bg-white flex items-center justify-between">
                                          <span className="text-[10px] text-green-650 font-semibold truncate max-w-[80%] flex items-center space-x-1">
                                            <CheckCircle className="h-3.5 w-3.5 inline text-green-500" />
                                            <span>ফাইল লোড হয়েছে (File uploaded successfully)</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setDynamicFieldsData(prev => {
                                              const copy = { ...prev };
                                              delete copy[f.fieldId];
                                              return copy;
                                            })}
                                            className="text-[10px] text-red-550 border hover:bg-red-50 p-1 px-2 rounded font-bold"
                                          >
                                            রিমুভ
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {f.fieldType === 'radio' && (
                                    <div className="flex flex-wrap gap-4 pt-1">
                                      {f.options?.map((opt) => (
                                        <label key={opt} className="flex items-center space-x-2 text-xs font-sans text-gray-700 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={f.fieldId}
                                            required={isReq}
                                            checked={dynamicFieldsData[f.fieldId] === opt}
                                            onChange={() => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: opt }))}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                          />
                                          <span>{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}

                                  {f.fieldType === 'checkbox' && (
                                    <div className="flex flex-wrap gap-4 pt-1">
                                      {f.options?.map((opt) => {
                                        const selectedValues = Array.isArray(dynamicFieldsData[f.fieldId]) 
                                          ? dynamicFieldsData[f.fieldId] 
                                          : (dynamicFieldsData[f.fieldId] ? [dynamicFieldsData[f.fieldId]] : []);
                                        const isChecked = selectedValues.includes(opt);
                                        return (
                                          <label key={opt} className="flex items-center space-x-2 text-xs font-sans text-gray-700 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(ev) => {
                                                let newVals;
                                                if (ev.target.checked) {
                                                  newVals = [...selectedValues, opt];
                                                } else {
                                                  newVals = selectedValues.filter((v: string) => v !== opt);
                                                }
                                                setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: newVals }));
                                              }}
                                              className="h-4 w-4 text-primary rounded focus:ring-primary border-gray-300"
                                            />
                                            <span>{opt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {f.fieldType === 'signature' && (
                                    <textarea
                                      rows={2}
                                      required={isReq}
                                      placeholder={f.placeholder || 'ডিজিটাল ই-স্বাক্ষর (ই-নাম)...'}
                                      value={dynamicFieldsData[f.fieldId] || ''}
                                      onChange={e => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-serif font-bold tracking-wider"
                                    />
                                  )}

                                  {f.fieldType === 'rating' && (
                                    <div className="flex items-center space-x-2 pt-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setDynamicFieldsData(prev => ({ ...prev, [f.fieldId]: star }))}
                                          className={`text-xl focus:outline-none transition ${
                                            (dynamicFieldsData[f.fieldId] || 0) >= star ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'
                                          }`}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>

                        {/* Dynamic Fee Calculation Card */}
                        {((Number(activeForm.alumniFee) || 0) > 0 || (Number(activeForm.guestFee) || 0) > 0) && (
                          (() => {
                            const totalAmount = getFormTotalAmount(activeForm, dynamicFieldsData);
                            // Also need to re-calculate alumni/guest fees for UI
                            const guestField = targetFields.find(f => {
                              const lbl = (f.label || '').toLowerCase();
                              return lbl.includes('guest') || lbl.includes('guestcount') || lbl.includes('guest count') || lbl.includes('guest_count') || lbl.includes('guestcount') || lbl.includes('অতিথি') || lbl.includes('মেহমান') || lbl.includes('অতিরিক্ত সদস্য');
                            });
                            
                            let guestCount = 0;
                            if (guestField) {
                              const val = dynamicFieldsData[guestField.fieldId];
                              if (val) {
                                const parsed = parseInt(val, 10);
                                guestCount = isNaN(parsed) ? 0 : parsed;
                              }
                            }
                            const alumniFee = Number(activeForm.alumniFee) || 0;
                            const guestFee = Number(activeForm.guestFee) || 0;
                            const totalGuestFee = guestCount * guestFee;

                            return (
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/40 p-4 rounded-xl border border-emerald-150/60 my-2 space-y-2.5 text-left font-sans shadow-3xs">
                                <h4 className="text-xs font-extrabold text-emerald-900 flex items-center space-x-1.5 pb-1 border-b border-emerald-150/40">
                                  <span>💰 ফি হিসাব বিবরণী (Registration Fee Calculation)</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                                  <div className="bg-white p-2 rounded-lg border border-emerald-150/30">
                                    <span className="text-gray-400 text-[10px] block font-semibold">অ্যালামনাই নিবন্ধন ফি:</span>
                                    <strong className="text-gray-800 text-sm font-mono">{alumniFee}/- BDT</strong>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-emerald-150/30">
                                    <span className="text-gray-400 text-[10px] block font-semibold">অতিরিক্ত অতিথি ফি ({guestCount} জন):</span>
                                    <strong className="text-gray-800 text-sm font-mono">{totalGuestFee > 0 ? `${guestCount} × ${guestFee} = ${totalGuestFee}/- BDT` : '0/- BDT'}</strong>
                                  </div>
                                  <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-3xs">
                                    <span className="text-white/80 text-[10.5px] block font-bold">সর্বমোট প্রদেয় ফি (Total Fee):</span>
                                    <strong className="text-white text-base font-black font-mono">{totalAmount}/- BDT</strong>
                                  </div>
                                </div>
                                <p className="text-[10px] text-emerald-700 font-medium">
                                  * অনুগ্রহ করে মোট {totalAmount}/- টাকা আমাদের পেমেন্ট নম্বরে সেন্ড মানি করে পেমেন্ট বিবরণী ফিল্ডে ট্রানজেকশন আইডি যুক্ত করুন।
                                </p>
                              </div>
                            );
                          })()
                        )}

                        {/* Selector of payment option of cash numbers */}
                        {activeForm && ((Number(activeForm.alumniFee) || 0) > 0 || (Number(activeForm.guestFee) || 0) > 0) &&
                          (activeForm.bkashNumber || activeForm.nagadNumber || activeForm.rocketNumber) && (
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 text-left font-sans shadow-3xs my-2.5 col-span-full">
                            <h4 className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5 border-b pb-1.5 border-slate-200">
                              <span>📱 টাকা পাঠানোর মোবাইল নম্বর বেছে নিন (Select Payment Gateway)</span>
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {activeForm.bkashNumber && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentGateway('Bkash (বিকাশ)')}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                    paymentGateway === 'Bkash (বিকাশ)'
                                      ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20'
                                      : 'bg-white border-gray-200 hover:bg-pink-50/10 hover:border-pink-300'
                                  }`}
                                >
                                  <span className="text-pink-600 font-extrabold text-xs font-sans">বিকাশ (bKash)</span>
                                  <span className="text-gray-900 font-bold font-mono text-xs mt-1">{activeForm.bkashNumber}</span>
                                  <span className="text-[10px] text-pink-500 font-medium font-sans mt-0.5">(Send Money)</span>
                                </button>
                              )}
                              {activeForm.nagadNumber && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentGateway('Nagad (নগদ)')}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                    paymentGateway === 'Nagad (নগদ)'
                                      ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                                      : 'bg-white border-gray-200 hover:bg-orange-50/10 hover:border-orange-300'
                                  }`}
                                >
                                  <span className="text-orange-600 font-extrabold text-xs font-sans">নগদ (Nagad)</span>
                                  <span className="text-gray-900 font-bold font-mono text-xs mt-1">{activeForm.nagadNumber}</span>
                                  <span className="text-[10px] text-orange-500 font-medium font-sans mt-0.5">(Send Money)</span>
                                </button>
                              )}
                              {activeForm.rocketNumber && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentGateway('Rocket (রকেট)')}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                    paymentGateway === 'Rocket (রকেট)'
                                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                                      : 'bg-white border-gray-200 hover:bg-purple-50/10 hover:border-purple-300'
                                  }`}
                                >
                                  <span className="text-purple-700 font-extrabold text-xs font-sans">রকেট (Rocket)</span>
                                  <span className="text-gray-900 font-bold font-mono text-xs mt-1">{activeForm.rocketNumber}</span>
                                  <span className="text-[10px] text-purple-600 font-medium font-sans mt-0.5">(Send Money)</span>
                                </button>
                              )}
                              {activeForm.cashOptions && activeForm.cashOptions.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentGateway('Cash')}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                    paymentGateway === 'Cash'
                                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                                      : 'bg-white border-gray-200 hover:bg-emerald-50/10 hover:border-emerald-300'
                                  }`}
                                >
                                  <span className="text-emerald-600 font-extrabold text-xs font-sans">ক্যাশ (Cash)</span>
                                  <span className="text-gray-900 font-bold font-mono text-xs mt-1">পেমেন্ট</span>
                                  <span className="text-[10px] text-emerald-500 font-medium font-sans mt-0.5">(Select Option)</span>
                                </button>
                              )}
                            </div>

                            {paymentGateway === 'Cash' && activeForm.cashOptions && activeForm.cashOptions.length > 0 && (
                                <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                                  <label className="font-extrabold text-emerald-900 block text-xs font-sans mb-2">ক্যাশ অপশন সিলেক্ট করুন:</label>
                                  <select 
                                    value={paymentCashOption}
                                    onChange={e => setPaymentCashOption(e.target.value)}
                                    className="w-full border border-emerald-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-400 font-bold bg-white cursor-pointer"
                                  >
                                    <option value="">-- অপশন বেছে নিন --</option>
                                    {activeForm.cashOptions.map((opt: string) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                            )}

                            {/* Screenshot Upload OR Transaction ID Block */}
                            {paymentGateway !== 'Cash' && (
                              <div className="border-t border-slate-200 pt-3.5 space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2 text-left">
                                    <label className="font-extrabold text-slate-800 block text-xs font-sans">
                                      📸 পেমেন্ট সফল হওয়ার স্ক্রিনশট (Upload Screenshot)
                                    </label>
                                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                                      <div className="flex-1 w-full">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const r = new FileReader();
                                              r.onloadend = () => {
                                                setPaymentScreenshot(r.result as string);
                                              };
                                              r.readAsDataURL(file);
                                            }
                                          }}
                                          className="w-full text-xs font-sans text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                        />
                                      </div>
                                      {paymentScreenshot && (
                                        <div className="relative shrink-0 border rounded-lg overflow-hidden bg-gray-50">
                                          <img src={paymentScreenshot} alt="Screenshot Preview" className="h-10 w-10 object-cover" />
                                          <button
                                            type="button"
                                            onClick={() => setPaymentScreenshot('')}
                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white font-bold text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center p-0 hover:bg-red-650 cursor-pointer shadow-xs border border-white"
                                            title="মুছে ফেলুন"
                                          >
                                            X
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-left">
                                    <label className="font-extrabold text-slate-800 block text-xs font-sans">
                                      🔑 অথবা ট্রানজেকশন আইডি দিন (Or Enter Transaction ID / TrxID)
                                    </label>
                                    <input
                                      type="text"
                                      value={paymentTrxId}
                                      onChange={(e) => setPaymentTrxId(e.target.value)}
                                      placeholder="উদাঃ BK82M9S2P1"
                                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary font-mono text-xs bg-white text-gray-800 font-bold"
                                    />
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium font-sans">
                                  * পেমেন্ট ভেরিফিকেশনের জন্য স্ক্রিনশট আপলোড অথবা ট্রানজেকশন আইডি (TrxID) দুটির মধ্যে যেকোনো একটি তথ্য অবশ্যই প্রদান করতে হবে।
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end pt-3 border-t border-gray-150 gap-2">
                          {totalSteps > 1 && activeCustomFormStep > 1 && (
                            <button
                              type="button"
                              onClick={() => setActiveCustomFormStep(prev => prev - 1)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer mt-1"
                            >
                              পূর্ববর্তী ধাপ
                            </button>
                          )}
                          
                          {totalSteps > 1 && activeCustomFormStep < totalSteps ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                 const formEl = e.currentTarget.closest('form');
                                 if (formEl && formEl.checkValidity()) {
                                   setActiveCustomFormStep(prev => prev + 1);
                                 } else if (formEl) {
                                   formEl.reportValidity();
                                 }
                              }}
                              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer mt-1"
                            >
                              পরবর্তী ধাপ
                            </button>
                          ) : (
                            <button
                              id="btn-dynamic-form-submit-app"
                              type="submit"
                              disabled={formSubmitting}
                              className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-1"
                            >
                              {formSubmitting ? (
                                <span>দাখিল হচ্ছে...</span>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  <span>{activeForm.submitBtnText || 'নিবন্ধন সম্পন্ন করুন (Submit)'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  );
                })()
              ) : (
                <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow border border-gray-150 p-8 text-center space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">নিবন্ধন বন্ধ রয়েছে</h2>
                  <p className="text-gray-500 text-sm">দুঃখিত, বর্তমানে কোনো নিবন্ধন ফর্ম রানিং নেই।</p>
                </div>
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
                        Swal.fire({
                          icon: 'error',
                          title: 'ত্রুটি!',
                          text: 'গুগল পপআপে সমস্যা হয়েছে। দয়া করে সঠিক ভাবে পপআপ উইন্ডো অ্যালাউ করুন।',
                        });
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
