# Report Flow Integration - Complete Documentation

## ✅ SYSTEM STATUS: FULLY INTEGRATED

The Puerto Princesa MPA System now has a **complete, end-to-end report flow** from Public submission through Staff verification to Admin approval.

---

## 🔄 COMPLETE DATA FLOW

### Phase 1: Public Submission
**Location:** `/dashboard/report-issue` (Public User only)

**Action:** User fills form and submits report

**Data Created:**
```json
{
  "id": "RPT-1714662000000",
  "category": "Illegal Fishing",
  "title": "Report title",
  "description": "Report description",
  "location": "Location details",
  "status": "Submitted",
  "verificationStatus": "new",
  "submittedBy": "Public User Name",
  "submittedAt": "2026-05-02T10:30:00Z"
}
```

**Storage:** `localStorage.citizen_reports`

**User Can See:** In "My Reports" with status "Submitted" (blue badge)

---

### Phase 2: Staff Verification
**Location:** `/dashboard/incoming-reports` (Staff User only)

**Who Can Access:** Staff role only

**What Staff Sees:**
- All public-submitted reports
- Filter tabs: New / Under Review / Verified / Flagged
- Search by title, category, submitter
- Report cards with all details

**Staff Actions:**
1. **Click report card** → Opens Report Verification Panel (modal)
2. **Review report details**
3. **Add Staff Notes** (optional text)
4. **Choose action:**
   - **Mark Valid** → `verificationStatus: "verified"` → Sends to Admin
   - **Mark Invalid** → `verificationStatus: "flagged"` → Dead end (not sent to Admin)
   - **Send to Admin Review** → `verificationStatus: "under_review"` → Sends to Admin

**Data Updated:**
```json
{
  "verificationStatus": "verified",
  "status": "Verified",
  "staffNotes": "Verified. Location matches known fishing area."
}
```

**User Can See:** In "My Reports" with status "Verified by Staff" (green badge) + staff notes visible

---

### Phase 3: Admin Approval
**Location:** `/dashboard/admin-approvals` → **Citizen Reports** tab (Admin only)

**Who Can Access:** Admin role only

**What Admin Sees:**
- **Verified** tab: Reports verified by Staff (awaiting admin decision)
- **Approved** tab: Reports admin has approved
- **Rejected** tab: Reports admin has rejected

**Admin Actions on Verified Reports:**
1. **Click "View Details"** → Opens full report modal
2. **Review:**
   - Report details
   - Staff notes
   - All original information
3. **Add Admin Notes** (optional text for final decision)
4. **Choose action:**
   - **Approve** → `verificationStatus: "approved"` → Final success
   - **Reject** → `verificationStatus: "rejected"` + admin notes → Final rejection

**Data Updated (Approval):**
```json
{
  "verificationStatus": "approved",
  "status": "Approved",
  "adminNotes": "Report approved. Forwarding to enforcement team.",
  "reviewedByAdmin": "Admin Name",
  "reviewedAtAdmin": "2026-05-02T14:00:00Z"
}
```

**Data Updated (Rejection):**
```json
{
  "verificationStatus": "rejected",
  "status": "Rejected",
  "adminNotes": "Insufficient evidence. Please resubmit with photos.",
  "reviewedByAdmin": "Admin Name",
  "reviewedAtAdmin": "2026-05-02T14:00:00Z"
}
```

**User Can See:** In "My Reports" with status "Approved" (emerald badge) or "Rejected" (red badge) + admin notes visible

---

## 🗂️ STATUS PROGRESSION TABLE

| Stage | Status Field | verificationStatus | Who Can See | Visible To Public User |
|-------|--------------|-------------------|-------------|------------------------|
| **Initial Submit** | "Submitted" | "new" | Staff (New tab) | ✅ "Submitted" |
| **Staff: Send to Review** | "Under Review" | "under_review" | Admin (Verified tab) | ✅ "Under Review" + staff notes |
| **Staff: Mark Valid** | "Verified" | "verified" | Admin (Verified tab) | ✅ "Verified by Staff" + staff notes |
| **Staff: Mark Invalid** | "Flagged" | "flagged" | Staff only (Flagged tab) | ✅ "Flagged" + staff notes |
| **Admin: Approve** | "Approved" | "approved" | Admin (Approved tab) | ✅ "Approved" + admin notes |
| **Admin: Reject** | "Rejected" | "rejected" | Admin (Rejected tab) | ✅ "Rejected" + admin notes |

---

## 📋 FILE LOCATIONS

### Public User Pages:
- **Report Issue:** `/src/app/pages/ReportIssue.tsx` ✅
- **My Reports:** `/src/app/pages/MyReports.tsx` ✅ (Updated to show verification status)

### Staff Pages:
- **Incoming Reports:** `/src/app/pages/IncomingReports.tsx` ✅
- **Staff Dashboard:** `/src/app/pages/Dashboard.tsx` ✅ (Shows Incoming Reports card)

### Admin Pages:
- **Admin Approvals:** `/src/app/pages/AdminApprovals.tsx` ✅ (Has Citizen Reports tab)
- **Admin Dashboard:** `/src/app/pages/Dashboard.tsx` ✅

### Routes:
- `/src/app/routes.tsx` ✅ (All routes configured with proper role protection)

### Navigation:
- `/src/app/layouts/RootLayout.tsx` ✅ (Incoming Reports in Staff nav, Approvals in Admin nav)

---

## 🎯 VERIFIED INTEGRATION POINTS

### ✅ 1. Public Report Submission
- [x] Form creates report with `verificationStatus: "new"`
- [x] Saves to `localStorage.citizen_reports`
- [x] Navigates to My Reports after submission
- [x] Shows success toast with tracking ID

