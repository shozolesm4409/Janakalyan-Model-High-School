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
    const formsCol = collection(db, 'forms');
    const formsSnap = await getDocs(formsCol);
    if (formsSnap.empty) {
      console.log('Seeding initial custom forms...');
      const formId = 'golden_jubilee_reg';
      await setDoc(doc(db, 'forms', formId), {
        formId,
        title: 'সুবর্ণ জয়ন্তী নিবন্ধন ফরম (Registration Panel)',
        slug: 'golden-jubilee-reg',
        description: 'সুবর্ণ জয়ন্তী ৫০ বছর পূর্তি উৎসবের মহাসম্মেলনে আপনার উপস্থিতি নিশ্চিত করতে নিচের ফরমটি পূরণ করুন।',
        status: 'active',
        createdBy: 'System Seed',
        createdAt: new Date().toISOString(),
        permission: 'login_required',
        registerNowActive: true
      });

      console.log('Seeding initial custom form fields...');
      const fields = [
        {
          fieldId: 'fld_name',
          formId,
          label: 'আবেদনকারীর নাম (Alumni/User Name)',
          fieldType: 'text',
          required: true,
          placeholder: 'আপনার নাম লিখুন',
          options: [],
          sortOrder: 1
        },
        {
          fieldId: 'fld_date',
          formId,
          label: 'তারিখ (Date)',
          fieldType: 'date',
          required: false,
          placeholder: '',
          options: [],
          sortOrder: 2
        },
        {
          fieldId: 'fld_location',
          formId,
          label: 'লোকেশন বা ঠিকানা (Location)',
          fieldType: 'address',
          required: true,
          placeholder: 'আপনার বর্তমান লোকেশন বা ঠিকানা',
          options: [],
          sortOrder: 3
        },
        {
          fieldId: 'fld_abc',
          formId,
          label: 'অপশন নির্বাচন করুন (ABC Dropdown Option)',
          fieldType: 'dropdown',
          required: true,
          placeholder: 'একটি অপশন নির্বাচন করুন',
          options: ['Option A', 'Option B', 'Option C'],
          sortOrder: 4
        },
        {
          fieldId: 'fld_attachment',
          formId,
          label: 'সংযুক্তি (Upload Proof/Document)',
          fieldType: 'file',
          required: true,
          placeholder: '',
          options: [],
          sortOrder: 5
        }
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
