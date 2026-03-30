"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Warning } from "@/components/ui/icon";
import { useTranslation } from "@/hooks/useTranslation";

interface ClaudeInstallInfo {
  path: string;
  version: string | null;
  type: "native" | "homebrew" | "npm" | "bun" | "unknown";
}

interface ClaudeStatus {
  connected: boolean;
  version: string | null;
  binaryPath?: string | null;
  installType?: string | null;
  otherInstalls?: ClaudeInstallInfo[];
  missingGit?: boolean;
  warnings?: string[];
}

const BASE_INTERVAL = 30_000; // 30s
const BACKED_OFF_INTERVAL = 60_000; // 60s after 3 consecutive stable results
const STABLE_THRESHOLD = 3;

function getUninstallAdvice(type: string): string | null {
  switch (type) {
    case 'npm': return 'npm uninstall -g @anthropic-ai/claude-code';
    case 'bun': return 'bun remove -g @anthropic-ai/claude-code';
    case 'homebrew': return 'brew uninstall --cask claude-code';
    default: return null;
  }
}

export function ConnectionStatus() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ClaudeStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stableCountRef = useRef(0);
  const lastConnectedRef = useRef<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use a ref-based approach to avoid circular deps between check and schedule
  const checkRef = useRef<() => void>(() => {});

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const interval = stableCountRef.current >= STABLE_THRESHOLD
      ? BACKED_OFF_INTERVAL
      : BASE_INTERVAL;
    timerRef.current = setTimeout(() => checkRef.current(), interval);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/claude-status");
      if (res.ok) {
        const data: ClaudeStatus = await res.json();
        if (lastConnectedRef.current === data.connected) {
          stableCountRef.current++;
        } else {
          stableCountRef.current = 0;
        }
        lastConnectedRef.current = data.connected;
        setStatus(data);
      }
    } catch {
      if (lastConnectedRef.current === false) {
        stableCountRef.current++;
      } else {
        stableCountRef.current = 0;
      }
      lastConnectedRef.current = false;
      setStatus({ connected: false, version: null });
    }
    schedule();
  }, [schedule]);

  useEffect(() => {
    checkRef.current = checkStatus;
  }, [checkStatus]);

  useEffect(() => {
    checkStatus(); // eslint-disable-line react-hooks/set-state-in-effect -- setState is called asynchronously after fetch
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [checkStatus]);

  const handleManualRefresh = useCallback(() => {
    stableCountRef.current = 0;
    checkStatus();
  }, [checkStatus]);

  const connected = status?.connected ?? false;
  const hasConflicts = (status?.otherInstalls?.length ?? 0) > 0;
  const hasWarnings = hasConflicts;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className={cn(
          "h-7 rounded-full px-2.5 text-[11px] font-medium gap-1.5",
          status === null
            ? "bg-muted text-muted-foreground"
            : connected
              ? hasWarnings
                ? "bg-status-warning-muted text-status-warning-foreground"
                : "bg-status-success-muted text-status-success-foreground"
              : "bg-status-error-muted text-status-error-foreground"
        )}
      >
        <span
          className={cn(
            "block h-1.5 w-1.5 shrink-0 rounded-full",
            status === null
              ? "bg-muted-foreground/40"
              : connected
                ? hasWarnings
                  ? "bg-status-warning"
                  : "bg-status-success"
                : "bg-status-error"
          )}
        />
        {status === null
          ? t('connection.checking')
          : connected
            ? hasConflicts
              ? t('connection.conflict')
              : t('connection.connected')
            : t('connection.disconnected')}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connected ? t('connection.installed') : t('connection.notInstalled')}
            </DialogTitle>
            <DialogDescription>
              {connected
                ? `Claude Code CLI v${status?.version} · ${status?.binaryPath ?? ''}`
                : t('connection.notDetectedHint')}
            </DialogDescription>
          </DialogHeader>

          {connected ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-lg bg-status-success-muted px-4 py-3">
                <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-status-success" />
                <div>
                  <p className="font-medium text-status-success-foreground">{t('connection.active')}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {status?.version && `v${status.version}`}
                    {status?.binaryPath && ` · ${status.binaryPath}`}
                  </p>
                </div>
              </div>

              {/* Conflict warning — keep, it's actionable */}
              {hasConflicts && (
                <div className="rounded-lg bg-status-warning-muted px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Warning size={16} className="text-status-warning-foreground shrink-0" />
                    <p className="font-medium text-status-warning-foreground text-xs">
                      {t('connection.conflictWarning')}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {status?.otherInstalls?.map((inst, i) => {
                      const advice = getUninstallAdvice(inst.type);
                      return (
                        <div key={i} className="space-y-0.5">
                          <p><code className="bg-muted px-1 rounded">{inst.path}</code></p>
                          {advice && (
                            <p>{t('connection.conflictRemove')}: <code className="bg-muted px-1 rounded">{advice}</code></p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-lg bg-status-error-muted px-4 py-3">
                <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-status-error" />
                <p className="font-medium text-status-error-foreground">{t('connection.notDetected')}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('connection.notDetectedHint')}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleManualRefresh}
            >
              {t('connection.refresh')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
