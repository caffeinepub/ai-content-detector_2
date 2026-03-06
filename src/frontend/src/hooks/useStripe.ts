import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isPermanentAdmin } from "../utils/permanentAdmin";
import { getSecretParameter } from "../utils/urlParams";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface ShoppingItem {
  name: string;
  price: number; // in cents
  quantity: number;
}

export interface StripeConfiguration {
  secretKey: string;
  allowedCountries: string[];
}

/**
 * Extended actor type that includes Stripe methods and admin control methods
 * not present in the generated backendInterface (added by the Stripe/ACL component).
 */
interface StripeActor {
  createCheckoutSession(
    items: ShoppingItem[],
    successUrl: string,
    cancelUrl: string,
  ): Promise<string>;
  isStripeConfigured(): Promise<boolean>;
  setStripeConfiguration(config: StripeConfiguration): Promise<void>;
  isCallerAdmin(): Promise<boolean>;
  _initializeAccessControlWithSecret(token: string): Promise<void>;
}

// ── useCreateCheckoutSession ─────────────────────────────────────────────────

interface CreateCheckoutSessionVars {
  items: ShoppingItem[];
  planId: string;
}

export function useCreateCheckoutSession() {
  const { actor, isFetching } = useActor();

  return useMutation<CheckoutSession, Error, CreateCheckoutSessionVars>({
    mutationFn: async ({ items, planId }) => {
      if (isFetching) {
        throw new Error(
          "Still connecting to the backend. Please try again in a moment.",
        );
      }
      if (!actor) {
        throw new Error(
          "Backend connection unavailable. Please refresh the page.",
        );
      }

      const stripeActor = actor as unknown as StripeActor;
      const baseUrl = window.location.origin + window.location.pathname;
      const successUrl = `${baseUrl}?payment=success&plan=${encodeURIComponent(planId)}`;
      const cancelUrl = `${baseUrl}?payment=cancel`;

      const raw = await stripeActor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );

      let session: CheckoutSession;
      try {
        session = JSON.parse(raw) as CheckoutSession;
      } catch {
        throw new Error(
          "Invalid response from payment server. Please try again.",
        );
      }

      if (!session.url) {
        throw new Error(
          "Payment session could not be created. Please try again.",
        );
      }

      return session;
    },
  });
}

// ── useIsStripeConfigured ────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const stripeActor = actor as unknown as StripeActor;
        return await stripeActor.isStripeConfigured();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    retry: false,
  });
}

// ── useSetStripeConfiguration ────────────────────────────────────────────────

export function useSetStripeConfiguration() {
  const { actor, isFetching } = useActor();

  return useMutation<void, Error, StripeConfiguration>({
    mutationFn: async (config) => {
      if (isFetching) {
        throw new Error(
          "Still connecting to the backend. Please try again in a moment.",
        );
      }
      if (!actor) {
        throw new Error(
          "Backend connection unavailable. Please refresh the page.",
        );
      }
      const stripeActor = actor as unknown as StripeActor;
      return stripeActor.setStripeConfiguration(config);
    },
  });
}

// ── useIsCallerAdmin ─────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();
  const alwaysAdmin = isPermanentAdmin(principalId);

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin", principalId],
    queryFn: async () => {
      if (alwaysAdmin) return true;
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        // Backend may trap "User is not registered" — treat as not admin
        return false;
      }
    },
    enabled: alwaysAdmin || (!!actor && !isFetching),
    staleTime: 60_000,
    retry: false,
    // Seed the cache immediately for permanent admins so there's no loading flash
    initialData: alwaysAdmin ? true : undefined,
  });
}

// ── useClaimAdminAccess ──────────────────────────────────────────────────────

/** Poll until actor is ready, up to maxAttempts × intervalMs */
async function waitForActor(
  getState: () => { actor: StripeActor | null; isFetching: boolean },
  maxAttempts = 5,
  intervalMs = 1500,
): Promise<StripeActor> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { actor, isFetching } = getState();
    if (actor && !isFetching) return actor as unknown as StripeActor;
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  throw new Error(
    "Backend is taking too long to connect. Please refresh the page and try again.",
  );
}

export function useClaimAdminAccess() {
  const actorState = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Keep a ref-like object so waitForActor can read the latest state
  const getState = () => ({
    actor: actorState.actor as unknown as StripeActor | null,
    isFetching: actorState.isFetching,
  });

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const principalId = identity?.getPrincipal().toString();
      // Permanent admins don't need to claim — they always have access
      if (isPermanentAdmin(principalId)) return;

      const extActor = await waitForActor(getState);

      // Use the URL/session token if available (same as actor init in useActor.ts)
      const token = getSecretParameter("caffeineAdminToken") ?? "";
      await extActor._initializeAccessControlWithSecret(token);

      // Verify that admin was actually granted
      let isAdmin = false;
      try {
        isAdmin = await extActor.isCallerAdmin();
      } catch {
        // Backend may trap if registration is still propagating — treat as false
        isAdmin = false;
      }

      if (!isAdmin) {
        throw new Error(
          "Admin access could not be granted. If another user has already claimed admin, use the URL token method.",
        );
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      void queryClient.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}
