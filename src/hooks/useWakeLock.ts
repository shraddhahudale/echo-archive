import { useEffect, useRef } from "react";

export function useWakeLock(enabled: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) {
      void lockRef.current?.release().catch(() => undefined);
      lockRef.current = null;
      return;
    }

    let cancelled = false;

    async function request() {
      try {
        if (!("wakeLock" in navigator)) return;
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release().catch(() => undefined);
          return;
        }
        lockRef.current = lock;
      } catch {
        /* unsupported or denied */
      }
    }

    void request();

    function onVisible() {
      if (document.visibilityState === "visible" && enabled) void request();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lockRef.current?.release().catch(() => undefined);
      lockRef.current = null;
    };
  }, [enabled]);
}
