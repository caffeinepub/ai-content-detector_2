# AI Content Detector

## Current State

- Full SaaS app with Text/Image/Document analysis, Dashboard, Plans page, and API page.
- Plans page (`PlansPage.tsx`) shows Free ($0), Pro ($19/mo), Team ($79/mo) tiers.
- Plan upgrades are simulated: clicking "Upgrade to Pro" just sets a localStorage flag with a toast saying "Demo mode — no payment required".
- No real payment processing exists. Plan state is stored in localStorage only.
- Backend (`backend.d.ts`) has user profile, scan history, roles, and daily quota APIs but no subscription/payment APIs.

## Requested Changes (Diff)

### Add
- Stripe payment integration component (via Caffeine `stripe` component).
- Backend subscription management: store user subscription tier (free/pro/team), Stripe customer ID, and subscription status.
- `getUserSubscription` and `setUserSubscription` backend APIs.
- A Stripe checkout flow triggered from the Plans page when user clicks "Upgrade to Pro" or "Upgrade to Team".
- A payment success/cancel redirect handler that updates the user's plan in the backend.
- A "Manage Subscription" / "Cancel Plan" button for Pro and Team plan holders.
- Display active subscription status badge on Plans page (live from backend).

### Modify
- `PlansPage.tsx`: Replace the mock `handleUpgrade` with real Stripe checkout calls. Show a loading state during checkout redirect. Show "Manage Subscription" for active paid plans.
- `App.tsx`: Load plan from backend subscription state (not just localStorage) when authenticated. Keep localStorage as fallback for anonymous/unauthenticated users.
- Backend: Add subscription record storage keyed by principal. Expose methods to get and set subscription tier.

### Remove
- The "(Demo mode — no payment required)" toast message.
- localStorage-only plan management for authenticated users.

## Implementation Plan

1. Select Stripe Caffeine component.
2. Regenerate Motoko backend with subscription management: store `SubscriptionRecord` (tier, stripeCustomerId, status, updatedAt) keyed by principal. Expose `getUserSubscription`, `setUserSubscription` query/update methods.
3. Update frontend:
   - Add `useUserSubscription` and `useSetUserSubscription` hooks.
   - Wire Stripe checkout on "Upgrade" button clicks using the Stripe component's `createCheckoutSession` utility.
   - On successful return from Stripe (URL param `?payment=success`), call `setUserSubscription` to persist new plan tier.
   - On Plans page, show real subscription badge and "Manage Subscription" button for paid plans.
   - In `App.tsx`, initialize plan from backend subscription when authenticated, fall back to localStorage for anonymous users.
