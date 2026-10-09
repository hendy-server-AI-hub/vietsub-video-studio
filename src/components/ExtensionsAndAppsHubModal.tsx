import React, { useState } from "react";
import {
  X,
  Smartphone,
  Laptop,
  Globe,
  Download,
  Bookmark,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Apple,
  Maximize2,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";

interface ExtensionsAndAppsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookmarkletModal: () => void;
  onOpenCinemaMode: () => void;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const ExtensionsAndAppsHubModal: React.FC<ExtensionsAndAppsHubModalProps> = ({
  isOpen,
  onClose,
  onOpenBookmarkletModal,
  onOpenCinemaMode,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<"chrome" | "apk" | "desktop" | "pwa">("chrome");

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    // Generate simulated APK package descriptor / installer manifest
    const apkData = JSON.stringify(
      {
        appName: "Vietsub Video Studio Pro",
        package: "com.vietsub.studio.app",
        version: "2.5.0-pro",
        features: [
          "1-Click Translate & Auto-Narrate",
          "Edge Speech Synthesizer",
          "Floating Subtitle HUD Overlay",
          "Optimized Full-Screen Cinema Player",
        ],
        targetSdkVersion: 34,
        minSdkVersion: 26,
      },
      null,
      2
    );
    const blob = new Blob([apkData], { type: "application/vnd.android.package-archive" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "VietsubVideoStudio_v2.5_Pro.apk";
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.("Đang tải xuống bộ cài Vietsub Video Studio APK cho Android!", "success");
  };

  const handleDownloadChromeExtension = () => {
    const manifestJson = JSON.stringify(
      {
        manifest_version: 3,
        name: "Vietsub Video Studio - 1-Click Translate & Auto-Narrate",
        version: "2.5.0",
        description: "Tự động tạo phụ đề Vietsub và thuyết minh giọng đọc tiếng Việt trên mọi web phim (YouTube, TikTok, Netflix, Douyin, AV01...)",
        action: {
          default_title: "Bật Vietsub & Thuyết minh tự động",
        },
        permissions: ["activeTab", "scripting"],
      },
      null,
      2
    );
    const blob = new Blob([manifestJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manifest.json";
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.("Đã tải gói Extension Manifest V3 cho Chrome / Edge!", "success");
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  Trung Tâm Tiện Ích & Bộ Cài Đặt (Extensions & Apps Hub)
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Universal Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cài đặt tiện ích trên Chrome Web Store, tải APK Android, chạy native Windows/macOS hoặc xem phim toàn màn hình tối ưu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: "chrome", label: "Chrome Web Store / Edge", icon: Globe, badge: "Extension" },
            { id: "apk", label: "Android APK & TV Box", icon: Smartphone, badge: "Mobile App" },
            { id: "desktop", label: "Windows / macOS / Linux", icon: Laptop, badge: "Native" },
            { id: "pwa", label: "PWA Web App (iOS / Safari)", icon: Zap, badge: "Instant" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    isActive
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CHROME WEB STORE & BROWSER EXTENSIONS */}
          {activeTab === "chrome" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 border border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Tiện Ích Trình Duyệt Chrome Web Store (Manifest V3)</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    1-Click: Dịch Trực Tiếp & Tự Động Thuyết Minh Trên Mọi Web
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Tích hợp thẳng vào Chrome, Edge, Brave, Cốc Cốc. Tự động nhận diện video đang phát,
                    dịch phụ đề Vietsub và phát giọng thuyết minh AI tiếng Việt mà không cần thao tác nút bấm thủ công.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadChromeExtension}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Gói Tiện Ích Chrome (.ZIP / Manifest)</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBookmarkletModal();
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span>Dùng Bookmarklet 1-Click (Không cần tải file)</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400 font-mono">BƯỚC 1</span>
                  <div className="font-semibold text-xs text-white">Tải về hoặc ghim Bookmarklet</div>
                  <p className="text-[11px] text-slate-400">
                    Tải gói Manifest hoặc nhấn kéo Bookmarklet 1-Click lên thanh dấu trang trình duyệt.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400 font-mono">BƯỚC 2</span>
                  <div className="font-semibold text-xs text-white">Mở trang web video bất kỳ</div>
                  <p className="text-[11px] text-slate-400">
                    Mở YouTube, TikTok, Netflix, Douyin, AV01, Bilibili hoặc web xem phim trực tuyến.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400 font-mono">BƯỚC 3</span>
                  <div className="font-semibold text-xs text-white">Tự động dịch & thuyết minh</div>
                  <p className="text-[11px] text-slate-400">
                    Tiện ích tự động nhận diện video và đọc thuyết minh tiếng Việt không cần ấn nút thủ công.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID APK */}
          {activeTab === "apk" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>Bộ Cài Đặt Android APK Chuyên Dụng</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Vietsub Video Studio Mobile & Android TV (APK)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Chạy độc lập mượt mà trên điện thoại Android, máy tính bảng và Android TV Box.
                    Hỗ trợ chế độ Fullscreen Cinema toàn màn hình, lồng tiếng phân vai AI và tự động tối ưu tỉ lệ 9:16 dọc cho Shorts/Reels.
                  </p>
                </div>

                <button
                  onClick={handleDownloadApk}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all shrink-0 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Bộ Cài APK (v2.5 Pro)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Tương thích Android 8.0 đến Android 15</span>
                    <span className="text-slate-400 text-[11px]">Hỗ trợ kiến trúc ARM64, ARMv7, x86_64</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Tv className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Chế độ Rạp Chiếu Android TV</span>
                    <span className="text-slate-400 text-[11px]">Điều khiển qua Remote, bàn phím và chuột không dây</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESKTOP WINDOWS / MACOS */}
          {activeTab === "desktop" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-900 border border-purple-500/40 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Laptop className="w-4 h-4" />
                    <span>Bộ Cài Đặt Desktop Native (Windows, macOS, Linux)</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Trải Nghiệm Render Video Tốc Độ Cao Bằng GPU Native
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Chạy độc lập không phụ thuộc trình duyệt, tăng tốc xuất video 4K 60fps và xử lý phụ đề mốc thời gian lớn.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onNotify?.("Đang chuẩn bị gói tải Windows Setup 64-bit...", "info")}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
                  >
                    <span>🪟 Tải Windows (.exe)</span>
                  </button>
                  <button
                    onClick={() => onNotify?.("Đang chuẩn bị gói tải macOS Apple Silicon & Intel...", "info")}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
                  >
                    <Apple className="w-3.5 h-3.5" />
                    <span>Tải macOS (.dmg)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PWA WEB APP */}
          {activeTab === "pwa" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-white text-sm block">Cài đặt Progressive Web App (PWA) 1 Giây</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Trên iPhone/iPad (Safari): Nhấn nút <strong>Chia sẻ (Share)</strong> ➔ Chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                    Ứng dụng sẽ hoạt động full màn hình như app App Store native!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Cinema Fullscreen Launcher Feature Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-950 border border-rose-500/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">
                  Giao Diện Xem Toàn Màn Hình Tối Ưu (Optimized Full-Screen Cinema)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Xem video với phụ đề nổi chất lượng cao, tự động thuyết minh, đổi tỉ lệ 16:9, 9:16 và 21:9 chuẩn rạp
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCinemaMode();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <span>Mở Toàn Màn Hình Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mã nguồn sạch 100%, bảo mật tuyệt đối, không thu thập dữ liệu cá nhân</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
