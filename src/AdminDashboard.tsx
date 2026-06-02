/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import Cropper, { Area } from 'react-easy-crop';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch 
} from 'firebase/firestore';
import { Registration, Payment, Event, Notice, Gallery, User, CustomForm, CustomFormField, CustomFormSubmission, Committee } from './types';
import Swal from 'sweetalert2';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminOverview } from './components/admin/AdminOverview';
import { VerificationQueue } from './components/admin/VerificationQueue';
import { UserManager } from './components/admin/UserManager';
import { CommitteeManager } from './components/admin/CommitteeManager';
import { EventManager } from './components/admin/EventManager';
import { NoticePublisher } from './components/admin/NoticePublisher';
import { HistoricalPhotoUpload } from './components/admin/HistoricalPhotoUpload';
import { FormBuilder } from './components/admin/FormBuilder';
import { FormSubmissions } from './components/admin/FormSubmissions';
import { FormDashboard } from './components/admin/FormDashboard';
import { 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Calendar, 
  Bell, 
  Image, 
  Eye, 
  AlertCircle,
  TrendingUp,
  Award,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Wrench,
  Settings2,
  Sliders,
  Edit,
  Edit2,
  Download,
  ClipboardList,
  PlusCircle,
  Copy,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Lock,
  Link,
  User as UserIcon,
  Search,
  Check,
  Save
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Data State
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  
  // Dynamic Custom Forms State
  const [customForms, setCustomForms] = useState<CustomForm[]>([]);
  const [customFields, setCustomFields] = useState<CustomFormField[]>([]);
  const [customSubmissions, setCustomSubmissions] = useState<CustomFormSubmission[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Committee Management States
  const [committee, setCommittee] = useState<Committee[]>([]);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesignation, setNewCommDesignation] = useState('');
  const [newCommRemark, setNewCommRemark] = useState('');
  const [newCommPhoto, setNewCommPhoto] = useState('');
  const [isCommPhotoUploading, setIsCommPhotoUploading] = useState(false);
  const [editingCommMemberId, setEditingCommMemberId] = useState<string | null>(null);
  const [commSearchQuery, setCommSearchQuery] = useState('');
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  
  // Crop States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // Tabs inside Admin Desk
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'registrations' | 'users' | 'events' | 'notices' | 'gallery' | 'form_builder' | 'form_submissions' | 'form_dashboard' | 'committee'>('overview');

  // Preview sliders
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Form states for adding items
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');

  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDesc, setNewNoticeDesc] = useState('');

  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCat, setNewGalleryCat] = useState('Golden Jubilee');
  const [newGalleryImg, setNewGalleryImg] = useState('');

  // Modals for admin popup flows
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  // Setup live snapshots with exact path checks for the rule validator
  useEffect(() => {
    // 1. Registrations
    const regPath = 'registrations';
    const unsubReg = onSnapshot(collection(db, regPath), (snapshot) => {
      const items: Registration[] = [];
      snapshot.forEach(doc => {
        items.push({ registrationId: doc.id, ...doc.data() } as Registration);
      });
      setRegistrations(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, regPath);
    });

    // 2. Payments
    const payPath = 'payments';
    const unsubPay = onSnapshot(collection(db, payPath), (snapshot) => {
      const items: Payment[] = [];
      snapshot.forEach(doc => {
        items.push({ paymentId: doc.id, ...doc.data() } as Payment);
      });
      setPayments(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, payPath);
    });

    // 3. Events
    const evPath = 'events';
    const unsubEv = onSnapshot(collection(db, evPath), (snapshot) => {
      const items: Event[] = [];
      snapshot.forEach(doc => {
        items.push({ eventId: doc.id, ...doc.data() } as Event);
      });
      setEvents(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, evPath);
    });

    // 4. Notices
    const noticePath = 'notices';
    const unsubNotice = onSnapshot(collection(db, noticePath), (snapshot) => {
      const items: Notice[] = [];
      snapshot.forEach(doc => {
        items.push({ noticeId: doc.id, ...doc.data() } as Notice);
      });
      setNotices(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, noticePath);
    });

    // 5. Gallery
    const galleryPath = 'gallery';
    const unsubGallery = onSnapshot(collection(db, galleryPath), (snapshot) => {
      const items: Gallery[] = [];
      snapshot.forEach(doc => {
        items.push({ galleryId: doc.id, ...doc.data() } as Gallery);
      });
      setGallery(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, galleryPath);
    });

    // 6. Dynamic Custom Forms
    const formsPath = 'forms';
    const unsubForms = onSnapshot(collection(db, formsPath), (snapshot) => {
      const items: CustomForm[] = [];
      snapshot.forEach(doc => {
        items.push({ formId: doc.id, ...doc.data() } as CustomForm);
      });
      setCustomForms(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, formsPath);
    });

    // 7. Dynamic Custom Form Fields
    const fieldsPath = 'form_fields';
    const unsubFields = onSnapshot(collection(db, fieldsPath), (snapshot) => {
      const items: CustomFormField[] = [];
      snapshot.forEach(doc => {
        items.push({ fieldId: doc.id, ...doc.data() } as CustomFormField);
      });
      setCustomFields(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, fieldsPath);
    });

    // 8. Dynamic Custom Form Submissions
    const submissionsPath = 'form_submissions';
    const unsubSubmissions = onSnapshot(collection(db, submissionsPath), (snapshot) => {
      const items: CustomFormSubmission[] = [];
      snapshot.forEach(doc => {
        items.push({ submissionId: doc.id, ...doc.data() } as CustomFormSubmission);
      });
      setCustomSubmissions(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, submissionsPath);
    });

    // 9. Users Directory
    const usersPath = 'users';
    const unsubUsers = onSnapshot(collection(db, usersPath), (snapshot) => {
      const items: User[] = [];
      snapshot.forEach(doc => {
        items.push({ uid: doc.id, ...doc.data() } as User);
      });
      setAllUsers(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, usersPath);
    });

    // 10. Committee Directory
    const committeePath = 'committee';
    const unsubCommittee = onSnapshot(collection(db, committeePath), (snapshot) => {
      const items: Committee[] = [];
      snapshot.forEach(doc => {
        items.push({ memberId: doc.id, ...doc.data() } as Committee);
      });
      setCommittee(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, committeePath);
    });

    return () => {
      unsubReg();
      unsubPay();
      unsubEv();
      unsubNotice();
      unsubGallery();
      unsubForms();
      unsubFields();
      unsubSubmissions();
      unsubUsers();
      unsubCommittee();
    };
  }, []);

  // Action: Approve Registration and payment synchronously
  const handleApproveRegistration = async (regId: string) => {
    try {
      // Find matching payment
      const pRecord = payments.find(p => p.registrationId === regId);
      
      const batch = writeBatch(db);
      const regRef = doc(db, 'registrations', regId);
      batch.update(regRef, { approvalStatus: 'approved' });

      if (pRecord) {
        const payRef = doc(db, 'payments', pRecord.paymentId);
        batch.update(payRef, { paymentStatus: 'approved' });
      }

      await batch.commit();
      setSelectedReg(null);
      Swal.fire({
        icon: 'success',
        title: 'এপ্রুভড!',
        text: 'আবেদনটি সফলভাবে এপ্রুভ করা হয়েছে!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'এপ্রুভ করতে সমস্যা হয়েছে।',
      });
    }
  };

  // Action: Approve Custom Submission
  const handleApproveCustomSubmission = async (subId: string) => {
    try {
      await updateDoc(doc(db, 'form_submissions', subId), { status: 'approved' });
      Swal.fire({
        icon: 'success',
        title: 'অনুমোদিত!',
        text: 'সাবমিশনটি অনুমোদিত হয়েছে!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'অনুমোদনে সমস্যা হয়েছে।',
      });
    }
  };

  // Action: Reject Custom Submission
  const handleRejectCustomSubmission = async (subId: string) => {
    try {
      await updateDoc(doc(db, 'form_submissions', subId), { status: 'rejected' });
      Swal.fire({
        icon: 'success',
        title: 'বাতিল!',
        text: 'সাবমিশনটি বাতিল করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'বাতিল করতে সমস্যা হয়েছে।',
      });
    }
  };

  // Action: Reject Registration & Payment
  const handleRejectRegistration = async (regId: string) => {
    try {
      const pRecord = payments.find(p => p.registrationId === regId);
      const batch = writeBatch(db);

      const regRef = doc(db, 'registrations', regId);
      batch.update(regRef, { approvalStatus: 'rejected' });

      if (pRecord) {
        const payRef = doc(db, 'payments', pRecord.paymentId);
        batch.update(payRef, { paymentStatus: 'rejected' });
      }

      await batch.commit();
      setSelectedReg(null);
      Swal.fire({
        icon: 'info',
        title: 'বাতিলকৃত!',
        text: 'আবেদনটি বাতিল (Rejected) করা হয়েছে।',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'বাতিল করতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // Action: Add Event Calendar detail
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    const evId = `event_${Date.now()}`;
    try {
      await setDoc(doc(db, 'events', evId), {
        eventId: evId,
        title: newEventTitle,
        description: newEventDesc,
        eventDate: newEventDate,
        location: newEventLoc || 'Main Campus'
      });
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setNewEventLoc('');
      setIsEventModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ইভেন্ট সফলভাবে যুক্ত করা হয়েছে!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (evId: string) => {
    try {
      await deleteDoc(doc(db, 'events', evId));
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Add Notice
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeDesc) return;
    const nId = `notice_${Date.now()}`;
    try {
      await setDoc(doc(db, 'notices', nId), {
        noticeId: nId,
        title: newNoticeTitle,
        description: newNoticeDesc,
        publishDate: new Date().toISOString().split('T')[0]
      });
      setNewNoticeTitle('');
      setNewNoticeDesc('');
      setIsNoticeModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'নোটিশটি বোর্ডে সফলভাবে পাবলিশ করা হয়েছে!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (nId: string) => {
    try {
      await deleteDoc(doc(db, 'notices', nId));
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Add Gallery Image
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImg || !newGalleryTitle) return;
    const gId = `gallery_${Date.now()}`;
    try {
      await setDoc(doc(db, 'gallery', gId), {
        galleryId: gId,
        title: newGalleryTitle,
        category: newGalleryCat,
        image: newGalleryImg
      });
      setNewGalleryTitle('');
      setNewGalleryImg('');
      setIsGalleryModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'গ্যালারি ছবি সফলভাবে আপলোড হয়েছে!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (gId: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', gId));
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================================================
  // COMMITTEE DIRECTORY OPERATION HANDLERS
  // =========================================================================================
  const handleAddOrEditCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName || !newCommDesignation) {
      Swal.fire({
        icon: 'warning',
        title: 'আবশ্যক!',
        text: 'নাম ও পদবী আবশ্যক!',
      });
      return;
    }

    try {
      if (editingCommMemberId) {
        // Edit Mode
        const memberRef = doc(db, 'committee', editingCommMemberId);
        await updateDoc(memberRef, {
          name: newCommName,
          designation: newCommDesignation,
          remark: newCommRemark,
          photo: newCommPhoto || ''
        });
        Swal.fire({
          icon: 'success',
          title: 'আপডেট সফল!',
          text: 'কমিটি সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে!',
          timer: 1500,
          showConfirmButton: false
        });
        setEditingCommMemberId(null);
      } else {
        // Add Mode
        const memberId = `member_${Date.now()}`;
        await setDoc(doc(db, 'committee', memberId), {
          memberId,
          name: newCommName,
          designation: newCommDesignation,
          remark: newCommRemark,
          photo: newCommPhoto || ''
        });
        Swal.fire({
          icon: 'success',
          title: 'যুক্ত হয়েছে!',
          text: 'কমিটি সদস্য সফলভাবে যুক্ত করা হয়েছে!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      // Reset State
      setNewCommName('');
      setNewCommDesignation('');
      setNewCommRemark('');
      setNewCommPhoto('');
      setIsCommModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।',
      });
    }
  };

  const handleEditCommitteeStart = (member: Committee) => {
    setEditingCommMemberId(member.memberId);
    setNewCommName(member.name);
    setNewCommDesignation(member.designation);
    setNewCommRemark(member.remark || '');
    setNewCommPhoto(member.photo || '');
    setIsCommModalOpen(true);
  };

  const handleCancelCommitteeEdit = () => {
    setEditingCommMemberId(null);
    setNewCommName('');
    setNewCommDesignation('');
    setNewCommRemark('');
    setNewCommPhoto('');
    setIsCommModalOpen(false);
  };

  const handleCommPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'বড় ফাইল!',
        text: 'ছবির সাইজ ২ মেগাবাইটের কম হতে হবে।',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropModalOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSaveCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      setIsCommPhotoUploading(true);
      const canvas = document.createElement('canvas');
      const img = new (window as any).Image();
      img.src = imageToCrop;
      
      await new Promise((resolve) => { img.onload = resolve; });

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCommPhotoUploading(false);
        return;
      }

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      setNewCommPhoto(canvas.toDataURL('image/jpeg', 0.8));
      setIsCropModalOpen(false);
      setImageToCrop(null);
      setIsCommPhotoUploading(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ক্রপ এরর!',
        text: 'ছবি ক্রপ করতে সমস্যা হয়েছে।',
      });
      setIsCommPhotoUploading(false);
    }
  };

  const handleDeleteCommittee = async (memberId: string) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "আপনি কি নিশ্চিতভাবে এই কমিটি সদস্যকে ডিলিট করতে চান?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
      cancelButtonText: 'না'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'committee', memberId));
        Swal.fire(
          'ডিলিট করা হয়েছে!',
          'কমিটি সদস্য সফলভাবে ডিলিট করা হয়েছে!',
          'success'
        );
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি!',
          text: 'ডিলিট করতে সমস্যা হয়েছে।',
        });
      }
    }
  };

  // =========================================================================================
  // DYNAMIC FORM BUILDER & SUBMISSIONS HANDLERS
  // =========================================================================================
  const [selectedBuilderFormId, setSelectedBuilderFormId] = useState<string | null>(null);
  
  // Settings edit state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formPermission, setFormPermission] = useState<'public' | 'login_required' | 'batch_restricted'>('public');
  const [formRestrictedBatch, setFormRestrictedBatch] = useState('');
  const [formSuccessMsg, setFormSuccessMsg] = useState('আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!');
  const [formSubmitBtnText, setFormSubmitBtnText] = useState('নিবন্ধন সম্পন্ন করুন (Submit)');
  const [formRedirectUrl, setFormRedirectUrl] = useState('');
  const [formRegisterNowActive, setFormRegisterNowActive] = useState(false);
  const [formTotalSteps, setFormTotalSteps] = useState(1);
  const [formLayout, setFormLayout] = useState<'single' | 'double'>('single');
  
  // Rules and payment guide customization states
  const [formShowRulesWidget, setFormShowRulesWidget] = useState(true);
  const [formRulesIntro, setFormRulesIntro] = useState('উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।');
  const [formRulesItems, setFormRulesItems] = useState([
    'একক অ্যালামনাই ফি: ১০০০/- টাকা।',
    'প্রতিটি অতিরিক্ত অতিথি ফি: ৫০০/- টাকা।',
    'উপহার সামগ্রী: সুবর্ণ জয়ন্তী টি-শার্ট, ক্যাপ, ব্যাজ ও স্মরণিকা ম্যাগাজিন।'
  ]);
  const [formPaymentNumber, setFormPaymentNumber] = useState('০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)');
  const [formBkashNumber, setFormBkashNumber] = useState('');
  const [formNagadNumber, setFormNagadNumber] = useState('');
  const [formRocketNumber, setFormRocketNumber] = useState('');
  const [formCashOptions, setFormCashOptions] = useState('');
  const [formPaymentInstructions, setFormPaymentInstructions] = useState('টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।');
  const [formAlumniFee, setFormAlumniFee] = useState<number>(1000);
  const [formGuestFee, setFormGuestFee] = useState<number>(500);

  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Field edit state
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'textarea' | 'number' | 'email' | 'mobile' | 'password' | 'dropdown' | 'radio' | 'checkbox' | 'date' | 'time' | 'datetime' | 'address' | 'signature' | 'rating' | 'url' | 'color' | 'file'>('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldOptionsRaw, setFieldOptionsRaw] = useState('');

  // Field inline editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState('');
  const [editFieldType, setEditFieldType] = useState<'text' | 'textarea' | 'number' | 'email' | 'mobile' | 'password' | 'dropdown' | 'radio' | 'checkbox' | 'date' | 'time' | 'datetime' | 'address' | 'signature' | 'rating' | 'url' | 'color' | 'file'>('text');
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldPlaceholder, setEditFieldPlaceholder] = useState('');
  const [editFieldOptionsRaw, setEditFieldOptionsRaw] = useState('');

  // Selected responses tracking
  const [selectedSubmission, setSelectedSubmission] = useState<CustomFormSubmission | null>(null);
  const [selectedSubmissionsFormId, setSelectedSubmissionsFormId] = useState<string>('');
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [exportPreviewFormId, setExportPreviewFormId] = useState<string | null>(null);

  // Auto-select the form that is Active + Register Now active in the submissions tab
  useEffect(() => {
    if (activeSubTab === 'form_submissions' && !selectedSubmissionsFormId && customForms.length > 0) {
      const activeRegForm = customForms.find(f => f.status === 'active' && f.registerNowActive === true);
      if (activeRegForm) {
        setSelectedSubmissionsFormId(activeRegForm.formId);
      } else {
        // Fallback to first active form, if any
        const firstActive = customForms.find(f => f.status === 'active');
        if (firstActive) {
          setSelectedSubmissionsFormId(firstActive.formId);
        } else {
          setSelectedSubmissionsFormId(customForms[0].formId);
        }
      }
    }
  }, [activeSubTab, customForms, selectedSubmissionsFormId]);

  // Populate form settings for editing
  const loadFormSettingsIntoState = (form: CustomForm) => {
    setSelectedBuilderFormId(form.formId);
    setFormTitle(form.title);
    setFormSlug(form.slug);
    setFormDesc(form.description);
    setFormStatus(form.status);
    setFormPermission(form.permission);
    setFormRestrictedBatch(form.restrictedBatch || '');
    setFormSuccessMsg(form.successMessage || 'আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!');
    setFormSubmitBtnText(form.submitBtnText || 'নিবন্ধন সম্পন্ন করুন (Submit)');
    setFormRedirectUrl(form.redirectUrl || '');
    setFormRegisterNowActive(!!form.registerNowActive);
    setFormTotalSteps(form.totalSteps || 1);
    setFormLayout((form as any).layout || 'single');
    
    setFormShowRulesWidget(form.showRulesWidget !== false);
    setFormRulesIntro(form.rulesIntro || 'উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।');
    setFormRulesItems(form.rulesItems && form.rulesItems.length > 0 ? form.rulesItems : [
      'একক অ্যালামনাই ফি: ১০০০/- টাকা।',
      'প্রতিটি অতিরিক্ত অতিথি ফি: ৫০০/- টাকা।',
      'উপহার সামগ্রী: সুবর্ণ জয়ন্তী টি-শার্ট, ক্যাপ, ব্যাজ ও স্মরণিকা ম্যাগাজিন।'
    ]);
    setFormPaymentNumber(form.paymentNumber || '০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)');
    setFormBkashNumber(form.bkashNumber || '');
    setFormNagadNumber(form.nagadNumber || '');
    setFormRocketNumber(form.rocketNumber || '');
    setFormCashOptions(form.cashOptions?.join(', ') || '');
    setFormPaymentInstructions(form.paymentInstructions || 'টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।');
    setFormAlumniFee(form.alumniFee !== undefined ? form.alumniFee : 1000);
    setFormGuestFee(form.guestFee !== undefined ? form.guestFee : 500);

    setIsEditingSettings(true);
  };

  const handleStartNewForm = () => {
    setSelectedBuilderFormId(null);
    setFormTitle('');
    setFormSlug('');
    setFormDesc('');
    setFormStatus('active');
    setFormPermission('public');
    setFormRestrictedBatch('');
    setFormSuccessMsg('আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!');
    setFormSubmitBtnText('নিবন্ধন সম্পন্ন করুন (Submit)');
    setFormRedirectUrl('');
    setFormRegisterNowActive(false);
    setFormTotalSteps(1);
    setFormLayout('single');

    setFormShowRulesWidget(true);
    setFormRulesIntro('উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।');
    setFormRulesItems([
      'একক অ্যালামনাই ফি: ১০০০/- টাকা।',
      'প্রতিটি অতিরিক্ত অতিথি ফি: ৫০০/- টাকা।',
      'উপহার সামগ্রী: সুবর্ণ জয়ন্তী টি-শার্ট, ক্যাপ, ব্যাজ ও স্মরণিকা ম্যাগাজিন।'
    ]);
    setFormPaymentNumber('০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)');
    setFormBkashNumber('');
    setFormNagadNumber('');
    setFormRocketNumber('');
    setFormPaymentInstructions('টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।');
    setFormAlumniFee(1000);
    setFormGuestFee(500);

    setIsEditingSettings(true);
  };

  // Action: Save Form settings (create/update form)
  const handleSaveFormSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    
    const finalSlug = formSlug.trim() || formTitle.trim().toLowerCase().replace(/[^a-zA-Z0-9_\-]+/g, '-');
    const fId = selectedBuilderFormId || `form_${Date.now()}`;
    
    try {
      await setDoc(doc(db, 'forms', fId), {
        formId: fId,
        title: formTitle.trim(),
        slug: finalSlug,
        description: formDesc.trim(),
        status: formStatus,
        permission: formPermission,
        restrictedBatch: formRestrictedBatch.trim(),
        successMessage: formSuccessMsg.trim(),
        submitBtnText: formSubmitBtnText.trim(),
        redirectUrl: formRedirectUrl.trim(),
        registerNowActive: formRegisterNowActive,
        totalSteps: formTotalSteps,
        layout: formLayout,
        showRulesWidget: formShowRulesWidget,
        rulesIntro: formRulesIntro.trim(),
        rulesItems: formRulesItems.map(item => item.trim()).filter(Boolean),
        paymentNumber: formPaymentNumber.trim(),
        bkashNumber: formBkashNumber.trim(),
        nagadNumber: formNagadNumber.trim(),
        rocketNumber: formRocketNumber.trim(),
        cashOptions: formCashOptions.split(',').map(s => s.trim()).filter(Boolean),
        paymentInstructions: formPaymentInstructions.trim(),
        alumniFee: Number(formAlumniFee) || 0,
        guestFee: Number(formGuestFee) || 0,
        createdBy: currentUser?.name || 'Admin',
        createdAt: selectedBuilderFormId 
          ? (customForms.find(f => f.formId === selectedBuilderFormId)?.createdAt || new Date().toISOString())
          : new Date().toISOString()
      }, { merge: true });

      // Automatically sync a beautiful banner to the gallery indicating custom form is live
      const companionGalleryId = `gallery_form_${fId}`;
      const customFormCategoryName = `আবেদন ফরম: ${formTitle.trim()}`;
      
      const elegantUnsplashBanners = [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80"
      ];
      const selectedThemeBanner = elegantUnsplashBanners[fId.length % elegantUnsplashBanners.length];

      await setDoc(doc(db, 'gallery', companionGalleryId), {
        galleryId: companionGalleryId,
        title: `${formTitle.trim()} (সেশন ফর্ম)`,
        category: customFormCategoryName,
        imgUrl: selectedThemeBanner,
        uploadedBy: currentUser?.name || 'Admin',
        uploadedAt: new Date().toISOString()
      }, { merge: true });
      
      if (formRegisterNowActive) {
        // Automatically deactivate registerNowActive flag for other existing custom forms
        const otherFormsWithActive = customForms.filter(f => f.formId !== fId && f.registerNowActive);
        for (const otherF of otherFormsWithActive) {
          await updateDoc(doc(db, 'forms', otherF.formId), { registerNowActive: false });
        }
      }

      if (!selectedBuilderFormId) {
        setSelectedBuilderFormId(fId);
        // Add default "Your Name" text input
        const fldId = `field_${Date.now()}`;
        await setDoc(doc(db, 'form_fields', fldId), {
          fieldId: fldId,
          formId: fId,
          label: 'আবেদনকারীর নাম (Alumni/User Name)',
          fieldType: 'text',
          required: true,
          placeholder: 'আপনার নাম লিখুন',
          options: [],
          sortOrder: 1
        });
      }
      
      setIsEditingSettings(false);
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ফর্ম কনফিগারেশন সফলভাবে সেভ করা হয়েছে!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch(err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'অ্যাপ ডেভেলপমেন্ট সিস্টেমে ফর্ম সংরক্ষণ করতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // Action: Add Form Field
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilderFormId || !fieldLabel.trim()) return;
    
    const fldId = `field_${Date.now()}`;
    const optionsList = fieldOptionsRaw
      ? fieldOptionsRaw.split(',').map(o => o.trim()).filter(Boolean)
      : [];
      
    const siblingFields = customFields.filter(f => f.formId === selectedBuilderFormId);
    const order = siblingFields.length + 1;
    
    try {
      await setDoc(doc(db, 'form_fields', fldId), {
        fieldId: fldId,
        formId: selectedBuilderFormId,
        label: fieldLabel.trim(),
        fieldType,
        required: fieldRequired,
        placeholder: fieldPlaceholder.trim(),
        options: optionsList,
        sortOrder: order
      });
      
      setFieldLabel('');
      setFieldPlaceholder('');
      setFieldOptionsRaw('');
      setFieldRequired(false);
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ফিল্ডটি সফলভাবে ফর্মে যুক্ত করা হয়েছে!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch(err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'নতুন ফিল্ড তৈরি করতে সমস্যা হয়েছে।',
      });
    }
  };

  const handleEditFieldStart = (field: CustomFormField) => {
    setEditingFieldId(field.fieldId);
    setEditFieldLabel(field.label);
    setEditFieldType(field.fieldType);
    setEditFieldRequired(!!field.required);
    setEditFieldPlaceholder(field.placeholder || '');
    setEditFieldOptionsRaw(field.options ? field.options.join(', ') : '');
  };

  const handleEditFieldCancel = () => {
    setEditingFieldId(null);
    setEditFieldLabel('');
    setEditFieldPlaceholder('');
    setEditFieldOptionsRaw('');
    setEditFieldRequired(false);
  };

  const handleEditFieldSave = async (fieldId: string) => {
    if (!editFieldLabel.trim()) {
      return;
    }
    const optionsList = editFieldOptionsRaw
      ? editFieldOptionsRaw.split(',').map(o => o.trim()).filter(Boolean)
      : [];
    try {
      await updateDoc(doc(db, 'form_fields', fieldId), {
        label: editFieldLabel.trim(),
        fieldType: editFieldType,
        required: editFieldRequired,
        placeholder: editFieldPlaceholder.trim(),
        options: optionsList
      });
      setEditingFieldId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteDoc(doc(db, 'form_fields', fieldId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloneField = async (field: CustomFormField) => {
    const fldId = `field_${Date.now()}`;
    const siblingFields = customFields.filter(f => f.formId === field.formId);
    const order = siblingFields.length + 1;
    try {
      await setDoc(doc(db, 'form_fields', fldId), {
        ...field,
        fieldId: fldId,
        label: `${field.label} (Copy)`,
        sortOrder: order
      });
      Swal.fire({
        icon: 'success',
        title: 'ক্লোন সফল!',
        text: 'ফিল্ডটি ক্লোন করা হয়েছে!',
        timer: 1000,
        showConfirmButton: false
      });
    } catch(err) {
      console.error(err);
    }
  };

  // Shift fields order (sort order)
  const handleShiftFieldOrder = async (field: CustomFormField, direction: 'up' | 'down') => {
    const siblingFields = [...customFields]
      .filter(f => f.formId === field.formId)
      .sort((a,b) => a.sortOrder - b.sortOrder);
      
    const idx = siblingFields.findIndex(f => f.fieldId === field.fieldId);
    if (idx === -1) return;
    
    if (direction === 'up' && idx > 0) {
      const prev = siblingFields[idx - 1];
      const prevOrder = prev.sortOrder;
      const curOrder = field.sortOrder;
      await updateDoc(doc(db, 'form_fields', field.fieldId), { sortOrder: prevOrder });
      await updateDoc(doc(db, 'form_fields', prev.fieldId), { sortOrder: curOrder });
    } else if (direction === 'down' && idx < siblingFields.length - 1) {
      const next = siblingFields[idx + 1];
      const nextOrder = next.sortOrder;
      const curOrder = field.sortOrder;
      await updateDoc(doc(db, 'form_fields', field.fieldId), { sortOrder: nextOrder });
      await updateDoc(doc(db, 'form_fields', next.fieldId), { sortOrder: curOrder });
    }
  };

  // Delete Form completely (including children)
  const handleDeleteFormComplete = async (formId: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'forms', formId));
      
      const relatedFields = customFields.filter(f => f.formId === formId);
      relatedFields.forEach(f => {
        batch.delete(doc(db, 'form_fields', f.fieldId));
      });
      
      const relatedSubs = customSubmissions.filter(s => s.formId === formId);
      relatedSubs.forEach(s => {
        batch.delete(doc(db, 'form_submissions', s.submissionId));
      });
      
      await batch.commit();
      setSelectedBuilderFormId(null);
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে!',
        text: 'ফর্মটি সফলভাবে মুছে ফেলা হয়েছে!',
      });
    } catch(err) {
      console.error(err);
    }
  };

  // Toggle form active/inactive status
  const handleToggleFormStatus = async (formId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'forms', formId), { status: nextStatus });
      Swal.fire({
        icon: 'success',
        title: 'আপডেট সফল!',
        text: `ফর্ম স্ট্যাটাস সফলভাবে '${nextStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}' করা হয়েছে!`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'সিস্টেমে ফর্ম স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // Toggle registerNowActive toggle
  const handleToggleRegisterNowActive = async (formId: string, currentRegisterNowActive: boolean) => {
    try {
      const nextActive = !currentRegisterNowActive;
      
      // Update targeted form
      await updateDoc(doc(db, 'forms', formId), { registerNowActive: nextActive });
      
      if (nextActive) {
        // Automatically deactivate registerNowActive flag for all other forms
        const otherFormsWithActive = customForms.filter(f => f.formId !== formId && f.registerNowActive);
        for (const otherF of otherFormsWithActive) {
          await updateDoc(doc(db, 'forms', otherF.formId), { registerNowActive: false });
        }
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'এই ফর্মটি এখন প্রধান "Register Now" ফর্ম হিসেবে নির্ধারিত হয়েছে!',
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'ডিসকানেক্টেড!',
          text: 'ফর্ম থেকে "Register Now" সংযোগ বিচ্ছিন্ন করা হয়েছে।',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'রেজিস্ট্রেশন এখন সক্রিয়করণে সমস্যা হয়েছে।',
      });
    }
  };

  // Client-Side CSV Exporter
  const handleExportSubmissionsCSV = (formId: string) => {
    const targetForm = customForms.find(f => f.formId === formId);
    if (!targetForm) return;
    
    const fields = [...customFields]
      .filter(f => f.formId === formId)
      .sort((a,b) => a.sortOrder - b.sortOrder);
      
    const subs = customSubmissions.filter(s => s.formId === formId);
    if (subs.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'নো ডাটা!',
        text: 'রপ্তানি করার জন্য কোন রেসপন্স বা সাবমিশন পাওয়া যায়নি।',
      });
      return;
    }
    
    const hasPaymentFields = subs.some(s => s.data && (s.data.paymentGateway || s.data.paymentScreenshot));
    const headers = [
      'Submission ID', 
      'User Name', 
      'User Email', 
      'Submitted At', 
      ...fields.map(f => f.label),
      ...(hasPaymentFields ? ['Selected Payment Gateway', 'Payment Screenshot (Status)'] : [])
    ];

    const rows = subs.map(sub => {
      const escapeField = (val: string) => {
        return (val || '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');
      };

      return [
        `"${escapeField(sub.submissionId)}"`,
        `"${escapeField(sub.userName || 'Guest User')}"`,
        `"${escapeField(sub.userEmail || '')}"`,
        `"${escapeField(new Date(sub.submittedAt).toLocaleString())}"`,
        ...fields.map(f => {
          const val = sub.data[f.fieldId];
          if (val === undefined || val === null) return '""';
          
          const isAttachment = f.fieldType === 'file' || f.fieldType === 'signature' || (typeof val === 'string' && val.startsWith('data:'));
          if (isAttachment) {
            return `"${escapeField(f.fieldType === 'signature' ? '[ডিজিটাল স্বাক্ষর (Digital Signature)]' : '[সংযুক্ত ছবি/ফাইল (Attached Image/File)]')}"`;
          }

          if (Array.isArray(val)) {
            return `"${escapeField(val.join('; '))}"`;
          }
          return `"${escapeField(String(val))}"`;
        }),
        ...(hasPaymentFields ? [
          sub.data?.paymentGateway ? `"${escapeField(sub.data.paymentGateway)}"` : '""',
          sub.data?.paymentScreenshot ? '"[সংযুক্ত স্ক্রিনশট (Screenshot Uploaded)]"' : '""'
        ] : [])
      ];
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `submissions_${targetForm.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete single submission
  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await deleteDoc(doc(db, 'form_submissions', submissionId));
      setSelectedSubmission(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Math totals for stats counters
  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter(r => r.approvalStatus === 'approved').length;
  const pendingRegistrations = registrations.filter(r => r.approvalStatus === 'pending').length;
  const pendingCustomSubmissions = customSubmissions.filter(s => (s.status || 'pending') === 'pending');
  const totalReceivedBkash = payments
    .filter(p => p.paymentStatus === 'approved')
    .reduce((sum, current) => sum + current.amount, 0);

  // ----------------------------------------------------
  // Recharts Chart Formulations: Group Alumni by SSC Batch decade
  // ----------------------------------------------------
  const batchMapping: { [key: string]: number } = {};
  registrations.forEach(r => {
    const year = Number(r.academicInfo?.passingYear || 2015);
    const decade = year < 1980 ? "70s" :
                   year < 1990 ? "80s" :
                   year < 2000 ? "90s" :
                   year < 2010 ? "2000s" :
                   year < 2020 ? "2010s" : "2020s";
    batchMapping[decade] = (batchMapping[decade] || 0) + 1;
  });

  const chartDataBatch = Object.keys(batchMapping).map(key => ({
    decade: `Decade - ${key}`,
    Registrations: batchMapping[key]
  }));

  // Recharts Chart Formulations: Approved vs Pending Payments distribution
  const approvedPayCount = payments.filter(p => p.paymentStatus === 'approved').length;
  const pendingPayCount = payments.filter(p => p.paymentStatus === 'pending').length;
  const chartDataPayments = [
    { name: 'অনুমোদিত (Approved)', value: approvedPayCount === 0 && pendingPayCount === 0 ? 1 : approvedPayCount },
    { name: 'বকেয়া/যাচাইাধীন (Pending)', value: pendingPayCount }
  ];

  const PIE_COLORS = ['#0F4C81', '#E63946'];

  interface SidebarTabItem {
    id: 'overview' | 'registrations' | 'events' | 'notices' | 'gallery' | 'form_builder' | 'form_submissions' | 'committee';
    label: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }

  const adminSidebarTabs: SidebarTabItem[] = [
    { id: 'overview', label: 'সার্বিক ওভারভিউ', subtitle: 'Overview & Charts', icon: LayoutDashboard },
    { id: 'registrations', label: 'আবেদন ভেরিফিকেশন', subtitle: 'Verification Queue', icon: Users, badge: pendingRegistrations > 0 ? String(pendingRegistrations) : undefined },
    { id: 'committee', label: 'কমিটি মেম্বার', subtitle: 'Manage Committee List', icon: Award },
    { id: 'events', label: 'কর্মসূচী ম্যানেজার', subtitle: 'Event Program Scheduler', icon: Calendar },
    { id: 'notices', label: 'ঘোষণা ও নোটিশ', subtitle: 'Publish Noticeboard', icon: Bell },
    { id: 'gallery', label: 'স্মৃতি গ্যালারি', subtitle: 'Upload Historical Photos', icon: Image },
    { id: 'form_builder', label: 'ডায়নামিক ফর্ম বিল্ডার', subtitle: 'Unlimited Form Creator', icon: Sliders },
    { id: 'form_submissions', label: 'ফর্ম সাবমিশন ডাটা', subtitle: 'Track Dynamic Submissions', icon: ClipboardList },
  ];

  return (
    <div className="max-w-none w-full px-2 sm:px-4 lg:px-4 py-2 text-gray-800 pb-16">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        
        <AdminSidebar 
          currentUser={currentUser}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          logout={logout}
        />
        
        {/* ========================================================================================= */}
        {/* MAIN WORKSPACE CONTENT CONTAINER */}
        {/* ========================================================================================= */}
        <main className="flex-grow w-full bg-transparent">
          {/* 2. Interactive Sections switcher */}
      {activeSubTab === 'overview' && (
        <div className="space-y-10">
          
          {/* Quick numbers cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০১. সর্বমোট ইউজার</span>
                <span className="text-2xl font-extrabold text-gray-900 font-mono block">{allUsers.length || registrations.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
              <div className="p-3 bg-violet-50 rounded-lg text-violet-600">
                <Sliders className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০২. মোট তৈরি ফর্ম</span>
                <span className="text-2xl font-extrabold text-gray-900 font-mono block">{customForms.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০৩. মোট সাবমিশন</span>
                <span className="text-2xl font-extrabold text-gray-900 font-mono block">{customSubmissions.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০৪. অ্যাক্টিভ ফর্ম</span>
                <span className="text-2xl font-extrabold text-gray-900 font-mono block">{customForms.filter(f => f.status === 'active').length}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex items-center space-x-4">
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">১০৫. অপেক্ষমাণ আবেদন</span>
                <span className="text-2xl font-extrabold text-gray-900 font-mono block">{pendingRegistrations}</span>
              </div>
            </div>

          </div>

          {/* Recharts Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Batch Distribution chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-150 p-4 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <TrendingUp className="h-5 text-primary" />
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">নিবন্ধিত প্রাক্তনী দলের দশকভিত্তিক বিন্যাস (Batch decade)</h3>
              </div>
              
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataBatch}>
                    <XAxis dataKey="decade" fontSize={11} stroke="#888888" />
                    <YAxis fontSize={11} stroke="#888888" />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="Registrations" fill="#0F4C81" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Income breakdown distribution circular pie chart */}
            <div className="bg-white rounded-xl border border-gray-150 p-4 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <CreditCard className="h-5 text-primary" />
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">পেমেন্ট কালেকশন</h3>
              </div>

              <div className="h-72 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataPayments}
                      cx="55%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartDataPayments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. Registrations Approval screen */}
      {activeSubTab === 'registrations' && (
        <div id="admin-registrations-tab" className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 mb-1 flex items-center space-x-2">
                  <span>আবেদনপত্র ভেরিফিকেশন (Registration Queue)</span>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {pendingRegistrations} অপেক্ষমান
                  </span>
                </h2>
                <p className="text-xs text-gray-400 font-medium">প্রাক্তনী ভর্তি আবেদনসমূহ ও পেমেন্ট ট্রানজেকশন প্রুফ যাচাইকরণ</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-xs divide-y">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">শনাক্তকারী ID</th>
                    <th className="py-3 px-4">আবেদনকারীর বিবরণ</th>
                    <th className="py-3 px-4">ব্যাচ</th>
                    <th className="py-3 px-4">গেস্ট সংখ্যা</th>
                    <th className="py-3 px-4">টি-শার্ট সাইজ</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">ম্যানেজ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 font-medium">
                        কোন নিবেশন বা আবেদন জমা পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => {
                      const regUser = allUsers.find(u => u.uid === reg.userId);
                      const isPending = reg.approvalStatus === 'pending';
                      
                      return (
                        <tr key={reg.registrationId} className="hover:bg-gray-50/40 transition">
                          <td className="ppy-1.5 px-2 font-mono font-bold text-gray-700">
                            #{reg.registrationId.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="ppy-1.5 px-2">
                            <div className="font-bold text-gray-800">{regUser?.name || 'পরিচিত ইউজার'}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{regUser?.email || 'N/A'}</div>
                          </td>
                          <td className="ppy-1.5 px-2 font-mono text-gray-600">
                            {reg.academicInfo?.passingYear || "N/A"}
                          </td>
                          <td className="ppy-1.5 px-2 font-mono text-gray-600">
                            {reg.participationInfo?.guestCount ?? 0} জন
                          </td>
                          <td className="ppy-1.5 px-2">
                            <span className="bg-gray-150 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono border">
                              {reg.participationInfo?.tshirtSize || "M"}
                            </span>
                          </td>
                          <td className="ppy-1.5 px-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.approvalStatus === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : reg.approvalStatus === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {reg.approvalStatus === 'approved' 
                                ? 'অনুমোদিত' 
                                : reg.approvalStatus === 'rejected' 
                                ? 'উপেক্ষিত' 
                                : 'যাচাইধীন'}
                            </span>
                          </td>
                          <td className="ppy-1.5 px-2 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSelectedReg(reg)}
                                className="text-indigo-600 font-bold hover:bg-indigo-50 px-2.5 py-1 rounded border border-indigo-150 transition cursor-pointer"
                              >
                                বিস্তারিত
                              </button>
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApproveRegistration(reg.registrationId)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer transition"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>এপ্রুভ</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectRegistration(reg.registrationId)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    <span>বাতিল</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic Form Submissions Approval screen */}
            <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 mb-1 flex items-center space-x-2">
                    <span>ডায়নামিক ফর্ম আবেদনপত্র ভেরিফিকেশন</span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {pendingCustomSubmissions.length} অপেক্ষমান
                    </span>
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left text-xs divide-y">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ফর্ম নাম</th>
                      <th className="py-3 px-4">আবেদনকারী</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">ম্যানেজ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {pendingCustomSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-400 font-medium">
                          কোন পেন্ডিং ডায়নামিক ফর্ম আবেদন নেই।
                        </td>
                      </tr>
                    ) : (
                      pendingCustomSubmissions.map((sub) => (
                        <tr key={sub.submissionId} className="hover:bg-gray-50/40 transition">
                          <td className="ppy-1.5 px-2 font-bold text-gray-700">
                            {customForms.find(f => f.formId === sub.formId)?.title || 'Unknown Form'}
                          </td>
                          <td className="ppy-1.5 px-2 font-bold text-gray-800">
                            {sub.userName}
                          </td>
                          <td className="ppy-1.5 px-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {sub.status || 'Pending'}
                            </span>
                          </td>
                          <td className="ppy-1.5 px-2 text-right">
                             <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="text-primary font-bold hover:bg-primary/5 px-2.5 py-1 rounded border border-primary/20 transition cursor-pointer"
                                >
                                  ডিটেইলস
                                </button>
                                <button
                                  onClick={() => handleApproveCustomSubmission(sub.submissionId)}
                                  className="text-green-600 font-bold hover:bg-green-50 px-2.5 py-1 rounded border border-green-150 transition cursor-pointer"
                                >
                                  এপ্রুভ
                                </button>
                                <button
                                  onClick={() => handleRejectCustomSubmission(sub.submissionId)}
                                  className="text-red-600 font-bold hover:bg-red-50 px-2.5 py-1 rounded border border-red-150 transition cursor-pointer"
                                >
                                  বাতিল
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detailed Registration Info Modal */}
          {selectedReg && (
            <div id="registration-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                onClick={() => setSelectedReg(null)} 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              />
              
              <div className="bg-white rounded-xl w-full max-w-3xl border shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-150 flex justify-between items-center bg-radial-to-r from-blue-50/10 to-indigo-50/10">
                  <div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 rounded font-bold uppercase px-2 py-0.5 tracking-wider">
                      নিবন্ধন বিবরণী কার্ড
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 mt-1">
                      {allUsers.find(u => u.uid === selectedReg.userId)?.name || 'আবেদনকারী'} এর বিবরণী
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedReg(null)}
                    className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded transition"
                  >
                    X
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Personal Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border space-y-2.5">
                      <h4 className="font-bold text-gray-800 border-b pb-1 font-sans">ব্যক্তিগত তথ্য (Personal)</h4>
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">পিতার নাম:</td><td className="py-1 font-bold text-gray-805">{selectedReg.personalInfo?.fatherName || 'N/A'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">মাতার নাম:</td><td className="py-1 font-bold text-gray-805">{selectedReg.personalInfo?.motherName || 'N/A'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">লিঙ্গ:</td><td className="py-1 font-bold text-gray-805">{selectedReg.personalInfo?.gender || 'N/A'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">রক্তের গ্রুপ:</td><td className="py-1 font-bold text-red-600">{selectedReg.personalInfo?.bloodGroup || 'N/A'}</td></tr>
                          <tr><td className="py-1 text-gray-400">জন্ম তারিখ:</td><td className="py-1 font-bold text-gray-805">{selectedReg.personalInfo?.dob || 'N/A'}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 2. Academic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border space-y-2.5">
                      <h4 className="font-bold text-gray-800 border-b pb-1 font-sans">একাডেমিক বিবরণ (Academic)</h4>
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">SSC বছর:</td><td className="py-1 font-mono font-bold text-gray-805">{selectedReg.academicInfo?.passingYear || 'N/A'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">ক্লাস রোল:</td><td className="py-1 font-mono font-bold text-gray-805">{selectedReg.academicInfo?.roll || 'N/A'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">শাখা/সেকশন:</td><td className="py-1 font-bold text-gray-805">{selectedReg.academicInfo?.section || 'N/A'}</td></tr>
                          <tr><td className="py-1 text-gray-400">বর্তমান পেশা:</td><td className="py-1 font-bold text-gray-805">{selectedReg.academicInfo?.currentOccupation || 'N/A'}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 3. Contact Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border col-span-1 md:col-span-2 space-y-2.5">
                      <h4 className="font-bold text-gray-800 border-b pb-1 font-sans">যোগাযোগের বিবরণ (Contact)</h4>
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400 w-1/4">বিকল্প মোবাইল:</td><td className="py-1 font-bold text-gray-805">{selectedReg.contactInfo?.alternateMobile || 'N/A'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="py-1 text-gray-400">বর্তমান ঠিকানা:</td><td className="py-1 text-gray-805">{selectedReg.contactInfo?.presentAddress || 'N/A'}</td></tr>
                          <tr><td className="py-1 text-gray-400 font-sans">স্থায়ী ঠিকানা:</td><td className="py-1 text-gray-805">{selectedReg.contactInfo?.permanentAddress || 'N/A'}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 4. Payment details */}
                    <div className="bg-gray-50 p-4 rounded-lg border col-span-1 md:col-span-2 space-y-3">
                      <h4 className="font-bold text-gray-800 border-b pb-1 flex items-center space-x-1 font-sans">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span>পেমেন্ট ট্রানজেকশন ট্র্যাকিং (Transaction Info)</span>
                      </h4>
                      {(() => {
                        const pm = payments.find(p => p.registrationId === selectedReg.registrationId);
                        if (!pm) {
                          return <div className="text-amber-600 font-bold">এই আবেদনের বিপরীতে কোন পেমেন্ট রেকর্ড পাওয়া যায়নি।</div>;
                        }
                        return (
                          <div className="space-y-4 font-sans">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-3 border-gray-200">
                              <div>
                                <span className="text-gray-400 block pb-0.5">টাকার পরিমাণ (Amount)</span>
                                <strong className="text-[13px] text-gray-900 font-black block">{pm.amount} ৳</strong>
                              </div>
                              <div>
                                <span className="text-gray-400 block pb-0.5">ট্রানজেকশন ID (TrxID)</span>
                                <strong className="text-xs text-indigo-700 font-bold block uppercase font-mono">{pm.trxId}</strong>
                              </div>
                              <div>
                                <span className="text-gray-400 block pb-0.5">পেমেন্ট স্টেট</span>
                                <strong className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                  pm.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' : pm.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>{pm.paymentStatus}</strong>
                              </div>
                              <div>
                                <span className="text-gray-400 block pb-0.5">তারিখ</span>
                                <strong className="text-[10px] text-gray-500 font-mono block">
                                  {new Date(pm.createdAt).toLocaleString()}
                                </strong>
                              </div>
                            </div>

                            {/* Base64 Payment proof image if exists */}
                            {pm.paymentProof && (
                              <div className="space-y-1.5">
                                <span className="text-gray-400 font-bold block">পেমেন্ট স্ক্রিনশট / প্রমাণ (Payment Proof Screenshot):</span>
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
                                  <img 
                                    src={pm.paymentProof} 
                                    alt="Payment proof screenshot" 
                                    referrerPolicy="no-referrer"
                                    className="max-h-[220px] object-contain mx-auto rounded"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-150 flex justify-end space-x-2 text-xs font-sans">
                  <button 
                    onClick={() => setSelectedReg(null)}
                    className="px-4 py-2 border hover:bg-gray-150 rounded-lg font-bold cursor-pointer transition"
                  >
                    বন্ধ করুন
                  </button>
                  {selectedReg.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleRejectRegistration(selectedReg.registrationId)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>বাতিল করুন</span>
                      </button>
                      <button
                        onClick={() => handleApproveRegistration(selectedReg.registrationId)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition flex items-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>অনুমোদন করুন (Approve)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2.5 User Management Global List */}
      {activeSubTab === 'users' && (
        <UserManager />
      )}

      {/* 3. Event Program scheduler */}
      {activeSubTab === 'events' && (
        <div id="admin-events-tab" className="grid grid-cols-1 gap-4 animate-fade-in text-xs">
          {/* Full Width Column: Scheduled Event List */}
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-gray-850 text-sm font-sans flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>নির্ধারিত ইভেন্ট সমূহ (Scheduled Events)</span>
              </h3>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="bg-primary hover:bg-primary/95 text-white font-bold py-1.5 px-3 rounded text-[10.5px] cursor-pointer transition flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Event</span>
              </button>
            </div>
            
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium font-sans">কোন কর্মসূচী বা ইভেন্ট এখনও শিডিউল করা হয়নি।</div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div key={ev.eventId} className="p-4 bg-gray-50 border rounded-xl hover:shadow-xs transition relative">
                    <button 
                      onClick={() => handleDeleteEvent(ev.eventId)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded absolute top-3 right-3 transition cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="space-y-1.5 max-w-[90%]">
                      <h4 className="font-bold text-gray-950 text-sm leading-tight font-sans">{ev.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-gray-500 font-medium">
                        <span className="flex items-center space-x-0.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>{ev.eventDate}</span>
                        </span>
                        <span className="flex items-center space-x-0.5">
                          <AlertCircle className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>ভেন্যু: {ev.location}</span>
                        </span>
                      </div>
                      {ev.description && (
                        <p className="text-gray-600 leading-relaxed font-sans mt-2 whitespace-pre-wrap">{ev.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Notices announcement screen */}
      {activeSubTab === 'notices' && (
        <div id="admin-notices-tab" className="grid grid-cols-1 gap-4 animate-fade-in text-xs">
          {/* Full Width Column: Published Notices board */}
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-gray-850 text-sm font-sans flex items-center space-x-1.5">
                <Bell className="h-4 w-4 text-primary shrink-0" />
                <span>প্রকাশিত নোটিশবোর্ড (Published Notices)</span>
              </h3>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="bg-primary hover:bg-primary/95 text-white font-bold py-1.5 px-3 rounded text-[10.5px] cursor-pointer transition flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Notice</span>
              </button>
            </div>

            {notices.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium font-sans">কোন নোটিশ বা ঘোষণা এখনো প্রকাশিত করা হয়নি।</div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {notices.map((n) => (
                  <div key={n.noticeId} className="p-4 bg-gray-50 border rounded-xl hover:shadow-xs transition relative">
                    <button 
                      onClick={() => handleDeleteNotice(n.noticeId)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded absolute top-3 right-3 transition cursor-pointer"
                      title="Delete Notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="space-y-1.5 max-w-[90%]">
                      <strong className="text-gray-950 font-bold block text-sm leading-tight font-sans">{n.title}</strong>
                      <span className="text-[9px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                        তারিখ: {n.publishDate}
                      </span>
                      <p className="text-gray-600 font-sans mt-2 whitespace-pre-wrap leading-relaxed border-t pt-2 mt-2">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Memory Photo gallery subtab */}
      {activeSubTab === 'gallery' && (
        <div id="admin-gallery-tab" className="grid grid-cols-1 gap-4 animate-fade-in text-xs">
          {/* Full Width Column Album feed */}
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-gray-850 text-sm font-sans flex items-center space-x-1.5">
                <Image className="h-4 w-4 text-primary shrink-0" />
                <span>গ্যালারি অ্যালবাম (Photo Gallery Feed)</span>
              </h3>
              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="bg-primary hover:bg-primary/95 text-white font-bold py-1.5 px-3 rounded text-[10.5px] cursor-pointer transition flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Image</span>
              </button>
            </div>

            {gallery.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium font-sans">গ্যালারিতে এখনও কোনো ছবি আপলোড করা হয়নি।</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[580px] overflow-y-auto pr-1">
                {gallery.map((g) => (
                  <div key={g.galleryId} className="group bg-gray-50 border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition relative font-sans">
                    <button 
                      onClick={() => handleDeleteGallery(g.galleryId)}
                      className="p-1 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full shadow-xs absolute top-2 right-2 z-10 font-bold text-xs cursor-pointer transition"
                      title="Delete Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="aspect-video w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img 
                        src={g.image} 
                        alt={g.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3 leading-tight space-y-1">
                      <strong className="text-gray-950 font-bold block text-xs truncate" title={g.title}>{g.title}</strong>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full inline-block">{g.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Dynamic Form Builder subtab */}
      {activeSubTab === 'form_builder' && (
        <div id="admin-form-builder-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-4 animate-fade-in text-xs font-sans">
          
          {/* LEFT COLUMN: DYNAMIC DIRECTORIES & FORM CREATING/SETTINGS MODULATOR */}
          <div className="xl:col-span-5 space-y-4">
            
            {/* 1. Forms Listing and directory switcher */}
            <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-2.5">
                <h4 className="font-bold text-gray-800 text-xs flex items-center space-x-1">
                  <Sliders className="h-4 w-4 text-primary" />
                  <span>কাস্টম ফর্ম ডিরেক্টরি (Forms Queue)</span>
                </h4>
                <button
                  onClick={handleStartNewForm}
                  className="bg-primary hover:bg-primary/95 text-white font-bold py-1 px-2.5 rounded text-[10px] flex items-center space-x-0.5 cursor-pointer transition"
                >
                  <Plus className="h-3 w-3" />
                  <span>নতুন তৈরি করুন</span>
                </button>
              </div>

              {customForms.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">এখন পর্যন্ত কোনো কাস্টম ফর্ম তৈরি করা হয়নি।</p>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {customForms.map((frm) => {
                    const isSelected = selectedBuilderFormId === frm.formId;
                    return (
                      <div 
                        key={frm.formId}
                        onClick={() => loadFormSettingsIntoState(frm)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          isSelected 
                            ? 'bg-indigo-55 border-indigo-400 shadow-xs' 
                            : 'bg-gray-50 border-gray-150 hover:bg-gray-100/50'
                        }`}
                      >
                        <div className="leading-tight space-y-1 max-w-[80%]">
                          <strong className="text-gray-900 block truncate">{frm.title}</strong>
                          <span className="text-[10px] text-gray-400 font-mono block">/{frm.slug}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            frm.status === 'active' ? 'bg-green-150 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {frm.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFormComplete(frm.formId);
                            }}
                            className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer transition"
                            title="Delete Form completely"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Form Settings Modifier panel */}
            {isEditingSettings && (
              <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs space-y-3 animate-slide-up">
                <h4 className="font-bold text-gray-800 text-xs pb-2 border-b flex items-center space-x-1.5">
                  <Settings2 className="h-4 w-4 text-primary" />
                  <span>{selectedBuilderFormId ? 'ফর্ম সেটিংস এডিট করুন' : 'নতুন ফর্ম বেসিক সেটিংস'}</span>
                </h4>

                <form onSubmit={handleSaveFormSettings} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500 block">ফর্মের শিরোনাম (Form Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="IT Training Registration Form"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500 block">কাস্টম Slug URL (slug)*</label>
                    <input
                      type="text"
                      placeholder="it-training-apply"
                      value={formSlug}
                      onChange={e => setFormSlug(e.target.value)}
                      className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500 block">ফর্মের বিবরণ/নির্দেশিকা (Notice / Guidelines)</label>
                    <textarea
                      rows={3}
                      placeholder="ফর্ম পূরণ করার সময় ইউজারকে যে নোটিশ বা বিবরণ দেখাবেন তা এখানে লিখুন..."
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500 block">ফর্ম লেআউট (Form Layout)</label>
                    <select
                      value={formLayout}
                      onChange={e => setFormLayout(e.target.value as 'single' | 'double')}
                      className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                    >
                      <option value="single">Single Column Layout</option>
                      <option value="double">Two Column Layout</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-500 block">স্ট্যাটাস (Status)</label>
                      <select
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value as any)}
                        className="w-full border rounded px-3 py-1.5 bg-white text-xs font-sans"
                      >
                        <option value="active">সক্রিয় (Active)</option>
                        <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-500 block">অনুমতি (Access Permission)</label>
                      <select
                        value={formPermission}
                        onChange={e => setFormPermission(e.target.value as any)}
                        className="w-full border rounded px-3 py-1.5 bg-white text-xs font-sans"
                      >
                        <option value="public">উন্মুক্ত (Public)</option>
                        <option value="login_required">লগইন বাধ্যতামূলক (Login Required)</option>
                        <option value="batch_restricted">নির্দিষ্ট ব্যাচ প্রাক্তনী (Batch restricted)</option>
                      </select>
                    </div>
                  </div>

                  {formPermission === 'batch_restricted' && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="font-semibold text-gray-500 block">অনুমোদিত ব্যাচ বছর (উদাঃ 2015) *</label>
                      <input
                        type="text"
                        required
                        placeholder="উদাঃ 2015"
                        value={formRestrictedBatch}
                        onChange={e => setFormRestrictedBatch(e.target.value)}
                        className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-500 block">মোট ধাপ (Total Steps Count)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formTotalSteps}
                        onChange={e => setFormTotalSteps(Number(e.target.value))}
                        className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-500 block">বাটন টেক্সট (Submit Text)</label>
                      <input
                        type="text"
                        placeholder="উদাঃ নিবন্ধন সম্পন্ন করুন (Submit)"
                        value={formSubmitBtnText}
                        onChange={e => setFormSubmitBtnText(e.target.value)}
                        className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-500 block">জমা পরবর্তী সফল মেসেজ (Success Message)</label>
                      <input
                        type="text"
                        placeholder="আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!"
                        value={formSuccessMsg}
                        onChange={e => setFormSuccessMsg(e.target.value)}
                        className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs"
                      />
                    </div>
                  </div>

                  {/* Rules and Payment Guide Customization */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label onClick={() => setFormShowRulesWidget(!formShowRulesWidget)} className="font-extrabold text-indigo-900 select-none cursor-pointer font-sans text-xs">
                        ফর্মে "সরাসরি নিয়মাবলি ও ফি" গাইডলাইন দেখান
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormShowRulesWidget(!formShowRulesWidget)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${formShowRulesWidget ? 'bg-primary' : 'bg-gray-300'}`}
                        role="switch"
                        aria-checked={formShowRulesWidget}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formShowRulesWidget ? 'translate-x-4' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 block leading-tight font-sans">
                      এই অপশনটি চালু থাকলে ফর্মে পেমেন্ট এবং নিয়মাবলি সংক্রান্ত একটি তথ্যবহুল কার্ড প্রদর্শিত হবে। বন্ধ থাকলে তা ফর্মের ভিতর লুকানো থাকবে তবে ল্যান্ডিং পেজে প্রদর্শিত হবে।
                    </span>

                    <div className="space-y-3.5 pt-2.5 border-t border-indigo-100 animate-slide-up text-left">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600 block text-[10.5px]">গাইডলাইন ভূমিকা (Intro Text)</label>
                          <textarea
                            rows={2}
                            value={formRulesIntro}
                            onChange={e => setFormRulesIntro(e.target.value)}
                            className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs bg-white"
                            placeholder="উদাঃ উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে..."
                          />
                        </div>

                        <div className="space-y-1.5">
                        <div className="space-y-1.5 flex justify-between items-center">
                          <label className="font-semibold text-gray-600 block text-[10.5px]">নিয়ম বা ফি এর তালিকা (Rules / Items)</label>
                          <button
                            type="button"
                            onClick={() => setFormRulesItems([...formRulesItems, ''])}
                            className="bg-primary/10 hover:bg-primary/20 text-primary p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition"
                            title="নতুন নিয়ম যুক্ত করুন"
                          >
                            <Plus className="w-3 h-3" /> যুক্ত করুন
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {formRulesItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="bg-indigo-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-bold shrink-0">{index + 1}</span>
                              <input
                                type="text"
                                value={item}
                                onChange={e => {
                                  const newItems = [...formRulesItems];
                                  newItems[index] = e.target.value;
                                  setFormRulesItems(newItems);
                                }}
                                className="w-full border rounded px-2.5 py-1 focus:ring-1 focus:ring-primary font-sans text-xs bg-white"
                                placeholder={`আইটেম ${index + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...formRulesItems];
                                  newItems.splice(index, 1);
                                  setFormRulesItems(newItems);
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="font-semibold text-gray-600 block text-[10.5px]">সাধারণ পেমেন্ট নম্বর (বিবিধ/সরাসরি)</label>
                            <input
                              type="text"
                              value={formPaymentNumber}
                              onChange={e => setFormPaymentNumber(e.target.value)}
                              className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs bg-white"
                              placeholder="০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-gray-655 block text-[10.5px]">টাকা পাঠানোর পরবর্তী নির্দেশিকা</label>
                            <input
                              type="text"
                              value={formPaymentInstructions}
                              onChange={e => setFormPaymentInstructions(e.target.value)}
                              className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs bg-white"
                              placeholder="উদাঃ টাকা পাঠানোর পর ট্রানজেকশন আইডি..."
                            />
                          </div>
                        </div>

                        {/* 3 Account Numbers Inputs */}
                        <div className="bg-indigo-50/25 border border-indigo-100/60 p-3 rounded-xl space-y-2">
                          <label className="font-bold text-indigo-950 block text-[11px] font-sans">৩টি মোবাইল পেমেন্ট গেটওয়ে নম্বর (ঐচ্ছিক - নম্বর প্রদান করলে গ্রাহক অটো পেমেন্ট ও স্ক্রিনশট দিতে পারবে)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-semibold text-pink-600 block text-[10px]">বিকাশ নম্বর (Bkash)</label>
                              <input
                                type="text"
                                value={formBkashNumber}
                                onChange={e => setFormBkashNumber(e.target.value)}
                                className="w-full border border-pink-200 rounded px-2.5 py-1 focus:ring-1 focus:ring-pink-400 font-sans text-xs bg-white text-pink-700 font-bold font-mono"
                                placeholder="০১৭XXXXXXXX"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-orange-600 block text-[10px]">নগদ নম্বর (Nagad)</label>
                              <input
                                type="text"
                                value={formNagadNumber}
                                onChange={e => setFormNagadNumber(e.target.value)}
                                className="w-full border border-orange-200 rounded px-2.5 py-1 focus:ring-1 focus:ring-orange-400 font-sans text-xs bg-white text-orange-700 font-bold font-mono"
                                placeholder="০১৮XXXXXXXX"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div className="space-y-1">
                              <label className="font-semibold text-purple-650 block text-[10px]">রকেট নম্বর (Rocket)</label>
                              <input
                                type="text"
                                value={formRocketNumber}
                                onChange={e => setFormRocketNumber(e.target.value)}
                                className="w-full border border-purple-200 rounded px-2.5 py-1 focus:ring-1 focus:ring-purple-400 font-sans text-xs bg-white text-purple-700 font-bold font-mono"
                                placeholder="০১৫XXXXXXXX"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-emerald-600 block text-[10px]">ক্যাশ অপশন (Cash)</label>
                              <input
                                type="text"
                                value={formCashOptions || ''}
                                onChange={e => setFormCashOptions(e.target.value)}
                                className="w-full border border-emerald-200 rounded px-2.5 py-1 focus:ring-1 focus:ring-emerald-400 font-sans text-xs bg-white text-emerald-700 font-bold"
                                placeholder="ক্যাশ অপশন (কমা দিয়ে লিখুন)..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fee Settings Configuration */}
                        <div className="border-t border-indigo-150 pt-2.5 space-y-2">
                          <label className="font-extrabold text-indigo-900 block text-xs font-sans">নিবন্ধন ফি নির্ধারণ (Registration Fees)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-green-50/20 p-3 rounded-xl border border-green-150/40">
                            <div className="space-y-1">
                              <label className="font-semibold text-gray-650 block text-[10.5px]">১. একক অ্যালামনাই নিবন্ধন ফি (টাকা)*</label>
                              <input
                                type="number"
                                required
                                min={0}
                                value={formAlumniFee}
                                onChange={e => setFormAlumniFee(Number(e.target.value))}
                                className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs bg-white font-mono"
                                placeholder="উদাঃ ১০০০"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-semibold text-gray-650 block text-[10.5px]">২. প্রতিটি অতিরিক্ত অতিথি ফি (টাকা)*</label>
                              <input
                                type="number"
                                required
                                min={0}
                                value={formGuestFee}
                                onChange={e => setFormGuestFee(Number(e.target.value))}
                                className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs bg-white font-mono"
                                placeholder="উদাঃ ৫০০"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>

                  {/* Register Now Active Integration (REQUEST 3) */}
                  <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="formRegNowChk"
                        checked={formRegisterNowActive}
                        onChange={e => setFormRegisterNowActive(e.target.checked)}
                        className="h-4 w-4 text-primary rounded cursor-pointer"
                      />
                      <label htmlFor="formRegNowChk" className="font-semibold text-gray-700 select-none cursor-pointer">
                        "রেজিস্ট্রেশন করুন (Register Now)" বাটন এর সাথে সক্রিয় করুন
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-400 block leading-tight font-sans">
                      এই চেক বক্স অন করলে, হোম স্ক্রিনের প্রধান "রেজিস্ট্রেশন করুন" বাটন এ ক্লিক করলে সরাসরি এই কাস্টম ফর্মটি লোড হবে।
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-secondary text-gray-900 font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center space-x-1 font-sans"
                  >
                    <Save className="h-4 w-4" />
                    <span>ফর্ম কনফিগারেশন সংরক্ষণ করুন (Save Settings)</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DESIGN AREA / FORM FIELDS */}
          <div className="xl:col-span-7 space-y-6">
            {!selectedBuilderFormId ? (
              <div className="bg-white rounded-xl border border-gray-150 p-8 text-center space-y-3 font-sans">
                <Sliders className="h-10 w-10 text-gray-300 mx-auto animate-pulse" />
                <h4 className="text-gray-800 font-bold text-sm mb-1">কোন ফর্ম সিলেক্ট করা নেই</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">বাম পাশের ডিরেক্টরি থেকে কাস্টমাইজ করার জন্য যেকোনো একটি ফর্ম সিলেক্ট করুন অথবা নতুন ক্রিয়েট করুন।</p>
              </div>
            ) : (
              (() => {
                const selectedForm = customForms.find(f => f.formId === selectedBuilderFormId);
                const sortedFields = [...customFields]
                  .filter(f => f.formId === selectedBuilderFormId)
                  .sort((a,b) => a.sortOrder - b.sortOrder);
                
                return (
                  <div className="space-y-6 font-sans">
                    {/* Selected Form Header */}
                    <div className="bg-white rounded-xl border border-gray-150 p-4 flex justify-between items-center bg-radial-to-r from-blue-50/10 to-indigo-50/10">
                      <div>
                        <span className="text-[10.5px] bg-primary/10 text-primary font-bold uppercase rounded px-2 py-0.5">ডিজাইন এরিয়া</span>
                        <h3 className="font-extrabold text-gray-900 text-sm mt-1">{selectedForm?.title}</h3>
                        <p className="text-[11px] text-gray-500 font-medium">স্ল্যাগ URL: <code className="font-mono bg-gray-100 text-gray-800 px-1 rounded">/forms/{selectedForm?.slug}</code></p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold block bg-gray-100 text-gray-600 px-3 py-1 rounded">
                          মোট ফিল্ড: {sortedFields.length} টি
                        </span>
                      </div>
                    </div>

                    {/* Add Field Section (REQUEST 2 option file included below) */}
                    {isAddFieldOpen && (
                      <div className="bg-white rounded-xl border border-gray-150 p-4 space-y-3 shadow-xs animate-slide-up">
                        <h4 className="font-bold text-gray-800 text-xs pb-1.5 border-b text-secondary flex items-center space-x-1 font-sans">
                          <PlusCircle className="h-4 w-4" />
                          <span>১০০% কাস্টম ইনপুট ফিল্ড জোড়ানো (Add Form Field)</span>
                        </h4>

                        <form onSubmit={handleAddField} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-semibold text-gray-500 block font-sans">ফিল্ডের নাম / লেবেল (Label) *</label>
                              <input
                                type="text"
                                required
                                placeholder="উদাঃ বর্তমান পেশা (Current Occupation)"
                                value={fieldLabel}
                                onChange={e => setFieldLabel(e.target.value)}
                                className="w-full border rounded px-3 py-1.5 text-xs font-sans"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-semibold text-gray-500 block font-sans">ইনপুট টাইপ (Field Input Type) *</label>
                              <select
                                value={fieldType}
                                onChange={e => setFieldType(e.target.value as any)}
                                className="w-full border rounded px-3 py-1.5 bg-white text-xs font-sans"
                              >
                                <optgroup label="Basic Inputs">
                                  <option value="text">সাধারণ টেক্সট (Text Input)</option>
                                  <option value="textarea">দীর্ঘ বর্ণনা (Textarea)</option>
                                  <option value="number">সংখ্যা (Number)</option>
                                  <option value="email">ইমেইল (Email)</option>
                                  <option value="mobile">মোবাইল নম্বর (Mobile Number)</option>
                                  <option value="password">পাসওয়ার্ড (Password)</option>
                                </optgroup>
                                <optgroup label="Selection Controls">
                                  <option value="dropdown">ড্রপডাউন লিস্ট (Dropdown Select)</option>
                                  <option value="radio">অপশন বাটন (Radio Buttons)</option>
                                  <option value="checkbox">চেকবক্স অপশন (Checkbox Items)</option>
                                </optgroup>
                                <optgroup label="Temporal Pickers">
                                  <option value="date">তারিখ (Date Picker)</option>
                                  <option value="time">সময় (Time Picker)</option>
                                  <option value="datetime">তারিখ ও সময় (DateTime Picker)</option>
                                </optgroup>
                                <optgroup label="Advanced & Uploads">
                                  <option value="file">ফাইল আপলোড / ছবি (File/Image Upload) 📁</option>
                                  <option value="address">পূর্ণ ঠিকানা (Full Address Panel)</option>
                                  <option value="signature">স্বাক্ষর স্পেস (Digital Signature)</option>
                                  <option value="rating">রেটিং স্টার (Rating Stars)</option>
                                  <option value="url">ওয়েবসাইট লিংক URL (Website Link)</option>
                                  <option value="color">কালার পিকার (Color Picker)</option>
                                </optgroup>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-semibold text-gray-500 block font-sans">সহায়ক লেখা (Placeholder Message)</label>
                              <input
                                type="text"
                                placeholder="ইনপুট বক্সের ভেতরে যে হালকা লেখা ভেসে থাকবে"
                                value={fieldPlaceholder}
                                onChange={e => setFieldPlaceholder(e.target.value)}
                                className="w-full border rounded px-3 py-1.5 text-xs font-sans"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-6">
                              <input
                                type="checkbox"
                                id="requiredFieldChk"
                                checked={fieldRequired}
                                onChange={e => setFieldRequired(e.target.checked)}
                                className="h-4 w-4 rounded text-primary text-xs cursor-pointer"
                              />
                              <label htmlFor="requiredFieldChk" className="font-semibold text-gray-700 select-none cursor-pointer font-sans text-xs">
                                অবশ্যই পূরণীয়? (Field is Required?)
                              </label>
                            </div>
                          </div>

                          {/* Dropdown/Radio/Checkbox Options field */}
                          {['dropdown', 'radio', 'checkbox'].includes(fieldType) && (
                            <div className="space-y-1">
                              <label className="font-semibold text-gray-500 text-teal-600 block font-sans pb-0.5">
                                চয়েস অপশন তালিকা (Comma-separated options) *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Option A, Option B, Option C, Option D"
                                value={fieldOptionsRaw}
                                onChange={e => setFieldOptionsRaw(e.target.value)}
                                className="w-full border rounded border-teal-200 focus:border-teal-400 px-3 py-1.5 bg-teal-50/10 font-sans text-xs"
                              />
                              <span className="text-[10px] text-teal-600 block leading-tight mt-1 font-sans">
                                মাঝে কমা ( , ) ব্যবহার করে একাধিক অপশনগুলো পর পর লিখুন। মডিউল এগুলোকে রূপান্তর করবে।
                              </span>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full bg-secondary hover:bg-secondary/90 text-gray-900 font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer font-sans text-xs"
                          >
                            <Plus className="h-4 w-4" />
                            <span>ডিজাইন ফর্মে এই ফিল্ড যোগ করুন (Apply & Add)</span>
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Drag & Drop Sorted Fields List */}
                    <div className="bg-white rounded-xl border border-gray-150 p-4 space-y-3">
                      <div className="flex justify-between items-center border-b pb-2.5">
                        <h4 className="font-extrabold text-gray-850 text-xs">রিয়েল-টাইম ফর্ম ফিল্ড ডিজাইন ও সাজানো</h4>
                        <button
                          type="button"
                          onClick={() => setIsAddFieldOpen(!isAddFieldOpen)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer transition"
                        >
                          {isAddFieldOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          <span>{isAddFieldOpen ? 'প্যানেল বন্ধ করুন' : 'নতুন ফিল্ড যোগ করুন'}</span>
                        </button>
                      </div>
                      
                      {sortedFields.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">ফর্মে এখনও কোনো ইনপুট ফিল্ড নেই। নতুন ফিল্ড যোগ করুন বোতামে ক্লিক করুন!</p>
                      ) : (
                        <div className="space-y-2.5">
                          {sortedFields.map((field, idx) => {
                            const isEditingOfThisField = editingFieldId === field.fieldId;
                            
                            return (
                              <div 
                                key={field.fieldId}
                                className="p-3.5 bg-gray-50 rounded-lg border border-gray-150 flex flex-col space-y-3 text-xs"
                              >
                                {isEditingOfThisField ? (
                                  /* Inline Edit Panel (REQUEST 1) */
                                  <div className="space-y-3 animate-fade-in bg-white p-3 rounded border border-indigo-200">
                                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                                      <strong className="text-indigo-700 text-xs font-bold font-sans">ফিল্ডের তথ্য সম্পাদন (Edit Field Properties)</strong>
                                      <span className="text-[10px] text-gray-400 font-mono">ID: {field.fieldId}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="font-bold text-gray-400 block text-[9.5px]">লেবেল নাম / শিরোনাম (Label) *</label>
                                        <input
                                          type="text"
                                          required
                                          value={editFieldLabel}
                                          onChange={e => setEditFieldLabel(e.target.value)}
                                          className="w-full border rounded px-2.5 py-1 text-xs font-sans"
                                        />
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <label className="font-bold text-gray-400 block text-[9.5px]">ইনপুট ধরণ (Type) *</label>
                                        <select
                                          value={editFieldType}
                                          onChange={e => setEditFieldType(e.target.value as any)}
                                          className="w-full border rounded px-2.5 py-1 text-xs bg-white font-sans"
                                        >
                                          <optgroup label="Basic Inputs">
                                            <option value="text">সাধারণ টেক্সট (Text Input)</option>
                                            <option value="textarea">দীর্ঘ বর্ণনা (Textarea)</option>
                                            <option value="number">সংখ্যা (Number)</option>
                                            <option value="email">ইমেইল (Email)</option>
                                            <option value="mobile">মোবাইল নম্বর (Mobile Phone)</option>
                                            <option value="password">পাসওয়ার্ড (Password)</option>
                                          </optgroup>
                                          <optgroup label="Selection Controls">
                                            <option value="dropdown">ড্রপডাউন লিস্ট (Dropdown Select)</option>
                                            <option value="radio">অপশন বাটন (Radio Buttons)</option>
                                            <option value="checkbox">চেকবক্স অপশন (Checkbox Items)</option>
                                          </optgroup>
                                          <optgroup label="Advanced & Uploads">
                                            <option value="file">ফাইল আপলোড / ছবি (File/Image Upload) 📁</option>
                                            <option value="address">পূর্ণ ঠিকানা (Full Address Panel)</option>
                                            <option value="signature">স্বাক্ষর স্পেস (Digital Signature)</option>
                                            <option value="rating">রেটিং স্টার (Rating Stars)</option>
                                            <option value="url">ওয়েবসাইট লিংক URL (Website Link)</option>
                                            <option value="color">কালার পিকার (Color Picker)</option>
                                          </optgroup>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                      <div className="space-y-1">
                                        <label className="font-bold text-gray-400 block text-[9.5px]">সহায়ক মেসেজ (Placeholder)</label>
                                        <input
                                          type="text"
                                          value={editFieldPlaceholder}
                                          onChange={e => setEditFieldPlaceholder(e.target.value)}
                                          className="w-full border rounded px-2.5 py-1 text-xs font-sans"
                                        />
                                      </div>

                                      <div className="flex items-center space-x-1.5 pt-5">
                                        <input
                                          type="checkbox"
                                          id={`editReqCh_${field.fieldId}`}
                                          checked={editFieldRequired}
                                          onChange={e => setEditFieldRequired(e.target.checked)}
                                          className="h-4 w-4 text-primary rounded cursor-pointer animate-fade-in"
                                        />
                                        <label htmlFor={`editReqCh_${field.fieldId}`} className="font-bold text-gray-700 select-none cursor-pointer font-sans text-xs">
                                          অবশ্যই পূরণীয়? (Required)
                                        </label>
                                      </div>
                                    </div>

                                    {['dropdown', 'radio', 'checkbox'].includes(editFieldType) && (
                                      <div className="space-y-1 animate-slide-up bg-teal-50/20 p-2 border border-teal-100 rounded">
                                        <label className="font-bold text-teal-700 block text-[9.5px] font-sans">চয়েস অপশন তালিকা (Comma-separated choices) *</label>
                                        <input
                                          type="text"
                                          required
                                          value={editFieldOptionsRaw}
                                          onChange={e => setEditFieldOptionsRaw(e.target.value)}
                                          className="w-full border rounded p-1 text-xs font-sans"
                                          placeholder="Option A, Option B, Option C"
                                        />
                                      </div>
                                    )}

                                    <div className="flex justify-end space-x-1.5 pt-2 border-t font-sans">
                                      <button
                                        type="button"
                                        onClick={handleEditFieldCancel}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold cursor-pointer transition"
                                      >
                                        বাতিল (Cancel)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleEditFieldSave(field.fieldId)}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold flex items-center space-x-0.5 cursor-pointer transition"
                                      >
                                        <Save className="h-3 w-3" />
                                        <span>সংরক্ষণ করুন (Apply)</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Static Row View */
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-mono text-gray-400 font-bold bg-gray-250/50 h-6 w-6 rounded-lg flex items-center justify-center border text-[10px]">
                                        {idx + 1}
                                      </span>
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <strong className="text-gray-800 font-bold font-sans text-xs">{field.label}</strong>
                                          {field.required && <span className="text-red-500 font-bold">*</span>}
                                        </div>
                                        <span className="font-mono text-[9.5px] text-gray-400 capitalize bg-white border px-1.5 py-0.2 rounded mt-1 block w-fit shadow-3xs">
                                          Type: {field.fieldType}
                                        </span>
                                        {field.options && field.options.length > 0 && (
                                          <span className="text-[9.5px] text-indigo-600 block mt-1 font-sans">Options: {field.options.join(', ')}</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                      {/* Order Shifting Buttons */}
                                      <button
                                        onClick={() => handleShiftFieldOrder(field, 'up')}
                                        disabled={idx === 0}
                                        className="p-1 hover:bg-gray-200 text-gray-400 rounded disabled:opacity-40 transition cursor-pointer"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleShiftFieldOrder(field, 'down')}
                                        disabled={idx === sortedFields.length - 1}
                                        className="p-1 hover:bg-gray-200 text-gray-400 rounded disabled:opacity-40 transition cursor-pointer"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </button>

                                      {/* Field Operations */}
                                      <button
                                        onClick={() => handleEditFieldStart(field)}
                                        className="p-1 hover:bg-gray-200 text-indigo-600 rounded cursor-pointer transition"
                                        title="Edit Field Properties"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleCloneField(field)}
                                        className="p-1 hover:bg-gray-200 text-gray-600 rounded cursor-pointer transition"
                                        title="Clone Field"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteField(field.fieldId)}
                                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer transition"
                                        title="Delete Field"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>



                  </div>
                );
              })()
            )}
          </div>

        </div>
      )}


      {/* 7. DYNAMIC SUBMISSIONS TRACKING PANEL */}
      {/* ========================================================================================= */}
      {activeSubTab === 'form_submissions' && (
        <div id="admin-form-submissions-panel" className="space-y-6">
          
          {/* TOP SELECTOR & SEARCH BAR */}
          <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="space-y-1">
                <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase rounded px-2 py-0.5">রেসপন্স মনিটর</span>
                <h3 className="font-bold text-gray-800 text-sm">ডায়নামিক ফর্ম সাবমিশন ম্যানেজার</h3>
              </div>
              
              {selectedSubmissionsFormId && (
                <button
                  onClick={() => setExportPreviewFormId(selectedSubmissionsFormId)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 px-3.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer self-stretch md:self-auto justify-center"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>এক্সেল/CSV ডাটা ডাউনলোড (Export CSV)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-gray-500">ফর্ম বেছে নিন (Select Form)</label>
                <select
                  value={selectedSubmissionsFormId}
                  onChange={e => setSelectedSubmissionsFormId(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-xs bg-gray-50"
                >
                  <option value="">-- ফর্ম নির্বাচন করুন --</option>
                  {customForms.map(f => (
                    <option key={f.formId} value={f.formId}>{f.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-xs md:col-span-2">
                <label className="font-semibold text-gray-500">আবেদনকারী বা টেক্সট খুজুন (Search query)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ইউজার নাম, ইমেইল বা ডাটা কিওয়ার্ড লিখে সার্চ দিন..."
                    disabled={!selectedSubmissionsFormId}
                    value={subSearchQuery}
                    onChange={e => setSubSearchQuery(e.target.value)}
                    className="w-full border rounded px-3 py-1.5 text-xs pl-8 disabled:bg-gray-100 placeholder:text-gray-400"
                  />
                  <Users className="h-4 w-4 text-gray-400 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>
          </div>

          {/* RESPONSES DIRECTORY */}
          {!selectedSubmissionsFormId ? (
            <div className="bg-white rounded-xl border border-gray-150 p-12 text-center shadow-sm">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">কোন ফর্ম সিলেক্ট করা হয়নি</p>
              <span className="text-xs text-gray-400">ড্রপডাউন লিস্ট থেকে কাস্টম ফর্ম চুজ করে সাবমিশন ট্র্যাকার লোড করুন।</span>
            </div>
          ) : (
            (() => {
              const matchedForm = customForms.find(f => f.formId === selectedSubmissionsFormId);
              const fields = [...customFields]
                .filter(f => f.formId === selectedSubmissionsFormId)
                .sort((a,b) => a.sortOrder - b.sortOrder);
                
              const rawSubs = customSubmissions.filter(s => s.formId === selectedSubmissionsFormId);
              
              // Filter logic
              const filteredSubs = rawSubs.filter(sub => {
                if (!subSearchQuery.trim()) return true;
                const query = subSearchQuery.toLowerCase();
                const matchUser = (sub.userName || '').toLowerCase().includes(query) || (sub.userEmail || '').toLowerCase().includes(query);
                const matchData = Object.values(sub.data || {}).some(val => String(val).toLowerCase().includes(query));
                return matchUser || matchData;
              });

              return (
                <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center text-xs text-gray-500">
                    <div>
                      <span>ফর্ম: <strong className="text-gray-900 font-bold">{matchedForm?.title}</strong></span>
                    </div>
                    <div>
                      <span>রেকর্ডস: <strong className="text-gray-900 font-bold">{filteredSubs.length} / {rawSubs.length}</strong> টি</span>
                    </div>
                  </div>

                  {filteredSubs.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      কোন রেসপন্স ডাটা পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-150 text-gray-600 font-bold">
                            <th className="p-3.5 pl-4">আবেদনকারী</th>
                            <th className="p-3.5">তারিখ ও সময়</th>
                            <th className="p-3.5">স্ট্যাটাস</th>
                            {fields.slice(0, 3).map(f => (
                              <th key={f.fieldId} className="p-3.5 truncate max-w-[150px]">{f.label}</th>
                            ))}
                            {fields.length > 3 && <th className="p-3.5 text-gray-400">...)</th>}
                            <th className="p-3.5 text-right pr-4">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredSubs.map((sub) => (
                            <tr key={sub.submissionId} className="hover:bg-gray-50">
                              <td className="p-3.5 pl-4 leading-tight">
                                <strong className="text-gray-900 block">{sub.userName || 'Guest User'}</strong>
                                <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{sub.userEmail || 'Anonymous'}</span>
                              </td>
                              <td className="p-3.5 text-[10px] text-gray-400 font-mono">
                                {new Date(sub.submittedAt).toLocaleString()}
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                  {sub.status || 'Pending'}
                                </span>
                              </td>
                              {fields.slice(0, 3).map(f => {
                                const val = sub.data[f.fieldId];
                                const displayVal = val === undefined || val === null ? '-' : Array.isArray(val) ? val.join(', ') : String(val);
                                return (
                                  <td key={f.fieldId} className="p-3.5 text-gray-600 truncate max-w-[150px]" title={String(displayVal)}>
                                    {displayVal}
                                  </td>
                                );
                              })}
                              {fields.length > 3 && <td className="p-3.5 text-gray-400 font-mono text-[10px]">+{fields.length - 3} tabs</td>}
                              <td className="p-3.1 text-right pr-4 shrink-0">
                                <div className="inline-flex items-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedSubmission(sub)}
                                    className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold transition"
                                  >
                                    ডিটেইলস
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubmission(sub.submissionId)}
                                    className="p-1 hover:bg-red-100 text-red-500 rounded"
                                    title="Delete Submission"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })()
          )}

          {/* RESPONSE DETAIL MODAL */}
          <AnimatePresence>
            {selectedSubmission && (
              <div id="submission-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedSubmission(null)}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                />
                
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-white rounded-2xl w-full max-w-2xl border p-6 md:p-8 shadow-2xl relative overflow-hidden"
                >
                  {/* Modal Content */}
                  <div className="flex justify-between items-start pb-4 border-b border-gray-150">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm">
                        {selectedSubmission.userName || 'Guest User'} এর আবেদনপত্র
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {selectedSubmission.submissionId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold text-xs"
                    >
                      X
                    </button>
                  </div>

                  {/* Submission Specific Info Container */}
                  <div className="py-4 overflow-y-auto max-h-[60vh] space-y-4 text-xs font-sans">
                    {/* Basic Submitter Details */}
                    <div className="bg-gray-50/80 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-100">
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">আবেদনকারীর নাম</span>
                        <span className="font-bold text-gray-800">{selectedSubmission.userName || 'Guest User'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">ইমেইল এড্রেস</span>
                        <span className="font-bold text-gray-800">{selectedSubmission.userEmail || 'Anonymous'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">জমাদানের সময়</span>
                        <span className="font-medium text-gray-750">{new Date(selectedSubmission.submittedAt).toLocaleString('bn-BD') || selectedSubmission.submittedAt}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">ফর্ম স্ল্যাগ / আইডি</span>
                        <span className="font-mono text-gray-700">/{customForms.find(f => f.formId === selectedSubmission.formId)?.slug || selectedSubmission.formId}</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded px-3 py-1.5 col-span-full">
                        <span className="text-emerald-700 font-semibold block text-[10px] uppercase font-mono">নিধারিত Amount</span>
                        <span className="font-black text-emerald-900 text-sm">{selectedSubmission.data?.amount ? `${selectedSubmission.data.amount} ৳` : '0 ৳'}</span>
                      </div>
                    </div>

                    {/* Dynamic Fields rendering */}
                    <div className="space-y-3 pt-1 text-left">
                      <h4 className="font-bold text-gray-800 text-xs border-b pb-1.5 font-sans">
                        জমাকৃত বিবরণী তথ্যতালিকা (Submitted Data Response)
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {customFields
                          .filter(f => f.formId === selectedSubmission.formId)
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((f) => {
                            const val = selectedSubmission.data[f.fieldId];
                            const isNull = val === undefined || val === null || val === '';
                            
                            return (
                              <div key={f.fieldId} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/30 space-y-1">
                                <label className="font-bold text-gray-500 text-[10px] block font-sans">{f.label}</label>
                                <div className="text-gray-800 font-medium text-xs break-words">
                                  {isNull ? (
                                    <span className="text-gray-350 italic">ফাঁকা (No Input)</span>
                                  ) : f.fieldType === 'file' && String(val).startsWith('data:image') ? (
                                    <div className="relative group max-w-full mt-1">
                                      <img 
                                        src={String(val)} 
                                        alt={f.label} 
                                        className="rounded border border-gray-200 max-h-36 max-w-full object-contain cursor-zoom-in"
                                        onClick={() => {
                                          const w = window.open();
                                          if (w) w.document.write(`<img src="${val}" style="max-width:100%"/>`);
                                        }}
                                      />
                                      <span className="text-[9px] text-gray-400 block mt-1 font-mono">পূর্ণ সাইজ দেখতে ছবিতে ক্লিক করুন</span>
                                    </div>
                                  ) : f.fieldType === 'signature' && String(val).startsWith('data:image') ? (
                                    <div className="mt-1 inline-block bg-gray-50 border p-1 rounded">
                                      <img src={String(val)} alt="digital signature" className="h-8 object-contain" />
                                    </div>
                                  ) : f.fieldType === 'color' ? (
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="h-4 w-8 rounded border border-gray-300 shadow-xs inline-block" style={{ backgroundColor: String(val) }} />
                                      <span className="font-mono text-[11px]">{String(val)}</span>
                                    </div>
                                  ) : f.fieldType === 'rating' ? (
                                    <div className="flex text-amber-400 text-xs mt-0.5">
                                      {'★'.repeat(Number(val))}
                                      {'☆'.repeat(5 - Number(val))}
                                    </div>
                                  ) : Array.isArray(val) ? (
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">{val.join(', ')}</span>
                                  ) : (
                                    <p className="whitespace-pre-wrap leading-relaxed">{String(val)}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                        {selectedSubmission.data?.paymentGateway && (
                          <div className="border border-indigo-150 rounded-lg p-3 bg-indigo-50/20 col-span-full space-y-1 text-left">
                            <label className="font-extrabold text-indigo-900 text-[10px] block font-sans tracking-wide uppercase">পেমেন্ট গেটওয়ে (Selected Gateway)</label>
                            <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded text-[11px] inline-block font-sans">
                              {selectedSubmission.data.paymentGateway}
                            </span>
                            {selectedSubmission.data?.amount && (
                              <div className="mt-1 font-extrabold text-indigo-900 text-xs">
                                নিধারিত Amount: {selectedSubmission.data.amount} ৳
                              </div>
                            )}
                          </div>
                        )}

                        {selectedSubmission.data?.paymentTrxId && (
                          <div className="border border-amber-150 rounded-lg p-3 bg-amber-50/20 col-span-full space-y-1 text-left">
                            <label className="font-extrabold text-amber-900 text-[10px] block font-sans tracking-wide uppercase">ট্রানজেকশন আইডি (Transaction ID / TrxID)</label>
                            <span className="bg-amber-600 text-white font-mono font-bold px-3 py-1 rounded text-xs inline-block">
                              {selectedSubmission.data.paymentTrxId}
                            </span>
                          </div>
                        )}

                        {selectedSubmission.data?.paymentScreenshot && (
                          <div className="border border-emerald-150 rounded-lg p-3 bg-emerald-50/20 col-span-full space-y-2 text-left">
                            <label className="font-extrabold text-emerald-900 text-[10px] block font-sans tracking-wide uppercase">পেমেন্ট সফলতার স্ক্রিনশট (Uploaded Screenshot)</label>
                            <div className="relative group max-w-full">
                              <img 
                                src={selectedSubmission.data.paymentScreenshot} 
                                alt="Payment Screenshot" 
                                className="rounded border border-gray-200 max-h-56 max-w-full object-contain cursor-zoom-in"
                                onClick={() => {
                                  const w = window.open();
                                  if (w) w.document.write(`<img src="${selectedSubmission.data.paymentScreenshot}" style="max-width:100%"/>`);
                                }}
                              />
                              <span className="text-[10px] text-gray-400 block mt-1 font-mono">পূর্ণ সাইজ দেখতে ছবিতে ক্লিক করুন</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-150 flex justify-end space-x-3 text-xs">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 border hover:bg-gray-50 rounded-lg font-bold"
                    >
                      প্রিন্ট করুন (Print)
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold"
                    >
                      বন্ধ করুন (Close)
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* CSV EXPORT PREVIEW MODAL */}
      <AnimatePresence>
        {exportPreviewFormId && (() => {
          const targetForm = customForms.find(f => f.formId === exportPreviewFormId);
          if (!targetForm) return null;

          const fields = [...customFields]
            .filter(f => f.formId === exportPreviewFormId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          
          const subs = customSubmissions.filter(s => s.formId === exportPreviewFormId);

          return (
            <div id="csv-export-preview-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExportPreviewFormId(null)}
                className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs"
              />
              
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-2xl w-full max-w-5xl border p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b border-gray-150 shrink-0">
                  <div>
                    <span className="text-[9.5px] bg-green-50 text-green-700 font-bold uppercase rounded px-2.5 py-1">এক্সেল ও CSV ডাটা এক্সপোর্ট</span>
                    <h3 className="font-extrabold text-gray-900 text-base mt-1.5 flex items-center space-x-1.5">
                      <ClipboardList className="h-4 w-4 text-green-600" />
                      <span>{targetForm.title} - জমাকৃত ডাটা টেবিল</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      মোট <strong className="text-gray-800">{subs.length}</strong> টি রেসপন্স এবং <strong className="text-gray-800">{fields.length + 3}</strong> টি ডাটা কলাম পাওয়া গেছে।
                    </p>
                  </div>
                  <button
                    onClick={() => setExportPreviewFormId(null)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs cursor-pointer transition"
                  >
                    X
                  </button>
                </div>

                {/* Table View Area container */}
                <div className="py-4 my-2 overflow-auto flex-1 border border-gray-100 rounded-xl bg-gray-50/20 text-xs font-sans">
                  {subs.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      কোন তথ্য বা রেসপন্স জমা পড়েনি।
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-155 text-gray-700 font-bold">
                          <th className="p-3">জমাদানের সময়</th>
                          <th className="p-3">ইউজার নাম</th>
                          <th className="p-3">ইমেইল</th>
                          {fields.map(f => (
                            <th key={f.fieldId} className="p-3 whitespace-nowrap">{f.label}</th>
                          ))}
                          <th className="p-3 whitespace-nowrap text-indigo-805">পেমেন্ট গেটওয়ে</th>
                          <th className="p-3 whitespace-nowrap text-amber-805">ট্রানজেকশন আইডি</th>
                          <th className="p-3 whitespace-nowrap text-emerald-805">পেমেন্ট স্ক্রিনশট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subs.map((sub) => (
                          <tr key={sub.submissionId} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition">
                            <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                              {new Date(sub.submittedAt).toLocaleString('bn-BD')}
                            </td>
                            <td className="p-3 font-bold text-gray-800 whitespace-nowrap">{sub.userName || 'Guest User'}</td>
                            <td className="p-3 text-gray-500 font-mono text-[11px]">{sub.userEmail || 'N/A'}</td>
                            {fields.map(f => {
                              const val = sub.data[f.fieldId];
                              const isNull = val === undefined || val === null || val === '';
                              return (
                                <td key={f.fieldId} className="p-3 text-gray-750 max-w-[200px] truncate">
                                  {isNull ? (
                                    <span className="text-gray-300 italic">N/A</span>
                                  ) : f.fieldType === 'file' || f.fieldType === 'signature' ? (
                                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-mono">Image/File Attached</span>
                                  ) : Array.isArray(val) ? (
                                    val.join(', ')
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              );
                            })}
                            <td className="p-3 text-xs font-semibold text-indigo-700 whitespace-nowrap">
                              {sub.data?.paymentGateway || <span className="text-gray-300">-</span>}
                            </td>
                            <td className="p-3 text-xs font-mono font-semibold text-amber-700 whitespace-nowrap">
                              {sub.data?.paymentTrxId || <span className="text-gray-300">-</span>}
                            </td>
                            <td className="p-3 text-xs text-emerald-700 whitespace-nowrap">
                              {sub.data?.paymentScreenshot ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">✓ Screenshot</span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-gray-150 flex justify-end space-x-3 text-xs shrink-0 bg-white">
                  <button
                    onClick={() => setExportPreviewFormId(null)}
                    className="px-4 py-2 border hover:bg-gray-50 rounded-lg font-bold transition cursor-pointer"
                  >
                    বন্ধ করুন (Close)
                  </button>
                  <button
                    onClick={() => {
                      handleExportSubmissionsCSV(exportPreviewFormId);
                      setExportPreviewFormId(null);
                    }}
                    disabled={subs.length === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-bold flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>এক্সেল/CSV ডাউনলোড করুন (Download CSV)</span>
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ========================================================================================= */}
      {/* FORM VISIBILITY AND SUMMARY PANEL */}
      {/* ========================================================================================= */}
      {activeSubTab === 'form_visibility' && (
        <div id="admin-form-visibility-panel" className="space-y-6 animate-fade-in font-sans text-xs">
          {/* Header Description */}
          <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1 text-left flex-1">
              <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase rounded px-2.5 py-1 inline-block">কনফিগারেশন কন্ট্রোল</span>
              <h3 className="font-extrabold text-gray-900 text-lg">ফর্ম ভিজিবিলিটি এবং সার্বিক সামারি</h3>
              <p className="text-gray-500 text-xs mt-1">সবগুলো কাস্টম ডায়নামিক ফর্মের ভিজিবিলিটি স্ট্যাটাস, সাবমিশন কাউন্টার এবং "রেজিস্ট্রেশন করুন (Register Now)" ড্যাশবোর্ড উইজেট কন্ট্রোল করতে পারবেন।</p>
            </div>

            {/* Active Register Form Summary Widget */}
            {customForms.find(f => f.registerNowActive) && (
              <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200 flex items-center gap-4 min-w-[280px]">
                <div className="bg-white/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">Active Register Form</span>
                  <h4 className="font-bold text-sm truncate max-w-[180px]">{customForms.find(f => f.registerNowActive)?.title}</h4>
                  <div className="flex gap-3 mt-1 text-[10px] font-mono">
                    <span>Total: <span className="font-black">{customSubmissions.filter(s => s.formId === customForms.find(f => f.registerNowActive)?.formId).length}</span></span>
                    <span>Approved: <span className="font-black">{customSubmissions.filter(s => s.formId === customForms.find(f => f.registerNowActive)?.formId && s.status === 'approved').length}</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Forms Summary and Toggles List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customForms.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-150 p-12 text-center text-gray-400 space-y-3 shadow-xs">
                <Sliders className="h-10 w-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">কোন ডায়নামিক ফর্ম এখনো তৈরি করা হয়নি।</p>
                <button
                  onClick={() => setActiveSubTab('form_builder')}
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  প্রথম ফর্ম তৈরি করুন (Create First Form)
                </button>
              </div>
            ) : (
              customForms.map((form) => {
                const totalSubmissions = customSubmissions.filter(s => s.formId === form.formId).length;
                const isFormActive = form.status === 'active';
                const isRegisterActive = !!form.registerNowActive;

                return (
                  <div 
                    key={form.formId} 
                    className="bg-white rounded-xl border border-gray-150 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group"
                  >
                    {/* Visual Decor Element */}
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 bg-primary/5 rounded-full transform group-hover:scale-110 transition-transform duration-300" />
                    
                    <div className="space-y-3 z-10 text-left">
                      {/* Form Metadata Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-extrabold text-gray-900 text-sm tracking-tight leading-short mt-0.5">
                            {form.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                            {form.description || 'কোন বিবরণ উল্লেখ করা হয়নি।'}
                          </p>
                        </div>
                        
                        {/* Dynamic Counter Badging */}
                        <div className="bg-indigo-50 border border-indigo-100 text-center rounded-xl p-3 shrink-0 shadow-xs">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block font-mono">জমাকৃত রেসপন্স</span>
                          <span className="text-xl font-black text-indigo-700 block font-mono mt-0.5">{totalSubmissions}</span>
                        </div>
                      </div>

                      {/* Display Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isFormActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isFormActive ? '🟢 সক্রিয় (Active)' : '🔴 নিষ্ক্রিয় (Inactive)'}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isRegisterActive ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isRegisterActive ? '⭐ Register Now লিংকে যুক্ত' : 'সাধারণ ফর্ম'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-150">
                          🛡️ অনুমতি: {
                            form.permission === 'public' 
                              ? 'সকলের জন্য উন্মুক্ত (Public)' 
                              : form.permission === 'login_required' 
                                ? 'লগইন আবশ্যক (Login Required)' 
                                : `ব্যাচ নির্দিষ্ট (${form.restrictedBatch || 'N/A'})`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Interactive Toggles & Controls Panel */}
                    <div className="border-t border-gray-150 pt-4 space-y-3 text-left">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 p-2.5 rounded-lg border">
                        
                        {/* 1. Form General Active/Inactive Status Toggle */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleFormStatus(form.formId, form.status)}
                            className={`p-1 w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                              isFormActive ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              isFormActive ? 'transform translate-x-5' : ''
                            }`} />
                          </button>
                          <span className="font-semibold text-gray-700 text-[11px]">পাবলিক অ্যাক্সেস উইজেট</span>
                        </div>

                        {/* 2. Register Now integration Switch Toggle */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleRegisterNowActive(form.formId, isRegisterActive)}
                            className={`p-1 w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                              isRegisterActive ? 'bg-amber-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              isRegisterActive ? 'transform translate-x-5' : ''
                            }`} />
                          </button>
                          <span className="font-semibold text-gray-700 text-[11px]">
                            রেজিস্ট্রেশন করুন (Register Now) Visibility
                          </span>
                        </div>

                      </div>

                      {/* 3. Access Permission Settings Update Inline */}
                      <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-blue-900 text-[10.5px] uppercase tracking-wider flex items-center space-x-1">
                            <span>🛡️ অনুমতি ও ব্যাচ সেটিং (Access Control)</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">Auto-saved</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex-1">
                            <select
                              value={form.permission || 'public'}
                              onChange={async (e) => {
                                const newPerm = e.target.value;
                                try {
                                  await updateDoc(doc(db, 'forms', form.formId), { 
                                    permission: newPerm 
                                  });
                                } catch (err) {
                                  console.error(err);
                                  Swal.fire({
                                    icon: 'error',
                                    title: 'ত্রুটি!',
                                    text: 'পারমিশন আপডেট করতে ব্যর্থ হয়েছে।',
                                  });
                                }
                              }}
                              className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                            >
                              <option value="public">সকলের জন্য উন্মুক্ত (Public)</option>
                              <option value="login_required">লগইন আবশ্যক (Login Required)</option>
                              <option value="batch_restricted">ব্যাচ নির্দিষ্ট (Batch Restricted)</option>
                            </select>
                          </div>

                          {(form.permission === 'batch_restricted') && (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                placeholder="ব্যাচ দিন (উদাঃ ১৯৯৮)"
                                defaultValue={form.restrictedBatch || ''}
                                onBlur={async (e) => {
                                  const val = e.target.value.trim();
                                  try {
                                    await updateDoc(doc(db, 'forms', form.formId), { 
                                      restrictedBatch: val 
                                    });
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    try {
                                      await updateDoc(doc(db, 'forms', form.formId), { 
                                        restrictedBatch: val 
                                      });
                                      Swal.fire({
                                        icon: 'success',
                                        title: 'সফল!',
                                        text: 'ব্যাচ সফলভাবে আপডেট করা হয়েছে!',
                                        timer: 1000,
                                        showConfirmButton: false
                                      });
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                                className="bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 font-bold focus:outline-none focus:ring-1 focus:ring-blue-400 w-full font-mono text-center"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  // Find internal input element in previous sibling
                                  const container = e.currentTarget.previousSibling as HTMLInputElement;
                                  if (container) {
                                    const val = container.value.trim();
                                    updateDoc(doc(db, 'forms', form.formId), { 
                                      restrictedBatch: val 
                                    }).then(() => {
                                      Swal.fire({
                                        icon: 'success',
                                        title: 'সফল!',
                                        text: 'ব্যাচ সফলভাবে আপডেট করা হয়েছে!',
                                        timer: 1000,
                                        showConfirmButton: false
                                      });
                                    }).catch(console.error);
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 text-[11px] rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                              >
                                সেট করুন
                              </button>
                            </div>
                          )}
                        </div>
                        {form.permission === 'batch_restricted' && (
                          <p className="text-[9.5px] text-blue-600 font-semibold leading-relaxed">
                            * শুধুমাত্র ব্যাচটি নির্দিষ্ট করতে পাশে ব্যাচ বসিয়ে 'সেট করুন' চাপুন।
                          </p>
                        )}
                      </div>

                      {/* Redirect actions shortcuts */}
                      <div className="flex flex-wrap justify-between items-center pt-1 gap-2">
                        <button
                          onClick={() => {
                            setSelectedBuilderFormId(form.formId);
                            setActiveSubTab('form_builder');
                          }}
                          className="flex items-center space-x-1 text-primary hover:text-primary-dark font-bold font-sans cursor-pointer py-1 px-2 hover:bg-primary/5 rounded whitespace-nowrap"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>ডিজাইন এডিট</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSubmissionsFormId(form.formId);
                            setActiveSubTab('form_submissions');
                          }}
                          className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold font-sans cursor-pointer py-1 px-2 hover:bg-indigo-50 rounded whitespace-nowrap"
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          <span>রেসপন্স ডাটা দেখুন</span>
                        </button>

                        <button
                          onClick={() => {
                            setExportPreviewFormId(form.formId);
                          }}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-800 font-bold font-sans cursor-pointer py-1 px-2 hover:bg-green-50 rounded whitespace-nowrap"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>এক্সপোর্ট (Export)</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

          {/* 8. FORM DASHBOARD PANEL */}
      {/* ========================================================================================= */}
      {activeSubTab === 'form_dashboard' && (
        <div id="admin-form-dashboard-panel" className="space-y-6">
          <FormDashboard 
            forms={customForms}
            fields={customFields}
            submissions={customSubmissions}
          />
        </div>
      )}

      {/* 8. COMMITTEE DIRECTORY MANAGEMENT PANEL */}
      {/* ========================================================================================= */}
      {activeSubTab === 'committee' && (
        <div id="admin-committee-panel" className="space-y-6">
          
          {/* HEADER & SEARCH */}
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase rounded px-2 py-0.5">Directory Manager</span>
                <h3 className="font-extrabold text-gray-900 text-base">কমিটি মেম্বার ডিরেক্টরি ম্যানেজার</h3>
              </div>
              
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <input
                    type="text"
                    placeholder="নাম বা পদবী দিয়ে খুঁজুন..."
                    value={commSearchQuery}
                    onChange={e => setCommSearchQuery(e.target.value)}
                    className="w-full md:w-64 border rounded-lg px-3 py-1.5 text-xs pl-8 font-sans"
                  />
                  <Users className="h-4 w-4 text-gray-400 absolute left-2.5 top-2" />
                </div>
                <button
                  onClick={() => setIsCommModalOpen(true)}
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-primary/20 cursor-pointer flex-shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>নতুন সদস্য যুক্ত করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* COMMITTEE LIST */}
          <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase tracking-wider font-sans">
              <span>সক্রিয় সদস্য তালিকা (Committee Roster)</span>
              <span>মোট: {committee.length} জন</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-gray-150 text-gray-500 font-sans font-bold">
                    <th className="p-1 pl-3">সদস্যের তথ্য</th>
                    <th className="p-4">পদবী (Designation)</th>
                    <th className="p-4">মন্তব্য (Remark)</th>
                    <th className="p-4 text-right pr-6">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {committee
                    .filter(m => {
                      if (!commSearchQuery.trim()) return true;
                      const q = commSearchQuery.toLowerCase();
                      return m.name.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q);
                    })
                    .map((item) => (
                      <tr key={item.memberId} className="hover:bg-gray-50/50 transition">
                        <td className="p-1 pl-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 border overflow-hidden flex-shrink-0">
                              {item.photo ? (
                                <img src={item.photo} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <Users className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                                <span className="text-gray-900 font-extrabold text-[13px] block">{item.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {item.memberId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-[11px] border border-indigo-100/50 inline-block">
                             {item.designation}
                          </span>
                        </td>
                        <td className="p-4">
                           <span className="text-gray-500 font-sans italic text-[11px]">
                             {item.remark || '---'}
                           </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                                onClick={() => handleEditCommitteeStart(item)}
                                className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition cursor-pointer"
                                title="Edit Member"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCommittee(item.memberId)}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer"
                                title="Remove Member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {committee.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400 font-sans italic">
                        কোন কমিটি সদস্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMMITTEE ADD/EDIT MODAL */}
      {isCommModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="bg-primary p-6 text-white relative">
              <button 
                onClick={handleCancelCommitteeEdit}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Award className="h-6 w-6" />
                <span>{editingCommMemberId ? 'সদস্যের তথ্য আপডেট করুন' : 'নতুন সদস্য যুক্ত করুন'}</span>
              </h2>
              <p className="text-white/70 text-xs mt-1">কমিটি ডিরেক্টরি ম্যানেজমেন্ট প্যানেল</p>
            </div>

            <form onSubmit={handleAddOrEditCommittee} className="p-6 space-y-5 capitalize-none">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase font-sans flex items-center space-x-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>পূর্ণ নাম (Member Full Name)</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={e => setNewCommName(e.target.value)}
                  placeholder="যেমন: মোঃ আব্দুল করিম"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase font-sans flex items-center space-x-1.5">
                  <Award className="h-3.5 w-3.5" />
                  <span>পদবী (Member Designation)</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCommDesignation}
                  onChange={e => setNewCommDesignation(e.target.value)}
                  placeholder="যেমন: আহ্বায়ক / যুগ্ম আহ্বায়ক"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase font-sans flex items-center space-x-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-gray-500" />
                  <span>মন্তব্য (Remark)</span>
                </label>
                <textarea
                  value={newCommRemark}
                  onChange={e => setNewCommRemark(e.target.value)}
                  placeholder="সদস্য সম্পর্কে অতিরিক্ত তথ্য (ঐচ্ছিক)"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase font-sans flex items-center space-x-1.5">
                  <Image className="h-3.5 w-3.5" />
                  <span>সদস্যের ছবি (Profile Photo)</span>
                </label>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="h-16 w-16 rounded-full bg-white border-2 border-primary/10 overflow-hidden flex-shrink-0 shadow-sm relative group">
                    {newCommPhoto ? (
                      <>
                        <img src={newCommPhoto} alt="Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewCommPhoto('')}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <UserIcon className="h-6 w-6" />
                      </div>
                    )}
                    {isCommPhotoUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <label className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-sm">
                      <PlusCircle className="h-3.5 w-3.5 text-primary" />
                      <span>{newCommPhoto ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleCommPhotoUpload}
                        disabled={isCommPhotoUploading}
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 font-sans">সমর্থিত ফরম্যাট: JPG, PNG, WEBP (সর্বোচ্চ ২ মেগাবাইট)</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-sans">অথবা ছবির সরাসরি লিংক (Direct Image URL)</label>
                  <input
                    type="text"
                    value={newCommPhoto.startsWith('data:') ? '' : newCommPhoto}
                    onChange={e => setNewCommPhoto(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancelCommitteeEdit}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 text-white rounded-xl text-sm font-bold transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                    editingCommMemberId ? 'bg-amber-600 shadow-amber-200' : 'bg-primary shadow-primary/20'
                  }`}
                >
                  {editingCommMemberId ? <Edit2 className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  <span>{editingCommMemberId ? 'আপডেট করুন' : 'সদস্য যুক্ত করুন'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* IMAGE CROP MODAL */}
      {isCropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]"
          >
            <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Edit2 className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">ছবি ক্রপ করুন (Crop Image)</h3>
              </div>
              <button 
                onClick={() => { setIsCropModalOpen(false); setImageToCrop(null); }}
                className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex-grow bg-gray-100">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 bg-white border-t space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>জুম ইন/আউট (Zoom)</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsCropModalOpen(false); setImageToCrop(null); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveCroppedImage}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>ক্রপ সম্পন্ন করুন (Save)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin Popup Modals */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-gray-905/65 backdrop-blur-md flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-lg w-full p-6 shadow-2xl relative animate-scale-up space-y-4">
            <button 
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5 font-sans">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <span>নতুন কর্মসূচী যোগ করুন (Add Event Program)</span>
              </h3>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-650 block">ইভেন্টের শিরোনাম (Event Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ প্রাক্তনী মহাসম্মেলন ২০২৬ (Alumni Reunion)"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-650 block">তারিখ ও সময় (Event Date & Time) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ ২৫শে ডিসেম্বর, ২০২৬ সকাল ১০:০০ টা"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-650 block">অনুষ্ঠান স্থল (Location/Venue)</label>
                <input
                  type="text"
                  placeholder="School Campus Grounds"
                  value={newEventLoc}
                  onChange={e => setNewEventLoc(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-650 block">বিস্তারিত কর্মসূচী বিবরণ (Description)</label>
                <textarea
                  rows={4}
                  placeholder="অনুষ্ঠানের বিস্তারিত সময়সূচী ও রুটিন গাইডলাইন এখানে লিখুন..."
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer transition text-xs"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg cursor-pointer transition flex items-center space-x-1 font-sans text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>কর্মসূচী সংরক্ষণ করুন (Add Event)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div id="submission-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubmission(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-2xl border p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Modal Content */}
              <div className="flex justify-between items-start pb-4 border-b border-gray-150">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">
                    {selectedSubmission.userName || 'Guest User'} এর আবেদনপত্র
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {selectedSubmission.submissionId}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold text-xs"
                >
                  X
                </button>
              </div>

              {/* Submission Specific Info Container */}
              <div className="py-4 overflow-y-auto max-h-[60vh] space-y-4 text-xs font-sans">
                {/* Basic Submitter Details */}
                <div className="bg-gray-50/80 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-100">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">আবেদনকারীর নাম</span>
                    <span className="font-bold text-gray-800">{selectedSubmission.userName || 'Guest User'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">ইমেইল এড্রেস</span>
                    <span className="font-bold text-gray-800">{selectedSubmission.userEmail || 'Anonymous'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">জমাদানের সময়</span>
                    <span className="font-medium text-gray-750">{new Date(selectedSubmission.submittedAt).toLocaleString('bn-BD') || selectedSubmission.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase font-mono">ফর্ম স্ল্যাগ / আইডি</span>
                    <span className="font-mono text-gray-700">/{customForms.find(f => f.formId === selectedSubmission.formId)?.slug || selectedSubmission.formId}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded px-3 py-1.5 col-span-full">
                    <span className="text-emerald-700 font-semibold block text-[10px] uppercase font-mono">নিধারিত Amount</span>
                    <span className="font-black text-emerald-900 text-sm">{selectedSubmission.data?.amount ? `${selectedSubmission.data.amount} ৳` : '0 ৳'}</span>
                  </div>
                </div>

                {/* Dynamic Fields rendering */}
                <div className="space-y-3 pt-1 text-left">
                  <h4 className="font-bold text-gray-800 text-xs border-b pb-1.5 font-sans">
                    জমাকৃত বিবরণী তথ্যতালিকা (Submitted Data Response)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customFields
                      .filter(f => f.formId === selectedSubmission.formId)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((f) => {
                        const val = selectedSubmission.data[f.fieldId];
                        const isNull = val === undefined || val === null || val === '';
                        
                        return (
                          <div key={f.fieldId} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/30 space-y-1">
                            <label className="font-bold text-gray-500 text-[10px] block font-sans">{f.label}</label>
                            <div className="text-gray-800 font-medium text-xs break-words">
                              {isNull ? (
                                <span className="text-gray-350 italic">ফাঁকা (No Input)</span>
                              ) : f.fieldType === 'file' && String(val).startsWith('data:image') ? (
                                <div className="relative group max-w-full mt-1">
                                  <img 
                                    src={String(val)} 
                                    alt={f.label} 
                                    className="rounded border border-gray-200 max-h-36 max-w-full object-contain cursor-zoom-in"
                                    onClick={() => {
                                      const w = window.open();
                                      if (w) w.document.write(`<img src="${val}" style="max-width:100%"/>`);
                                    }}
                                  />
                                  <span className="text-[9px] text-gray-400 block mt-1 font-mono">পূর্ণ সাইজ দেখতে ছবিতে ক্লিক করুন</span>
                                </div>
                              ) : f.fieldType === 'signature' && String(val).startsWith('data:image') ? (
                                <div className="mt-1 inline-block bg-gray-50 border p-1 rounded">
                                  <img src={String(val)} alt="digital signature" className="h-8 object-contain" />
                                </div>
                              ) : f.fieldType === 'color' ? (
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="h-4 w-8 rounded border border-gray-300 shadow-xs inline-block" style={{ backgroundColor: String(val) }} />
                                  <span className="font-mono text-[11px]">{String(val)}</span>
                                </div>
                              ) : f.fieldType === 'rating' ? (
                                <div className="flex text-amber-400 text-xs mt-0.5">
                                  {'★'.repeat(Number(val))}
                                  {'☆'.repeat(5 - Number(val))}
                                </div>
                              ) : Array.isArray(val) ? (
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">{val.join(', ')}</span>
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed">{String(val)}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {selectedSubmission.data?.paymentGateway && (
                      <div className="border border-indigo-150 rounded-lg p-3 bg-indigo-50/20 col-span-full space-y-1 text-left">
                        <label className="font-extrabold text-indigo-900 text-[10px] block font-sans tracking-wide uppercase">পেমেন্ট গেটওয়ে (Selected Gateway)</label>
                        <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded text-[11px] inline-block font-sans">
                          {selectedSubmission.data.paymentGateway}
                        </span>
                        {selectedSubmission.data?.amount && (
                          <div className="mt-1 font-extrabold text-indigo-900 text-xs">
                            নিধারিত Amount: {selectedSubmission.data.amount} ৳
                          </div>
                        )}
                      </div>
                    )}

                    {selectedSubmission.data?.paymentTrxId && (
                      <div className="border border-amber-150 rounded-lg p-3 bg-amber-50/20 col-span-full space-y-1 text-left">
                        <label className="font-extrabold text-amber-900 text-[10px] block font-sans tracking-wide uppercase">ট্রানজেকশন আইডি (Transaction ID / TrxID)</label>
                        <span className="bg-amber-600 text-white font-mono font-bold px-3 py-1 rounded text-xs inline-block">
                          {selectedSubmission.data.paymentTrxId}
                        </span>
                      </div>
                    )}

                    {selectedSubmission.data?.paymentScreenshot && (
                      <div className="border border-emerald-150 rounded-lg p-3 bg-emerald-50/20 col-span-full space-y-2 text-left">
                        <label className="font-extrabold text-emerald-900 text-[10px] block font-sans tracking-wide uppercase">পেমেন্ট সফলতার স্ক্রিনশট (Uploaded Screenshot)</label>
                        <div className="relative group max-w-full">
                          <img 
                            src={selectedSubmission.data.paymentScreenshot} 
                            alt="Payment Screenshot" 
                            className="rounded border border-gray-200 max-h-56 max-w-full object-contain cursor-zoom-in"
                            onClick={() => {
                              const w = window.open();
                              if (w) w.document.write(`<img src="${selectedSubmission.data.paymentScreenshot}" style="max-width:100%"/>`);
                            }}
                          />
                          <span className="text-[10px] text-gray-400 block mt-1 font-mono">পূর্ণ সাইজ দেখতে ছবিতে ক্লিক করুন</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 flex justify-end space-x-3 text-xs">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border hover:bg-gray-50 rounded-lg font-bold"
                >
                  প্রিন্ট করুন (Print)
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-gray-905/65 backdrop-blur-md flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-lg w-full p-6 shadow-2xl relative animate-scale-up space-y-4">
            <button 
              type="button"
              onClick={() => setIsNoticeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-950 text-sm flex items-center space-x-1.5 font-sans">
                <Bell className="h-5 w-5 text-primary shrink-0" />
                <span>নতুন নোটিশ পাবলিশ করুন (Publish Notice)</span>
              </h3>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-650 block">নোটিশের শিরোনাম (Notice Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ নিবন্ধন ফি পরিশোধের সময়সীমা বৃদ্ধি প্রসংগে"
                  value={newNoticeTitle}
                  onChange={e => setNewNoticeTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-650 block">নোটিশ বা বার্তার বিস্তারিত বিবরণ (Notice Message Content) *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="নোটিশের বিস্তারিত ঘোষণা ঘোষণা অংশসমূহ স্পষ্টভাবে এখানে উল্লেখ করুন..."
                  value={newNoticeDesc}
                  onChange={e => setNewNoticeDesc(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer transition text-xs"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg cursor-pointer transition flex items-center space-x-1 font-sans text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>নোটিশ প্রকাশ করুন (Publish Announcement)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isGalleryModalOpen && (
        <div className="fixed inset-0 bg-gray-905/65 backdrop-blur-md flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-lg w-full p-6 shadow-2xl relative animate-scale-up space-y-4">
            <button 
              type="button"
              onClick={() => setIsGalleryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5 font-sans">
                <Image className="h-5 w-5 text-primary shrink-0" />
                <span>গ্যালারিতে নতুন ছবি আপলোড করুন</span>
              </h3>
            </div>

            <form onSubmit={handleAddGallery} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-gray-450 block pb-1">ছবির শিরোনাম (Photo Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ প্রথম রিইউনিয়ন উদ্বোধনী স্মৃতি"
                  value={newGalleryTitle}
                  onChange={e => setNewGalleryTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-450 block pb-1">ক্যাটাগরি বা অ্যালবাম (Album Category)</label>
                <select
                  value={newGalleryCat}
                  onChange={e => setNewGalleryCat(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white text-xs font-sans"
                >
                  <option value="Golden Jubilee font-sans">সুবর্ণ জন্মজয়ন্তী (Golden Jubilee)</option>
                  <option value="Class Reunion font-sans">শ্রেণী পুনর্মিলনী (Class Reunion)</option>
                  <option value="Sports & Culture font-sans font-sans">খেলাধুলা ও সংস্কৃতি</option>
                  <option value="Campus font-sans Memory">ক্যাম্পাসের স্মৃতিপট</option>
                  <option value="Others font-sans">অন্যান্য অ্যালবাম</option>
                  {customForms.map(form => (
                    <option key={form.formId} value={form.title}>{form.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-450 block pb-1">ছবি সিলেক্ট করুন (Choose Photo) *</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewGalleryImg(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border p-2 rounded bg-gray-50 file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded file:bg-primary file:text-white file:font-semibold file:cursor-pointer text-xs"
                />
                
                {newGalleryImg && (
                  <div className="border border-indigo-150 rounded-lg overflow-hidden bg-gray-50 p-1 mt-2">
                    <span className="text-[10px] text-indigo-600 block mb-1">Image Preview:</span>
                    <img 
                      src={newGalleryImg} 
                      alt="Upload preview" 
                      referrerPolicy="no-referrer"
                      className="max-h-[140px] w-full object-contain mx-auto rounded animate-fade-in"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer transition text-xs"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg cursor-pointer transition flex items-center space-x-1 font-sans text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>অ্যালবামে যুক্ত করুন (Upload Photo)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
      </div>
    </div>
  );
};
