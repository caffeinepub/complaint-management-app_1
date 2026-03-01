# Specification

## Summary
**Goal:** Build a full-featured bilingual (Hindi + English) PS Sadar Bazar Application Box for UP Police, enabling complaint submission, officer management, status tracking, and PDF receipt generation with official UP Police branding.

**Planned changes:**
- Display the uploaded UP Police logo (logo.png) on the login page header and navigation bar alongside the title "PS Sadar Bazar Application Box - UP Police"
- Implement Admin Login (ID + password) with a change password flow verified via simulated mobile OTP
- Implement User/Applicant Login (ID + password) redirecting to the complaint submission form
- Build a bilingual complaint submission form (Name, Father's Name, Address, Mobile Number, Complaint Detail) with PDF/JPG file attachment and camera capture support
- Auto-generate a unique complaint number (e.g., PSSB-2024-0001) on submission, display it on a confirmation screen, and store a simulated SMS notification record
- Build an Officer Management panel for admins to add officers (name + mobile) and assign them to complaints, with simulated SMS notification records
- Implement complaint status management (Pending → In Progress → Resolved) with resolution details, hearing date/time, and a full status history log
- Add an attendance/hearing record section on the complaint detail page to log officer attendance with date and time
- Generate a downloadable/printable PDF receipt per complaint including all applicant details, complaint number, status, officer info, hearing date/time, attached file reference, and UP Police branding
- Apply a government-official visual theme using deep navy, white, and saffron/gold colors with consistent bilingual labels throughout

**User-visible outcome:** Admins and applicants can log in, submit and manage complaints bilingually, track status updates, assign officers, record hearings, and download branded PDF receipts — all within a formal UP Police-themed interface.
