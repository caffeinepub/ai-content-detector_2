import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Loader2,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useIsCallerAdmin,
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useStripe";

export function StripeSetupPanel() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isConfigured, refetch: refetchConfigured } =
    useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [expanded, setExpanded] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,CA,GB,AU,DE,FR,NL,SE");
  const [saved, setSaved] = useState(false);

  // Don't render for non-admins or while loading
  if (adminLoading || !isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error("Please enter a Stripe Secret Key");
      return;
    }
    if (!secretKey.startsWith("sk_")) {
      toast.error("Secret key must start with sk_live_ or sk_test_");
      return;
    }

    const allowedCountries = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    try {
      await setConfig.mutateAsync({ secretKey, allowedCountries });
      toast.success("Stripe configuration saved successfully");
      setSaved(true);
      setExpanded(false);
      setSecretKey("");
      void refetchConfigured();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save Stripe configuration",
      );
    }
  };

  return (
    <div
      data-ocid="plans.stripe_setup.panel"
      className={cn(
        "rounded-2xl border bg-card overflow-hidden transition-all",
        isConfigured
          ? "border-border"
          : "border-amber-400/40 bg-amber-50/30 dark:bg-amber-950/10",
      )}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
              isConfigured || saved
                ? "bg-human-score-bg"
                : "bg-amber-100 dark:bg-amber-900/30",
            )}
          >
            {isConfigured || saved ? (
              <CheckCircle2 className="h-4 w-4 text-human-score" />
            ) : (
              <Settings2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isConfigured || saved
                ? "Stripe Payments Configured"
                : "Configure Stripe Payments"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isConfigured || saved
                ? "Payment processing is active. Update your key below."
                : "Admin: connect Stripe to enable paid plan upgrades"}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expandable form */}
      {expanded && (
        <div className="border-t border-border p-4">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="stripe-secret-key"
                className="text-sm font-medium text-foreground"
              >
                <KeyRound className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                Stripe Secret Key
              </Label>
              <Input
                id="stripe-secret-key"
                data-ocid="plans.stripe_setup.secret_key.input"
                type="password"
                placeholder="sk_live_... or sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="font-mono text-sm"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Found in your{" "}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:underline"
                >
                  Stripe Dashboard → API Keys
                </a>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="stripe-countries"
                className="text-sm font-medium text-foreground"
              >
                Allowed Countries
              </Label>
              <Input
                id="stripe-countries"
                data-ocid="plans.stripe_setup.countries.input"
                type="text"
                placeholder="US,CA,GB,AU,DE,FR"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated ISO country codes for Stripe checkout
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                data-ocid="plans.stripe_setup.submit_button"
                type="submit"
                disabled={setConfig.isPending}
                className="bg-teal text-primary-foreground hover:bg-teal/90 font-semibold"
              >
                {setConfig.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setExpanded(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Banner shown when Stripe is not configured (non-admin view) ──────────────

export function StripeNotConfiguredBanner() {
  return (
    <Alert
      data-ocid="plans.stripe_not_configured.error_state"
      className="border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/10"
    >
      <Settings2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold text-sm">
        Payment processing is being set up
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
        Payments are not yet configured on this instance. Contact support to
        upgrade your plan.
      </AlertDescription>
    </Alert>
  );
}
