/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Super Admin' | 'Admin' | 'Alumni/User';

export interface User {
  uid: string;
  name: string;
  email: string;
  mobile?: string;
  batch?: string;
  role: UserRole;
  profilePhoto?: string;
  createdAt?: string;
}

export interface PersonalInfo {
  fatherName?: string;
  motherName?: string;
  gender?: string;
  bloodGroup?: string;
  dob?: string;
}

export interface AcademicInfo {
  passingYear?: string;
  roll?: string;
  section?: string;
  currentOccupation?: string;
}

export interface ContactInfo {
  presentAddress?: string;
  permanentAddress?: string;
  alternateMobile?: string;
}

export interface ParticipationInfo {
  guestCount?: number;
  tshirtSize?: string;
  transportChoice?: string;
}

export interface Registration {
  registrationId: string;
  userId: string;
  personalInfo: PersonalInfo;
  academicInfo: AcademicInfo;
  contactInfo: ContactInfo;
  participationInfo: ParticipationInfo;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Payment {
  paymentId: string;
  registrationId: string;
  userId: string;
  amount: number;
  trxId: string;
  paymentProof?: string; // Base64 image
  paymentStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Event {
  eventId: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
}

export interface Notice {
  noticeId: string;
  title: string;
  description: string;
  publishDate: string;
}

export interface Gallery {
  galleryId: string;
  image: string; // Base-64 or URL
  title: string;
  category: string;
}

export interface Certificate {
  certificateId: string;
  userId: string;
  userName: string;
  batch: string;
  registrationId: string;
  generatedDate: string;
}

export interface Committee {
  memberId: string;
  name: string;
  designation: string;
  photo?: string;
  remark?: string;
}

export interface Sponsor {
  sponsorId: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface AppFormSubmission {
  submissionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  formType: 'id_card' | 'mentorship' | 'magazine';
  formLabel: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  data: Record<string, any>;
}

export interface CustomForm {
  formId: string;
  title: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  successMessage?: string;
  redirectUrl?: string;
  permission: 'public' | 'login_required' | 'batch_restricted';
  restrictedBatch?: string;
  registerNowActive?: boolean;
  showRulesWidget?: boolean;
  rulesIntro?: string;
  rulesItems?: string[];
  paymentNumber?: string;
  paymentInstructions?: string;
  submitBtnText?: string;
  totalSteps?: number;
}

export interface CustomFormField {
  fieldId: string;
  formId: string;
  label: string;
  fieldType: 'text' | 'textarea' | 'number' | 'email' | 'mobile' | 'password' | 'dropdown' | 'radio' | 'checkbox' | 'date' | 'time' | 'datetime' | 'address' | 'signature' | 'rating' | 'url' | 'color' | 'file';
  required: boolean;
  placeholder: string;
  options: string[];
  sortOrder: number;
}

export interface CustomFormSubmission {
  submissionId: string;
  formId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  data: Record<string, any>;
}
