import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronDown,
  Key,
  LogIn,
  LogOut,
  Moon,
  ScanSearch,
  Sun,
  Zap,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export type Page = "dashboard" | "analyze" | "plans" | "api";

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  dailyCount: number;
  quotaLimit: number;
  plan: "free" | "pro" | "team";
  isAuthenticated: boolean;
  identity?: { getPrincipal: () => { toString: () => string } };
  onLogin: () => void;
  onLogout: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-teal-muted text-teal",
  team: "bg-ai-score-bg text-ai-score",
};

export function TopNav({
  currentPage,
  onNavigate,
  dailyCount,
  quotaLimit,
  plan,
  isAuthenticated,
  identity,
  onLogin,
  onLogout,
}: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const remaining =
    quotaLimit === Number.POSITIVE_INFINITY
      ? "∞"
      : Math.max(0, quotaLimit - dailyCount);
  const isAtLimit =
    quotaLimit !== Number.POSITIVE_INFINITY && dailyCount >= quotaLimit;

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const truncatedPrincipal = principalStr
    ? `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`
    : "";

  const navLinks: { label: string; page: Page; icon?: React.ReactNode }[] = [
    { label: "Dashboard", page: "dashboard" },
    { label: "Analyze", page: "analyze" },
    { label: "Plans", page: "plans" },
    { label: "API", page: "api" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-screen-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            data-ocid="nav.dashboard.link"
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal">
              <ScanSearch className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-foreground hidden sm:block">
              AI Detector
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                type="button"
                data-ocid={`nav.${link.page}.link`}
                onClick={() => onNavigate(link.page)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  currentPage === link.page
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Plan badge */}
          <div
            data-ocid="nav.plan_badge"
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:flex",
              PLAN_COLORS[plan],
            )}
          >
            {plan !== "free" && <BarChart3 className="h-3 w-3" />}
            {PLAN_LABELS[plan]}
          </div>

          {/* Quota badge */}
          <div
            data-ocid="nav.quota_badge"
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:flex",
              isAtLimit
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                isAtLimit ? "bg-destructive animate-pulse" : "bg-human-score",
              )}
            />
            {isAtLimit ? "Limit reached" : `${remaining} scans left`}
          </div>

          {/* Theme toggle */}
          <Button
            data-ocid="nav.theme_toggle"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="h-8 w-8"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Auth button */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="nav.user_menu_button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs font-mono"
                >
                  <div className="h-4 w-4 rounded-full bg-teal flex items-center justify-center text-primary-foreground text-[9px] font-bold flex-shrink-0">
                    {principalStr.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{truncatedPrincipal}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                data-ocid="nav.user_dropdown_menu"
                align="end"
                className="w-44"
              >
                <DropdownMenuItem
                  data-ocid="nav.upgrade_link"
                  onClick={() => onNavigate("plans")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-teal" />
                  Upgrade Plan
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="nav.api_link"
                  onClick={() => onNavigate("api")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="nav.logout_button"
                  onClick={onLogout}
                  className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              data-ocid="nav.login_button"
              variant="default"
              size="sm"
              onClick={onLogin}
              className="h-8 gap-1.5 text-xs font-semibold bg-teal text-primary-foreground hover:bg-teal/90"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Sign In</span>
            </Button>
          )}

          {/* Mobile nav dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-ocid="nav.mobile_menu_button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                aria-label="Menu"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-ocid="nav.mobile_dropdown_menu"
              align="end"
              className="w-44"
            >
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.page}
                  data-ocid={`nav.${link.page}.link`}
                  onClick={() => onNavigate(link.page)}
                  className={cn(
                    "gap-2 text-sm cursor-pointer",
                    currentPage === link.page && "text-teal font-semibold",
                  )}
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
