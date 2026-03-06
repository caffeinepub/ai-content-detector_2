import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Key,
  Loader2,
  Lock,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Plan = "free" | "pro" | "team";

interface ApiKey {
  id: string;
  name: string;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
}

interface ApiPageProps {
  plan: Plan;
  onNavigatePlans: () => void;
}

function maskKey(id: string) {
  return `sk-****${id.slice(-4)}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SAMPLE_CODE = `curl -X POST https://api.aidetector.app/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your content here"}'`;

const rateLimits = [
  { plan: "Free", limit: "N/A", color: "text-muted-foreground" },
  { plan: "Pro", limit: "1,000 req/day", color: "text-teal" },
  { plan: "Team", limit: "10,000 req/day", color: "text-human-score" },
];

export function ApiPage({ plan, onNavigatePlans }: ApiPageProps) {
  const [keys, setKeys] = useState<ApiKey[]>(() => {
    try {
      const stored = localStorage.getItem("aidetector_apikeys");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const saveKeys = (updated: ApiKey[]) => {
    setKeys(updated);
    localStorage.setItem("aidetector_apikeys", JSON.stringify(updated));
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    setIsCreating(true);
    setTimeout(() => {
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        name: newKeyName.trim(),
        createdAt: Date.now(),
        lastUsed: 0,
        isActive: true,
      };
      saveKeys([...keys, newKey]);
      setNewKeyName("");
      setShowForm(false);
      setIsCreating(false);
      toast.success(`API key "${newKey.name}" created`);
    }, 600);
  };

  const handleRevoke = (id: string) => {
    const updated = keys.map((k) =>
      k.id === id ? { ...k, isActive: false } : k,
    );
    saveKeys(updated);
    toast.success("API key revoked");
  };

  const handleDelete = (id: string) => {
    const updated = keys.filter((k) => k.id !== id);
    saveKeys(updated);
    toast.success("API key deleted");
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(SAMPLE_CODE);
      setCopiedId("code");
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Failed to copy -- please select and copy manually");
    }
  };

  if (plan === "free") {
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
        <div
          data-ocid="api.upgrade_cta.card"
          className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8 text-center space-y-5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              API Access Requires Pro
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upgrade to Pro or Team to get API keys, integrate with your
              applications, and access up to 10,000 requests per day.
            </p>
          </div>
          <div className="space-y-2">
            <Button
              data-ocid="api.upgrade_primary_button"
              onClick={onNavigatePlans}
              className="w-full gap-2 bg-teal text-primary-foreground hover:bg-teal/90 font-semibold"
            >
              <Zap className="h-4 w-4" />
              Upgrade to Pro — $19/mo
            </Button>
            <Button
              data-ocid="api.view_plans_button"
              variant="ghost"
              onClick={onNavigatePlans}
              className="w-full text-sm text-muted-foreground"
            >
              View all plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          API Access
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your API keys and integrate AI detection into your
          applications.
        </p>
      </div>

      {/* API Keys section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">
            API Keys
          </h2>
          {!showForm && (
            <Button
              data-ocid="api.generate_key_button"
              size="sm"
              onClick={() => setShowForm(true)}
              className="gap-1.5 text-xs h-8 bg-teal text-primary-foreground hover:bg-teal/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate New Key
            </Button>
          )}
        </div>

        {/* Create key form */}
        {showForm && (
          <div
            data-ocid="api.create_key.panel"
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <p className="text-sm font-medium text-foreground">New API Key</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="key-name" className="sr-only">
                  Key Name
                </Label>
                <Input
                  id="key-name"
                  data-ocid="api.key_name.input"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production App, My Project..."
                  className="text-sm h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateKey();
                    if (e.key === "Escape") {
                      setShowForm(false);
                      setNewKeyName("");
                    }
                  }}
                  autoFocus
                />
              </div>
              <Button
                data-ocid="api.create_key.submit_button"
                size="sm"
                onClick={handleCreateKey}
                disabled={isCreating || !newKeyName.trim()}
                className="h-9 gap-1.5 bg-teal text-primary-foreground hover:bg-teal/90"
              >
                {isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Key className="h-3.5 w-3.5" />
                )}
                {isCreating ? "Creating..." : "Create"}
              </Button>
              <Button
                data-ocid="api.create_key.cancel_button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setNewKeyName("");
                }}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Keys table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {keys.length === 0 ? (
            <div
              data-ocid="api.keys_empty_state"
              className="flex flex-col items-center justify-center gap-3 py-12 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No API keys yet
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Generate your first API key to get started
                </p>
              </div>
            </div>
          ) : (
            <Table data-ocid="api.keys_table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Key ID</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key, index) => (
                  <TableRow
                    key={key.id}
                    data-ocid={`api.key_row.${index + 1}`}
                    className="border-border"
                  >
                    <TableCell className="py-3 text-sm font-medium text-foreground">
                      {key.name}
                    </TableCell>
                    <TableCell className="py-3">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {maskKey(key.id)}
                      </code>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          "text-xs border-0",
                          key.isActive
                            ? "bg-human-score-bg text-human-score"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {key.isActive ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1">
                        {key.isActive && (
                          <button
                            type="button"
                            data-ocid={`api.revoke_key_button.${index + 1}`}
                            onClick={() => handleRevoke(key.id)}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          type="button"
                          data-ocid={`api.delete_key_button.${index + 1}`}
                          onClick={() => handleDelete(key.id)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Delete key"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Separator />

      {/* Sample code */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">
            Quick Start
          </h2>
          <Button
            data-ocid="api.copy_code_button"
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="gap-1.5 text-xs h-7"
          >
            {copiedId === "code" ? (
              <Check className="h-3.5 w-3.5 text-human-score" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedId === "code" ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div
          data-ocid="api.code_block.editor"
          className="rounded-xl border border-border bg-[oklch(0.12_0.015_255)] overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.18_80)]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-human-score/60" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              bash
            </span>
          </div>
          <pre className="p-4 text-xs font-mono text-[oklch(0.85_0.05_200)] overflow-x-auto leading-relaxed">
            {SAMPLE_CODE}
          </pre>
        </div>
      </div>

      <Separator />

      {/* Rate limits table */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold text-foreground">
          Rate Limits
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table data-ocid="api.rate_limits_table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs">Request Limit</TableHead>
                <TableHead className="text-xs">Current Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateLimits.map((row, index) => {
                const isCurrentPlan = row.plan.toLowerCase() === plan;
                return (
                  <TableRow
                    key={row.plan}
                    data-ocid={`api.rate_limit_row.${index + 1}`}
                    className={cn(
                      "border-border",
                      isCurrentPlan && "bg-teal-muted/30",
                    )}
                  >
                    <TableCell className="py-3 text-sm font-medium text-foreground">
                      {row.plan}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-3 text-sm font-mono font-semibold",
                        row.color,
                      )}
                    >
                      {row.limit}
                    </TableCell>
                    <TableCell className="py-3">
                      {isCurrentPlan && (
                        <Badge className="bg-teal-muted text-teal border-0 text-xs">
                          Your plan
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
