import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

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
      const stripeActor = actor as unknown as StripeActor;
      return stripeActor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
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

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ── useClaimAdminAccess ──────────────────────────────────────────────────────

export function useClaimAdminAccess() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (isFetching) {
        throw new Error("Still connecting. Please try again.");
      }
      if (!actor) {
        throw new Error("Backend unavailable. Refresh the page.");
      }
      const extActor = actor as unknown as StripeActor;
      await extActor._initializeAccessControlWithSecret("");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}
