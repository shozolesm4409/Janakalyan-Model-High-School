/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch 
} from 'firebase/firestore';
import { Registration, Payment, Event, Notice, Gallery, User, CustomForm, CustomFormField, CustomFormSubmission } from './types';
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
  Download,
  ClipboardList,
  PlusCircle,
  Copy,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Lock,
  Link,
  Edit2,
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
  
  // Tabs inside Admin Desk
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'registrations' | 'payments' | 'events' | 'notices' | 'gallery' | 'form_builder' | 'form_submissions'>('overview');

  // Preview sliders
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [selectedPay, setSelectedPay] = useState<Payment | null>(null);

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
      alert("আবেদনটি সফলভাবে এপ্রুভ করা হয়েছে!");
    } catch (err) {
      console.error(err);
      alert("এপ্রুভ করতে সমস্যা হয়েছে।");
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
      alert("আবেদনটি বাতিল (Rejected) করা হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("বাতিল করতে ব্যর্থ হয়েছে।");
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
      alert("ইভেন্ট সফলভাবে যুক্ত করা হয়েছে!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (evId: string) => {
    if (!confirm("ইভেন্টটি মুছে ফেলতে চান?")) return;
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
      alert("নোটিশটি বোর্ডে সফলভাবে পাবলিশ করা হয়েছে!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (nId: string) => {
    if (!confirm("নোটিশটি মুছে ফেলতে চান?")) return;
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
      alert("গ্যালারি ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (gId: string) => {
    if (!confirm("গ্যালারির ছবিটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, 'gallery', gId));
    } catch (err) {
      console.error(err);
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
  const [formRedirectUrl, setFormRedirectUrl] = useState('');
  const [formRegisterNowActive, setFormRegisterNowActive] = useState(false);
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
    setFormRedirectUrl(form.redirectUrl || '');
    setFormRegisterNowActive(!!form.registerNowActive);
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
    setFormRedirectUrl('');
    setFormRegisterNowActive(false);
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
        redirectUrl: formRedirectUrl.trim(),
        registerNowActive: formRegisterNowActive,
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
      alert('ফর্ম কনফিগারেশন সফলভাবে সেভ করা হয়েছে!');
    } catch(err) {
      console.error(err);
      alert('অ্যাপ ডেভেলপমেন্ট সিস্টেমে ফর্ম সংরক্ষণ করতে ব্যর্থ হয়েছে।');
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
      alert('ফিল্ডটি সফলভাবে ফর্মে যুক্ত করা হয়েছে!');
    } catch(err) {
      console.error(err);
      alert('নতুন ফিল্ড তৈরি করতে সমস্যা হয়েছে।');
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
      alert('ফিল্ডের নাম / লেবেল অবশ্যই লিখতে হবে।');
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
      alert('ফিল্ডটি সফলভাবে আপডেট করা হয়েছে!');
    } catch (err) {
      console.error(err);
      alert('ফিল্ড আপডেট করতে ত্রুটি হয়েছে।');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('ফিল্ডটি ফর্ম থেকে মুছে ফেলতে চান?')) return;
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
      alert('ফিল্ডটি ক্লোন করা হয়েছে!');
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
    if (!confirm('এই ফর্ম এবং এর অন্তর্ভুক্ত সকল ফিল্ড ও সাবমিশন ডাটা মুছে ফেলা হবে। আপনি কি নিশ্চিত?')) return;
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
      alert('ফর্মটি সফলভাবে মুছে ফেলা হয়েছে!');
    } catch(err) {
      console.error(err);
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
      alert('রপ্তানি করার জন্য কোন রেসপন্স বা সাবমিশন পাওয়া যায়নি।');
      return;
    }
    
    const headers = ['Submission ID', 'User Name', 'User Email', 'Submitted At', ...fields.map(f => f.label)];
    const rows = subs.map(sub => {
      return [
        `"${sub.submissionId}"`,
        `"${(sub.userName || 'Guest User').replace(/"/g, '""')}"`,
        `"${(sub.userEmail || '').replace(/"/g, '""')}"`,
        `"${new Date(sub.submittedAt).toLocaleString()}"`,
        ...fields.map(f => {
          const val = sub.data[f.fieldId];
          if (val === undefined || val === null) return '""';
          if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        })
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
    if (!confirm('সাবমিশনটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'form_submissions', submissionId));
      setSelectedSubmission(null);
      alert('রেসপন্সটি সফলভাবে ডিলিট করা হয়েছে!');
    } catch (err) {
      console.error(err);
    }
  };

  // Math totals for stats counters
  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter(r => r.approvalStatus === 'approved').length;
  const pendingRegistrations = registrations.filter(r => r.approvalStatus === 'pending').length;
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
    id: 'overview' | 'registrations' | 'events' | 'notices' | 'gallery' | 'form_builder' | 'form_submissions';
    label: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }

  const adminSidebarTabs: SidebarTabItem[] = [
    { id: 'overview', label: 'সার্বিক ওভারভিউ', subtitle: 'Overview & Charts', icon: LayoutDashboard },
    { id: 'registrations', label: 'আবেদন ভেরিফিকেশন', subtitle: 'Verification Queue', icon: Users, badge: pendingRegistrations > 0 ? String(pendingRegistrations) : undefined },
    { id: 'events', label: 'কর্মসূচী ম্যানেজার', subtitle: 'Event Program Scheduler', icon: Calendar },
    { id: 'notices', label: 'ঘোষণা ও নোটিশ', subtitle: 'Publish Noticeboard', icon: Bell },
    { id: 'gallery', label: 'স্মৃতি গ্যালারি', subtitle: 'Upload Historical Photos', icon: Image },
    { id: 'form_builder', label: 'ডায়নামিক ফর্ম বিল্ডার', subtitle: 'Unlimited Form Creator', icon: Sliders },
    { id: 'form_submissions', label: 'ফর্ম সাবমিশন ডাটা', subtitle: 'Track Dynamic Submissions', icon: ClipboardList },
  ];

  return (
    <div className="max-w-none w-full px-4 sm:px-10 lg:px-16 py-2 text-gray-800 pb-24">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ========================================================================================= */}
        {/* DESKTOP SIDEBAR PANEL */}
        {/* ========================================================================================= */}
        <aside id="admin-desktop-sidebar" className="hidden lg:flex w-72 shrink-0 flex-col bg-white rounded-2xl border border-gray-150 p-6 shadow-sm sticky top-24 space-y-7 group">
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-gray-100">
            <div className="relative">
              <img
                src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'}
                alt="Committee Admin Avatar"
                className="h-20 w-20 rounded-full object-cover border-4 border-red-500/30 shadow-md transform group-hover:scale-105 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <CheckCircle className="h-3 w-3" />
              </span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-gray-900 tracking-tight leading-short">{currentUser?.name || "এডমিন সদস্য"}</h4>
              <p className="text-[11px] font-semibold text-gray-400 font-mono">Committee Member Desk</p>
              <div className="inline-flex items-center space-x-1 mt-1 bg-red-50 text-red-700 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase border border-red-100 shadow-xs">
                <span>{currentUser?.role || "Admin"} Operator</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {adminSidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-sidebar-subtab-btn-${tab.id}`}
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
                  {tab.badge && (
                    <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                      isActive ? 'bg-white text-primary' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button 
              id="admin-sidebar-btn-logout"
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
        <div id="admin-mobile-header" className="lg:hidden w-full bg-white rounded-xl border border-gray-150 p-4 shadow-sm flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              id="admin-mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
              title="Open Admin Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <span className="text-xs text-gray-400 font-mono block">অ্যাডমিন ডেস্ক / {activeSubTab.toUpperCase()}</span>
              <strong className="text-sm font-bold text-gray-800 block">
                {activeSubTab === 'overview' ? 'সার্বিক ওভারভিউ' :
                 activeSubTab === 'registrations' ? 'আবেদনপত্র ভেরিফিকেশন' :
                 activeSubTab === 'events' ? 'কর্মসূচী ও ইভেন্ট ম্যানেজার' :
                 activeSubTab === 'notices' ? 'ঘোষণা ও নোটিশ পাবলিশার' :
                 activeSubTab === 'gallery' ? 'স্মৃতি গ্যালারি আপলোডার' :
                 activeSubTab === 'form_builder' ? 'ডায়নামিক ফর্ম বিল্ডার' : 'ফর্ম সাবমিশন ডাটা'}
              </strong>
            </div>
          </div>
          
          <img
            src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover border border-red-500/30 shadow-sm"
          />
        </div>

        {/* ========================================================================================= */}
        {/* MOBILE SIDEBAR DRAWER POPUP */}
        {/* ========================================================================================= */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              />

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
                    <span className="font-display font-medium text-sm">এডমিন নিয়ন্ত্রণ মেনু</span>
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
                    src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'}
                    alt="avatar"
                    className="h-16 w-16 rounded-full object-cover border-2 border-red-500/30 shadow-md"
                  />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm leading-none">{currentUser?.name || "এডমিন সদস্য"}</h5>
                    <span className="text-[10px] text-gray-400 font-mono">{currentUser?.role || "Super Admin"} Panel</span>
                  </div>
                </div>

                <nav className="space-y-1.5 flex-1">
                  {adminSidebarTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`admin-mob-subtab-btn-${tab.id}`}
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
                        {tab.badge && (
                          <span className="text-[8.5px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Batch Distribution chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-150 p-6 space-y-6">
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
            <div className="bg-white rounded-xl border border-gray-150 p-6 space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <CreditCard className="h-5 text-primary" />
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">পেমেন্ট ভেরিফিকেশন অনুপাত</h3>
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
          <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
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
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                            #{reg.registrationId.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-800">{regUser?.name || 'পরিচিত ইউজার'}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{regUser?.email || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-600">
                            {reg.academicInfo?.passingYear || "N/A"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-600">
                            {reg.participationInfo?.guestCount ?? 0} জন
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-gray-150 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono border">
                              {reg.participationInfo?.tshirtSize || "M"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
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
                          <td className="py-3.5 px-4 text-right">
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

      {/* 3. Event Program scheduler */}
      {activeSubTab === 'events' && (
        <div id="admin-events-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in text-xs">
          {/* Left Column: Create/Add Event Card */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-gray-150 p-6 shadow-xs space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5 font-sans">
                <Calendar className="h-4 w-4 text-primary" />
                <span>নতুন কর্মসূচী যোগ করুন (Add Event Program)</span>
              </h3>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-gray-500 block">ইভেন্টের শিরোনাম (Event Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ প্রাক্তনী মহাসম্মেলন ২০২৬ (Alumni Reunion)"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-500 block">তারিখ ও সময় (Event Date & Time) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ ২৫শে ডিসেম্বর, ২০২৬ সকাল ১০:০০ টা"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-500 block">অনুষ্ঠান স্থল (Location/Venue)</label>
                <input
                  type="text"
                  placeholder="School Campus Grounds"
                  value={newEventLoc}
                  onChange={e => setNewEventLoc(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-500 block">বিস্তারিত কর্মসূচী বিবরণ (Description)</label>
                <textarea
                  rows={4}
                  placeholder="অনুষ্ঠানের বিস্তারিত সময়সূচী ও রুটিন গাইডলাইন এখানে লিখুন..."
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center space-x-1 font-sans animate-fade-in"
              >
                <Plus className="h-4 w-4" />
                <span>কর্মসূচী সংরক্ষণ করুন (Add Event)</span>
              </button>
            </form>
          </div>

          {/* Right Column: Scheduled Event List */}
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
              <h3 className="font-bold text-gray-800 text-sm border-b pb-2 mb-4 font-sans">নির্ধারিত ইভেন্ট সমূহ (Scheduled Events)</h3>
              
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
        </div>
      )}

      {/* 4. Notices announcement screen */}
      {activeSubTab === 'notices' && (
        <div id="admin-notices-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in text-xs">
          {/* Left Column: Create notice form */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-gray-150 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5 border-b pb-2 font-sans">
              <Bell className="h-4 w-4 text-primary" />
              <span>নতুন নোটিশ পাবলিশ করুন (Publish Notice)</span>
            </h3>

            <form onSubmit={handleAddNotice} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-gray-500 block">নোটিশের শিরোনাম (Notice Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ নিবন্ধন ফি পরিশোধের সময়সীমা বৃদ্ধি প্রসংগে"
                  value={newNoticeTitle}
                  onChange={e => setNewNoticeTitle(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-500 block">নোটিশ বা বার্তার বিস্তারিত বিবরণ (Notice Message Content) *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="নোটিশের বিস্তারিত ঘোষণা ঘোষণা অংশসমূহ স্পষ্টভাবে এখানে উল্লেখ করুন..."
                  value={newNoticeDesc}
                  onChange={e => setNewNoticeDesc(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center space-x-1 font-sans"
              >
                <Plus className="h-4 w-4" />
                <span>নোটিশ প্রকাশ করুন (Publish Announcement)</span>
              </button>
            </form>
          </div>

          {/* Right Column: Published Notices board */}
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
              <h3 className="font-bold text-gray-800 text-sm border-b pb-2 mb-4 font-sans">প্রকাশিত নোটিশবোর্ড (Published Notices)</h3>

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
        </div>
      )}

      {/* 5. Memory Photo gallery subtab */}
      {activeSubTab === 'gallery' && (
        <div id="admin-gallery-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in text-xs">
          {/* Left Column Upload tools */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-gray-150 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center space-x-1.5 font-sans">
              <Image className="h-4 w-4 text-primary" />
              <span>গ্যালারিতে নতুন ছবি আপলোড করুন</span>
            </h3>

            <form onSubmit={handleAddGallery} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 block pb-1">ছবির শিরোনাম (Photo Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ প্রথম রিইউনিয়ন উদ্বোধনী স্মৃতি"
                  value={newGalleryTitle}
                  onChange={e => setNewGalleryTitle(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400 block pb-1">ক্যাটাগরি বা অ্যালবাম (Album Category)</label>
                <select
                  value={newGalleryCat}
                  onChange={e => setNewGalleryCat(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 bg-white text-xs font-sans"
                >
                  <option value="Golden Jubilee">সুবর্ণ જન્મজয়নন্তী (Golden Jubilee)</option>
                  <option value="Class Reunion">শ্রেণী পুনর্মিলনী (Class Reunion)</option>
                  <option value="Sports & Culture">খেলাধুলা ও সংস্কৃতি</option>
                  <option value="Campus Memory">ক্যাম্পাসের স্মৃতিপট</option>
                  <option value="Others">অন্যান্য অ্যালবাম</option>
                </select>
              </div>

              {/* Base64 file upload input */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 block pb-1 font-sans">ছবি সিলেক্ট করুন (Choose Photo) *</label>
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
                  className="w-full border p-1 rounded bg-gray-50 file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded file:bg-primary file:text-white file:font-semibold file:cursor-pointer"
                />
                
                {/* Image preview */}
                {newGalleryImg && (
                  <div className="border border-indigo-150 rounded-lg overflow-hidden bg-gray-50 p-1">
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

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center space-x-1 font-sans"
              >
                <Plus className="h-4 w-4" />
                <span>অ্যালবামে যুক্ত করুন (Upload Photo)</span>
              </button>
            </form>
          </div>

          {/* Right Column Album feed */}
          <div className="xl:col-span-7 bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
            <h3 className="font-bold text-gray-800 text-sm border-b pb-2 mb-4 font-sans">গ্যালারি অ্যালবাম (Photo Gallery Feed)</h3>

            {gallery.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium font-sans">গ্যালারিতে এখনও কোনো ছবি আপলোড করা হয়নি।</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[580px] overflow-y-auto pr-1">
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
        <div id="admin-form-builder-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in text-xs font-sans">
          
          {/* LEFT COLUMN: DYNAMIC DIRECTORIES & FORM CREATING/SETTINGS MODULATOR */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* 1. Forms Listing and directory switcher */}
            <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs space-y-4">
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
              <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs space-y-4 animate-slide-up">
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

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500 block">জমা পরবর্তী সফল মেসেজ (Success Message)</label>
                    <input
                      type="text"
                      placeholder="আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!"
                      value={formSuccessMsg}
                      onChange={e => setFormSuccessMsg(e.target.value)}
                      className="w-full border rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-sans"
                    />
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
                    <div className="bg-white rounded-xl border border-gray-150 p-6 flex justify-between items-center bg-radial-to-r from-blue-50/10 to-indigo-50/10">
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

                    {/* Drag & Drop Sorted Fields List */}
                    <div className="bg-white rounded-xl border border-gray-150 p-6 space-y-4">
                      <h4 className="font-bold text-gray-800 text-xs pb-2 border-b">রিয়েল-টাইম ফর্ম ফিল্ড ডিজাইন ও সাজানো</h4>
                      
                      {sortedFields.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">ফর্মে এখনও কোনো ইনপুট ফিল্ড নেই। নিচের প্যানেল থেকে ফিল্ড যোগ করুন!</p>
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
                                          onChange={e => setFieldOptionsRaw(e.target.value)}
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
                                      <span className="font-mono text-gray-400 font-bold bg-gray-200/50 h-5 w-5 rounded flex items-center justify-center">
                                        {idx + 1}
                                      </span>
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <strong className="text-gray-800 uppercase font-sans text-[11px]">{field.label}</strong>
                                          {field.required && <span className="text-red-500 font-bold">*</span>}
                                        </div>
                                        <span className="font-mono text-[10px] text-gray-400 capitalize bg-white/85 border px-1.5 py-0.2 rounded mt-1 block w-fit shadow-2xs">
                                          Type: {field.fieldType}
                                        </span>
                                        {field.options && field.options.length > 0 && (
                                          <span className="text-[9.5px] text-primary block mt-1 font-sans">Options: {field.options.join(', ')}</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                      {/* Order Shifting Buttons */}
                                      <button
                                        onClick={() => handleShiftFieldOrder(field, 'up')}
                                        disabled={idx === 0}
                                        className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-40 transition cursor-pointer"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleShiftFieldOrder(field, 'down')}
                                        disabled={idx === sortedFields.length - 1}
                                        className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-40 transition cursor-pointer"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </button>

                                      {/* Field Operations */}
                                      <button
                                        onClick={() => handleEditFieldStart(field)}
                                        className="p-1 hover:bg-gray-200 text-indigo-600 rounded cursor-pointer transition"
                                        title="Edit Field Properties"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleCloneField(field)}
                                        className="p-1 hover:bg-gray-200 text-gray-600 rounded cursor-pointer transition"
                                        title="Clone Field"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteField(field.fieldId)}
                                        className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer transition"
                                        title="Delete Field"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
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

                    {/* Add Field Section (REQUEST 2 option file included below) */}
                    <div className="bg-white rounded-xl border border-gray-150 p-6 space-y-4 shadow-xs">
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
                              placeholder="우দাঃ বর্তমান পেশা (Current Occupation)"
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
                  onClick={() => handleExportSubmissionsCSV(selectedSubmissionsFormId)}
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
                    <option key={f.formId} value={f.formId}>{f.title} (/{f.slug})</option>
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
                  <div className="flex justify-between items-start pb-4 border-b border-gray-150">
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2 py-0.5 rounded uppercase font-mono mb-1 inline-block">
                        সম্পূর্ণ সাবমিশন রেকর্ড
                      </span>
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

                  <div className="my-5 overflow-y-auto max-h-[420px] text-xs space-y-4">
                    {/* User Metadata */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 border p-3.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono">SUBMITTED BY</span>
                        <strong className="text-gray-800 text-xs block mt-0.5">{selectedSubmission.userName || 'Guest User'}</strong>
                        <span className="text-[10.5px] text-slate-500 font-mono block">{selectedSubmission.userEmail || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono">SUBMISSION DATE</span>
                        <strong className="text-gray-800 text-xs block mt-0.5">
                          {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Dynamic Key Values Table */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">ফর্ম ডাটা (Submitted Payload)</h4>
                      <div className="border rounded-xl overflow-hidden divide-y">
                        {(() => {
                          const matchingFields = [...customFields]
                            .filter(f => f.formId === selectedSubmission.formId)
                            .sort((a,b) => a.sortOrder - b.sortOrder);
                            
                          if (matchingFields.length === 0) {
                            return Object.entries(selectedSubmission.data || {}).map(([key, val]) => {
                              const valStr = String(val);
                              const isImage = valStr.startsWith('data:image/');
                              const isPdf = valStr.startsWith('data:application/pdf');
                              return (
                                <div key={key} className="grid grid-cols-3 p-3 text-xs bg-white items-center">
                                  <span className="font-bold text-gray-500 col-span-1">{key}</span>
                                  {isImage ? (
                                    <div className="col-span-2 space-y-1 text-left">
                                      <img 
                                        src={valStr} 
                                        alt={key} 
                                        className="max-h-40 max-w-full rounded border bg-slate-50 p-1 shadow-3xs object-contain" 
                                        referrerPolicy="no-referrer"
                                      />
                                      <a 
                                        href={valStr} 
                                        download={`upload_${selectedSubmission.submissionId}.png`}
                                        className="text-[10px] text-primary hover:underline font-extrabold flex items-center space-x-1 mt-1 cursor-pointer"
                                      >
                                        <Download className="h-3.5 w-3.5 pointer-events-none" />
                                        <span>ছবি ডাউনলোড করুন (Download Image)</span>
                                      </a>
                                    </div>
                                  ) : isPdf ? (
                                    <div className="col-span-2 text-left space-y-1">
                                      <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold border border-red-150 inline-block">
                                        PDF Document
                                      </span>
                                      <a 
                                        href={valStr} 
                                        download={`doc_${selectedSubmission.submissionId}.pdf`}
                                        className="text-[10px] text-primary hover:underline font-extrabold flex items-center space-x-1 mt-1 cursor-pointer"
                                      >
                                        <Download className="h-3.5 w-3.5 pointer-events-none" />
                                        <span>পিডিএফ ডাউনলোড (Download PDF)</span>
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-gray-800 col-span-2 font-mono whitespace-pre-wrap">{valStr}</span>
                                  )}
                                </div>
                              );
                            });
                          }

                          return matchingFields.map((f) => {
                            const val = selectedSubmission.data[f.fieldId];
                            const valStr = val === undefined || val === null ? '' : String(val);
                            const isImage = valStr.startsWith('data:image/') || f.fieldType === 'file' && valStr.startsWith('data:image/');
                            const isPdf = valStr.startsWith('data:application/pdf') || f.fieldType === 'file' && valStr.startsWith('data:application/pdf');
                            const displayVal = val === undefined || val === null ? '-' : Array.isArray(val) ? val.join(', ') : valStr;

                            return (
                              <div key={f.fieldId} className="grid grid-cols-3 p-3 text-xs hover:bg-gray-50/50 items-center">
                                <span className="font-bold text-gray-600 col-span-1">{f.label}</span>
                                {isImage ? (
                                  <div className="col-span-2 space-y-1 text-left">
                                    <img 
                                      src={valStr} 
                                      alt={f.label} 
                                      className="max-h-40 max-w-full rounded border bg-slate-50 p-1 shadow-3xs object-contain" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <a 
                                      href={valStr} 
                                      download={`upload_${selectedSubmission.submissionId}.png`}
                                      className="text-[10px] text-primary hover:underline font-extrabold flex items-center space-x-1 mt-1 cursor-pointer animate-pulse"
                                    >
                                      <Download className="h-3.5 w-3.5 pointer-events-none" />
                                      <span>ছবি ডাউনলোড করুন (Download Image)</span>
                                    </a>
                                  </div>
                                ) : isPdf ? (
                                  <div className="col-span-2 text-left space-y-1">
                                    <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold border border-red-150 inline-block">
                                      PDF Document
                                    </span>
                                    <a 
                                      href={valStr} 
                                      download={`doc_${selectedSubmission.submissionId}.pdf`}
                                      className="text-[10px] text-primary hover:underline font-extrabold flex items-center space-x-1 mt-1 cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5 pointer-events-none" />
                                      <span>পিডিএফ ডাউনলোড (Download PDF)</span>
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-gray-800 col-span-2 font-medium whitespace-pre-wrap">{displayVal}</span>
                                )}
                              </div>
                            );
                          });
                        })()}
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

        </main>
      </div>
    </div>
  );
};
