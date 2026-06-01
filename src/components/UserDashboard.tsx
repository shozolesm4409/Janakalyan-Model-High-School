/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Registration, Payment, Event, Notice, AppFormSubmission, CustomForm, CustomFormField, CustomFormSubmission } from '../types';
import { AppCertificate } from './AppCertificate';
import { 
  User as UserIcon, 
  Settings, 
  Award, 
  MapPin, 
  CreditCard, 
  Clock, 
  Calendar, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  X,
  LayoutDashboard,
  Menu,
  ChevronRight,
  LogOut,
  AppWindow,
  Upload,
  Camera,
  Image,
  FileText,
  Send,
  PlusCircle,
  Edit,
  Pencil,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserDashboardProps {
  setCurrentTab?: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser, refreshUserProfile, logout } = useAuth();
  
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [applications, setApplications] = useState<AppFormSubmission[]>([]);

  // Real-time custom forms and fields
  const [customForms, setCustomForms] = useState<CustomForm[]>([]);
  const [customFields, setCustomFields] = useState<CustomFormField[]>([]);
  const [customSubmissions, setCustomSubmissions] = useState<CustomFormSubmission[]>([]);
  
  // Track inputs for active custom dynamic form fields
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, any>>({});

  // Selected Tab state within User Portal Sidebar
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'certificate' | 'events' | 'profile' | 'notices' | 'apply'>('overview');
  
  // Mobile drawer visibility 
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Profile forms
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [batch, setBatch] = useState('');
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Input states for dynamic application forms (Apply Form panel)
  const [activeFormType, setActiveFormType] = useState<string>('id_card');
  const [idName, setIdName] = useState('');
  const [idMobile, setIdMobile] = useState('');
  const [idBatch, setIdBatch] = useState('');
  const [idBloodGroup, setIdBloodGroup] = useState('O+');
  const [idOccupation, setIdOccupation] = useState('');
  const [idAddress, setIdAddress] = useState('');

  const [mentorArea, setMentorArea] = useState('Software & IT');
  const [mentorExperience, setMentorExperience] = useState('2');
  const [mentorBio, setMentorBio] = useState('');

  const [articleTitle, setArticleTitle] = useState('');
  const [articleTopic, setArticleTopic] = useState('স্মৃতিচারণ (Memories)');
  const [articleContent, setArticleContent] = useState('');

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Edit submission state
  const [editingClassicSub, setEditingClassicSub] = useState<AppFormSubmission | null>(null);
  const [editingCustomSub, setEditingCustomSub] = useState<CustomFormSubmission | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  // Load state values
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setMobile(currentUser.mobile || '');
      setBatch(currentUser.batch || '2015');
      setPhoto(currentUser.profilePhoto || '');

      // Initialize ID card default values
      setIdName(currentUser.name || '');
      setIdMobile(currentUser.mobile || '');
      setIdBatch(currentUser.batch || '2015');
    }
  }, [currentUser]);

  // Auto-populate custom fields for name, profile image/photo, or file inputs
  useEffect(() => {
    if (!currentUser) return;
    
    // Find active form based on activeFormType
    const activeForm = customForms.find(f => f.formId === activeFormType);
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
  }, [currentUser, customForms, customFields, activeFormType]);

  // Handle Snapshot listeners following rules strictly
  useEffect(() => {
    if (!currentUser) return;

    // 1. Listen for Registration
    const regPath = 'registrations';
    const regQuery = query(collection(db, regPath), where('userId', '==', currentUser.uid));
    const unsubReg = onSnapshot(regQuery, (snapshot) => {
      if (!snapshot.empty) {
        const item = snapshot.docs[0].data() as Registration;
        setRegistration(item);
      } else {
        setRegistration(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, regPath);
    });

    // 2. Listen for Payments
    const payPath = 'payments';
    const payQuery = query(collection(db, payPath), where('userId', '==', currentUser.uid));
    const unsubPay = onSnapshot(payQuery, (snapshot) => {
      if (!snapshot.empty) {
        const item = snapshot.docs[0].data() as Payment;
        setPayment(item);
      } else {
        setPayment(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, payPath);
    });

    // 3. Listen for Jubilee events
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

    // 4. Listen for Notices
    const noticePath = 'notices';
    const unsubNotice = onSnapshot(collection(db, noticePath), (snapshot) => {
      const items: Notice[] = [];
      snapshot.forEach(doc => {
        items.push({ noticeId: doc.id, ...doc.data() } as Notice);
      });
      setNotices(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, noticePath);
    });

    // 5. Listen for Applications
    const appsPath = 'applications';
    const appsQuery = query(collection(db, appsPath), where('userId', '==', currentUser.uid));
    const unsubApps = onSnapshot(appsQuery, (snapshot) => {
      const items: AppFormSubmission[] = [];
      snapshot.forEach(doc => {
        items.push({ submissionId: doc.id, ...doc.data() } as AppFormSubmission);
      });
      setApplications(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, appsPath);
    });

    // 6. Listen for Custom Forms
    const unsubCustomForms = onSnapshot(collection(db, 'forms'), (snapshot) => {
      const items: CustomForm[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as CustomForm);
      });
      setCustomForms(items);
    }, (error) => {
      console.error('Custom Forms read error:', error);
    });

    // 7. Listen for Custom Fields
    const unsubCustomFields = onSnapshot(collection(db, 'form_fields'), (snapshot) => {
      const items: CustomFormField[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as CustomFormField);
      });
      setCustomFields(items);
    }, (error) => {
      console.error('Custom Fields read error:', error);
    });

    // 8. Listen for User's Custom Form Submissions
    const subQuery = query(collection(db, 'form_submissions'), where('userId', '==', currentUser.uid));
    const unsubCustomSubs = onSnapshot(subQuery, (snapshot) => {
      const items: CustomFormSubmission[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as CustomFormSubmission);
      });
      setCustomSubmissions(items);
    }, (error) => {
      console.error('Custom Submissions read error:', error);
    });

    return () => {
      unsubReg();
      unsubPay();
      unsubEv();
      unsubNotice();
      unsubApps();
      unsubCustomForms();
      unsubCustomFields();
      unsubCustomSubs();
    };
  }, [currentUser]);

  if (!currentUser) return null;

  const getClassicFieldDetails = (key: string) => {
    switch (key) {
      case 'name': return { label: 'আবেদনকারীর নাম (Alumni Name)', type: 'text' };
      case 'mobile': return { label: 'মোবাইল নম্বর', type: 'tel' };
      case 'batch': return { label: 'এসএসসি পাসের ব্যাচ (Batch)', type: 'text' };
      case 'bloodGroup': return { label: 'রক্তের গ্রুপ', type: 'text' };
      case 'occupation': return { label: 'বর্তমান পেশা', type: 'text' };
      case 'address': return { label: 'যোগাযোগের ঠিকানা', type: 'textarea' };
      case 'mentorArea': return { label: 'মেন্টরশিপ এরিয়া / ক্ষেত্র', type: 'text' };
      case 'experienceYears': return { label: 'অভিজ্ঞ বছর (Years of Experience)', type: 'number' };
      case 'bio': return { label: 'বায়ো ও দক্ষতা (Bio / Expertise)', type: 'textarea' };
      case 'title': return { label: 'স্মরণিকা/নিবন্ধ শিরোনাম', type: 'text' };
      case 'topic': return { label: 'বিষয়বস্তু (Topic)', type: 'text' };
      case 'content': return { label: 'মূল লেখা (Article Content)', type: 'textarea' };
      default: return { label: key, type: 'text' };
    }
  };

  const handleSaveClassicEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassicSub) return;
    setIsUpdatingSub(true);
    try {
      await updateDoc(doc(db, 'applications', editingClassicSub.submissionId), {
        data: editFormData,
        updatedAt: new Date().toISOString()
      });
      alert('আবেদনপত্রটি সফলভাবে আপডেট করা হয়েছে!');
      setEditingClassicSub(null);
    } catch (err) {
      console.error(err);
      alert('আপডেট করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।');
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const handleSaveCustomEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomSub) return;
    setIsUpdatingSub(true);
    try {
      await updateDoc(doc(db, 'form_submissions', editingCustomSub.submissionId), {
        data: editFormData,
        updatedAt: new Date().toISOString()
      });
      alert('আবেদনপত্রটি সফলভাবে আপডেট করা হয়েছে!');
      setEditingCustomSub(null);
    } catch (err) {
      console.error(err);
      alert('আপডেট করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।');
    } finally {
      setIsUpdatingSub(false);
    }
  };

  // Profile Image Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('দয়া করে একটি সঠিক ছবি ফাইল (.jpg, .png, .jpeg, .webp) নির্বাচন করুন।');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির সাইজ অনেক বড়! সর্বোচ্চ ২ মেগাবাইট (2MB) সাইজের ছবি নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle profile updates
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert("নাম এবং মোবাইল নাম্বার বাধ্যতামূলক!");
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        mobile: mobile.trim(),
        batch,
        profilePhoto: photo.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      });
      await refreshUserProfile();
      setEditing(false);
      setActiveSubTab('overview');
      alert("আপনার প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      console.error(err);
      alert("তথ্য আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  // Handle Dynamic Application submissions
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const submissionId = `sub_${Date.now()}`;
      let data: Record<string, any> = {};
      let formLabel = '';

      if (activeFormType === 'id_card') {
        if (!idName.trim() || !idMobile.trim() || !idBatch.trim()) {
          alert('অনুগ্রহ করে নাম, মোবাইল ও ব্যাচ সঠিকভাবে প্রদান করুন।');
          setFormSubmitting(false);
          return;
        }
        data = {
          name: idName.trim(),
          mobile: idMobile.trim(),
          batch: idBatch.trim(),
          bloodGroup: idBloodGroup,
          occupation: idOccupation.trim(),
          address: idAddress.trim(),
        };
        formLabel = 'ডিজিটাল অ্যালামনাই আইডি কার্ডের আবেদন (Digital Alumni ID Card)';
      } else if (activeFormType === 'mentorship') {
        if (!mentorBio.trim()) {
          alert('অনুগ্রহ করে আপনার বায়ো ও কারিগরি দক্ষতা সঠিকভাবে লিখুন।');
          setFormSubmitting(false);
          return;
        }
        data = {
          name: currentUser.name,
          mobile: currentUser.mobile || '',
          batch: currentUser.batch || '',
          mentorArea,
          experienceYears: mentorExperience,
          bio: mentorBio.trim(),
        };
        formLabel = 'ক্যারিয়ার মেন্টরশিপ হাবে ভলান্টিয়ার আবেদন (Career Mentorship)';
      } else if (activeFormType === 'magazine') {
        if (!articleTitle.trim() || !articleContent.trim()) {
          alert('অনুগ্রহ করে শিরোনাম এবং মূল লেখার কন্টেন্ট সঠিকভাবে পূর্ণ করুন।');
          setFormSubmitting(false);
          return;
        }
        data = {
          name: currentUser.name,
          batch: currentUser.batch || '',
          title: articleTitle.trim(),
          topic: articleTopic,
          content: articleContent.trim(),
        };
        formLabel = 'সুবর্ণ জয়ন্তী স্মরণিকা ম্যাগাজিন স্মৃতিকথা প্রকাশ (Magazine Contribution)';
      }

      await setDoc(doc(db, 'applications', submissionId), {
        submissionId,
        userId: currentUser.uid,
        userName: currentUser.name,
        userEmail: currentUser.email,
        formType: activeFormType,
        formLabel,
        status: 'pending',
        submittedAt: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('bn-BD'),
        data,
      });

      alert('আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে এবং নিচে সাবমিশন তালিকায় ট্র্যাকিংয়ের জন্য যুক্ত হয়েছে!');
      
      // Reset unique variable inputs
      if (activeFormType === 'id_card') {
        setIdOccupation('');
        setIdAddress('');
      } else if (activeFormType === 'mentorship') {
        setMentorBio('');
      } else if (activeFormType === 'magazine') {
        setArticleTitle('');
        setArticleContent('');
      }
    } catch (err) {
      console.error(err);
      alert('আবেদন জমা দিতে সমস্যা হয়েছে। দয়া করে পরবর্তীতে পুনরায় চেষ্টা করুন।');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Schema-driven Dynamic Form Submissions
  const handleCustomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentForm = customForms.find(f => f.formId === activeFormType);
    if (!currentForm) return;

    if (currentForm.permission === 'login_required' && !currentUser) {
      alert('এই ফর্মটি পূরণের জন্য অনুগ্রহ করে প্রোফাইল লগইন করুন।');
      return;
    }

    if (currentForm.permission === 'batch_restricted') {
      const allowedBatch = currentForm.restrictedBatch?.trim();
      const userBatch = currentUser.batch?.trim();
      if (allowedBatch && userBatch !== allowedBatch) {
        alert(`দুঃখিত! এই ফর্মটি শুধুমাত্র এসএসসি ${allowedBatch} পাসের ব্যাচের শিক্ষার্থীদের জন্য সীমাবদ্ধ।`);
        return;
      }
    }

    const currentFields = customFields.filter(f => f.formId === activeFormType);
    for (const f of currentFields) {
      if (f.required && !dynamicFieldsData[f.fieldId]) {
        alert(`"${f.label}" ফিল্ডটি অবশ্যই পূরণ করতে হবে।`);
        return;
      }
    }

    setFormSubmitting(true);
    try {
      const subId = `sub_${Date.now()}`;
      await setDoc(doc(db, 'form_submissions', subId), {
        submissionId: subId,
        formId: activeFormType,
        userId: currentUser.uid,
        userName: currentUser.name || 'Anonymous User',
        userEmail: currentUser.email || 'N/A',
        data: dynamicFieldsData,
        submittedAt: new Date().toISOString()
      });

      alert(currentForm.successMessage || 'আপনার ডাটা সফলভাবে ফর্মে সাবমিট করা হয়েছে!');
      setDynamicFieldsData({});
      
      if (currentForm.redirectUrl) {
        window.location.href = currentForm.redirectUrl;
      }
    } catch (err) {
      console.error(err);
      alert('তথ্য সাবমিট করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।');
    } finally {
      setFormSubmitting(false);
    }
  };

  const isApproved = registration?.approvalStatus === 'approved' && payment?.paymentStatus === 'approved';

  // Sub-navigation tab list with localized titles and icons
  const sidebarTabs = [
    { id: 'overview', label: 'ওভারভিউ ড্যাশবোর্ড', subtitle: 'Overview & Status', icon: LayoutDashboard },
    { id: 'notices', label: 'ঘোষণা ও নোটিশ বোর্ড', subtitle: 'Notice Board', icon: Bell },
    { id: 'apply', label: 'আবেদনপত্র সমূহ (Apply)', subtitle: 'Apply Form Panel', icon: AppWindow },
    { id: 'certificate', label: 'স্মারক প্রশংসাপত্র', subtitle: 'Digital Certificate', icon: Award, badge: isApproved ? 'Approved' : 'Pending' },
    { id: 'events', label: 'শ্রেণীভিত্তিক কর্মসূচী', subtitle: 'Jubilee Events', icon: Calendar },
    { id: 'profile', label: 'প্রোফাইল সম্পাদন', subtitle: 'Settings & Photo', icon: Settings },
  ] as const;

  return (
    <div className="max-w-none w-full px-4 sm:px-10 lg:px-16 py-2 text-gray-800 pb-24">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ========================================================================================= */}
        {/* DESKTOP SIDEBAR PANEL */}
        {/* ========================================================================================= */}
        <aside id="user-desktop-sidebar" className="hidden lg:flex w-72 shrink-0 flex-col bg-white rounded-2xl border border-gray-150 p-6 shadow-sm sticky top-24 space-y-7 group">
          {/* User Mini Profile Brief */}
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-gray-100">
            <div className="relative">
              <img
                src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                alt="Profile Avatar"
                className="h-20 w-20 rounded-full object-cover border-4 border-secondary/50 shadow-md transform group-hover:scale-105 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              {isApproved ? (
                <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Member">
                  <CheckCircle className="h-3 w-3" />
                </span>
              ) : (
                <span className="absolute bottom-0 right-0 bg-amber-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verification Pending">
                  <Clock className="h-3 w-3" />
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-gray-900 tracking-tight leading-short">{currentUser.name}</h4>
              <p className="text-[11px] font-semibold text-gray-400 font-mono">SSC Batch {currentUser.batch}</p>
              <div className="inline-flex items-center space-x-1 mt-1 bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                <span>{currentUser.role} Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1.5 flex-1 font-sans">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sidebar-subtab-btn-${tab.id}`}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <div className="leading-none text-left">
                      <span className="text-xs font-semibold block">{tab.label}</span>
                      <span className={`text-[9px] font-mono block mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-400 font-medium'}`}>{tab.subtitle}</span>
                    </div>
                  </div>
                  {tab.id === 'certificate' && tab.badge && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                      isApproved 
                        ? (isActive ? 'bg-white text-green-700' : 'bg-green-100 text-green-800') 
                        : (isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800')
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Danger segment footer helpers */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button 
              id="sidebar-btn-logout"
              onClick={logout}
              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition flex items-center space-x-3 font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span>লগ আউট (Sign Out)</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================================= */}
        {/* MOBILE SIDEBAR ACTIONS HEADER & TOGGLES */}
        {/* ========================================================================================= */}
        <div id="user-mobile-header" className="lg:hidden w-full bg-white rounded-xl border border-gray-150 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              id="user-mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
              title="Open Navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <span className="text-xs text-gray-400 font-mono block">আমার ড্যাশবোর্ড / {activeSubTab.toUpperCase()}</span>
              <strong className="text-sm font-bold text-gray-800 block">
                {activeSubTab === 'overview' ? 'ড্যাশবোর্ড ওভারভিউ' :
                 activeSubTab === 'notices' ? 'ঘোষণা ও নোটিশ বোর্ড' :
                 activeSubTab === 'apply' ? 'আবেদনপত্র সমূহ' :
                 activeSubTab === 'certificate' ? 'স্মারক প্রশংসাপত্র' :
                 activeSubTab === 'events' ? 'শ্রেণীভিত্তিক কর্মসূচী' : 'প্রোফাইল সম্পাদন'}
              </strong>
            </div>
          </div>
          
          <img
            src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover border border-secondary shadow-sm"
          />
        </div>

        {/* ========================================================================================= */}
        {/* MOBILE SIDEBAR DRAWER POPUP */}
        {/* ========================================================================================= */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              {/* Backdrop fade filter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              />

              {/* Sidebar container sliding transition */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="relative flex flex-col w-80 max-w-[85vw] bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b">
                  <div className="flex items-center space-x-1.5 text-primary">
                    <Award className="h-5 w-5 text-secondary" />
                    <span className="font-display font-medium text-sm">মেম্বারশিপ মেনু (Menu)</span>
                  </div>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 px-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-bold"
                  >
                    X
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 py-4">
                  <img
                    src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt="avatar"
                    className="h-16 w-16 rounded-full object-cover border-2 border-secondary/50"
                  />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm leading-none">{currentUser.name}</h5>
                    <span className="text-[10px] text-gray-400 font-mono">SSC Batch - {currentUser.batch}</span>
                  </div>
                </div>

                <nav className="space-y-1.5 flex-1">
                  {sidebarTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`mob-subtab-btn-${tab.id}`}
                        onClick={() => { setActiveSubTab(tab.id as any); setMobileSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition ${
                          isActive 
                            ? 'bg-primary text-white font-bold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          <span className="text-xs font-semibold">{tab.label}</span>
                        </div>
                        {tab.id === 'certificate' && tab.badge && (
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                            isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { logout(); setMobileSidebarOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>লগআউট (Logout)</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================================= */}
        {/* MAIN WORKSPACE CONTENT CONTAINER */}
        {/* ========================================================================================= */}
        <main className="flex-grow w-full bg-transparent">
          <AnimatePresence mode="wait">
            
            {/* SUBTAB: OVERVIEW PANEL */}
            {activeSubTab === 'overview' && (
              <motion.div
                key="subtab-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Greeting Hero card */}
                <div className="bg-radial-gradient bg-primary text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg border border-primary/20">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-secondary/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                  <div className="relative z-10 space-y-2">
                    <span className="bg-secondary/20 text-secondary border border-secondary/25 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded inline-block font-sans">
                      অ্যালামনাই পোর্টাল (Status Overview)
                    </span>
                    <h2 className="text-2.5xl sm:text-3.xl font-display font-black leading-tight text-white mb-1">
                      স্বাগতম, {currentUser.name}!
                    </h2>
                    <p className="text-sm text-gray-200 font-sans max-w-xl leading-relaxed">
                      জনকল্যাণ হাই স্কুলের সুবর্ণ জয়ন্তী উদযাপন প্যানেলে আপনাকে স্বাগত। নিচে আপনার আবেদনপত্র এবং পেমেন্ট স্লিপের বর্তমান লাইভ অগ্রগতি এবং ভেরিফিকেশন স্ট্যাটাস ট্র্যাক করুন।
                    </p>
                  </div>
                </div>

                {/* Progress Tracking Widget Cards (High visual quality) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Registration tracking detail */}
                  <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-56 group hover:shadow-md transition duration-200">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 bg-primary/5 rounded-full transform group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">ধাপ ১: পুনর্মিলনী রেজিস্ট্রেশন</div>
                      
                      {registration ? (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center space-x-2">
                            {registration.approvalStatus === 'approved' ? (
                              <div className="h-9 w-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                            ) : registration.approvalStatus === 'rejected' ? (
                              <div className="h-9 w-9 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <AlertCircle className="h-5 w-5" />
                              </div>
                            ) : (
                              <div className="h-9 w-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                <Clock className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <strong className="text-sm font-bold text-gray-900 block">
                                {registration.approvalStatus === 'approved' ? 'রেজিস্ট্রেশন আবেদন অনুমোদিত' :
                                 registration.approvalStatus === 'rejected' ? 'আবেদন বাতিল করা হয়েছে' :
                                 'নিবন্ধন খসড়া ভেরিফাই হচ্ছে'}
                              </strong>
                              <span className="text-xs text-gray-400 font-sans font-medium">আবেদন আইডি - #{registration.registrationId}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-1">
                          <h4 className="text-sm font-bold text-amber-700">কোন রেজিস্ট্রেশন আবেদন পাওয়া যায়নি</h4>
                          <p className="text-xs text-gray-500 font-sans max-w-xs leading-relaxed">সুবর্ণ জয়ন্তী অনুষ্ঠান উদযাপনে স্বপ্রণোদিত অংশ নিতে আজই নিবন্ধিত হয়ে নিন।</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-400">দাখিলকৃত গেস্ট: {registration?.participationInfo?.guestCount || 0} জন</span>
                      <span className="text-primary font-mono bg-secondary/15 px-2 py-0.5 rounded">টি-শার্ট: {registration?.participationInfo?.tshirtSize || 'XL'}</span>
                    </div>
                  </div>

                  {/* Payment tracking details */}
                  <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-56 group hover:shadow-md transition duration-200">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 bg-pink-50 rounded-full transform group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">ধাপ ২: ব্যাংক / মোবাইল পেমেন্ট স্লিপ</div>
                      
                      {payment ? (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center space-x-2">
                            {payment.paymentStatus === 'approved' ? (
                              <div className="h-9 w-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                            ) : payment.paymentStatus === 'rejected' ? (
                              <div className="h-9 w-9 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <AlertCircle className="h-5 w-5" />
                              </div>
                            ) : (
                              <div className="h-9 w-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                <Clock className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <strong className="text-sm font-bold text-gray-900 block">
                                {payment.paymentStatus === 'approved' ? 'পেমেন্ট স্লিপ এপ্রুভ হয়েছে' :
                                 payment.paymentStatus === 'rejected' ? 'পেমেন্ট ত্রুটিপূর্ণ (Rejected)' :
                                 'লেনদেন রসিদ মেলাানো হচ্ছে'}
                              </strong>
                              <span className="text-xs text-gray-400 font-mono font-medium">TrxID: {payment.trxId}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-1">
                          <h4 className="text-sm font-bold text-gray-500">কোন পেমেন্ট স্লিপ পাওয়া যায়নি</h4>
                          <p className="text-xs text-gray-500 font-sans max-w-xs leading-relaxed">রেজিস্ট্রেশন ফি পরিশোধ করার পর তার বিবরণ এবং স্ক্রিনশট রসিদ আপলোড করুন।</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                      <span className="text-xs font-semibold text-gray-400">পরিশোধিত ফি পরিমাণ:</span>
                      <strong className="text-sm text-pink-600 font-extrabold font-mono tracking-wide">{payment?.amount || 0} BDT</strong>
                    </div>
                  </div>

                </div>

                {/* Important alert instructions guidelines */}
                <div className="border border-blue-150 bg-blue-50/20 rounded-2xl p-6 sm:p-8 text-xs sm:text-sm text-gray-600 leading-relaxed flex items-start space-x-4">
                  <span className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <strong className="text-gray-900 font-bold block mb-1 text-sm">সাপোর্ট ও ভেরিফিকেশন সংক্রান্ত জরুরী নির্দেশনা:</strong>
                    <p className="leading-relaxed">
                      আবেদন আপলোড করার পর উৎসব উপ-কমিটির দায়িত্বপ্রাপ্ত প্রাক্তনীরা ২৪ ঘণ্টার মধ্যে আপনার এসএসসি পাসিং ব্যাচ, নাম এবং ট্রানজেকশন স্ক্রিনশট মিলিয়ে আবেদনটির সত্যতা যাচাই করবেন। অনুমোদন সম্পন্ন হওয়ার সাথে সাথেই সাইডবারের <strong>স্মারক প্রশংসাপত্র (Digital Certificate)</strong> অপশনটি আনলক হয়ে যাবে, যেখানে নিজের নাম ও ব্যাচ খোদাইকৃত উৎসব সার্টিফিকেট পেয়ে যাবেন।
                    </p>
                  </div>
                </div>

                {/* Quick Profile Read-Only Widget */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-800">অ্যালামনাই মূল প্রোফাইল সংক্ষিপ্ত বিবরণ</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-600">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-medium block">প্রাক্তনী ইমেইল ঠিকানা</span>
                      <strong className="text-gray-900 font-mono mt-1 font-bold text-sm block truncate">{currentUser.email}</strong>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-medium block">যোগাযোগ মোবাইল নং</span>
                      <strong className="text-gray-900 font-mono mt-1 font-bold text-sm block">{currentUser.mobile || '০১৭xxxxxxxx'}</strong>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-medium block">এসএসসি পাসের ব্যাচ</span>
                      <strong className="text-gray-950 mt-1 font-bold text-sm block">SSC Batch {currentUser.batch}</strong>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* SUBTAB: DIGITAL CERTIFICATE PANEL */}
            {activeSubTab === 'certificate' && (
              <motion.div
                key="subtab-certificate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {isApproved ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <Award className="h-5.5 w-5.5" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-primary font-display">স্মারক ডিজিটাল প্রশংসাপত্র (Attendance Certificate)</h2>
                          <p className="text-[11px] text-gray-400 font-sans">পুনর্মিলনী নিবন্ধন ও পেমেন্ট সফলভাবে এপ্রুভ ও ভেরিফায়েড হয়েছে। অভিনন্দন!</p>
                        </div>
                      </div>
                      {setCurrentTab && (
                        <button
                          onClick={() => setCurrentTab('register')}
                          className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>নতুন রেজিস্ট্রেশন করুন (Register Now)</span>
                        </button>
                      )}
                    </div>
                    
                    <AppCertificate
                      recipientName={currentUser.name}
                      batch={currentUser.batch || '2026'}
                      registrationId={registration?.registrationId || 'REG-PENDING'}
                    />
                  </div>
                ) : (
                  <div className="border border-amber-200 bg-amber-50/15 rounded-2xl p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-6 shadow-sm">
                    <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner transform rotate-12">
                      <Award className="h-8 w-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-tight">সার্টিফিকেট সাময়িকভাবে লক করা আছে (Certificate Locked)</h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                        আপনার দাখিলকৃত ইনফরমেশন ও ট্রানজেকশন স্ক্রিনশট যাচাইধীন রয়েছে। অ্যাডমিন প্যানেল এটি এপ্রুভ করার সাথে সাথে আপনার জন্য স্মারক ডিজিটাল প্রশংসাপত্রটি এখানে সয়ংক্রিয়ভাবে জেনারেট হয়ে যাবে।
                      </p>
                    </div>
                    
                    <div className="pt-2 bg-gray-50 border rounded-xl p-4 text-left space-y-1.5 max-w-xs mx-auto font-mono text-[10px] text-gray-500">
                      <div className="flex justify-between">
                        <span>নিবন্ধন অবস্থা:</span>
                        <strong className="text-amber-700 uppercase font-semibold">{registration?.approvalStatus || 'Not Joined'}</strong>
                      </div>
                      <div className="flex justify-between border-t pt-1.5">
                        <span>পেমেন্ট অবস্থা:</span>
                        <strong className="text-amber-700 uppercase font-semibold">{payment?.paymentStatus || 'No Record'}</strong>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col items-center justify-center space-y-2">
                      {setCurrentTab && (
                        <button
                          onClick={() => setCurrentTab('register')}
                          className="bg-amber-550 hover:bg-amber-600 active:scale-95 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center space-x-2 transition duration-200 cursor-pointer animate-smooth"
                        >
                          <PlusCircle className="h-4.5 w-4.5" />
                          <span>রেজিস্ট্রেশন করুন (Register Now)</span>
                        </button>
                      )}
                      <p className="text-[10px] text-gray-400">ইতিমধ্যে কোনো তথ্য জমা না দিয়ে থাকলে দয়া করে রেজিস্ট্রেশন ফর্মটি পূরণ করুন।</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SUBTAB: EVENT PROGRAMS SHEDULE */}
            {activeSubTab === 'events' && (
              <motion.div
                key="subtab-events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center space-x-2 pb-3 border-b">
                  <Calendar className="h-5.5 w-5.5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">সুবর্ণ জয়ন্তী উৎসব ইভেন্ট ও কর্মসূচী</h3>
                    <p className="text-[11px] text-gray-400">মিলনমেলায় আয়োজিত উদযাপন ও সাংস্কৃতিক ইভেন্টগুলোর তালিকা</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {events.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-450 font-mono text-xs">কোন কর্মসূচীর বিবরণ এখনো তৈরি করা হয়নি।</div>
                  ) : (
                    events.map((event) => (
                      <div key={event.eventId} className="border border-gray-100 rounded-xl p-5 hover:border-primary/20 transition-all duration-300 flex items-start space-x-4 bg-gray-50 hover:bg-white hover:shadow-sm">
                        <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0 mt-0.5">
                          <Calendar className={`h-5 w-5 ${isApproved ? 'animate-bounce' : ''}`} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{event.title}</h4>
                          <p className="text-xs text-gray-500 font-sans leading-relaxed pt-0.5">{event.description}</p>
                          <div className="pt-2 text-[10px] text-amber-700 font-extrabold font-mono flex flex-wrap gap-x-3">
                            <span>📅 {event.eventDate}</span>
                            <span>📍 {event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* SUBTAB: NOTICE BOARD PANEL */}
            {activeSubTab === 'notices' && (
              <motion.div
                key="subtab-notices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                  <Bell className="h-5.5 w-5.5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">ঘোষণা ও নোটিশ বোর্ড (Notice Board)</h3>
                    <p className="text-[11px] text-gray-400 font-sans">সুবর্ণ জয়ন্তী উদযাপন কমিটির সর্বশেষ অফিশিয়াল সিদ্ধান্ত ও সাধারণ নোটিশসমূহ</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {notices.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-sans text-xs">কোন নোটিশ বা ঘোষণা এই মুহূর্তে পাওয়া যায়নি। নতুন সিদ্ধান্তের জন্য পরবর্তীতে চেক করুন।</div>
                  ) : (
                    notices.map((notice) => (
                      <div 
                        key={notice.noticeId} 
                        className="border border-gray-150 rounded-xl p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition duration-200 border-l-4 border-l-primary"
                      >
                        <div className="flex justify-between items-center text-[10px] text-primary font-bold font-mono">
                          <span className="bg-primary/10 px-2.5 py-0.5 rounded">📢 অফিসিয়াল ঘোষণা</span>
                          <span>published: {notice.publishDate || 'Today'}</span>
                        </div>
                        <h4 className="font-extrabold text-gray-900 text-sm mt-3.5 leading-snug">{notice.title}</h4>
                        <p className="text-gray-600 text-xs whitespace-pre-line leading-relaxed mt-2 font-sans">{notice.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* SUBTAB: APPLY FORM PANEL WITH SUBMISSIONS LIST */}
            {activeSubTab === 'apply' && (
              <motion.div
                key="subtab-apply"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                    <AppWindow className="h-5.5 w-5.5 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">অ্যালামনাই বিশেষ সেবা ও ক্যাটাগরি আবেদন হাব</h3>
                      <p className="text-[11px] text-gray-400 font-sans">নিচের ৩টি ভিন্ন ক্যাটাগরি ফরমের যেকোনো একটি নির্বাচন করুন এবং প্রয়োজনীয় তথ্য দিয়ে সাবমিট করুন</p>
                    </div>
                  </div>

                  {/* Form toggle buttons - High Quality Visual Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setActiveFormType('id_card')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        activeFormType === 'id_card'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-2 text-primary" />
                      <strong className="text-xs font-extrabold block">ডিজিটাল আইডি কার্ড</strong>
                      <span className="text-[9px] text-gray-400 block mt-0.5 leading-none">Alumni ID Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFormType('mentorship')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        activeFormType === 'mentorship'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <UserIcon className="h-5 w-5 mb-2 text-primary" />
                      <strong className="text-xs font-extrabold block">ক্যারিয়ার মেন্টরশিপ</strong>
                      <span className="text-[9px] text-gray-400 block mt-0.5 leading-none">Mentorship Volunteer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFormType('magazine')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        activeFormType === 'magazine'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <FileText className="h-5 w-5 mb-2 text-primary" />
                      <strong className="text-xs font-extrabold block">স্মরণিকায় লেখা প্রকাশ</strong>
                      <span className="text-[9px] text-gray-400 block mt-0.5 leading-none">Magazine Article</span>
                    </button>

                    {/* DYNAMIC REGISTERED ACTIVE FORMS LIST */}
                    {customForms.filter(frm => frm.status === 'active').map((frm) => (
                      <button
                        key={frm.formId}
                        type="button"
                        onClick={() => {
                          setActiveFormType(frm.formId);
                          setDynamicFieldsData({});
                        }}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          activeFormType === frm.formId
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <AppWindow className="h-5 w-5 mb-2 text-amber-550 animate-pulse" />
                        <strong className="text-xs font-extrabold block truncate" title={frm.title}>{frm.title}</strong>
                        <span className="text-[9px] text-gray-400 block mt-0.5 leading-none truncate font-mono">/{frm.slug}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic form area */}
                  <form 
                    onSubmit={['id_card', 'mentorship', 'magazine'].includes(activeFormType) ? handleApplicationSubmit : handleCustomFormSubmit} 
                    className="bg-slate-50/50 rounded-xl p-5 sm:p-6 border border-gray-150 space-y-4 text-xs font-sans"
                  >
                    <h4 className="font-extrabold text-sm text-gray-900 border-b border-gray-150 pb-2 mb-2">
                      {activeFormType === 'id_card' && '১. ডিজিটাল অ্যালামনাই আইডি কার্ডের আবেদন ফরম'}
                      {activeFormType === 'mentorship' && '২. সুবর্ণ জয়ন্তী ক্যারিয়ার মেন্টর হাব আবেদন ফরম'}
                      {activeFormType === 'magazine' && '৩. স্মরণিকা ম্যাগাজিন স্মৃতিকথা প্রকাশ ফরম'}
                      {!['id_card', 'mentorship', 'magazine'].includes(activeFormType) && (
                        `আবেদন ফরম: ${customForms.find(frm => frm.formId === activeFormType)?.title || 'কাস্টম সংস্করণ'}`
                      )}
                    </h4>

                    {/* Form Input switch rendering */}
                    {activeFormType === 'id_card' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">পূর্ণ নাম (Full Name)</label>
                          <input
                            type="text"
                            required
                            value={idName}
                            onChange={e => setIdName(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">মোবাইল নাম্বার (Mobile Number)</label>
                          <input
                            type="tel"
                            required
                            value={idMobile}
                            onChange={e => setIdMobile(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">এসএসসি পাসের ব্যাচ (SSC Passing Batch)</label>
                          <input
                            type="text"
                            required
                            value={idBatch}
                            onChange={e => setIdBatch(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">রক্তের গ্রুপ (Blood Group)</label>
                          <select
                            value={idBloodGroup}
                            onChange={e => setIdBloodGroup(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer"
                          >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(grp => (
                              <option key={grp} value={grp}>{grp}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">বর্তমান পেশা (Current Occupation)</label>
                          <input
                            type="text"
                            placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার, ব্যাংক কর্মকর্তা ইত্যাদি"
                            value={idOccupation}
                            onChange={e => setIdOccupation(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">যোগাযোগের ঠিকানা (Mailing Address)</label>
                          <input
                            type="text"
                            required
                            placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                            value={idAddress}
                            onChange={e => setIdAddress(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}

                    {activeFormType === 'mentorship' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-500 uppercase block">কারিগরি মেন্টরশিপ এরিয়া (Area of Mentorship)</label>
                            <select
                              value={mentorArea}
                              onChange={e => setMentorArea(e.target.value)}
                              className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="Software & IT">সফটওয়্যার ও তথ্যপ্রযুক্তি (Software & IT)</option>
                              <option value="Civil / Mechanical / Engineering">ইঞ্জিনিয়ারিং ও টেকনিক্যাল (Engineering)</option>
                              <option value="Civil Services / BCS / Administration">সরকারি প্রশাসন ও সিভিল সার্ভিস (BCS)</option>
                              <option value="Medical & Healthcare">মেডিকেল ও চিকিৎসা সেবা (Medical)</option>
                              <option value="Education & Academic Career">শিক্ষা ও উচ্চশিক্ষা গাইডলাইন (Education)</option>
                              <option value="Business & Entrepreneurship">ব্যবসা ও উদ্যোক্তা তৈরি (Business)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-500 uppercase block">অভিজ্ঞতার বছর (Years of Experience)</label>
                            <input
                              type="number"
                              min="1"
                              max="40"
                              required
                              value={mentorExperience}
                              onChange={e => setMentorExperience(e.target.value)}
                              className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">সংক্ষিপ্ত বায়ো ও অর্জন (Brief Mentorship Statement) *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="প্রাক্তনী শিক্ষার্থীদের ক্যারিয়ারে দিকনির্দেশনার জন্য আপনার অভিজ্ঞতা এবং আপনি কীভাবে অবদান রাখবেন তা উল্লেখ করুন..."
                            value={mentorBio}
                            onChange={e => setMentorBio(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-sans leading-relaxed"
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {activeFormType === 'magazine' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-500 uppercase block">লেখার শিরোনাম (Article Title) *</label>
                            <input
                              type="text"
                              required
                              placeholder="স্মরণিকা ম্যাগাজিনের জন্য লেখার আকর্ষণীয় নাম"
                              value={articleTitle}
                              onChange={e => setArticleTitle(e.target.value)}
                              className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-500 uppercase block">টপিক বা বিষয়বস্তু (Select Topic)</label>
                            <select
                              value={articleTopic}
                              onChange={e => setArticleTopic(e.target.value)}
                              className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="স্মৃতিচারণ (Memories)">স্কুল জীবনের স্মৃতিচারণ ও মধুর দিনগুলো</option>
                              <option value="সুবর্ণ জয়ন্তী উৎসব শুভেচ্ছা">সুবর্ণ জয়ন্তী ও স্কুলের গৌরবময় ৫০ বছর</option>
                              <option value="কবিতা / ছোটগল্প (Poetry)">অনুরণন - কবিতা / ছোটগল্প</option>
                              <option value="সাফল্য গাঁথা ও রূপকল্প">প্রাক্তনী এবং বর্তমান সমাজ সংস্কার</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase block">মূল লেখা / কন্টেন্ট বডি (Full Article Content) *</label>
                          <textarea
                            rows={5}
                            required
                            placeholder="আপনার সুন্দর স্মৃতিকথা বা কবিতা এখানে বিস্তারিত লিখুন। লেখাটি সুবর্ণ জয়ন্তী উপলক্ষে প্রকাশিত স্মরণিকায় (Souvenir) যুক্ত করার জন্য সাবমিট হচ্ছে..."
                            value={articleContent}
                            onChange={e => setArticleContent(e.target.value)}
                            className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-sans leading-relaxed"
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* SCHEMA-DRIVEN DYNAMIC FORM FIELDS SWITCHBOARD */}
                    {!['id_card', 'mentorship', 'magazine'].includes(activeFormType) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-gray-150 p-4.5 rounded-xl">
                        
                        {/* Beautiful Guidelines & Fee Rates Card inside the Active Dynamic Form */}
                        <div className="sm:col-span-2 bg-indigo-50/50 rounded-xl border border-indigo-150 p-5 space-y-4 text-left font-sans shadow-3xs mb-2">
                          <div className="flex items-center space-x-2 pb-2 border-b border-indigo-150">
                            <BookOpen className="h-5 w-5 text-indigo-700 font-bold" />
                            <h2 className="text-sm font-extrabold text-indigo-900">সরাসরি নিয়মাবলি ও ফি (Rules & Payment Guide)</h2>
                          </div>
                          
                          <div className="space-y-3.5 text-xs leading-relaxed text-gray-700">
                            <p className="font-semibold text-gray-750">
                              উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।
                            </p>
                            
                            <ul className="space-y-2 font-sans">
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
                            </ul>

                            <div className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-3xs space-y-1.5 mt-2">
                              <div className="text-[9.5px] font-mono tracking-wider font-extrabold text-gray-450 uppercase">বিকাশ / রকেট পেমেন্ট নম্বর:</div>
                              <div className="text-sm font-extrabold text-indigo-800 font-mono">০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)</div>
                              <p className="text-[10px] text-gray-500 leading-normal">টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।</p>
                            </div>
                          </div>
                        </div>

                        {customFields
                          .filter(f => f.formId === activeFormType)
                          .sort((a,b) => a.sortOrder - b.sortOrder)
                          .map((f) => {
                            const isReq = !!f.required;
                            return (
                              <div key={f.fieldId} className={`space-y-1.5 ${
                                ['textarea', 'address', 'signature'].includes(f.fieldType) ? 'sm:col-span-2' : ''
                              }`}>
                                <label className="font-bold text-gray-700 block">
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
                                            alert('ফাইলের সাইজ অনেক বড়! সর্বোচ্চ ৩ মেগাবাইট (3MB) পর্যন্ত ফাইল আপলোড করতে পারবেন।');
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
                    )}

                    {/* Submit area for dynamic form */}
                    <div className="flex justify-end pt-3 border-t border-gray-150">
                      <button
                        id="btn-dynamic-form-submit"
                        type="submit"
                        disabled={formSubmitting}
                        className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-1"
                      >
                        {formSubmitting ? (
                          <span>দাখিল হচ্ছে...</span>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>আবেদনপত্র দাখিল করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Applied Data (Show user's submitted data in real-time) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800">আমার দাখিলকৃত আবেদনপত্রের ইতিহাস ও রিয়েলটাইম অবস্থা (Submission Activity)</h3>
                      <p className="text-[10px] text-gray-400">আপনার সাবমিট করা সকল ড্যাশবোর্ড ডাটা এবং কমিটির এপ্রুভাল কন্ডিশন ভিউ ট্র্যাকিং</p>
                    </div>
                  </div>

                  {applications.length === 0 && customSubmissions.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50 border-gray-200">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-gray-400 mb-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-gray-450 font-bold font-sans block text-center">আপনি এখনো কোনো বিশেষ ক্যাটাগরি আবেদনপত্র জমা দেননি।</p>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5 block text-center">আবেদনের সাথে সাথে আপনার ট্র্যাকিং রেকর্ডটি ম্যাপ হয়ে রিয়েল টাইমে এখানে শো করবে।</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Classic Application submissions */}
                      {applications.map((app) => (
                        <div key={app.submissionId} className="border border-gray-150 bg-slate-50/20 rounded-xl p-5 hover:bg-white transition duration-200 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-gray-900 leading-none">{app.formLabel}</h4>
                              <span className="text-[10px] text-gray-400 block font-mono">আইডি - #{app.submissionId} | দাখিলকৃত সময়: {app.submittedAt}</span>
                            </div>

                            {/* Status badge */}
                            <span className={`text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide self-start sm:self-center font-mono inline-flex items-center gap-1 ${
                              app.status === 'approved'
                                ? 'bg-green-150 text-green-700'
                                : app.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                app.status === 'approved' ? 'bg-green-600' : app.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600'
                              }`} />
                              <span>{app.status === 'approved' ? 'Approved (অনুমোদিত)' : 
                                    app.status === 'rejected' ? 'Rejected' : 'Pending (যাচাইাধীন)'}</span>
                            </span>
                          </div>

                          {/* Expansion data list */}
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-[11px] text-gray-600 font-sans">
                            {Object.entries(app.data || {}).map(([key, val]) => {
                              // Human labels translations
                              let bnLabel = key;
                              if (key === 'name') bnLabel = 'নাম';
                              if (key === 'mobile') bnLabel = 'মোবাইল';
                              if (key === 'batch') bnLabel = 'ব্যাচ';
                              if (key === 'bloodGroup') bnLabel = 'রক্তের গ্রুপ';
                              if (key === 'occupation') bnLabel = 'পেশা';
                              if (key === 'address') bnLabel = 'যোগাযোগের ঠিকানা';
                              if (key === 'mentorArea') bnLabel = 'মেন্টরশিপ এরিয়া';
                              if (key === 'experienceYears') bnLabel = 'অভিজ্ঞ বছর';
                              if (key === 'bio') bnLabel = 'বায়ো ও দক্ষতা';
                              if (key === 'title') bnLabel = 'স্মরণিকা শিরোনাম';
                              if (key === 'topic') bnLabel = 'বিষয়বস্তু';
                              if (key === 'content') bnLabel = 'মূল লেখা';

                              return (
                                <div key={key} className={`${key === 'bio' || key === 'content' || key === 'address' ? 'sm:col-span-2 md:col-span-3' : ''} bg-white border rounded-lg p-2.5 shadow-3xs`}>
                                  <span className="text-gray-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">{bnLabel}:</span>
                                  <span className="text-gray-900 font-medium leading-relaxed font-mono whitespace-pre-line block">{String(val)}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Edit button */}
                          <div className="mt-4 pt-3 border-t border-gray-150 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingClassicSub(app);
                                setEditFormData({ ...app.data });
                              }}
                              className="text-xs text-primary font-bold hover:text-primary/80 transition duration-150 flex items-center gap-1 cursor-pointer focus:outline-none"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>তথ্য পরিবর্তন বা সংশোধন করুন (Edit Application)</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Custom Form submissions */}
                      {customSubmissions.map((sub) => {
                        const targetForm = customForms.find(f => f.formId === sub.formId);
                        const fields = customFields.filter(f => f.formId === sub.formId);
                        
                        return (
                          <div key={sub.submissionId} className="border border-amber-100 bg-amber-50/10 rounded-xl p-5 hover:bg-white transition duration-200 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-gray-900 leading-none flex items-center space-x-2">
                                  <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Dynamic Form</span>
                                  <span>{targetForm?.title || 'কাস্টম সংস্করণ'}</span>
                                </h4>
                                <span className="text-[10px] text-gray-400 block font-mono">আইডি - #{sub.submissionId} | দাখিলকৃত সময়: {new Date(sub.submittedAt).toLocaleString()}</span>
                              </div>

                              {/* Custom form submits are verified automatically / success */}
                              <span className="text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide self-start sm:self-center font-mono inline-flex items-center gap-1 bg-green-150 text-green-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                               <span>Success (জমা হয়েছে)</span>
                              </span>
                            </div>

                            {/* Response details */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-[11px] text-gray-600 font-sans">
                              {Object.entries(sub.data || {}).map(([fldId, val]) => {
                                const fld = fields.find(fd => fd.fieldId === fldId);
                                const label = fld ? fld.label : fldId;
                                const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                                const valueStr = String(val);
                                const isImage = valueStr.startsWith('data:image/') || fld?.fieldType === 'file' && valueStr.startsWith('data:image/');
                                const isPdf = valueStr.startsWith('data:application/pdf') || fld?.fieldType === 'file' && valueStr.startsWith('data:application/pdf');

                                return (
                                  <div key={fldId} className="bg-white border rounded-lg p-2.5 shadow-3xs flex flex-col justify-between">
                                    <div>
                                      <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wider text-[9px]">{label}:</span>
                                      {isImage ? (
                                        <div className="mt-1 border rounded p-1 bg-gray-50 flex flex-col items-center">
                                          <img 
                                            src={valueStr} 
                                            alt={label} 
                                            className="max-h-24 max-w-full rounded object-contain" 
                                            referrerPolicy="no-referrer"
                                          />
                                          <a 
                                            href={valueStr} 
                                            download={`upload_${sub.submissionId}.png`}
                                            className="text-[9px] text-primary hover:underline font-bold mt-1.5 inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            <Upload className="h-3 w-3" />
                                            <span>ডাউনলোড (Download)</span>
                                          </a>
                                        </div>
                                      ) : isPdf ? (
                                        <div className="mt-1">
                                          <div className="flex items-center space-x-1.5 text-[9px] bg-red-50 text-red-700 px-2.5 py-1 rounded-md border border-red-150 inline-flex">
                                            <FileText className="h-4 w-4 shrink-0 text-red-500" />
                                            <span className="font-extrabold">PDF Document</span>
                                          </div>
                                          <a 
                                            href={valueStr} 
                                            download={`document_${sub.submissionId}.pdf`}
                                            className="text-[10px] text-primary hover:underline font-bold block mt-1.5 inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            <Upload className="h-3 w-3" />
                                            <span>ডাউনলোড করুন (Download PDF)</span>
                                          </a>
                                        </div>
                                      ) : (
                                        <span className="text-gray-900 font-medium leading-relaxed font-mono whitespace-pre-line block">{displayVal}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Edit button */}
                            <div className="mt-4 pt-3 border-t border-gray-150 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCustomSub(sub);
                                  setEditFormData({ ...sub.data });
                                }}
                                className="text-xs text-primary font-bold hover:text-primary/80 transition duration-150 flex items-center gap-1 cursor-pointer focus:outline-none"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>তথ্য পরিবর্তন বা সংশোধন করুন (Edit Submission)</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SUBTAB: PROFILE EDIT SETTINGS */}
            {activeSubTab === 'profile' && (
              <motion.div
                key="subtab-profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 sm:p-8"
              >
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">অ্যালামনাই প্রোফিল সম্পাদন সেটিংস</h3>
                    <p className="text-[11px] text-gray-400">আপনার ব্যক্তিগত প্রোফাইল বিবরণ সামঞ্জস্য করুন</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5 pt-6 max-w-xl text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label id="lbl-edit-name" className="text-xs font-bold text-gray-500 uppercase">পূর্ণ নাম (Full Name) *</label>
                      <input
                        id="edit-profile-name"
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-primary font-bold text-gray-800 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label id="lbl-edit-mobile" className="text-xs font-bold text-gray-500 uppercase">যোগাযোগ মোবাইল নং *</label>
                      <input
                        id="edit-profile-mobile"
                        type="tel"
                        required
                        value={mobile}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-primary font-mono text-gray-800 text-sm"
                        onChange={e => setMobile(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label id="lbl-edit-batch" className="text-xs font-bold text-gray-500 uppercase">এসএসসি পাসের ব্যাচ (SSC Passing Year)</label>
                      <select
                        id="edit-profile-batch"
                        value={batch}
                        onChange={e => setBatch(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-primary font-mono text-gray-800 text-sm cursor-pointer"
                      >
                        {Array.from({ length: 51 }, (_, i) => String(1976 + i)).map(year => (
                          <option key={year} value={year}>{year} (SSC Batch)</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-3 pt-3 border-t border-gray-100">
                      <label className="text-xs font-extrabold text-gray-700 uppercase block">প্রোফাইল ছবি পরিবর্তন ও আপলোড (Profile Picture Upload)</label>
                      
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-5 bg-slate-50/50 p-4 border border-gray-200 rounded-xl">
                        {/* Live Preview Avatar */}
                        <div className="flex flex-col items-center justify-center shrink-0 space-y-1.5 pb-2 md:pb-0 md:pr-4 border-b md:border-b-0 md:border-r border-gray-200">
                          <label className="text-[10px] font-bold text-gray-400 font-sans uppercase">লাইভ প্রিভিউ (Preview)</label>
                          <div className="relative group">
                            <img
                              src={photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                              alt="Profile Preview"
                              className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
                              referrerPolicy="no-referrer"
                            />
                            {photo && (
                              <button
                                type="button"
                                onClick={() => setPhoto('')}
                                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-650 text-white rounded-full p-1 shadow-md transition-all hover:scale-110 cursor-pointer"
                                title="ছবি মুছে ফেলুন"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          {photo ? (
                            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">ছবি সেট হয়েছে</span>
                          ) : (
                            <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">ডিফল্ট অবতার</span>
                          )}
                        </div>

                        {/* Drag and Drop zone */}
                        <div className="flex-1">
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                              isDragging 
                                ? 'border-primary bg-primary/10 scale-[0.99]' 
                                : 'border-gray-200 hover:border-primary/50 bg-white hover:bg-slate-50/30'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="photo-upload-selector"
                            />
                            <label htmlFor="photo-upload-selector" className="cursor-pointer block space-y-1.5 focus:outline-none">
                              <div className="flex justify-center">
                                <span className={`p-2 rounded-full ${isDragging ? 'bg-primary/20 text-primary animate-bounce' : 'bg-slate-100 text-gray-500'}`}>
                                  <Upload className="h-5 w-5" />
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 font-bold block leading-relaxed">
                                এই বাক্সে আপনার ছবি <span className="text-primary underline">ড্র্যাগ অ্যান্ড ড্রপ করুন</span> অথবা <span className="text-amber-600 underline">ক্লিক করে ফাইল বা ক্যামেরা বাছুন</span>
                              </p>
                              <p className="text-[10px] text-gray-400 font-sans block leading-none">
                                ফাইল সাইজ সর্বোচ্চ ২ মেগাবাইট (2MB limit). JPG, PNG, WebP ফরম্যাট সমর্থিত।
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Manual Image URL Input fallback */}
                      <div className="space-y-1 pt-1.5">
                        <label id="lbl-edit-photo" className="text-[11px] font-bold text-gray-400 uppercase block">অথবা, সরাসরি ইন্টারনেট লিংক URL যুক্ত করুন (Image URL Link)</label>
                        <input
                          id="edit-profile-photo"
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={photo}
                          onChange={e => setPhoto(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-primary text-xs font-mono text-gray-600 bg-white shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('overview')}
                      className="px-5 py-2.5 rounded-lg border text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                    >
                      বাতিল (Cancel)
                    </button>
                    <button
                      id="btn-profile-submit-save"
                      type="submit"
                      disabled={saving}
                      className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-lg font-bold flex items-center space-x-1.5 text-xs shadow-md transition disabled:opacity-50"
                    >
                      {saving ? (
                        <span>সংরক্ষণ হচ্ছে...</span>
                      ) : (
                        <>
                          <Save className="h-4.5 w-4.5" />
                          <span>তথ্য সংরক্ষণ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* EDIT CLASSIC SUBMISSION MODAL */}
            {editingClassicSub && (
              <div key="edit-classic-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingClassicSub(null)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white rounded-2xl shadow-xl border w-full max-w-lg relative z-10 overflow-hidden"
                >
                  <form onSubmit={handleSaveClassicEdit} className="flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-1 font-mono">
                          সম্পাদনা (Edit Mode)
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-sm">
                          {editingClassicSub.formLabel} তথ্য সংশোধন
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingClassicSub(null)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Form body */}
                    <div className="p-6 overflow-y-auto space-y-4 text-left">
                      {Object.entries(editFormData).map(([key, val]) => {
                        const details = getClassicFieldDetails(key);
                        return (
                          <div key={key} className="space-y-1">
                            <label className="font-bold text-xs text-gray-650 block">
                              {details.label}
                            </label>
                            {details.type === 'textarea' ? (
                              <textarea
                                value={String(val)}
                                rows={3}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary bg-white text-gray-850"
                              />
                            ) : (
                              <input
                                type={details.type}
                                value={String(val)}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary bg-white text-gray-850"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer buttons */}
                    <div className="bg-slate-50 border-t px-6 py-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingClassicSub(null)}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-150 transition"
                      >
                        বাতিল (Cancel)
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingSub}
                        className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        {isUpdatingSub ? (
                          <span>সংরক্ষণ হচ্ছে...</span>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            <span>আপডেট করুন (Save Changes)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* EDIT CUSTOM FORM SUBMISSION MODAL */}
            {editingCustomSub && (
              <div key="edit-custom-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingCustomSub(null)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white rounded-2xl shadow-xl border w-full max-w-lg relative z-10 overflow-hidden"
                >
                  <form onSubmit={handleSaveCustomEdit} className="flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-1 font-mono">
                          সংশোধন (Dynamic Edit Mode)
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-sm">
                          {customForms.find(f => f.formId === editingCustomSub.formId)?.title || 'কাস্টম সংস্করণ'} তথ্য সংশোধন
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCustomSub(null)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Form body */}
                    <div className="p-6 overflow-y-auto space-y-4 text-left">
                      {customFields
                        .filter(f => f.formId === editingCustomSub.formId)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((f) => {
                          const isReq = !!f.required;
                          return (
                            <div key={f.fieldId} className="space-y-1.5">
                              <label className="font-bold text-xs text-gray-700 block">
                                {f.label} {isReq && <span className="text-red-500">*</span>}
                              </label>

                              {f.fieldType === 'text' && (
                                <input
                                  type="text"
                                  required={isReq}
                                  placeholder={f.placeholder || 'উত্তর লিখুন'}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                              )}

                              {f.fieldType === 'textarea' && (
                                <textarea
                                  rows={3}
                                  required={isReq}
                                  placeholder={f.placeholder || 'বিস্তারিত লিখুন...'}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-350 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                              )}

                              {f.fieldType === 'number' && (
                                <input
                                  type="number"
                                  required={isReq}
                                  placeholder={f.placeholder || 'সংখ্যা'}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-350 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                              )}

                              {f.fieldType === 'email' && (
                                <input
                                  type="email"
                                  required={isReq}
                                  placeholder={f.placeholder || 'example@mail.com'}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                              )}

                              {f.fieldType === 'mobile' && (
                                <input
                                  type="tel"
                                  required={isReq}
                                  placeholder={f.placeholder || '01XXXXXXXXX'}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              )}

                              {f.fieldType === 'date' && (
                                <input
                                  type="date"
                                  required={isReq}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              )}

                              {f.fieldType === 'time' && (
                                <input
                                  type="time"
                                  required={isReq}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              )}

                              {f.fieldType === 'datetime' && (
                                <input
                                  type="datetime-local"
                                  required={isReq}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              )}

                              {f.fieldType === 'dropdown' && (
                                <select
                                  required={isReq}
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer"
                                >
                                  <option value="">-- নির্বাচন করুন --</option>
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
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                              )}

                              {f.fieldType === 'file' && (
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    required={isReq && !editFormData[f.fieldId]}
                                    accept="image/*,application/pdf"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      if (file) {
                                        if (file.size > 3 * 1024 * 1024) {
                                          alert('ফাইলের সাইজ সর্বোচ্চ ৩ মেগাবাইট হতে পারবে।');
                                          return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setEditFormData(prev => ({ ...prev, [f.fieldId]: reader.result as string }));
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="w-full text-xs font-sans text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
                                  />
                                  {editFormData[f.fieldId] && (
                                    <div className="border rounded-lg p-2 bg-white flex items-center justify-between">
                                      <span className="text-[10px] text-green-650 font-semibold truncate max-w-[80%] flex items-center space-x-1">
                                        <CheckCircle className="h-3.5 w-3.5 inline text-green-500" />
                                        <span>ফাইল লোড হয়েছে</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setEditFormData(prev => {
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
                                        name={`edit-${f.fieldId}`}
                                        required={isReq}
                                        checked={editFormData[f.fieldId] === opt}
                                        onChange={() => setEditFormData(prev => ({ ...prev, [f.fieldId]: opt }))}
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
                                    const selectedValues = Array.isArray(editFormData[f.fieldId]) 
                                      ? editFormData[f.fieldId] 
                                      : (editFormData[f.fieldId] ? [editFormData[f.fieldId]] : []);
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
                                            setEditFormData(prev => ({ ...prev, [f.fieldId]: newVals }));
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
                                  value={editFormData[f.fieldId] || ''}
                                  onChange={e => setEditFormData(prev => ({ ...prev, [f.fieldId]: e.target.value }))}
                                  className="w-full border border-gray-355 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-serif font-bold tracking-wider"
                                />
                              )}

                              {f.fieldType === 'rating' && (
                                <div className="flex items-center space-x-2 pt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditFormData(prev => ({ ...prev, [f.fieldId]: star }))}
                                      className={`text-xl focus:outline-none transition ${
                                        (editFormData[f.fieldId] || star) >= star ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'
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

                    {/* Footer buttons */}
                    <div className="bg-slate-50 border-t px-6 py-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCustomSub(null)}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-150 transition"
                      >
                        বাতিল (Cancel)
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingSub}
                        className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        {isUpdatingSub ? (
                          <span>সংরক্ষণ হচ্ছে...</span>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            <span>আপডেট করুন (Save Changes)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};
