import React, { useState, useRef } from "react";
import {
  X,
  Languages,
  Image as ImageIcon,
  FileText,
  Upload,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Subtitles,
  ExternalLink,
} from "lucide-react";
import { SubtitleCue } from "../types";

interface ImageTextTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppendSubtitles?: (newCues: SubtitleCue[]) => void;
}

export const ImageTextTranslatorModal: React.FC<ImageTextTranslatorModalProps> = ({
  isOpen,
  onClose,
  onAppendSubtitles,
}) => {
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [targetLang, setTargetLang] = useState("vi");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranslate = async () => {
    if (activeTab === "image" && !imagePreview) return;
    if (activeTab === "text" && !inputText.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/ocr-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: activeTab === "image" ? imagePreview : undefined,
          textContent: activeTab === "text" ? inputText : undefined,
          targetLang,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi dịch thuật.");
      setResult(json.data);
    } catch (err: any) {
      alert("Lỗi dịch ngôn ngữ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTranslated = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImportToSubtitles = () => {
    if (!result?.subtitlesList || !onAppendSubtitles) return;
    const formattedCues: SubtitleCue[] = result.subtitlesList.map((s: any, idx: number) => ({
      id: Date.now() + idx,
      start: Number(s.start || idx * 3.5),
      end: Number(s.end || (idx + 1) * 3.5),
      textOriginal: s.textOriginal || "",
      textVi: s.textVi || s.text || "",
    }));
    onAppendSubtitles(formattedCues);
    alert(`Đã thêm ${formattedCues.length} câu thoại từ hình ảnh/văn bản vào danh sách phụ đề dự án!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Dịch Thuật Đa Ngôn Ngữ Hình Ảnh & Văn Bản
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  Gemini Vision OCR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Nhận diện chữ trên ảnh chụp/poster và dịch thuật văn bản sang Vietsub chuẩn điện ảnh
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

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/40">
          <button
            onClick={() => setActiveTab("image")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "image"
                ? "border-cyan-500 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>OCR & Dịch Chữ Trên Ảnh (Image Translation)</span>
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "text"
                ? "border-cyan-500 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Biên Dịch Văn Bản Chuyên Sâu (Text Translation)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Target Language Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <Languages className="w-4 h-4 text-cyan-400" /> Ngôn ngữ đích cần chuyển đổi:
            </span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="vi">🇻🇳 Tiếng Việt (Vietnamese Vietsub)</option>
              <option value="en">🇬🇧 Tiếng Anh (English)</option>
              <option value="ja">🇯🇵 Tiếng Nhật (Japanese / 日本語)</option>
              <option value="ko">🇰🇷 Tiếng Hàn (Korean / 한국어)</option>
              <option value="zh">🇨🇳 Tiếng Trung (Chinese / 中文)</option>
              <option value="fr">🇫🇷 Tiếng Pháp (French / Français)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Side */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {activeTab === "image" ? "Ảnh cần dịch thuật" : "Văn bản gốc"}
              </label>

              {activeTab === "image" ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black min-h-[220px] flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Upload"
                        className="max-h-60 w-auto object-contain"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs border border-slate-700 hover:bg-slate-800 transition"
                      >
                        Đổi ảnh khác
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[220px] rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/40 text-slate-400 hover:text-slate-200 text-xs flex flex-col items-center justify-center gap-2.5 transition p-6"
                    >
                      <Upload className="w-8 h-8 text-cyan-400" />
                      <div className="text-center">
                        <span className="font-semibold text-white">Tải lên ảnh chụp chữ hoặc poster</span>
                        <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP lên đến 20MB</p>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  placeholder="Nhập hoặc dán đoạn văn bản, kịch bản, lời thoại cần biên dịch sang tiếng Việt..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-mono"
                />
              )}

              <button
                onClick={handleTranslate}
                disabled={isLoading || (activeTab === "image" ? !imagePreview : !inputText.trim())}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gemini Vision đang phân tích & dịch thuật...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Thực Hiện Dịch Thuật Ngôn Ngữ
                  </>
                )}
              </button>
            </div>

            {/* Result Side */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Kết quả biên dịch
                </label>
                {result?.translatedText && (
                  <button
                    onClick={handleCopyTranslated}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-y-auto space-y-3 min-h-[260px] text-xs">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span>Đang bóc tách OCR và tra cứu ngữ điệu tiếng Việt...</span>
                  </div>
                ) : result ? (
                  <div className="space-y-3 text-slate-200">
                    {result.detectedText && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold mb-0.5 uppercase">
                          Văn bản gốc phát hiện ({result.sourceLanguage || "Tự động"}):
                        </span>
                        <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                          {result.detectedText}
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-cyan-100">
                      <span className="text-[10px] text-cyan-300 block font-bold mb-1 uppercase">
                        Bản dịch hoàn thiện ({targetLang.toUpperCase()}):
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap font-medium">
                        {result.translatedText}
                      </p>
                    </div>

                    {result.notes && (
                      <div className="text-[11px] text-slate-400 italic">
                        💡 {result.notes}
                      </div>
                    )}

                    {result.subtitlesList && result.subtitlesList.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                          <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
                          Phát hiện {result.subtitlesList.length} phân đoạn thoại
                        </span>
                        <button
                          onClick={handleImportToSubtitles}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <PlusCircle className="w-4 h-4" /> Nạp vào Timeline Phụ Đề Video
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                    <Languages className="w-8 h-8 text-slate-600 mb-2" />
                    <span>Chưa có kết quả dịch. Tải ảnh hoặc nhập văn bản và bấm thực hiện.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <span>Hỗ trợ đa ngôn ngữ: Nhật, Hàn, Trung, Anh, Pháp sang Vietsub tự nhiên</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
