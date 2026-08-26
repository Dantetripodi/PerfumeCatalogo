import { useCallback, useEffect, useState } from "react";
import { isStudioUnlocked } from "../content-studio/studioAccess";

export type AppView = "catalog" | "content-studio" | "carousel";
type PinTarget = "content-studio" | "carousel";

export function canOpenInternalTool(
  target: PinTarget,
  hasAdminSession: boolean,
  hasContentAdmin: boolean,
  studioUnlocked: boolean,
): boolean {
  return target === "content-studio"
    ? hasContentAdmin
    : hasAdminSession || studioUnlocked;
}

/**
 * Owns the way into the owner-only tools: the Content Studio, the carousel
 * generator and the admin panel.
 *
 * They can be reached three ways — a hash route, a keyboard shortcut, or a
 * button — and each one has to pass the same PIN gate. Keeping that in App
 * meant three effects, four pieces of state and two handlers sitting next to
 * the catalog markup, none of which the catalog cares about.
 */
export function useInternalTools(hasAdminSession: boolean, hasContentAdmin: boolean) {
  const [appView, setAppView] = useState<AppView>("catalog");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<PinTarget>("content-studio");

  const openTool = useCallback(
    (target: PinTarget) => {
      const canAccess = canOpenInternalTool(
        target,
        hasAdminSession,
        hasContentAdmin,
        isStudioUnlocked(),
      );
      if (canAccess) {
        setAppView(target);
        return;
      }
      // Content Studio is admin-only. A PIN must never open it or show a
      // misleading PIN modal when there is no authenticated session.
      if (target === "content-studio") return;
      setPinTarget(target);
      setIsPinModalOpen(true);
    },
    [hasAdminSession, hasContentAdmin]
  );

  const openStudio = useCallback(() => openTool("content-studio"), [openTool]);
  const openCarousel = useCallback(() => openTool("carousel"), [openTool]);

  /** Drops #/studio, #/carousel or #/admin once the tool is closed. */
  const clearToolHash = useCallback((...hashes: string[]) => {
    if (hashes.includes(window.location.hash)) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const closeTool = useCallback(() => {
    setAppView("catalog");
    clearToolHash("#/studio", "#/carousel");
  }, [clearToolHash]);

  const closeAdmin = useCallback(() => {
    setIsAdminOpen(false);
    clearToolHash("#/admin");
  }, [clearToolHash]);

  const closePin = useCallback(() => {
    setIsPinModalOpen(false);
    clearToolHash("#/studio", "#/carousel");
  }, [clearToolHash]);

  const confirmPin = useCallback(() => {
    setIsPinModalOpen(false);
    if (pinTarget === "content-studio" && !hasContentAdmin) return;
    setAppView(pinTarget);
  }, [hasContentAdmin, pinTarget]);

  // Hash routes: #/admin, #/studio, #/carousel
  useEffect(() => {
    const syncHashRoute = () => {
      if (window.location.hash === "#/admin") setIsAdminOpen(true);
      else if (window.location.hash === "#/studio") openStudio();
      else if (window.location.hash === "#/carousel") openCarousel();
    };

    syncHashRoute();
    window.addEventListener("hashchange", syncHashRoute);
    return () => window.removeEventListener("hashchange", syncHashRoute);
  }, [openStudio, openCarousel]);

  // Ctrl/Cmd+Shift+S → Content Studio, Ctrl/Cmd+Shift+C → carousel
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        openStudio();
      } else if (key === "c") {
        event.preventDefault();
        openCarousel();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [openStudio, openCarousel]);

  const openAdmin = useCallback(() => setIsAdminOpen(true), []);

  return {
    appView,
    isAdminOpen,
    isPinModalOpen,
    openAdmin,
    openStudio,
    openCarousel,
    closeTool,
    closeAdmin,
    closePin,
    confirmPin,
  };
}
