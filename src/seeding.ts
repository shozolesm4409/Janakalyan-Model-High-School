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

    console.log('Database verification and seeding checked successfully.');
  } catch (error) {
    console.error('Error of database seeding:', error);
  }
}
