import React, { useState, useRef } from "react";
import { X, Film, Upload, Sparkles, Play, Download, Check, RefreshCw, Wand2, ArrowRight } from "lucide-react";

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadVideoIntoStudio: (videoUrl: string, title: string) => void;
}

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
  onLoadVideoIntoStudio,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Cinematic slow camera pan, dramatic lighting, subtle particle movements");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("Veo AI Animation");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setVideoTitle(file.name.replace(/\.[^/.]+$/, "") + " (Veo Animated)");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    try {
      const res = await fetch("/api/ai/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          prompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo video Veo thất bại.");

      setGeneratedVideoUrl(data.videoUrl);
    } catch (err: any) {
      alert("Lỗi tạo video Veo: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseInStudio = () => {
    if (generatedVideoUrl) {
      onLoadVideoIntoStudio(generatedVideoUrl, videoTitle);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Veo Video Generator</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chuyển đổi hình ảnh tĩnh thành video điện ảnh chuyển động mượt mà
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Input & Image Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Tải ảnh gốc (Photo / Artwork)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {selectedImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 group aspect-video bg-black flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Uploaded frame"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-medium transition backdrop-blur-xs"
                    >
                      <Upload className="w-4 h-4" /> Đổi ảnh khác
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-700 hover:border-rose-500/60 bg-slate-800/40 hover:bg-slate-800/70 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition cursor-pointer p-4"
                  >
                    <Upload className="w-8 h-8 text-rose-400" />
                    <span className="text-xs font-semibold">Tải ảnh lên từ máy tính</span>
                    <span className="text-[10px] text-slate-500">Hỗ trợ JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  2. Tỉ lệ khung hình (Aspect Ratio)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      aspectRatio === "16:9"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-sm"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="w-4 h-2.5 rounded-xs border border-current" />
                    16:9 (Landscape - Youtube / Phim)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      aspectRatio === "9:16"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-sm"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="w-2.5 h-4 rounded-xs border border-current" />
                    9:16 (Portrait - TikTok / Reels)
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  3. Câu lệnh chuyển động (Motion Prompt)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  placeholder="Mô tả hướng chuyển động camera, gió, ánh sáng, góc quay..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang tạo chuyển động video qua Veo AI...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Tạo Video bằng veo-3.1-fast-generate-preview
                  </>
                )}
              </button>
            </div>

            {/* Right: Output Video Player */}
            <div className="space-y-4 flex flex-col">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Kết quả Video đã tạo
              </label>

              <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden min-h-[260px] relative">
                {generatedVideoUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      className={`max-h-72 rounded-lg shadow-lg ${
                        aspectRatio === "9:16" ? "h-72 w-auto aspect-[9/16]" : "w-full aspect-video"
                      }`}
                    />
                  </div>
                ) : isGenerating ? (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-medium text-rose-300">Veo Video Generator đang kết xuất...</p>
                    <p className="text-[11px] text-slate-500">Mô hình: veo-3.1-fast-generate-preview ({aspectRatio})</p>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2 text-slate-500">
                    <Film className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-xs">Chưa có video. Tải ảnh và nhấn nút tạo video.</p>
                  </div>
                )}
              </div>

              {generatedVideoUrl && (
                <div className="flex gap-2">
                  <button
                    onClick={handleUseInStudio}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4" />
                    Nạp vào Studio để làm Vietsub
                  </button>
                  <a
                    href={generatedVideoUrl}
                    download="veo-video.mp4"
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" /> Tải MP4
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Chuẩn tỉ lệ: 16:9 và 9:16 theo tiêu chuẩn Veo AI Model</span>
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
