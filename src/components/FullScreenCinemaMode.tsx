import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Sparkles,
  Mic,
  Sliders,
  Eye,
  EyeOff,
  Layers,
  Film,
  Zap,
} from "lucide-react";
import { SubtitleCue, SubtitleStyle, VoiceoverConfig } from "../types";
import { previewSpeakerPersona, stopVoicePreview } from "../utils/voiceoverEngine";

interface FullScreenCinemaModeProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle?: string;
  cues: SubtitleCue[];
  currentTime: number;
  onSeek: (time: number) => void;
  subtitleStyle: SubtitleStyle;
  voiceoverConfig: VoiceoverConfig;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const FullScreenCinemaMode: React.FC<FullScreenCinemaModeProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoTitle = "Video Vietsub",
  cues,
  currentTime,
  onSeek,
  subtitleStyle,
  voiceoverConfig,
  onNotify,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [aspectMode, setAspectMode] = useState<"contain" | "cover" | "21:9" | "9:16">("contain");
  const [autoNarrate, setAutoNarrate] = useState(voiceoverConfig.enabled);
  const [speechSpeed, setSpeechSpeed] = useState(voiceoverConfig.speechRate || 1.0);
  const [showControls, setShowControls] = useState(true);
  const [activeCue, setActiveCue] = useState<SubtitleCue | null>(null);
  const lastSpokenCueIdRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Keyboard navigation & Esc listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setShowSubtitles((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopVoicePreview();
    };
  }, [isOpen]);

  // Sync current time with active subtitle cue and auto narration
  useEffect(() => {
    if (!isOpen) return;

    const cue = cues.find((c) => currentTime >= c.start && currentTime <= c.end) || null;
    setActiveCue(cue);

    if (cue && autoNarrate && isPlaying) {
      if (lastSpokenCueIdRef.current !== cue.id) {
        lastSpokenCueIdRef.current = cue.id;
        const textToRead = (cue.textVi || cue.textOriginal || "").trim();
        if (textToRead) {
          const persona = cue.voicePersona || (cue.speakerGender === "female" ? "female_young" : "male_young");
          previewSpeakerPersona(persona, textToRead).catch(() => {});
        }
      }
    }
  }, [currentTime, cues, autoNarrate, isPlaying, isOpen]);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3200);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const seekRelative = (delta: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = target;
    onSeek(target);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden select-none animate-fadeIn"
    >
      {/* Ambient Theater Backlight */}
      <div className="absolute inset-0 bg-gradient-radial from-rose-950/20 via-black to-black pointer-events-none" />

      {/* Main Video Element */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
          aspectMode === "21:9"
            ? "max-h-[75vh]"
            : aspectMode === "9:16"
            ? "max-w-[56.25vh] mx-auto"
            : ""
        }`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full ${
            aspectMode === "cover" ? "object-cover" : "object-contain"
          }`}
          onTimeUpdate={() => {
            if (videoRef.current) {
              onSeek(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              videoRef.current.currentTime = currentTime;
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Dynamic Subtitle Display Overlay */}
        {showSubtitles && activeCue && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 text-center max-w-[90vw] pointer-events-none transition-all duration-150 z-20 ${
              subtitleStyle.position === "top"
                ? "top-[10%]"
                : subtitleStyle.position === "middle"
                ? "top-1/2 -translate-y-1/2"
                : "bottom-[12%]"
            }`}
          >
            <div className="inline-block px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-400/40 shadow-2xl">
              {/* Speaker Role Badge */}
              {activeCue.speakerRole && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-1.5 border border-amber-500/30">
                  <Mic className="w-3 h-3 text-amber-400" />
                  <span>{activeCue.speakerRole}</span>
                </div>
              )}

              {/* Vietnamese Subtitle */}
              <div
                className="font-bold text-amber-300 drop-shadow-md text-xl sm:text-2xl md:text-3xl leading-snug tracking-wide"
                style={{
                  fontFamily:
                    subtitleStyle.fontFamily === "serif"
                      ? "Georgia, serif"
                      : subtitleStyle.fontFamily === "bebas"
                      ? "'Bebas Neue', sans-serif"
                      : "system-ui, sans-serif",
                }}
              >
                {activeCue.textVi}
              </div>

              {/* Original Bilingual Line */}
              {subtitleStyle.displayMode === "bilingual" && activeCue.textOriginal && (
                <div className="text-slate-300 text-xs sm:text-sm mt-1 font-medium opacity-90">
                  {activeCue.textOriginal}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Floating Header Controls */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm sm:text-base drop-shadow-md truncate max-w-md">
              {videoTitle}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rạp Chiếu Toàn Màn Hình</span>
              </span>
              <span>•</span>
              <span>{cues.length} câu phụ đề</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Narrate Toggle */}
          <button
            onClick={() => {
              const next = !autoNarrate;
              setAutoNarrate(next);
              onNotify?.(
                next ? "Đã bật tự động thuyết minh theo phim" : "Đã tắt thuyết minh tự động",
                "info"
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoNarrate
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Tự động đọc thuyết minh tiếng Việt khớp từng câu thoại"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thuyết Minh Tự Động:</span>
            <span>{autoNarrate ? "BẬT" : "TẮT"}</span>
          </button>

          {/* Aspect Ratio Cycler */}
          <button
            onClick={() => {
              const modes: ("contain" | "cover" | "21:9" | "9:16")[] = [
                "contain",
                "cover",
                "21:9",
                "9:16",
              ];
              const next = modes[(modes.indexOf(aspectMode) + 1) % modes.length];
              setAspectMode(next);
              onNotify?.(`Tỉ lệ khung hình: ${next.toUpperCase()}`, "info");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80"
            title="Đổi tỉ lệ màn hình (Chuẩn, Tràn viền, 21:9 Cinema, 9:16 Dọc)"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tỉ Lệ: {aspectMode.toUpperCase()}</span>
          </button>

          {/* Close Fullscreen Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
            title="Thoát chế độ toàn màn hình (Esc)"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Timeline & Player Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-3 z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div className="relative w-full h-2 bg-slate-800/80 rounded-full cursor-pointer overflow-hidden border border-slate-700/60 group">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-75"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = val;
              onSeek(val);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => seekRelative(-5)}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Lùi 5 giây"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekRelative(5)}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Tua tới 5 giây"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="font-mono text-xs text-slate-300">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={toggleMute} className="text-slate-300 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                  }
                  setIsMuted(val === 0);
                }}
                className="w-16 sm:w-20 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Subtitles */}
            <button
              onClick={() => setShowSubtitles((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                showSubtitles
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900/80 text-slate-500 border-slate-800"
              }`}
            >
              {showSubtitles ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Phụ đề</span>
            </button>

            {/* Speech Speed Pill */}
            {autoNarrate && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] text-emerald-300">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Tốc độ đọc: {speechSpeed.toFixed(1)}x</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
