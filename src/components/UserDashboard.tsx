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
import { UserSidebar } from './UserSidebar';
import { UserOverview } from './user/UserOverview';
import { NoticeBoard } from './user/NoticeBoard';
import { JubileeEvents } from './user/JubileeEvents';
import { DigitalCertificateTab } from './user/DigitalCertificateTab';
import { ProfileSettings } from './user/ProfileSettings';

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
  const [activeCustomFormStep, setActiveCustomFormStep] = useState<number>(1);
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
  const [isPreviewing, setIsPreviewing] = useState(false);


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
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!currentUser?.uid) return;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        mobile,
        batch,
        profilePhoto: photo,
        updatedAt: new Date().toISOString()
      });
      await refreshUserProfile();
      setEditing(false);
      setActiveSubTab('overview');
      alert("আপনার প্রোফাইল আপডেট করা হয়েছে!");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, 'users');
      alert("প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  const handleAppFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const submissionId = `sub_${Date.now()}`;
      let data: any = {};
      let formLabel = '';

      if (activeFormType === 'id_card') {
        if (!idName.trim() || !idMobile.trim() || !idBatch.trim()) {
          alert('অনুগ্রহ করে সব তারকা (*) চিহ্নিত তথ্য প্রদান করুন।');
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
          alert('অনুগ্রহ করে শিরোনাম এবং মূল লেখার কন্টেন্ট সঠিকভাবে লিখুন।');
          setFormSubmitting(false);
          return;
        }
        data = {
          title: articleTitle.trim(),
          topic: articleTopic,
          content: articleContent.trim(),
        };
        formLabel = 'সুবর্ণ জয়ন্তী স্মরণিকা ম্যাগাজিনে লেখা জমা (Magazine Article)';
      }

      await setDoc(doc(db, 'form_submissions', submissionId), {
        submissionId,
        formId: activeFormType,
        formTitle: formLabel,
        userId: currentUser.uid,
        userName: currentUser.name,
        userEmail: currentUser.email,
        data,
        submittedAt: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('bn-BD'),
        status: 'pending'
      });

      alert('আপনার আবেদনটি সফলভাবে সাবমিট করা হয়েছে!');
      setArticleTitle('');
      setArticleContent('');
      setMentorBio('');
      setIdName('');
      setIdMobile('');
      setIdBatch('');
      setIdOccupation('');
      setIdAddress('');
    } catch (err) {
      console.error(err);
      alert('আবেদন জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Schema-driven Dynamic Form Submissions
  const handleCustomFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isPreviewing) {
      setIsPreviewing(true);
      return;
    }
    
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
        alert(`দুঃখিত! এই ফর্মটি শুধুমাত্র এসএসসি ${allowedBatch} পাসের ব্যাচের শিক্ষার্থীদের জন্য প্রযোজ্য।`);
        return;
      }
    }

    setFormSubmitting(true);
    try {
      const submissionId = `sub_custom_${Date.now()}`;
      await setDoc(doc(db, 'form_submissions', submissionId), {
        submissionId,
        formId: currentForm.formId,
        formTitle: currentForm.title,
        userId: currentUser.uid,
        userName: currentUser.name,
        userEmail: currentUser.email,
        data: dynamicFieldsData,
        submittedAt: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('bn-BD'),
        status: 'pending'
      });

      alert('আপনার ফরমটি সফলভাবে সাবমিট করা হয়েছে!');
      setDynamicFieldsData({});
      setIsPreviewing(false);
      setActiveFormType('');
    } catch (err) {
      console.error(err);
      alert('সাবমিট করতে সমস্যা হয়েছে।');
    } finally {
      setFormSubmitting(false);
    }
  };

  const isApproved = registration?.approvalStatus === 'approved';

  return (
    <div className="max-w-none w-full px-4 sm:px-6 lg:px-8 py-2 text-gray-800 pb-24">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        <UserSidebar 
          currentUser={currentUser}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          logout={logout}
          isApproved={isApproved}
        />

        {/* ========================================================================================= */}
        {/* MAIN WORKSPACE CONTENT CONTAINER */}
        {/* ========================================================================================= */}
        <main className="flex-grow w-full bg-transparent">
          <AnimatePresence mode="wait">
            
            {/* SUBTAB: OVERVIEW PANEL */}
            {activeSubTab === 'overview' && (
              <UserOverview 
                currentUser={currentUser}
                registration={registration}
                payment={payment}
              />
            )}

            {/* SUBTAB: DIGITAL CERTIFICATE PANEL */}
            {activeSubTab === 'certificate' && (
              <DigitalCertificateTab 
                currentUser={currentUser}
                registration={registration}
                payment={payment}
                isApproved={isApproved}
                setCurrentTab={setCurrentTab}
              />
            )}

            {/* SUBTAB: EVENT PROGRAMS SHEDULE */}
            {activeSubTab === 'events' && (
              <JubileeEvents 
                events={events}
                isApproved={isApproved}
              />
            )}

            {/* SUBTAB: NOTICE BOARD PANEL */}
            {activeSubTab === 'notices' && (
              <NoticeBoard 
                notices={notices}
              />
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
                      onClick={() => { setActiveFormType('magazine'); setActiveCustomFormStep(1); }}
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
                          setActiveCustomFormStep(1);
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
                  {(() => {
                    const activeCustomRulesForm = !['id_card', 'mentorship', 'magazine'].includes(activeFormType) 
                      ? customForms.find(f => f.formId === activeFormType) 
                      : null;
                    const totalStepsForActiveForm = activeCustomRulesForm?.totalSteps || 1;

                    return (
                      <form 
                        onSubmit={['id_card', 'mentorship', 'magazine'].includes(activeFormType) ? handleAppFormSubmit : handleCustomFormSubmit} 
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
                      (() => {
                        const currentRulesForm = customForms.find(f => f.formId === activeFormType);
                        const targetFields = customFields
                          .filter(f => f.formId === activeFormType)
                          .sort((a,b) => a.sortOrder - b.sortOrder);
                        
                        const totalSteps = currentRulesForm?.totalSteps || 1;
                        let fieldsToRender = targetFields;
                        
                        if (totalSteps > 1) {
                          const chunkSize = Math.ceil(targetFields.length / totalSteps);
                          const startIndex = (activeCustomFormStep - 1) * chunkSize;
                          const endIndex = startIndex + chunkSize;
                          fieldsToRender = targetFields.slice(startIndex, endIndex);
                        }

                        return (
                          <div className="bg-slate-50 border border-gray-150 p-4 sm:p-5 rounded-xl space-y-5">
                            
                            {/* Step Indicator */}
                            {totalSteps > 1 && (
                              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                                <span className="text-xs font-extrabold text-gray-500 uppercase">ধাপ {activeCustomFormStep} / {totalSteps}</span>
                                <div className="flex space-x-1.5">
                                  {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div key={i} className={`h-2 w-8 rounded-full ${activeCustomFormStep >= i + 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Beautiful Guidelines & Fee Rates Card inside the Active Dynamic Form */}
                            {(!currentRulesForm || currentRulesForm.showRulesWidget !== false) && activeCustomFormStep === 1 && (
                              <div className="bg-indigo-50/50 rounded-xl border border-indigo-150 p-5 space-y-4 text-left font-sans shadow-3xs mb-2">
                                <div className="flex items-center space-x-2 pb-2 border-b border-indigo-150">
                                  <BookOpen className="h-5 w-5 text-indigo-700 font-bold" />
                                  <h2 className="text-sm font-extrabold text-indigo-900">সরাসরি নিয়মাবলি ও ফি (Rules & Payment Guide)</h2>
                                </div>
                                
                                <div className="space-y-3.5 text-xs leading-relaxed text-gray-700">
                                  <p className="font-semibold text-gray-750">
                                    {currentRulesForm?.rulesIntro || "উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।"}
                                  </p>
                                  
                                  <ul className="space-y-2 font-sans">
                                    {currentRulesForm?.rulesItems && currentRulesForm.rulesItems.length > 0 ? (
                                      currentRulesForm.rulesItems.map((rule, index) => (
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
                                      {currentRulesForm?.paymentNumber || "০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)"}
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-normal">
                                      {currentRulesForm?.paymentInstructions || "টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {fieldsToRender.map((f) => {
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
                      </div>
                    );
                  })()
                )}

                    {/* Submit or Navigation area for dynamic form */}
                    <div className="flex justify-end pt-3 border-t border-gray-150 gap-2">
                      {totalStepsForActiveForm > 1 && activeCustomFormStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setActiveCustomFormStep(prev => prev - 1)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer mt-1"
                        >
                          পূর্ববর্তী ধাপ
                        </button>
                      )}
                      
                      {totalStepsForActiveForm > 1 && activeCustomFormStep < totalStepsForActiveForm ? (
                        <button
                          type="button"
                          onClick={(e) => {
                             // Minimal validation check (HTML5 standard form validity before proceeding)
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
                              <span>
                                {!['id_card', 'mentorship', 'magazine'].includes(activeFormType)
                                  ? (activeCustomRulesForm?.submitBtnText || 'আবেদনপত্র দাখিল করুন')
                                  : 'আবেদনপত্র দাখিল করুন'}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                    );
                  })()}
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

            {/* SUBTAB: PROFILE SETTINGS */}
            {activeSubTab === 'profile' && (
              <ProfileSettings 
                currentUser={currentUser}
                name={name}
                setName={setName}
                mobile={mobile}
                setMobile={setMobile}
                batch={batch}
                setBatch={setBatch}
                photo={photo}
                saving={saving}
                handleSaveProfile={handleSaveProfile}
                handleFileChange={handleFileChange}
                isDragging={isDragging}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
              />
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
      {isPreviewing && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">ফর্মের তথ্য যাচাই (Preview)</h2>
            <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto">
              {Object.entries(dynamicFieldsData).map(([fieldId, value]) => (
                <div key={fieldId} className="flex justify-between border-b py-2 text-sm">
                   <span className="font-semibold text-gray-500">{customFields.find(f => f.fieldId === fieldId)?.label || fieldId}</span>
                   <span className="font-medium text-gray-800">{value instanceof File ? value.name : String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setIsPreviewing(false)} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100">বাতিল</button>
              <button onClick={() => handleCustomFormSubmit()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/95">নিশ্চিত করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
