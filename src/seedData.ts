/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Event, Notice, Gallery, Committee, Sponsor } from './types';

export const SEED_EVENTS: Event[] = [
  {
    eventId: 'event_1',
    title: 'Golden Jubilee Opening Ceremony (উদঘাটন অনুষ্ঠান)',
    description: 'Inauguration of the 50th-year celebration by national dignitaries, school flag hoisting, and memorial speeches by veterans.',
    eventDate: '2026-12-25 09:00 AM',
    location: 'School Main Playground (বিদ্যালয় প্রাঙ্গণ)'
  },
  {
    eventId: 'event_2',
    title: 'Grand Alumni Rally & Memory Lane (বর্ণাঢ্য র‍্যালি ও স্মৃতিচারণ)',
    description: 'A colorful parade of all batches, starting from the central gate, followed by batch-wise talk segments and sharing stories.',
    eventDate: '2026-12-25 02:00 PM',
    location: 'Town Square to Main Stage'
  },
  {
    eventId: 'event_3',
    title: 'Ex-Student Cultural Gala (পঁচাত্তর দশকের গান ও সাংস্কৃতিক সন্ধ্যা)',
    description: 'Musical performances, dance dramas, and recitations exclusively directed and performed by ex-students spanning 50 years.',
    eventDate: '2026-12-26 05:00 PM',
    location: 'Jubilee Stage Zone A'
  },
  {
    eventId: 'event_4',
    title: 'Gala Dinner & Certificate Handover (রাতের মহাভোজ ও প্রশংসাপত্র প্রদান)',
    description: 'A magnificent feast with traditional delicacies, followed by the electronic distribution of participation certificates.',
    eventDate: '2026-12-26 08:30 PM',
    location: 'Golden Jubilee Pavilion'
  }
];

export const SEED_NOTICES: Notice[] = [
  {
    noticeId: 'notice_1',
    title: 'Golden Jubilee Registration Open! (রেজিস্ট্রেশন শুরু হয়েছে)',
    description: 'We are thrilled to announce that the online registration for the 50th Golden Jubilee Celeberation of Janakalyan Model High School is officially live! Please complete the form and complete your secure deposit to secure your position.',
    publishDate: '2026-05-25'
  },
  {
    noticeId: 'notice_2',
    title: 'Last Date of Registration & Payment Submission Details',
    description: 'All alumni are requested to complete registrations and payment verifications by November 30, 2026. Custom T-shirts and commemorative gift boxes will be sorted based on batch registration sequences.',
    publishDate: '2026-05-30'
  },
  {
    noticeId: 'notice_3',
    title: 'Guidelines for T-shirt size selection and guest counts',
    description: 'Alumni can choose guest counts up to 3 inside the registration form. Selected guest entries require an additional fee verification. Please double-check your sizes before confirming submittals.',
    publishDate: '2026-05-31'
  }
];

export const SEED_COMMITTEE: Committee[] = [
  {
    memberId: 'member_1',
    name: 'Al-Haj Md. Abdul Quadir',
    designation: 'Convener (আহ্বায়ক), Golden Jubilee Committee',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    memberId: 'member_2',
    name: 'Professor Dr. Rahat Ara',
    designation: 'President & Batch of 1982 Representative',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    memberId: 'member_3',
    name: 'Md. Nazrul Islam',
    designation: 'General Secretary (সদস্য সচিব) & Headmaster',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  },
  {
    memberId: 'member_4',
    name: 'Farhana Chowdhury (Urmi)',
    designation: 'Treasurer & Cultural Events Coordinator',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  }
];

export const SEED_SPONSORS: Sponsor[] = [
  {
    sponsorId: 'sponsor_1',
    name: 'Janakalyan Alumni Trust',
    logo: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=150',
    website: 'https://janakalyan-alumni-trust.org'
  },
  {
    sponsorId: 'sponsor_2',
    name: 'Golden Jubilee Platinum Sponsor',
    logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=150',
    website: 'https://bengalfire.com'
  },
  {
    sponsorId: 'sponsor_3',
    name: 'United Telecom Group',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=150',
    website: 'https://unitedtel.net'
  }
];

export const SEED_GALLERY: Gallery[] = [
  {
    galleryId: 'gallery_1',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
    title: 'Vintage Main Assembly Hall (১৯৭৬)',
    category: 'Historic Campus'
  },
  {
    galleryId: 'gallery_2',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
    title: 'SSC Batch of 1988 Reunion Snaps',
    category: 'Reunions'
  },
  {
    galleryId: 'gallery_3',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600',
    title: 'First Prize Winners in Inter-School Debating',
    category: 'Old Memories'
  },
  {
    galleryId: 'gallery_4',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
    title: 'Golden Jubilee Preparatory Committee Meet',
    category: 'Golden Jubilee'
  }
];
