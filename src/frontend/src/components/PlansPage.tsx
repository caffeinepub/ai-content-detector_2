import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  Loader2,
  Lock,
  Shield,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";

import { toast } from "sonner";

import {
  useCreateCheckoutSession,
  useIsCallerAdmin,
  useIsStripeConfigured,
} from "../hooks/useStripe";
import { StripeSetupPanel } from "./StripeSetupPanel";

type Plan = "free" | "pro" | "team";

interface PlansPageProps {
  currentPlan: Plan;
  onPlanChange: (plan: Plan) => void;
}

const plans = [
  {
    id: "free" as Plan,
    name: "Free",
    price: "$0",
    period: "/mo",
    priceInCents: 0,
    description: "Perfect for trying out AI detection",
    features: [
      "5 scans per day",
      "Text analysis only",
      "Basic detection",
      "Scan history",
    ],
    limitations: ["No image/doc analysis", "No API access", "No exports"],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "pro" as Plan,
    name: "Pro",
    price: "$19",
    period: "/mo",
    priceInCents: 1900,
    description: "For professionals and power users",
    features: [
      "Unlimited scans",
      "All content types",
      "Confidence breakdown",
      "API access",
      "Export reports (CSV)",
      "Download reports",
      "Priority processing",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    id: "team" as Plan,
    name: "Team",
    price: "$79",
    period: "/mo",
    priceInCents: 7900,
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "10 team seats",
      "Team dashboard",
      "Priority support",
      "SLA guarantee",
      "10,000 API req/day",
      "Bulk file checking",
      "Custom integrations",
    ],
    limitations: [],
    cta: "Upgrade to Team",
    highlight: false,
  },
];

const complianceItems = [
  {
    icon: <Shield className="h-4 w-4 text-teal" />,
    title: "GDPR Compliant",
    desc: "Fully compliant with EU General Data Protection Regulation",
  },
  {
    icon: <Lock className="h-4 w-4 text-human-score" />,
    title: "Encrypted Uploads",
    desc: "All content is encrypted in transit and at rest",
  },
  {
    icon: <Trash2 className="h-4 w-4 text-muted-foreground" />,
    title: "Auto-Delete",
    desc: "Content is automatically deleted after analysis",
  },
  {
    icon: <ShieldCheck className="h-4 w-4 text-ai-score" />,
    title: "No Data Without Consent",
    desc: "We never store your data without explicit consent",
  },
];

export function PlansPage({ currentPlan, onPlanChange }: PlansPageProps) {
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const { data: isAdmin } = useIsCallerAdmin();
  const createCheckoutSession = useCreateCheckoutSession();

  const handleUpgrade = async (plan: Plan) => {
    if (plan === currentPlan) {
      toast.info("You're already on this plan");
      return;
    }

    // Downgrade to Free — no payment needed
    if (plan === "free") {
      onPlanChange("free");
      toast.success("Downgraded to Free plan");
      return;
    }

    // Paid upgrade — require Stripe to be configured
    if (!isStripeConfigured) {
      toast.error(
        "Payment processing is not yet configured. Contact support to upgrade.",
      );
      return;
    }

    const planMeta = plans.find((p) => p.id === plan);
    if (!planMeta) return;

    try {
      const session = await createCheckoutSession.mutateAsync({
        items: [
          {
            name: `AI Content Detector — ${planMeta.name} Plan`,
            price: planMeta.priceInCents,
            quantity: 1,
          },
        ],
        planId: plan,
      });

      if (!session.url) {
        toast.error("Payment session URL missing. Please try again.");
        return;
      }

      window.location.href = session.url;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again.",
      );
    }
  };

  const isPendingPlan = (planId: Plan) =>
    createCheckoutSession.isPending &&
    createCheckoutSession.variables?.planId === planId;

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge className="bg-teal-muted text-teal border-0 font-semibold">
          Pricing
        </Badge>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Choose the plan that fits your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      {/* Admin Stripe setup panel — only visible to admin */}
      {isAdmin && (
        <div className="max-w-4xl mx-auto">
          <StripeSetupPanel />
        </div>
      )}

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPending = isPendingPlan(plan.id);
          const isDowngrade =
            (currentPlan === "pro" && plan.id === "free") ||
            (currentPlan === "team" && plan.id !== "team");

          return (
            <div
              key={plan.id}
              data-ocid={`plans.${plan.id}.card`}
              className={cn(
                "relative rounded-2xl border bg-card p-6 flex flex-col gap-5 transition-all",
                plan.highlight
                  ? "border-teal shadow-teal-glow ring-1 ring-teal/30"
                  : "border-border",
                isCurrentPlan && "ring-2 ring-teal",
              )}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-teal text-primary-foreground border-0 text-xs font-semibold px-3">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current plan badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-muted text-foreground border border-border text-xs font-medium">
                    Current Plan
                  </Badge>
                </div>
              )}

              {/* Plan header */}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {plan.description}
                </p>
                <div className="mt-3 flex items-baseline gap-0.5">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* CTA */}
              {plan.id === "pro" ? (
                <div className="relative">
                  {isPending && (
                    <div
                      data-ocid="plans.pro.loading_state"
                      className="absolute inset-0 flex items-center justify-center"
                    />
                  )}
                  <Button
                    data-ocid="plans.pro.checkout_button"
                    onClick={() => void handleUpgrade(plan.id)}
                    disabled={
                      isCurrentPlan ||
                      isPending ||
                      createCheckoutSession.isPending
                    }
                    className={cn(
                      "w-full font-semibold",
                      plan.highlight
                        ? "bg-teal text-primary-foreground hover:bg-teal/90"
                        : isCurrentPlan
                          ? "bg-muted text-muted-foreground cursor-default"
                          : "",
                    )}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting…
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : isDowngrade ? (
                      `Downgrade to ${plan.name}`
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                </div>
              ) : plan.id === "team" ? (
                <div className="relative">
                  {isPending && (
                    <div
                      data-ocid="plans.team.loading_state"
                      className="absolute inset-0 flex items-center justify-center"
                    />
                  )}
                  <Button
                    data-ocid="plans.team.checkout_button"
                    onClick={() => void handleUpgrade(plan.id)}
                    disabled={
                      isCurrentPlan ||
                      isPending ||
                      createCheckoutSession.isPending
                    }
                    className={cn(
                      "w-full font-semibold",
                      isCurrentPlan
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "",
                    )}
                    variant="outline"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting…
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : isDowngrade ? (
                      `Downgrade to ${plan.name}`
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                /* Free plan */
                <Button
                  data-ocid={`plans.${plan.id}.primary_button`}
                  onClick={() => void handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={cn(
                    "w-full font-semibold",
                    isCurrentPlan
                      ? "bg-muted text-muted-foreground cursor-default"
                      : "",
                  )}
                  variant="outline"
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : isDowngrade ? (
                    `Downgrade to ${plan.name}`
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      {plan.cta}
                    </>
                  )}
                </Button>
              )}

              {/* Features */}
              <div className="space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-human-score-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-human-score" />
                    </div>
                    <span className="text-xs text-foreground/80">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.limitations.map((limitation) => (
                  <div key={limitation} className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-muted-foreground text-[9px] font-bold">
                        —
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-through">
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance section */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Security & Compliance
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enterprise-grade security built into every plan.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {complianceItems.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-border bg-background/50 p-3.5"
              >
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:support@aidetector.app"
            className="text-teal font-medium hover:underline"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
