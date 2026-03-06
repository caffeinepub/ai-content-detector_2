# AI Content Detector

## Current State
The app has 4 pages: Dashboard, Analyze, Plans, API. The Analyze page contains TextAnalyzer, ImageAnalyzer, and DocumentAnalyzer components. When the backend actor is unavailable, error messages in these analyzers show "Backend connection unavailable. Please refresh the page." as plain text -- no actionable navigation button. There is no user profile/information page.

The `backend.d.ts` exposes:
- `getCallerUserProfile()` → `UserProfile | null`
- `saveCallerUserProfile(profile)` → void
- `getCallerUserRole()` → `UserRole`
- `isCallerAdmin()` → boolean
- `getHistory(userId)` → `ScanRecord[]`
- `getDailyCount(userId)` → bigint

## Requested Changes (Diff)

### Add
- New `ProfilePage` component (`src/frontend/src/components/ProfilePage.tsx`) showing:
  - User's Internet Identity principal (full + truncated copy button)
  - Display name (editable via `saveCallerUserProfile`)
  - Current plan badge (Free/Pro/Team)
  - User role badge (admin/user/guest)
  - Total scans count (derived from history length)
  - Daily scans used today (from `getDailyCount`)
  - Account created indicator
  - Scan quota usage bar
  - Sign out button
- New `"profile"` page type added to `Page` union in `TopNav.tsx`
- Profile nav link in the top nav (desktop + mobile dropdown)
- User avatar in nav dropdown now has a "My Profile" menu item navigating to `"profile"` page
- In `App.tsx`: render `ProfilePage` when `page === "profile"`, pass required props (identity, plan, isAuthenticated, onLogout, onNavigatePlans)
- `useProfile` hook in `useQueries.ts` to fetch `getCallerUserProfile()` and `getCallerUserRole()` and `isCallerAdmin()`

### Modify
- `TextAnalyzer`, `ImageAnalyzer`, `DocumentAnalyzer`: when the error message is "Backend connection unavailable. Please refresh the page.", show an additional "Go to Profile" button next to the error that navigates to the profile page. Add `onNavigateProfile?: () => void` prop to each analyzer.
- `AnalyzePage`: accept and forward `onNavigateProfile` prop to the three analyzers.
- `App.tsx`: pass `onNavigateProfile={() => setPage("profile")}` to `AnalyzePage`.
- `TopNav`: add `"profile"` to `Page` type; add Profile link in nav and in user dropdown.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `"profile"` to the `Page` type in `TopNav.tsx`
2. Add Profile nav entry in desktop nav and mobile dropdown in `TopNav.tsx`; add "My Profile" item in user dropdown menu
3. Create `ProfilePage.tsx` with user info display (principal, name edit, plan, role, scan stats, quota bar, sign out)
4. Add `useProfile` query hook in `useQueries.ts` using `getCallerUserProfile`, `getCallerUserRole`, `isCallerAdmin`
5. Update `TextAnalyzer`, `ImageAnalyzer`, `DocumentAnalyzer` to accept `onNavigateProfile` prop and show a "Go to Profile" button alongside the backend-unavailable error
6. Update `AnalyzePage` to accept and pass `onNavigateProfile`
7. Update `App.tsx`: add profile page render, pass `onNavigateProfile` to `AnalyzePage`, pass required props to `ProfilePage`
