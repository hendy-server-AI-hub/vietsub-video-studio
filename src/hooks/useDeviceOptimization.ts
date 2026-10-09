import { useState, useEffect } from "react";
import {
  detectUniversalPlatform,
  PlatformInfo,
  initTelegramMiniAppAutoAdaptation,
} from "../utils/universalPlatformAdapter";

/**
 * Commercial Auto-Device Optimization Hook
 * Eliminates all manual OS adjustments and templates.
 * Auto-configures viewport, shortcuts, touch modes, and platform bindings.
 */
export function useDeviceOptimization(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(() => detectUniversalPlatform());

  useEffect(() => {
    // Detect on mount
    const detected = detectUniversalPlatform();
    setPlatformInfo(detected);

    // Initialize TMA if inside Telegram
    initTelegramMiniAppAutoAdaptation();

    // Set CSS Custom Properties for viewport & OS adaptations
    const root = document.documentElement;
    root.setAttribute("data-os", detected.os);
    root.setAttribute("data-is-mobile", String(detected.isMobile));
    root.setAttribute("data-is-tma", String(detected.isTelegramMiniApp));

    // Handle resize / orientation change seamlessly
    const handleResize = () => {
      setPlatformInfo(detectUniversalPlatform());
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return platformInfo;
}
