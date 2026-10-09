/**
 * Universal Commercial Platform Adapter
 * Automatically detects and adapts the UI, interactions, shortcuts, and native integrations
 * across Windows, macOS, Linux, Android, iOS, and Telegram Mini App (TMA).
 * Zero manual templates or adjustments required.
 */

export type OperatingSystem = "windows" | "macos" | "linux" | "android" | "ios" | "unknown";

export interface PlatformInfo {
  os: OperatingSystem;
  isMobile: boolean;
  isDesktop: boolean;
  isApple: boolean;
  isTelegramMiniApp: boolean;
  touchSupported: boolean;
  modifierKeyLabel: string; // "⌘" on Mac/iOS, "Ctrl" on others
  modifierKeyName: "metaKey" | "ctrlKey";
  osDisplayName: string;
  recommendedPackageExtension: string;
  recommendedFileName: string;
  downloadUrl: string;
}

export function detectUniversalPlatform(): PlatformInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      os: "windows",
      isMobile: false,
      isDesktop: true,
      isApple: false,
      isTelegramMiniApp: false,
      touchSupported: false,
      modifierKeyLabel: "Ctrl",
      modifierKeyName: "ctrlKey",
      osDisplayName: "Windows",
      recommendedPackageExtension: ".exe",
      recommendedFileName: "VietsubStudio-Setup.exe",
      downloadUrl: "https://github.com/hendy-server-AI-hub/hendy-studio-vietsub-test/releases/latest/download/VietsubStudio-Setup.exe",
    };
  }

  const ua = (navigator.userAgent || "").toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  // Detect Telegram WebApp context
  const isTelegramMiniApp = Boolean(
    (window as any).Telegram?.WebApp?.initData ||
    window.location.search.includes("tgWebAppPlatform") ||
    window.location.search.includes("tgWebApp")
  );

  let os: OperatingSystem = "windows";
  let isMobile = false;
  let isApple = false;

  if (/android/i.test(ua)) {
    os = "android";
    isMobile = true;
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "ios";
    isMobile = true;
    isApple = true;
  } else if (/macintosh|mac os x/i.test(ua) || platform.includes("mac")) {
    os = "macos";
    isApple = true;
  } else if (/linux/i.test(ua) && !/android/i.test(ua)) {
    os = "linux";
  } else {
    os = "windows";
  }

  const isDesktop = !isMobile;
  const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Commercial Package mapping
  const packages: Record<OperatingSystem, { name: string; ext: string; display: string }> = {
    windows: { name: "VietsubVideoStudio-Setup-2.8.0.exe", ext: ".exe", display: "Windows 10 / 11 (x64)" },
    macos: { name: "VietsubVideoStudio-2.8.0.dmg", ext: ".dmg", display: "macOS 12+ (Apple Silicon & Intel)" },
    linux: { name: "vietsub-video-studio_2.8.0_amd64.deb", ext: ".deb", display: "Linux (.deb)" },
    android: { name: "VietsubVideoStudio-release.apk", ext: ".apk", display: "Android APK & Play Store" },
    ios: { name: "TestFlight Invitation", ext: ".ipa", display: "iOS (TestFlight)" },
    unknown: { name: "VietsubVideoStudio-Setup.exe", ext: ".exe", display: "Universal Web" },
  };

  const pkg = packages[os];

  return {
    os,
    isMobile,
    isDesktop,
    isApple,
    isTelegramMiniApp,
    touchSupported,
    modifierKeyLabel: isApple ? "⌘" : "Ctrl",
    modifierKeyName: isApple ? "metaKey" : "ctrlKey",
    osDisplayName: pkg.display,
    recommendedPackageExtension: pkg.ext,
    recommendedFileName: pkg.name,
    downloadUrl: `https://github.com/hendy-server-AI-hub/hendy-studio-vietsub-test/releases/latest/download/${pkg.name}`,
  };
}

/**
 * Initializes native TMA runtime if inside Telegram
 */
export function initTelegramMiniAppAutoAdaptation(): void {
  try {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready?.();
      tg.expand?.();
      tg.setHeaderColor?.("#020617");
      tg.setBackgroundColor?.("#020617");
      tg.enableClosingConfirmation?.();
    }
  } catch (e) {
    // Non-blocking
  }
}
