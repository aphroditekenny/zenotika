import { useCallback, useEffect, useMemo, useState } from "react";

// Lightweight wrapper for the beforeinstallprompt flow
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const isStandalone = useMemo(() => {
    return (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      Boolean((navigator as any).standalone)
    );
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Some browsers fire this multiple times; keep the first one.
      e.preventDefault?.();
      if (!deferredPrompt) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [deferredPrompt]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: "dismissed" as const };
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return choice; // { outcome: 'accepted' | 'dismissed' }
    } catch {
      setDeferredPrompt(null);
      return { outcome: "dismissed" as const };
    }
  }, [deferredPrompt]);

  const canInstall = Boolean(deferredPrompt) && !installed && !isStandalone;

  return { canInstall, isStandalone, installed, promptInstall };
}
