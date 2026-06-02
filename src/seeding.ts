/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { SEED_EVENTS, SEED_NOTICES, SEED_COMMITTEE, SEED_SPONSORS, SEED_GALLERY } from './seedData';

export async function checkAndSeedDatabase() {
  try {
    // 1. Seed Notices
    const noticesCol = collection(db, 'notices');
    const noticesSnap = await getDocs(noticesCol);
    if (noticesSnap.empty) {
      console.log('Seeding initial notices...');
      const batch = writeBatch(db);
      SEED_NOTICES.forEach(item => {
        batch.set(doc(db, 'notices', item.noticeId), item);
      });
      await batch.commit();
    }

    // 2. Seed Events
    const eventsCol = collection(db, 'events');
    const eventsSnap = await getDocs(eventsCol);
    if (eventsSnap.empty) {
      console.log('Seeding initial events...');
      const batch = writeBatch(db);
      SEED_EVENTS.forEach(item => {
        batch.set(doc(db, 'events', item.eventId), item);
      });
      await batch.commit();
    }

    // 3. Seed Committee
    const committeeCol = collection(db, 'committee');
    const committeeSnap = await getDocs(committeeCol);
    if (committeeSnap.empty) {
      console.log('Seeding initial committee...');
      const batch = writeBatch(db);
      SEED_COMMITTEE.forEach(item => {
        batch.set(doc(db, 'committee', item.memberId), item);
      });
      await batch.commit();
    }

    // 4. Seed Sponsors
    const sponsorsCol = collection(db, 'sponsors');
    const sponsorsSnap = await getDocs(sponsorsCol);
    if (sponsorsSnap.empty) {
      console.log('Seeding initial sponsors...');
      const batch = writeBatch(db);
      SEED_SPONSORS.forEach(item => {
        batch.set(doc(db, 'sponsors', item.sponsorId), item);
      });
      await batch.commit();
    }

    // 5. Seed Gallery
    const galleryCol = collection(db, 'gallery');
    const gallerySnap = await getDocs(galleryCol);
    if (gallerySnap.empty) {
      console.log('Seeding initial gallery...');
      const batch = writeBatch(db);
      SEED_GALLERY.forEach(item => {
        batch.set(doc(db, 'gallery', item.galleryId), item);
      });
      await batch.commit();
    }

    // 6. Seed Default Custom Form: সুবর্ণ জয়ন্তী নিবন্ধন ফরম (Registration Panel)
    const formId = 'golden_jubilee_reg';
    const formDocSnapshot = await getDocs(collection(db, 'forms'));
    const isFormExists = formDocSnapshot.docs.some(d => d.id === formId);

    if (!isFormExists) {
      console.log('Seeding initial custom forms...');
      
      await setDoc(doc(db, 'forms', formId), {
        formId,
        title: 'সুবর্ণ জয়ন্তী নিবন্ধন ফরম (Registration Panel)',
        slug: 'golden-jubilee-reg',
        description: 'সুবর্ণ জয়ন্তী ৫০ বছর পূর্তি উৎসবের মহাসম্মেলনে আপনার উপস্থিতি নিশ্চিত করতে নিচের ফরমটি পূরণ করুন।',
        status: 'active',
        createdBy: 'System Seed',
        createdAt: new Date().toISOString(),
        permission: 'login_required',
        registerNowActive: true,
        totalSteps: 5,
        showRulesWidget: true,
        rulesIntro: 'উৎসবের নিরাপত্তা ও সুষ্ঠু পরিচালনার লক্ষ্যে প্রতিটি অ্যালামনাসকে অবশ্যই নির্দিষ্ট ফরম পূরণপূর্বক নিবন্ধন করতে হবে।',
        rulesItems: [
          'একক অ্যালামনাই ফি: ১০০০/- টাকা।',
          'প্রতিটি অতিরিক্ত অতিথি ফি: ৫০০/- টাকা।',
          'উপহার সামগ্রী: সুবর্ণ জয়ন্তী টি-শার্ট, ক্যাপ, ব্যাজ ও স্মরণিকা ম্যাগাজিন।'
        ],
        paymentNumber: '০১৭৪৫-৯৯০৫০৫ (পার্সোনাল)',
        paymentInstructions: 'টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) অবশ্যই পেমেন্ট ফর্মে যুক্ত করতে হবে।',
        successMessage: 'আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!',
        submitBtnText: 'নিবন্ধন সম্পন্ন করুন (Submit)'
      });

      console.log('Seeding initial custom form fields...');
      const fields = [
        { fieldId: 'fld_name', formId, label: 'আবেদনকারীর নাম (Alumni/User Name)', fieldType: 'text', required: true, placeholder: 'আপনার নাম লিখুন', options: [], sortOrder: 1 },
        { fieldId: 'fld_father', formId, label: 'পিতার নাম (Father\'s Name)', fieldType: 'text', required: true, placeholder: 'পিতার নাম লিখুন', options: [], sortOrder: 2 },
        { fieldId: 'fld_mother', formId, label: 'মাতার নাম (Mother\'s Name)', fieldType: 'text', required: true, placeholder: 'মাতার নাম লিখুন', options: [], sortOrder: 3 },
        { fieldId: 'fld_gender', formId, label: 'লিঙ্গ (Gender)', fieldType: 'dropdown', required: false, placeholder: '', options: ['Male', 'Female', 'Other'], sortOrder: 4 },
        { fieldId: 'fld_blood', formId, label: 'রক্তের গ্রুপ (Blood Group)', fieldType: 'dropdown', required: false, placeholder: '', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], sortOrder: 5 },
        { fieldId: 'fld_dob', formId, label: 'জন্ম তারিখ (Date of Birth)', fieldType: 'date', required: true, placeholder: '', options: [], sortOrder: 6 },
        { fieldId: 'fld_batch', formId, label: 'এসএসসি পাসের ব্যাচ / বছর', fieldType: 'text', required: true, placeholder: 'উদাঃ 1995', options: [], sortOrder: 7 },
        { fieldId: 'fld_roll', formId, label: 'রোল নং (SSC class roll)', fieldType: 'text', required: true, placeholder: 'এসএসসি রোল উল্লেখ করুন', options: [], sortOrder: 8 },
        { fieldId: 'fld_section', formId, label: 'সেকশন (Section)', fieldType: 'dropdown', required: false, placeholder: '', options: ['Science (A)', 'Arts (B)', 'Commerce (C)'], sortOrder: 9 },
        { fieldId: 'fld_occupation', formId, label: 'বর্তমান পেশা (Current Occupation)', fieldType: 'text', required: true, placeholder: 'উদাঃ ইঞ্জিনিয়ার, ডাক্তার, ব্যবসায়ী', options: [], sortOrder: 10 },
        { fieldId: 'fld_present_addr', formId, label: 'বর্তমান ঠিকানা (Present Address)', fieldType: 'text', required: true, placeholder: 'বর্তমান ঠিকানা লিখুন', options: [], sortOrder: 11 },
        { fieldId: 'fld_permanent_addr', formId, label: 'স্থায়ী ঠিকানা (Permanent Address)', fieldType: 'text', required: true, placeholder: 'স্থায়ী ঠিকানা লিখুন', options: [], sortOrder: 12 },
        { fieldId: 'fld_alt_phone', formId, label: 'বিকল্প মোবাইল নম্বর (Alternate Phone)', fieldType: 'text', required: true, placeholder: 'বিকল্প যোগাযোগের নাম্বার', options: [], sortOrder: 13 },
        { fieldId: 'fld_tshirt', formId, label: 'টি-শার্ট সাইজ (T-shirt Size Guide)', fieldType: 'dropdown', required: true, placeholder: '', options: ['S', 'M', 'L', 'XL', 'XXL'], sortOrder: 14 },
        { fieldId: 'fld_guests', formId, label: 'অতিরিক্ত অতিথি সংখ্যা (Guests)', fieldType: 'dropdown', required: true, placeholder: '', options: ['0 (কোনো অতিথি নেই)', '1 (+৫০০ BDT)', '2 (+১০০০ BDT)', '3 (+১৫০০ BDT)'], sortOrder: 15 },
        { fieldId: 'fld_transport', formId, label: 'যাতায়াত মাধ্যম (Transport Mode)', fieldType: 'dropdown', required: true, placeholder: '', options: ['ব্যক্তিগত যাতায়াত', 'বিদ্যালয়ের বাস সার্ভিস', 'পাবলিক কমুট'], sortOrder: 16 },
        { fieldId: 'fld_trxid', formId, label: 'লেনদেন ট্রানজেকশন আইডি (Transaction ID)', fieldType: 'text', required: true, placeholder: 'উদাঃ 8K34JH9FS', options: [], sortOrder: 17 },
        { fieldId: 'fld_screenshot', formId, label: 'পেমেন্ট স্লিপ / স্ক্রিনশট রিসিভ আপলোড', fieldType: 'file', required: true, placeholder: '', options: [], sortOrder: 18 }
      ];

      for (const field of fields) {
        await setDoc(doc(db, 'form_fields', field.fieldId), field);
      }
    }

    console.log('Database verification and seeding checked successfully.');
  } catch (error) {
    console.error('Error of database seeding:', error);
  }
}
