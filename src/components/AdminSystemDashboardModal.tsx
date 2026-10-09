import React, { useState, useEffect } from "react";
import { X, Server, Cpu, HardDrive, Activity, Shield, ToggleLeft, ToggleRight, AlertTriangle, RefreshCw, CheckCircle2, Lock } from "lucide-react";

interface AdminSystemDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerMaintenanceView?: (active: boolean) => void;
}

export const AdminSystemDashboardModal: React.FC<AdminSystemDashboardModalProps> = ({
  isOpen,
  onClose,
  onTriggerMaintenanceView,
}) => {
  const [systemData, setSystemData] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    smartMergeEngine: true,
    geminiChatbot: true,
    geminiImageBanana: true,
    veoVideoAnimation: true,
    highThinkingMode: true,
    cloudflareEdgeProxy: true,
    autoMultiVoiceTts: true,
  });
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [passcode, setPasscode] = useState("ADMIN2026");
  const [maintenanceReason, setMaintenanceReason] = useState("Nâng cấp cụm máy chủ Render GPU & Ktor Pipeline");
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/system");
      const data = await res.json();
      if (data.success) {
        setSystemData(data);
        setIsMaintenance(data.maintenance?.active || false);
        if (data.featureFlags) setFeatureFlags(data.featureFlags);
      }
    } catch (e) {
      console.warn("Could not fetch admin system status", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMaintenance = async () => {
    setIsLoading(true);
    const targetState = !isMaintenance;
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: targetState,
          reason: maintenanceReason,
          passcode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thao tác thất bại.");

      setIsMaintenance(targetState);
      onTriggerMaintenanceView?.(targetState);
      alert(data.message);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeature = async (key: string) => {
    const nextState = { ...featureFlags, [key]: !featureFlags[key] };
    setFeatureFlags(nextState);
    try {
      await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: nextState }),
      });
    } catch (e) {
      console.warn("Feature flag save error", e);
    }
  };

  const server = systemData?.server || {
    cpuPercent: 16,
    ramUsageMb: 420,
    totalRamMb: 2048,
    ramPercent: 21,
    uptimeSeconds: 1420,
    platform: "linux",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Bảng điều khiển Quản trị Hệ thống</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                  Admin Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Giám sát hiệu năng phần cứng, điều phối tính năng động và trạng thái bảo trì toàn hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>CPU Usage</span>
                <Cpu className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white">{server.cpuPercent}%</p>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${server.cpuPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>RAM RSS</span>
                <HardDrive className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{server.ramUsageMb} MB</p>
              <p className="text-[11px] text-slate-400 mt-1">/ {server.totalRamMb} MB ({server.ramPercent}%)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Active Render Jobs</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">{systemData?.queue?.activeJobs || 0}</p>
              <p className="text-[11px] text-slate-400 mt-1">FFmpeg Workers: 2 sẵn sàng</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Trạng thái Hệ thống</span>
                <Shield className="w-4 h-4 text-rose-400" />
              </div>
              <p className={`text-base font-bold ${isMaintenance ? "text-rose-400" : "text-emerald-400"}`}>
                {isMaintenance ? "🔴 BẢO TRÌ" : "🟢 HOẠT ĐỘNG"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Uptime: {server.uptimeSeconds}s</p>
            </div>
          </div>

          {/* Maintenance Mode Lock Control */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Chế độ Bảo trì (Maintenance Mode & Screen Lockout)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Khi kích hoạt, toàn bộ người dùng truy cập Web/TMA sẽ thấy Màn hình Bảo trì khóa cứng.
                </p>
              </div>

              <button
                onClick={handleToggleMaintenance}
                disabled={isLoading}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                  isMaintenance
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25"
                }`}
              >
                {isMaintenance ? "Mở Khóa Toàn Hệ Thống (Tắt Bảo trì)" : "Khóa Toàn Hệ Thống (Bật Bảo trì)"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mã xác thực Admin Bypass (Mặc định: ADMIN2026)</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Thông báo bảo trì hiển thị với người dùng</label>
                <input
                  type="text"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Feature Flags */}
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ToggleRight className="w-4 h-4 text-indigo-400" /> Quản lý Tính năng Động (Dynamic Feature Flags)
            </h3>
            <p className="text-xs text-slate-400">
              Bật/Tắt tính năng theo thời gian thực mà không cần khởi động lại máy chủ
            </p>

            {/* Cross-Platform Deployment & Sideload Releases Hub */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" /> Quản Trị Phát Hành Đa Nền Tảng (Direct Sideload & Bypassing Stores)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Bypass App Store & Play Store
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Người dùng có thể tải trực tiếp file cài đặt (.apk, .ipa, .exe, .dmg) từ trang chủ mà không cần qua chợ ứng dụng. Hệ thống tự động nhận diện thiết bị (Windows, macOS, Linux, Android, iOS, Web/TMA).
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-700">
                  <div className="text-[11px] text-slate-400">Android APK / AAB</div>
                  <div className="font-bold text-emerald-400">v2.8.0-release.apk</div>
                  <div className="text-[10px] text-slate-500">ExoPlayer Native</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-700">
                  <div className="text-[11px] text-slate-400">Windows Executable</div>
                  <div className="font-bold text-sky-400">VietsubStudio-Setup.exe</div>
                  <div className="text-[10px] text-slate-500">x64 / ARM64 Direct</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-700">
                  <div className="text-[11px] text-slate-400">macOS Package</div>
                  <div className="font-bold text-purple-400">VietsubStudio.dmg</div>
                  <div className="text-[10px] text-slate-500">Universal Silicon & Intel</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-700">
                  <div className="text-[11px] text-slate-400">iOS Sideload / IPA</div>
                  <div className="font-bold text-rose-400">VietsubStudio.ipa</div>
                  <div className="text-[10px] text-slate-500">AltStore & TestFlight</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { key: "smartMergeEngine", label: "SmartMergeEngine™ Thuật toán gộp sub", desc: "Tối ưu hóa câu thoại vụn thành dòng Vietsub chuẩn" },
                { key: "geminiChatbot", label: "Gemini Chatbot Co-Pilot", desc: "Trợ lý đàm thoại đa lượt hỗ trợ kịch bản & dịch phim" },
                { key: "highThinkingMode", label: "High Thinking Reasoning", desc: "Kích hoạt mô hình gemini-3.1-pro-preview tư duy sâu" },
                { key: "geminiImageBanana", label: "AI Cover (gemini-nano-banana-2.1)", desc: "Trình tạo poster & thumbnail bằng câu lệnh" },
                { key: "veoVideoAnimation", label: "Veo Video Generator (16:9 / 9:16)", desc: "Tạo chuyển động video từ ảnh tĩnh" },
                { key: "autoMultiVoiceTts", label: "Gemini 3.8 Flash TTS Voiceover", desc: "Thuyết minh đa vai nam/nữ/già/trẻ tự động" },
                { key: "crossPlatformToolkit", label: "Cross-Platform UI Studio Engine", desc: "Bộ công cụ Flutter / React Native / Jetpack Compose & XML" },
              ].map((flag) => {
                const isEnabled = featureFlags[flag.key] ?? true;
                return (
                  <div
                    key={flag.key}
                    onClick={() => handleToggleFeature(flag.key)}
                    className="p-3 rounded-xl bg-slate-850 border border-slate-700/60 hover:border-slate-600 flex items-center justify-between cursor-pointer transition select-none"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{flag.label}</h4>
                      <p className="text-[11px] text-slate-400">{flag.desc}</p>
                    </div>
                    <div className="shrink-0 ml-3">
                      {isEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> BẬT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-700/30 px-2 py-0.5 rounded-full border border-slate-700">
                          TẮT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Whitelist Admin: 718291029, 891273912, quanlinh2210@gmail.com</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
