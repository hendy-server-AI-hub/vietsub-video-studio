import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Sparkles, Download, Check, Upload, Wand2, RefreshCw } from "lucide-react";

interface AIGenerateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetAsVideoCover?: (imageUrl: string) => void;
}

export const AIGenerateImageModal: React.FC<AIGenerateImageModalProps> = ({
  isOpen,
  onClose,
  onSetAsVideoCover,
}) => {
  const [prompt, setPrompt] = useState("Poster điện ảnh Cyberpunk Vietsub phong cách phim chiếu rạp, ánh sáng neon rực rỡ");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [stylePreset, setStylePreset] = useState("cinematic_poster");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUploadReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          referenceImageBase64: referenceImage,
          style: stylePreset,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo ảnh thất bại.");

      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      alert("Lỗi tạo ảnh: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">AI Image Studio & Cover Editor</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  gemini-nano-banana-2.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tạo và chỉnh sửa poster, thumbnail và ảnh bìa video chuẩn điện ảnh bằng câu lệnh
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Prompt & Settings */}
            <div className="space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Mô tả nội dung ảnh (Prompt)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Mô tả bối cảnh, ánh sáng, nhân vật, tông màu..."
                />
              </div>

              {/* Reference Image Upload for Editing */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>2. Ảnh tham chiếu / Chỉnh sửa ảnh có sẵn</span>
                  {referenceImage && (
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleUploadReference}
                  className="hidden"
                />
                {referenceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 h-28 bg-black flex items-center justify-center">
                    <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs transition"
                    >
                      Thay ảnh khác
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-amber-400" /> Tải ảnh gốc để chỉnh sửa (Tùy chọn)
                  </button>
                )}
              </div>

              {/* Style Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  3. Phong cách nghệ thuật
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "cinematic_poster", label: "🎬 Poster Phim Chiếu Rạp" },
                    { id: "anime_shonen", label: "🎌 Anime Nhật Bản" },
                    { id: "cyberpunk_neon", label: "🌃 Cyberpunk Neon" },
                    { id: "tiktok_thumbnail", label: "📱 Thumbnail Triệu View" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setStylePreset(preset.id)}
                      className={`p-2 rounded-lg border text-left transition ${
                        stylePreset === preset.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  4. Tỉ lệ khung hình
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(["16:9", "9:16", "1:1"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 rounded-lg border text-center transition font-mono ${
                        aspectRatio === ratio
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    gemini-nano-banana-2.1 đang tạo ảnh...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Tạo / Chỉnh sửa Ảnh với gemini-nano-banana-2.1
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Output Image Preview */}
            <div className="space-y-4 flex flex-col">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Kết quả hình ảnh
              </label>

              <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden min-h-[280px] p-2 relative">
                {generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="AI Generated"
                    className="max-h-72 w-auto object-contain rounded-lg shadow-xl"
                  />
                ) : isGenerating ? (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-medium text-amber-300">Đang tổng hợp pixel AI...</p>
                    <p className="text-[11px] text-slate-500">Mô hình: gemini-nano-banana-2.1</p>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2 text-slate-500">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-xs">Chưa có ảnh kết quả. Điền mô tả và bấm Tạo ảnh.</p>
                  </div>
                )}
              </div>

              {generatedImageUrl && (
                <div className="flex gap-2">
                  {onSetAsVideoCover && (
                    <button
                      onClick={() => {
                        onSetAsVideoCover(generatedImageUrl);
                        alert("Đã đặt làm ảnh bìa video dự án!");
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
                    >
                      <Check className="w-4 h-4" /> Đặt làm Thumbnail Video
                    </button>
                  )}
                  <a
                    href={generatedImageUrl}
                    download="vietsub-ai-cover.png"
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" /> Tải PNG
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Tích hợp mô hình gemini-nano-banana-2.1 kết xuất hình ảnh phân giải cao</span>
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
