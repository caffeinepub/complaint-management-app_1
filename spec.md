# Specification

## Summary
**Goal:** Add a status update feature with progress/resolution detail notes to the complaint management system, allowing admins to log status changes with remarks and view the full status history.

**Planned changes:**
- Extend the complaint data model to include a `statusLog` array, where each entry stores `status`, `updatedAt`, `updatedBy`, and `details`
- Add a new backend function `updateComplaintStatus(complaintNumber, newStatus, updatedBy, details)` that appends to `statusLog` and updates the complaint's current status
- Update migration to add an empty `statusLog` array to all existing complaint records
- On the Complaint Detail page (admin-only), add an "Update Status" form with a Status dropdown (Pending, In Progress, Resolved), an "Updated By" text field, and a "Details / Remarks" textarea
- After form submission, refresh the complaint data and reflect the updated status badge
- Below the form, display a status log history table (Status, Updated By, Date & Time, Details) ordered from newest to oldest, visible to admins only

**User-visible outcome:** Admin users can update a complaint's status with progress or resolution notes, and view the full history of all status changes with details on the Complaint Detail page.
