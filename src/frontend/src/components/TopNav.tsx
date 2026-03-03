import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Moon, ScanSearch, Sun, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface TopNavProps {
  dailyCount: number;
  quotaLimit: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function TopNav({
  dailyCount,
  quotaLimit,
  sidebarOpen,
  onToggleSidebar,
}: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const remaining = Math.max(0, quotaLimit - dailyCount);
  const isAtLimit = dailyCount >= quotaLimit;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal">
            <ScanSearch className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            AI Detector
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Quota badge */}
          <div
            data-ocid="detector.quota_badge"
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors sm:flex",
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
            {isAtLimit ? "Limit reached" : `${remaining} scans left today`}
          </div>

          {/* Theme toggle */}
          <Button
            data-ocid="detector.theme_toggle"
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

          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Close history" : "Open history"}
            className="h-8 w-8 lg:hidden"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