### ✅ 2. Staff Can Access Reports
- [x] Incoming Reports page loads from `citizen_reports`
- [x] Shows all public submissions
- [x] Filter tabs work (New, Under Review, Verified, Flagged)
- [x] Search functionality works

### ✅ 3. Staff Can Verify Reports
- [x] Click report opens verification modal
- [x] Can add staff notes
- [x] Can mark Valid/Invalid/Send to Admin Review
- [x] Updates `verificationStatus` and `status`
- [x] Saves staff notes to report

### ✅ 4. Admin Can Access Verified Reports
- [x] Admin Approvals has "Citizen Reports" tab
- [x] Loads reports from `citizen_reports`
- [x] Shows only verified/under_review reports in "Verified" tab
- [x] Shows approved reports in "Approved" tab
- [x] Shows rejected reports in "Rejected" tab

### ✅ 5. Admin Can Approve/Reject Reports
- [x] Click report opens review modal
- [x] Can add admin notes
- [x] Can approve or reject
- [x] Updates `verificationStatus` to "approved" or "rejected"
- [x] Records admin name and timestamp

### ✅ 6. Public User Can See Progress
- [x] My Reports shows verification status
- [x] Displays staff notes when present
- [x] Displays admin notes when present
- [x] Shows status message for each verification stage
- [x] Color-coded badges for each status

---

## 🚀 EXPORT FUNCTIONALITY

### Admin Export Options:
Located in `/dashboard/admin-approvals`

1. **Export Verified Reports** (CSV)
   - Exports all verified citizen reports
   - Includes: ID, Title, Category, Location, Status, Submitted By, Submitted Date, Staff Notes

2. **Export Approvals** (CSV)
   - Exports all staff request approvals
   - Includes: Request ID, Action, Category, Status, Submitted By, Reviewed By, etc.

---

## 🧪 TESTING THE FLOW

### Test Scenario 1: Happy Path (Public → Staff → Admin → Approved)

1. **As Public User:**
   - Login: `public@example.com` / `demo`
   - Navigate to "Report Issue"
   - Fill form: Category = "Illegal Fishing", Title = "Test Report", Description = "Test"
   - Submit
   - Check "My Reports" → Should show "Submitted" badge

2. **As Staff User:**
   - Login: `staff@puertoprincesampa.gov` / `demo`
   - Navigate to "Incoming Reports"
   - Click "New" tab → Should see the test report
   - Click report card → Opens verification modal
   - Add staff notes: "Verified location"
   - Click "Mark Valid"
   - Confirm action
   - Report should move to "Verified" tab

3. **As Admin User:**
   - Login: `admin@puertoprincesampa.gov` / `demo`
   - Navigate to "Approvals"
   - Click "Citizen Reports" tab
   - Click "Verified" sub-tab → Should see the test report
   - Click "View Details" or "Approve" button
   - Add admin notes: "Approved for enforcement"
   - Click "Approve"
   - Report should move to "Approved" tab

4. **Back to Public User:**
   - Login: `public@example.com` / `demo`
   - Navigate to "My Reports"
   - Should see report with "Approved" badge (emerald green)
   - Should see staff notes and admin notes

---

### Test Scenario 2: Rejection Path (Public → Staff → Flagged)

1. **As Public User:**
   - Submit a report

2. **As Staff User:**
   - View in "Incoming Reports"
   - Click report
   - Add staff notes: "Insufficient evidence"
   - Click "Mark Invalid"
   - Report moves to "Flagged" tab
   - Does NOT appear in Admin's view

3. **As Public User:**
   - Check "My Reports"
   - Should see "Flagged" badge (orange)
   - Should see staff notes explaining why

---

### Test Scenario 3: Admin Rejection (Public → Staff → Admin → Rejected)

1. **As Public User:**
   - Submit report

2. **As Staff User:**
   - Mark Valid or Send to Admin Review

3. **As Admin User:**
   - View in "Citizen Reports" → "Verified" tab
   - Click "Reject"
   - Add admin notes: "Duplicate report"
   - Confirm rejection
   - Report moves to "Rejected" tab

4. **As Public User:**
   - Check "My Reports"
   - Should see "Rejected" badge (red)
   - Should see admin notes

---

## 📊 DATA SEPARATION

### Clear Separation Maintained:

1. **Citizen Reports** (`citizen_reports`)
   - Submitted by Public users
   - Verified by Staff
   - Approved/Rejected by Admin
   - Visible in:
     - Public: My Reports
     - Staff: Incoming Reports
     - Admin: Citizen Reports tab

2. **Field Incident Logs** (`field_incidents`)
   - Created by Staff users
   - NOT mixed with citizen reports
   - Separate workflow
   - Visible in:
     - Staff: Field Incident Log page

3. **Staff MPA Requests** (`pending_requests`)
   - Create/Update/Delete MPA requests by Staff
   - Approved/Rejected by Admin
   - Visible in:
     - Admin: Staff Requests tab (in Approvals)

---

## ✅ INTEGRATION COMPLETE

All components are properly integrated:
- ✅ Public users can submit reports
- ✅ Staff can review and verify reports
- ✅ Admin can approve or reject verified reports
- ✅ Public users can see the entire journey in My Reports
- ✅ Data flows correctly through all stages
- ✅ Each role sees only what they should see
- ✅ No mixing of citizen reports with staff incident logs
- ✅ Export functionality available for admins

**Status:** 🟢 FULLY FUNCTIONAL

**Last Updated:** May 2, 2026
