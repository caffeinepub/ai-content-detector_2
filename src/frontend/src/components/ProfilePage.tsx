import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Check,
  ClipboardCopy,
  Crown,
  Loader2,
  LogOut,
  ScanSearch,
  Shield,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { EnrichedScanRecord } from "../hooks/useQueries";
import {
  useCallerIsAdmin,
  useCallerProfile,
  useCallerRole,
  useSaveProfile,
} from "../hooks/useQueries";

interface ProfilePageProps {
  identity?: {
    getPrincipal: () => { toString: () => string; isAnonymous: () => boolean };
  };
  plan: "free" | "pro" | "team";
  isAuthenticated: boolean;
  onLogout: () => void;
  onNavigatePlans: () => void;
  userId: string;
  dailyCount: number;
  history: EnrichedScanRecord[] | undefined;
}

const PLAN_CONFIG = {
  free: {
    label: "Free",
    color: "bg-muted text-muted-foreground",
    icon: <User className="h-3.5 w-3.5" />,
    quota: 5,
  },
  pro: {
    label: "Pro",
    color: "bg-teal-muted text-teal",
    icon: <Zap className="h-3.5 w-3.5" />,
    quota: Number.POSITIVE_INFINITY,
  },
  team: {
    label: "Team",
    color: "bg-ai-score-bg text-ai-score",
    icon: <Crown className="h-3.5 w-3.5" />,
    quota: Number.POSITIVE_INFINITY,
  },
} as const;

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    color: "text-teal",
    badgeClass: "bg-teal-muted text-teal border-teal/20",
  },
  user: {
    label: "User",
    icon: <User className="h-3.5 w-3.5" />,
    color: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  },
  guest: {
    label: "Guest",
    icon: <Shield className="h-3.5 w-3.5" />,
    color: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

export function ProfilePage({
  identity,
  plan,
  isAuthenticated,
  onLogout,
  onNavigatePlans,
  userId: _userId,
  dailyCount,
  history,
}: ProfilePageProps) {
  const principalStr = identity?.getPrincipal().toString() ?? "";
  const avatarLetter = principalStr.charAt(0).toUpperCase() || "?";
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [hasEditedName, setHasEditedName] = useState(false);

  const { data: roleData, isLoading: roleLoading } = useCallerRole();
  const { data: isAdmin, isLoading: adminLoading } = useCallerIsAdmin();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const saveProfileMutation = useSaveProfile();

  // Sync display name with fetched profile (only once on first load)
  const resolvedName = hasEditedName
    ? displayName
    : (profile?.name ?? displayName);

  const planConfig = PLAN_CONFIG[plan];
  const roleKey = (roleData as string | undefined) ?? "guest";
  const roleConfig =
    ROLE_CONFIG[roleKey as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.guest;

  const totalScans = history?.length ?? 0;
  const quota = planConfig.quota;
  const quotaProgress =
    quota === Number.POSITIVE_INFINITY
      ? 0
      : Math.min(100, (dailyCount / quota) * 100);
  const scansRemaining =
    quota === Number.POSITIVE_INFINITY ? "∞" : Math.max(0, quota - dailyCount);

  const handleCopyPrincipal = async () => {
    if (!principalStr) return;
    try {
      await navigator.clipboard.writeText(principalStr);
      setCopied(true);
      toast.success("Principal ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSaveName = async () => {
    if (!resolvedName.trim()) return;
    try {
      await saveProfileMutation.mutateAsync({ name: resolvedName.trim() });
      toast.success("Display name saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save name");
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="profile.page"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Your profile, usage stats, and account settings live here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="profile.page"
      className="mx-auto max-w-2xl px-4 py-8 space-y-6"
    >
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, view usage stats, and configure settings.
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-teal text-primary-foreground font-display text-2xl font-bold shadow-md">
              {avatarLetter}
            </div>

            {/* Identity info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {profileLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <p className="font-display text-lg font-semibold text-foreground truncate">
                  {profile?.name || "Unnamed User"}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {principalStr
                    ? `${principalStr.slice(0, 12)}...${principalStr.slice(-6)}`
                    : "—"}
                </span>
                <button
                  type="button"
                  data-ocid="profile.copy_principal_button"
                  onClick={handleCopyPrincipal}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs hover:bg-muted transition-colors flex-shrink-0"
                  title="Copy full principal ID"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-teal" />
                  ) : (
                    <ClipboardCopy className="h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all hidden sm:block opacity-50">
                {principalStr}
              </p>
            </div>

            {/* Plan badge */}
            <div
              data-ocid="profile.plan_badge"
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0",
                planConfig.color,
              )}
            >
              {planConfig.icon}
              {planConfig.label} Plan
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Plan card */}
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal/10">
                <Zap className="h-3.5 w-3.5 text-teal" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Current Plan
              </span>
            </div>
            <p className="font-display text-base font-bold text-foreground">
              {planConfig.label}
            </p>
            {plan === "free" && (
              <button
                type="button"
                data-ocid="profile.upgrade_button"
                onClick={onNavigatePlans}
                className="mt-2 text-xs font-semibold text-teal hover:underline"
              >
                Upgrade →
              </button>
            )}
          </CardContent>
        </Card>

        {/* Role card */}
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                User Role
              </span>
            </div>
            {roleLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Badge
                data-ocid="profile.role_badge"
                className={cn(
                  "flex items-center gap-1 w-fit text-xs font-semibold",
                  roleConfig.badgeClass,
                )}
              >
                {roleConfig.icon}
                {roleConfig.label}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Admin status card */}
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Admin Access
              </span>
            </div>
            {adminLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : isAdmin ? (
              <Badge className="flex items-center gap-1 w-fit text-xs font-semibold bg-teal-muted text-teal border-teal/20">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">
                Standard user
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-teal" />
            Usage Statistics
          </CardTitle>
          <CardDescription className="text-xs">
            Your scan activity and quota usage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Scans today */}
            <div
              data-ocid="profile.scans_today_card"
              className="rounded-lg bg-muted/50 border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <ScanSearch className="h-3.5 w-3.5 text-teal" />
                <span className="text-xs text-muted-foreground">
                  Scans Today
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {dailyCount}
                {quota !== Number.POSITIVE_INFINITY && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {quota}
                  </span>
                )}
              </p>
              {quota !== Number.POSITIVE_INFINITY && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {scansRemaining} remaining today
                </p>
              )}
            </div>

            {/* Total scans */}
            <div
              data-ocid="profile.total_scans_card"
              className="rounded-lg bg-muted/50 border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="h-3.5 w-3.5 text-teal" />
                <span className="text-xs text-muted-foreground">
                  Total Scans
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {totalScans}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">All time</p>
            </div>
          </div>

          {/* Quota progress bar for free plan */}
          {plan === "free" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Daily quota</span>
                <span
                  className={cn(
                    dailyCount >= quota ? "text-destructive font-semibold" : "",
                  )}
                >
                  {dailyCount}/{quota} scans used
                </span>
              </div>
              <Progress
                value={quotaProgress}
                className={cn(
                  "h-2",
                  dailyCount >= quota
                    ? "[&>div]:bg-destructive"
                    : "[&>div]:bg-teal",
                )}
              />
              {dailyCount >= quota && (
                <p className="text-xs text-destructive">
                  Daily limit reached.{" "}
                  <button
                    type="button"
                    data-ocid="profile.upgrade_button"
                    onClick={onNavigatePlans}
                    className="font-semibold underline"
                  >
                    Upgrade for unlimited scans.
                  </button>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Display Name */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <User className="h-4 w-4 text-teal" />
            Display Name
          </CardTitle>
          <CardDescription className="text-xs">
            Customize how your name appears in the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="display-name" className="sr-only">
                Display Name
              </Label>
              <Input
                id="display-name"
                data-ocid="profile.name_input"
                value={resolvedName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setHasEditedName(true);
                }}
                placeholder={
                  profileLoading ? "Loading..." : "Enter your display name"
                }
                disabled={profileLoading || saveProfileMutation.isPending}
                className="text-sm border-border focus-visible:ring-teal/50 focus-visible:border-teal"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveName();
                }}
              />
            </div>
            <Button
              data-ocid="profile.save_name_button"
              onClick={() => void handleSaveName()}
              disabled={
                !resolvedName.trim() ||
                profileLoading ||
                saveProfileMutation.isPending
              }
              className="gap-2 bg-teal text-primary-foreground hover:bg-teal/90"
              size="sm"
            >
              {saveProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </Button>
          </div>
          {saveProfileMutation.isError && (
            <p className="mt-1.5 text-xs text-destructive">
              {saveProfileMutation.error?.message ?? "Failed to save name"}
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Account Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Account Actions
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          {plan === "free" && (
            <Button
              data-ocid="profile.upgrade_button"
              onClick={onNavigatePlans}
              className="gap-2 bg-teal text-primary-foreground hover:bg-teal/90"
              size="sm"
            >
              <Zap className="h-3.5 w-3.5" />
              Upgrade Plan
            </Button>
          )}
          <Button
            data-ocid="profile.logout_button"
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
