# Report Issue Layout Fix

## Problem
The Report Issue form was appearing layered incorrectly, potentially under the map or with layout issues.

## Solution Implemented

### 1. Proper Page Container Structure
**Before:**
```tsx
<div className="space-y-6">
  {/* Content */}
</div>
```

**After:**
```tsx
<div className="relative z-10 w-full">
  <div className="mx-auto max-w-7xl">
    {/* Content */}
  </div>
</div>
```

**Changes:**
- Added `relative` positioning to establish stacking context
- Added `z-10` to ensure page stays above map elements (z-0 to z-9)
- Added `w-full` to ensure full width within RootLayout
- Added `max-w-7xl` centered container for proper desktop layout
- Removed conflicting padding (RootLayout already provides padding)

### 2. Header Structure
**Before:**
```tsx
<div>
  <Button>Back to Map</Button>
  <h2>Report Environmental Issue</h2>
  <p>Help protect...</p>
</div>
```

**After:**
```tsx
<div className="mb-6">
  <Button className="mb-3">Back to Map Viewer</Button>
  <h1>Report Environmental Issue</h1>
  <p className="mt-2">Help protect...</p>
</div>
```

**Changes:**
- Proper semantic HTML (`h1` instead of `h2`)
- Added spacing classes for consistent layout
- Clear visual hierarchy

### 3. Map Container Constraints
**Before:**
```tsx
<div className="h-[400px] lg:h-[500px] overflow-hidden rounded-lg border border-gray-200 shadow-sm">
  <SimpleMapView />
</div>
```

**After:**
```tsx
<div className="relative h-[400px] lg:h-[500px] overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-100">
  <SimpleMapView />
</div>
```

**Changes:**
- Added `relative` positioning to contain the map
- Added `bg-gray-100` background for loading state
- Ensures map stays within its container bounds

### 4. Mobile Sticky Button Z-Index
**Before:**
```tsx
<div className="... z-30">
```

**After:**
```tsx
<div className="... z-50">
```

**Changes:**
- Increased z-index from 30 to 50 to ensure it stays above all map elements
- Ensures mobile submit button is always accessible

## Z-Index Layering System

Following the documented hierarchy:
- **Layer 0-9**: Map elements (tiles, polygons, markers)
- **Layer 10-19**: Map controls and legends
- **Layer 20-29**: Floating UI elements
- **Layer 30-39**: Navigation headers
- **Layer 50+**: Modals, dialogs, overlays

**Report Issue Page:**
- Main container: `z-10` (above all map elements)
- Mobile sticky button: `z-50` (modal/overlay layer)

## Layout Flow

```
RootLayout (provides sidebar + header)
  └─ main.flex-1.p-4.md:p-6.lg:p-8
      └─ <Outlet /> renders:
          └─ ReportIssue page
              ├─ Container (z-10, max-w-7xl, centered)
              │   ├─ Header with Back Button
              │   ├─ Info Alert
              │   └─ Grid Layout (2 columns on desktop)
              │       ├─ Form Card (left)
              │       └─ Map Card (right, constrained)
              └─ Mobile Sticky Submit (z-50, fixed bottom)
```

## Page Rendering

1. **Desktop View:**
   - Full RootLayout with sidebar
   - Content centered with max-width
   - Two-column grid (form left, map right)
   - Form and map are side-by-side

2. **Mobile View:**
   - Hamburger menu for navigation
   - Single column layout (form stacks above map)
   - Sticky submit button at bottom
   - Full-width responsive design

## Testing Checklist

- [x] Page renders without map overlap
- [x] Form is centered on desktop
- [x] Form is full-width on mobile
- [x] Back button navigates to Map Viewer
- [x] Submit button is accessible
- [x] Mobile sticky button stays above content
- [x] Map is contained within its card
- [x] No z-index conflicts
- [x] Proper semantic HTML structure
- [x] Responsive breakpoints work correctly

## Result

The Report Issue page now:
✅ Renders as a full, independent page
✅ Is properly centered with max-width container
✅ Has no map overlap issues
✅ Follows the z-index layering system
✅ Works correctly in both desktop and mobile views
✅ Integrates seamlessly with RootLayout navigation
