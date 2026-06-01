# Security Specification - Janakalyan Model High School Golden Jubilee

This document defines the Attribute-Based Access Control (ABAC) invariants, the "Dirty Dozen" rogue payloads, and the security guidelines for Cloud Firestore security rules.

## 1. Security Invariants

1. **Self-Only Profile Edits**: Alumnus profiles under `users/{userId}` can only be read/written by the matching authenticated user, or by an Admin/Super Admin. Users cannot modify their own `role` or self-escalate privileges.
2. **Registration Safety**: Registrations under `registrations/{registrationId}` belong to specific users. Only the owner can view or submit their registration. Once the status becomes "approved" or "rejected", it becomes a terminal state that only Admins can override.
3. **Transaction Rigor**: Payments on `payments/{paymentId}` cannot be edited by the user once created, preventing tampering of Transaction IDs (TrxId). Only Admins can execute approval/status switches.
4. **General Public Readability**: Public content such as `events`, `notices`, `gallery`, `committee`, and `sponsors` can be read by anyone (including anonymous/unregistered visitors). Writes to these collections are strictly restricted to verified Admins or Super Admins.
5. **Certificate Exclusivity**: Certificates under `certificates/{certificateId}` can only be fetched by the alumnus whose `userId` matches the token, or by Admins. They can only be generated/updated by Admins.

---

## 2. The "Dirty Dozen" Rogue Payloads 

Here are twelve specific malicious payloads designed to bypass our security system, which our rule set strictly blocks:

1. **User Role Spoofing**: An authenticated user registering under `/users/attackerId` trying to pass `role: "Super Admin"`. Blocked by verifying input fields and denying self-role writes.
2. **Ghost-Field Injection**: Creating a registration while injecting a secret field `isVipAlumni: true`. Protected via `keys().hasOnly()` or complete schemas.
3. **Ghost-ID Registration Override**: Submitting a registration under registration ID `admin_override` to hijack an admin control path. Checked by limiting document ID sizes and characters.
4. **Other User's Profile Read**: Trying to read `/users/victimUserId` as `attackerUserId`. Blocked by `request.auth.uid == userId`.
5. **Notice Spoofing**: Attempting to post a fake notification on `/notices/fake_news` as a logged-in alumnus. Checked by `isAdmin()`.
6. **Alumni Overriding Approved Registrations**: Attempting to set an approved registration back to "pending" to retry a submission. Locked by terminal state checks.
7. **Ad-Hoc Sponsor Injector**: Trying to post a spam link on `/sponsors/scam_site` without any auth. Checked by requiring `isSignedIn() && isAdmin()`.
8. **Tampering with Payment Amounts**: Modifying the amount of a transaction from `5000` to `50` inside `/payments/xxxx` after approval. Blocked by locking payments from user-updates.
9. **Certificate Counterfeit**: Generating a certificate under `/certificates/fake_cert` with attacker's user ID. Blocked by restricting coupon/certificate creation to Admins.
10. **Admin list infiltration**: Writing to the `/admins/{userId}` node (if exists) or claiming admin rights by path tampering. Verified through explicit admin-only exists gates.
11. **Negative Payment Amount**: Registering a payment with `amount: -100` to exploit system integers. Defended by numerical size/value limits on input values.
12. **Null/Missing Email In User Registrations**: Bypassing primary verification by submitting a blank contact email. Protected by strict field type checking.
