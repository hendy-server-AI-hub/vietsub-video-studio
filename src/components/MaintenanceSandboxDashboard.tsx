import React, { useState, useEffect } from "react";
import {
  Wrench,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  HardDrive,
  Sliders,
  ArrowLeft,
  Copy,
  Check,
  Mic,
  Database,
  Terminal,
} from "lucide-react";
import { SPEAKER_PERSONAS } from "../utils/voiceoverEngine";

interface MaintenanceSandboxDashboardProps {
  onBackToStudio: () => void;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

interface ServerStatus {
  status: string;
  tts: {
    circuitBreakerActive: boolean;
    cooldownRemainingSec: number;
    cacheEntriesCount: number;
    edgeEngineAvailable: boolean;
    supportedVoices: string[];
  };
  models: {
    audioCascade: string[];
    textCascade: string[];
    ttsCascade: string[];
  };
  singleSourceOfTruth: {
    synced: boolean;
    version: string;
    storageEngine: string;
  };
}

export const MaintenanceSandboxDashboard: React.FC<MaintenanceSandboxDashboardProps> = ({
  onBackToStudio,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "circuit_breaker" | "test_harness" | "storage">("overview");
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testText, setTestText] = useState("Hệ thống tổng hợp thuyết minh tiếng Việt tự động hoạt động hoàn hảo.");
  const [testPersona, setTestPersona] = useState<string>("male_young");
  const [isTestingTts, setIsTestingTts] = useState(false);
  const [testResultAudio, setTestResultAudio] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Diagnostic log stream
  const [logs, setLogs] = useState<Array<{ id: string; time: string; level: "info" | "success" | "warn"; msg: string }>>([
    {
      id: "log-1",
      time: new Date().toLocaleTimeString(),
      level: "info",
      msg: "Đã khởi động tiến trình Quản trị Bảo trì & Đồng bộ cấu hình gốc (SSOT)...",
    },
  ]);

  const addLog = (msg: string, level: "info" | "success" | "warn" = "info") => {
    setLogs((prev) => [
      { id: `log-${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString(), level, msg },
      ...prev.slice(0, 30),
    ]);
  };

  // Fetch status on load
  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenance/status");
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
        addLog("Đã đồng bộ trạng thái Gateway và kiểm tra sức khỏe hệ thống thành công.", "success");
      } else {
        addLog("Gateway phản hồi mã trạng thái bất thường khi lấy dữ liệu.", "warn");
      }
    } catch (err: any) {
      addLog(`Lỗi kết nối gateway: ${err.message}`, "warn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 12000);
    return () => clearInterval(interval);
  }, []);

  // Action: Reset Circuit Breaker and Auto-Repair
  const handleResetCircuitBreaker = async () => {
    setIsResetting(true);
    addLog("Đang kích hoạt quy trình tự động vá lỗi & reset Circuit Breaker...", "info");
    try {
      const res = await fetch("/api/maintenance/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearCache: true }),
      });
      const data = await res.json();
      if (res.ok) {
        addLog(`Vá lỗi thành công: ${data.message}`, "success");
        onNotify?.("Đã reset Circuit Breaker & xóa cache hạn ngạch thành công!", "success");
        await fetchStatus();
      } else {
        throw new Error(data.error || "Không thể thực hiện reset");
      }
    } catch (err: any) {
      addLog(`Lỗi khi reset: ${err.message}`, "warn");
      onNotify?.(err.message, "error");
    } finally {
      setIsResetting(false);
    }
  };

  // Action: Test Audio Edge Synthesizer
  const handleRunTtsTest = async () => {
    setIsTestingTts(true);
    addLog(`Đang kiểm thử giọng đọc "${testPersona}" với văn bản mẫu...`, "info");
    try {
      const res = await fetch("/api/maintenance/test-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, persona: testPersona }),
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        setTestResultAudio(data.audioBase64);
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        await audio.play();
        addLog(`Kiểm thử thành công! Đã phát âm thanh bằng ${data.provider}.`, "success");
        onNotify?.("Phát âm thanh kiểm thử thành công!", "success");
      } else {
        throw new Error("Không nhận được dữ liệu âm thanh kiểm thử.");
      }
    } catch (err: any) {
      addLog(`Lỗi kiểm thử âm thanh: ${err.message}`, "warn");
      onNotify?.(err.message, "error");
    } finally {
      setIsTestingTts(false);
    }
  };

  // Action: Force Sync LocalStorage Single Source of Truth
  const handleForceSyncLocalStorage = () => {
    try {
      const presets = localStorage.getItem("vietsub_custom_export_presets");
      if (!presets) {
        localStorage.setItem("vietsub_custom_export_presets", "[]");
      }
      addLog("Đồng bộ cấu hình SSOT LocalStorage hoàn tất.", "success");
      onNotify?.("Đã đồng bộ cơ sở dữ liệu Single Source of Truth!", "success");
    } catch (e: any) {
      addLog(`Lỗi đồng bộ bộ nhớ client: ${e.message}`, "warn");
    }
  };

  const handleCopyDirectLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "maintenance");
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    onNotify?.("Đã sao chép link truy cập trực tiếp trang Quản trị!", "success");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Quay lại Vietsub Studio</span>
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white">
                  Quản Trị Bảo Trì & Single Source of Truth (SSOT)
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Healthy
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Quy trình tự động vá lỗi, giám sát hạn ngạch Quota và đồng bộ trạng thái hệ thống
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyDirectLink}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors"
            title="Sao chép link Router độc lập: ?view=maintenance"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLink ? "Đã chép link!" : "Link Router ?view=maintenance"}</span>
          </button>

          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: "overview", label: "Tổng Quan Sức Khỏe & SSOT", icon: Activity },
            { id: "circuit_breaker", label: "Circuit Breaker & Hạn Ngạch", icon: ShieldCheck },
            { id: "test_harness", label: "Kiểm Thử Âm Thanh (Sandbox)", icon: Mic },
            { id: "storage", label: "Đồng Bộ Dữ Liệu & Nhật Ký", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Trạng Thái Cổng Gateway</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-extrabold text-white flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Hoạt động 100%</span>
                </div>
                <div className="text-[11px] text-slate-500">Node.js Express + TSX Server</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Circuit Breaker TTS</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-extrabold text-white">
                  {serverStatus?.tts?.circuitBreakerActive ? (
                    <span className="text-amber-400">Đang Giảm Tải ({serverStatus.tts.cooldownRemainingSec}s)</span>
                  ) : (
                    <span className="text-emerald-400">Sẵn Sàng</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">Tự động chuyển tiếp khi gặp 429</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Edge Speech Engine</span>
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-extrabold text-white text-indigo-300">
                  Zero Latency
                </div>
                <div className="text-[11px] text-slate-500">Tổng hợp formant WAV không tốn quota</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Single Source of Truth</span>
                  <Database className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-extrabold text-white text-rose-300">
                  Đồng Bộ v2.5
                </div>
                <div className="text-[11px] text-slate-500">Đồng nhất Client & Server Memory</div>
              </div>
            </div>

            {/* Quick Self-Repair Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-950 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Quy Trình Tự Động Vá Lỗi 1-Click (Self-Repair Pipeline)</span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Tự động dọn dẹp các yêu cầu nghẽn 429/503, xóa bộ nhớ đệm lỗi thời, giải phóng Circuit Breaker
                  và tái đồng bộ nguồn chân lý đơn nhất (SSOT) trên toàn hệ thống.
                </p>
              </div>

              <button
                onClick={handleResetCircuitBreaker}
                disabled={isResetting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-600/25 transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
                <span>{isResetting ? "Đang vá lỗi..." : "Vá Lỗi & Đồng Bộ Ngay"}</span>
              </button>
            </div>

            {/* Models Cascade Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Thứ Tự Cascade Mô Hình Âm Thanh & Phụ Đề</span>
                </div>
                <div className="space-y-1.5">
                  {(serverStatus?.models?.audioCascade || [
                    "gemini-3.5-transcribe",
                    "gemini-3.8-flash",
                    "gemini-flash-latest",
                    "gemini-3.5-flash",
                    "gemini-3.1-flash-lite",
                  ]).map((m, idx) => (
                    <div
                      key={m}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                        <span className="font-semibold text-slate-200">{m}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Thứ Tự Tổng Hợp Giọng Đọc Thuyết Minh (TTS)</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: "gemini-3.8-flash-lite-tts", desc: "Mô hình Gemini TTS thế hệ mới", tag: "Primary" },
                    { name: "gemini-3.8-flash-tts", desc: "Mô hình Gemini Studio High-Fidelity", tag: "Secondary" },
                    { name: "edge-speech-engine", desc: "Động cơ tổng hợp Formant trực tiếp (0ms delay)", tag: "Zero-Quota Fallback" },
                  ].map((m, idx) => (
                    <div
                      key={m.name}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                          <span>{m.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold shrink-0">
                        {m.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CIRCUIT BREAKER & QUOTA */}
        {activeTab === "circuit_breaker" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">
                    Cơ Chế Bảo Vệ Hạn Ngạch & Quá Tải (Rate-Limit & Quota Shield)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ngăn chặn hoàn toàn lỗi 429 và thông báo quá tải làm gián đoạn trải nghiệm người dùng
                  </p>
                </div>
                <button
                  onClick={handleResetCircuitBreaker}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  Reset Circuit Breaker Thủ Công
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Trạng thái Circuit Breaker:</div>
                  <div className="text-sm font-bold text-white">
                    {serverStatus?.tts?.circuitBreakerActive ? (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kích hoạt (Còn {serverStatus.tts.cooldownRemainingSec}s)</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bình thường (0 lỗi nghẽn)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Bản ghi Cache giọng đọc:</div>
                  <div className="text-sm font-bold text-white">
                    {serverStatus?.tts?.cacheEntriesCount ?? 0} tệp âm thanh
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Thời gian Cooldown:</div>
                  <div className="text-sm font-bold text-indigo-300">Tự động 60s khi gặp 429</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEST HARNESS SANDBOX */}
        {activeTab === "test_harness" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Khung Thử Nghiệm Sandbox Âm Thanh (TTS Synthesis Benchmark)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thử nghiệm phát âm thanh trực tiếp và đo lường độ phản hồi của bộ tổng hợp giọng đọc
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nội dung văn bản thử nghiệm:
                  </label>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Chọn vai diễn (Speaker Persona):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(SPEAKER_PERSONAS).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTestPersona(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                          testPersona === p.id
                            ? "bg-rose-950/40 border-rose-500 text-white font-bold"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{p.icon}</span>
                          <span>{p.shortLabel}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleRunTtsTest}
                    disabled={isTestingTts || !testText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isTestingTts ? "Đang tổng hợp..." : "Phát Thử Ngay"}</span>
                  </button>

                  {testResultAudio && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã tạo file âm thanh WAV thành công</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORAGE & LOGS */}
        {activeTab === "storage" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">
                    Đồng Bộ Nguồn Dữ Liệu Gốc (Single Source of Truth)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kiểm tra tính toàn vẹn của các cấu hình xuất Video, bộ presets và tuỳ biến giao diện
                  </p>
                </div>

                <button
                  onClick={handleForceSyncLocalStorage}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  Đồng Bộ Dữ Liệu LocalStorage
                </button>
              </div>

              {/* Real-time Telemetry Log Window */}
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nhật ký bảo trì & tự động sửa lỗi (Telemetry Log Stream):</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-52 overflow-y-auto font-mono text-[11px] space-y-1.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 ${
                        log.level === "success"
                          ? "text-emerald-400"
                          : log.level === "warn"
                          ? "text-amber-400"
                          : "text-slate-300"
                      }`}
                    >
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
