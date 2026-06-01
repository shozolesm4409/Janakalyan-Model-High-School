/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Registration, Payment, PersonalInfo, AcademicInfo, ContactInfo, ParticipationInfo } from '../types';
import { 
  User as UserIcon, 
  MapPin, 
  BookOpen, 
  Shirt, 
  CreditCard, 
  CheckCircle, 
  Upload, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistrationFormProps {
  onSuccess: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [dob, setDob] = useState('');

  const [passingYear, setPassingYear] = useState('2015');
  const [roll, setRoll] = useState('');
  const [section, setSection] = useState('A');
  const [currentOccupation, setCurrentOccupation] = useState('');

  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');

  const [guestCount, setGuestCount] = useState(0);
  const [tshirtSize, setTshirtSize] = useState('XL');
  const [transportChoice, setTransportChoice] = useState('Self Transport');

  const [paymentProvider, setPaymentProvider] = useState<'bKash' | 'Rocket'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-md border p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">লগইন প্রয়োজন</h2>
        <p className="text-gray-500">অনলাইনে নিবন্ধন করতে দয়া করে প্রথমে গুগল অথবা টেস্ট একাউন্ট দ্বারা লগইন করুন।</p>
      </div>
    );
  }

  // Calculate fees
  const baseFee = 1000;
  const guestFee = guestCount * 500;
  const totalFee = baseFee + guestFee;

  // File drag-and-drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (PNG/JPG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!trxId.trim()) {
      alert("বিকাশ বা রকেট ট্রানজেকশন আইডি (TrxID) দিন!");
      return;
    }
    if (!receiptImage) {
      alert("পেমেন্ট স্লিপ/স্ক্রিনশট আপলোড করুন!");
      return;
    }

    setSubmitting(true);
    const regId = `REG-${Date.now()}`;
    const payId = `PAY-${Date.now()}`;

    const newRegistration: Registration = {
      registrationId: regId,
      userId: currentUser.uid,
      personalInfo: { fatherName, motherName, gender, bloodGroup, dob },
      academicInfo: { passingYear, roll, section, currentOccupation },
      contactInfo: { presentAddress, permanentAddress, alternateMobile },
      participationInfo: { guestCount, tshirtSize, transportChoice },
      approvalStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const newPayment: Payment = {
      paymentId: payId,
      registrationId: regId,
      userId: currentUser.uid,
      amount: totalFee,
      trxId: trxId.trim(),
      paymentProof: receiptImage,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Write Registration
      await setDoc(doc(db, 'registrations', regId), newRegistration);
      // 2. Write Payment
      await setDoc(doc(db, 'payments', payId), newPayment);
      
      onSuccess();
    } catch (error) {
      console.error("Submission failed: ", error);
      try {
        handleFirestoreError(error, OperationType.WRITE, 'registrations');
      } catch (e: any) {
        alert("নিবন্ধন ত্রুটি: " + e.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Page Title */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-display font-extrabold text-primary">সুবর্ণ জয়ন্তী নিবন্ধন ফরম (Registration Panel)</h1>
        <p className="text-gray-500 font-sans text-sm">দয়া করে ৫টি ধাপে আপনার বর্তমান এবং প্রাতিষ্ঠানিক সকল তথ্য নির্ভুলভাবে প্রদান করুন।</p>
      </div>

      {/* Steps indicator bar */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-150 p-4 mb-8">
        {[
          { icon: UserIcon, label: 'ব্যক্তিগত তথ্য' },
          { icon: BookOpen, label: 'একাডেমিক' },
          { icon: MapPin, label: 'যোগাযোগ' },
          { icon: Shirt, label: 'টি-শার্ট ও গেস্ট' },
          { icon: CreditCard, label: 'পেমেন্ট করুন' }
        ].map((item, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 relative">
              <div className={`p-2.5 rounded-full border transition-all duration-300 ${
                isActive ? 'bg-primary text-white border-primary scale-110 shadow-md' :
                isCompleted ? 'bg-secondary text-primary border-secondary font-bold' :
                'bg-gray-50 text-gray-400 border-gray-200'
              }`}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <span className={`text-[10px] sm:text-xs mt-1.5 font-medium hidden sm:block ${
                isActive ? 'text-primary font-bold' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Steps form Body with Motion wrapper */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 sm:p-8 min-h-[400px] flex flex-col justify-between">
        <div>
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <UserIcon className="h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-800">ধাপ ১: ব্যক্তিগত তথ্য (Personal Details)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">পিতার নাম (Father's Name) *</label>
                    <input
                      id="input-father"
                      type="text"
                      required
                      value={fatherName}
                      onChange={e => setFatherName(e.target.value)}
                      placeholder="পিতার নাম লিখুন"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none placeholder:text-sm text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">মাতার নাম (Mother's Name) *</label>
                    <input
                      id="input-mother"
                      type="text"
                      required
                      value={motherName}
                      onChange={e => setMotherName(e.target.value)}
                      placeholder="মাতার নাম লিখুন"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none placeholder:text-sm text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">লিঙ্গ (Gender)</label>
                    <select
                      id="select-gender"
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm"
                    >
                      <option value="Male">পুরুষ (Male)</option>
                      <option value="Female">মহিলা (Female)</option>
                      <option value="Other">অন্যান্য (Other)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">রক্তের গ্রুপ (Blood Group)</label>
                    <select
                      id="select-blood"
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">জন্ম তারিখ (Date of Birth) *</label>
                    <input
                      id="input-dob"
                      type="date"
                      required
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Academic details */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <BookOpen className="h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-800">ধাপ ২: একাডেমিক ও কর্মক্ষেত্রের তথ্য</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">এসএসসি পাসের ব্যাচ / বছর *</label>
                    <select
                      id="select-batch"
                      value={passingYear}
                      onChange={e => setPassingYear(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm font-mono"
                    >
                      {Array.from({ length: 51 }, (_, i) => String(1976 + i)).map(year => (
                        <option key={year} value={year}>{year} (SSC Batch)</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">রোল নং (SSC class roll) *</label>
                    <input
                      id="input-roll"
                      type="text"
                      required
                      placeholder="এসএসসি রোল উল্লেখ করুন"
                      value={roll}
                      onChange={e => setRoll(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">সেকশন (Section)</label>
                    <select
                      id="select-section"
                      value={section}
                      onChange={e => setSection(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm"
                    >
                      <option value="A">বিজ্ঞান - Science (A)</option>
                      <option value="B">মানবিক - Arts (B)</option>
                      <option value="C">ব্যবসায় শিক্ষা - Commerce (C)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">বর্তমান পেশা (Current Occupation) *</label>
                    <input
                      id="input-occupation"
                      type="text"
                      required
                      placeholder="উদাঃ ইঞ্জিনিয়ার, ডাক্তার, ব্যবসায়ী"
                      value={currentOccupation}
                      onChange={e => setCurrentOccupation(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm placeholder:text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Contacts */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <MapPin className="h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-800">ধাপ ৩: যোগাযোগের বিবরণ (Contact)</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">বর্তমান ঠিকানা (Present Address) *</label>
                    <textarea
                      id="input-present-address"
                      required
                      rows={2}
                      placeholder="বর্তমান ঠিকানা লিখুন"
                      value={presentAddress}
                      onChange={e => setPresentAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">স্থায়ী ঠিকানা (Permanent Address) *</label>
                    <textarea
                      id="input-permanent-address"
                      required
                      rows={2}
                      placeholder="স্থায়ী ঠিকানা লিখুন"
                      value={permanentAddress}
                      onChange={e => setPermanentAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">বিকল্প মোবাইল নম্বর (Alternate Phone) *</label>
                    <input
                      id="input-alt-phone"
                      type="tel"
                      required
                      placeholder="বিকল্প যোগাযোগের নাম্বার"
                      value={alternateMobile}
                      onChange={e => setAlternateMobile(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm font-mono placeholder:text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Participation details, guests, sizes */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <Shirt className="h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-800">ধাপ ৪: টি-শার্ট সাইজ ও অতিরিক্ত অতিথি সংখ্যা</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">টি-শার্ট সাইজ (T-shirt Size Guide)</label>
                    <select
                      id="select-tshirt"
                      value={tshirtSize}
                      onChange={e => setTshirtSize(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm font-semibold"
                    >
                      <option value="S">S - ( স্মল )</option>
                      <option value="M">M - ( মিডিয়াম )</option>
                      <option value="L">L - ( লার্জ )</option>
                      <option value="XL">XL - ( এক্স-লার্জ )</option>
                      <option value="XXL">XXL - ( ডাবল এক্স-লার্জ )</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">অতিরিক্ত অতিথি সংখ্যা (Guests)</label>
                    <select
                      id="select-guests"
                      value={guestCount}
                      onChange={e => setGuestCount(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm font-semibold font-mono"
                    >
                      <option value={0}>০ - কোনো অতিথি নেই</option>
                      <option value={1}>১ জন অতিথি (+৫০০ BDT)</option>
                      <option value={2}>২ জন অতিথি (+১০০০ BDT)</option>
                      <option value={3}>৩ জন অতিথি (+১৫০০ BDT)</option>
                    </select>
                  </div>

                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">যাতায়াত মাধ্যম (Transport Mode)</label>
                    <select
                      id="select-transport"
                      value={transportChoice}
                      onChange={e => setTransportChoice(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm"
                    >
                      <option value="Self Transport">ব্যক্তিগত যাতায়াত (Self Transport)</option>
                      <option value="School Bus Services">বিদ্যালয়ের বাস সার্ভিস (School Bus Services)</option>
                      <option value="Public Commute">পাবলিক কমুট (Public Commute)</option>
                    </select>
                  </div>
                </div>

                {/* Live fee preview */}
                <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 mt-6">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-600">রেজিস্ট্রেশন ফি:</span>
                    <span className="font-mono">{baseFee} BDT</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium mt-1">
                    <span className="text-gray-600">অতিথি ফি ({guestCount} জন):</span>
                    <span className="font-mono">{guestFee} BDT</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold border-t border-dashed border-primary/20 pt-2.5 mt-2.5 text-primary">
                    <span>সর্বমোট প্রদেয় ফি (Total Payment):</span>
                    <span className="text-xl font-mono">{totalFee} BDT</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Payment details & manual drag receipt */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <CreditCard className="h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-800 flex items-center justify-between w-full">
                    <span>ধাপ ৫: ফি সরাসরি পরিশোধ করুন (Payment Proof)</span>
                    <span className="bg-accent/15 text-accent text-xs px-2.5 py-1 rounded font-bold font-mono">
                      {totalFee} BDT
                    </span>
                  </h3>
                </div>

                {/* Selection of bKash/Rocket */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('bKash')}
                    className={`p-3.5 rounded-lg border text-center font-bold flex flex-col items-center justify-center space-y-1.5 transition ${
                      paymentProvider === 'bKash'
                        ? 'border-pink-500 bg-pink-50/50 text-pink-700 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">bKash (বিকাশ)</span>
                    <span className="text-[10px] font-mono text-gray-400">০১৭৪৫-৯৯০৫০৫ (Personal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('Rocket')}
                    className={`p-3.5 rounded-lg border text-center font-bold flex flex-col items-center justify-center space-y-1.5 transition ${
                      paymentProvider === 'Rocket'
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">Rocket (রকেট)</span>
                    <span className="text-[10px] font-mono text-gray-400">০১৭৪৫-৯৯০৫০৫-৭ (Personal)</span>
                  </button>
                </div>

                <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 sm:p-4 leading-relaxed font-sans">
                  <strong>পেমেন্ট নির্দেশনাবলী:</strong> আপনার বিকাশ বা রকেট এপ্লিকেশন ব্যবহার করে উপরোক্ত পার্সোনাল নাম্বারে <strong>{totalFee} টাকা Send Money</strong> করুন। সফলভাবে লেনদেনের পর প্রাপ্ত 8 বা 10 অক্ষরের <strong>Transaction ID (TrxID)</strong> এবং পেমেন্ট কনফার্মেশন স্ক্রিনশটটি নিচে সাবমিট করুন।
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">লেনদেন ট্রানজেকশন আইডি (Transaction ID) *</label>
                  <input
                    id="input-trxid"
                    type="text"
                    required
                    placeholder="উদাঃ 8K34JH9FS"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:border-primary focus:outline-none text-sm font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-sm"
                  />
                </div>

                {/* Usability Patterns: Click and Drag File Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">পেমেন্ট স্লিপ / স্ক্রিনশট রিসিভ আপলোড *</label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('manual-file-uploader')?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 select-none min-h-[140px] ${
                      dragActive ? 'border-primary bg-primary/5' :
                      receiptImage ? 'border-green-500 bg-green-50/20' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      id="manual-file-uploader"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {receiptImage ? (
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <span className="text-xs font-semibold text-green-700">রিসিভ স্ক্রিনশট সফলভাবে যুক্ত হয়েছে!</span>
                        <img
                          src={receiptImage}
                          alt="preview"
                          className="max-h-24 max-w-full object-contain rounded border shadow-sm mt-1"
                        />
                        <span className="text-[10px] text-gray-400">পরিবর্তন করতে পুনরায় ক্লিক বা ড্রাগ করুন</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">ফাইলটি এখানে ড্র্যাগ করে ছেড়ে দিন অথবা ক্লিক করুন</span>
                        <span className="text-[10px] text-gray-400">PNG or JPG, Max size 1MB</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Buttons Controls */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
          <button
            id="btn-prev-step"
            type="button"
            disabled={step === 1}
            onClick={prevStep}
            className={`px-5 py-2.5 rounded-md text-sm font-semibold flex items-center space-x-1.5 border transition ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>পূর্ববর্তী (Back)</span>
          </button>

          {step < 5 ? (
            <button
              id="btn-next-step"
              type="button"
              disabled={
                (step === 1 && (!fatherName || !motherName || !dob)) ||
                (step === 2 && (!roll || !currentOccupation)) ||
                (step === 3 && (!presentAddress || !permanentAddress || !alternateMobile))
              }
              onClick={nextStep}
              className="px-6 py-2.5 rounded-lg text-sm font-bold bg-primary hover:bg-primary/95 text-white flex items-center space-x-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>পরবর্তী ধাপ (Next)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              id="btn-submit-registration"
              type="button"
              disabled={submitting || !trxId || !receiptImage}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-lg text-sm font-black bg-accent hover:bg-accent/90 text-white flex items-center space-x-2 shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>নিবন্ধন নিশ্চিত করুন ({totalFee} ৳)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
