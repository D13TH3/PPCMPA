# Test Report Issue Flow for Public Users

## Step 1: Login as Public User
- Go to `/login`
- Use credentials: `public@example.com` / `demo`
- Should redirect to `/dashboard`

## Step 2: Dashboard View (Public Role)
- Should see welcome message: "Welcome, Maria Clara"
- Should see 3 stat cards (Total Reports, Pending Review, Protected Areas)
- Should see 4 action cards:
  1. View Map → `/dashboard/map-viewer`
  2. **Report Environmental Issue** → `/dashboard/report-issue` ⭐
  3. My Reports → `/dashboard/my-reports`
  4. How to Report (info card)

## Step 3: Navigate to Report Issue
**Method 1: Dashboard Card**
- Click the "Report Environmental Issue" card (entire card is clickable)
- Should navigate to `/dashboard/report-issue`

**Method 2: Sidebar Menu**
- Click "Report Issue" in the left sidebar navigation
- Should navigate to `/dashboard/report-issue`

**Method 3: Mobile Menu**
- Click hamburger menu (☰) on mobile
- Click "Report Issue" in the drawer
- Should navigate to `/dashboard/report-issue`

## Step 4: Report Issue Page
Should display:
- ✅ Back button → "Back to Map"
- ✅ Page title: "Report Environmental Issue"
- ✅ Blue info alert
- ✅ Form with fields:
  - Issue Type dropdown (required)
  - Title input (required)
  - Description textarea (required)
  - Location input (optional)
  - Photo upload button
  - Submit button (green)
  - Cancel button
- ✅ Map selector on the right
- ✅ Mobile: Sticky submit button at bottom

## Step 5: Fill Form
1. Select "Illegal Fishing" from Issue Type
2. Enter title: "Test Report"
3. Enter description: "This is a test environmental report"
4. Click Submit

## Step 6: After Submit
- Should show success toast with tracking ID
- Should navigate to `/dashboard/my-reports`
- Should see the new report in the list

## Common Issues to Check

### Issue: Clicking doesn't navigate
**Check:**
- Browser console for errors
- Network tab for failed requests
- React Router version compatibility

### Issue: Page shows blank
**Check:**
- Component is rendering (React DevTools)
- CSS issues hiding content
- Z-index layering problems

### Issue: Form doesn't submit
**Check:**
- Form validation errors
- LocalStorage is enabled
- Toast notifications appearing

### Issue: Access Denied
**Check:**
- User is logged in
- User has 'public' role
- ProtectedRoute allows public users
- hasPermission function logic

## Route Configuration
```
/dashboard (ProtectedRoute - any authenticated user)
  ├─ / → Dashboard component
  ├─ /map-viewer (ProtectedRoute - requiredRole: public)
  ├─ /report-issue (ProtectedRoute - requiredRole: public) ⭐
  └─ /my-reports (ProtectedRoute - requiredRole: public)
```

## Current Implementation Status
- ✅ Route registered: `/dashboard/report-issue`
- ✅ Protected with requiredRole: 'public'
- ✅ Component exported: `export default function ReportIssue()`
- ✅ Component imported in routes.tsx
- ✅ Navigation menu item added
- ✅ Dashboard card with onClick handler
- ✅ Form with all required fields
- ✅ Submit handler saves to localStorage
- ✅ Success navigation to My Reports
