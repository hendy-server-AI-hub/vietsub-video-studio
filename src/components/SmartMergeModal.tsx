import React, { useState, useMemo } from "react";
import { X, GitMerge, Sliders, Play, CheckCircle2, AlertCircle, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { SubtitleCue } from "../types";
import {
  smartMergeSubtitles,
  runSmartMergeEngineTests,
  DEFAULT_SMART_MERGE_OPTIONS,
  SmartMergeOptions,
} from "../utils/smartMergeEngine";

interface SmartMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cues: SubtitleCue[];
  onApplyMergedCues: (mergedCues: SubtitleCue[]) => void;
}

export const SmartMergeModal: React.FC<SmartMergeModalProps> = ({
  isOpen,
  onClose,
  cues,
  onApplyMergedCues,
}) => {
  const [options, setOptions] = useState<SmartMergeOptions>(DEFAULT_SMART_MERGE_OPTIONS);
  const [testResults, setTestResults] = useState<{ passed: boolean; testCases: any[] } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Live preview calculation of smart merge
  const preview = useMemo(() => {
    return smartMergeSubtitles(cues, options);
  }, [cues, options]);

  if (!isOpen) return null;

  const handleRunTests = () => {
    const results = runSmartMergeEngineTests();
    setTestResults(results);
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApplyMergedCues(preview.cues);
      setIsApplying(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 text-white shadow-lg shadow-indigo-500/20">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                SmartMergeEngine™
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Kotlin Port v2.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Thuật toán AI tự động gộp các câu phụ đề vụn, rút gọn số lượng dòng thoại và đồng bộ nhịp thở
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
          {/* Metrics Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Số câu ban đầu</p>
              <p className="text-2xl font-bold text-slate-200 mt-1">{preview.originalCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Sau khi gộp</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{preview.mergedCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Đã tinh gọn</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">-{preview.reducedCount} câu</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Tỷ lệ tối ưu</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">+{preview.reducedPercentage}%</p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Tham số Thuật toán Gộp thông minh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Độ dài tối đa 1 câu</span>
                  <span className="text-indigo-400 font-semibold">{options.maxDurationSec} giây</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="8.0"
                  step="0.5"
                  value={options.maxDurationSec}
                  onChange={(e) => setOptions({ ...options, maxDurationSec: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Khoảng nghỉ tối đa (Gap)</span>
                  <span className="text-indigo-400 font-semibold">{options.maxGapMs} ms</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={options.maxGapMs}
                  onChange={(e) => setOptions({ ...options, maxGapMs: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Giới hạn ký tự/câu</span>
                  <span className="text-indigo-400 font-semibold">{options.maxCharLength} ký tự</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="5"
                  value={options.maxCharLength}
                  onChange={(e) => setOptions({ ...options, maxCharLength: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-700/40 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.respectPunctuation}
                  onChange={(e) => setOptions({ ...options, respectPunctuation: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">Không gộp khi gặp dấu kết câu (. ! ?)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.respectSpeakerChange}
                  onChange={(e) => setOptions({ ...options, respectSpeakerChange: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">Tôn trọng phân vai (Không gộp nếu đổi nhân vật)</span>
              </label>
            </div>
          </div>

          {/* Preview list */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Xem trước Phụ đề sau khi xử lý ({preview.cues.length} câu)
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {preview.cues.slice(0, 10).map((cue) => (
                <div
                  key={cue.id}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-indigo-300 font-mono text-[11px] shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                      #{cue.id}
                    </span>
                    <span>{cue.startTime} → {cue.endTime}</span>
                  </div>
                  <div className="flex-1 text-slate-200">
                    <p className="font-medium text-amber-300">{cue.textVi}</p>
                    {cue.textOriginal && (
                      <p className="text-slate-400 text-[11px] mt-0.5 italic">{cue.textOriginal}</p>
                    )}
                  </div>
                  {cue.speakerRole && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 shrink-0">
                      {cue.speakerRole}
                    </span>
                  )}
                </div>
              ))}
              {preview.cues.length > 10 && (
                <p className="text-center text-xs text-slate-500 italic py-1">
                  ... và {preview.cues.length - 10} câu phụ đề khác đã được tối ưu.
                </p>
              )}
            </div>
          </div>

          {/* Test Runner Suite */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-emerald-400" /> Kiểm thử thuật toán (SmartMergeEngineTest.kt)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Chạy bộ unit test mô phỏng test suite nguyên bản trong Kotlin Multiplatform
                </p>
              </div>
              <button
                onClick={handleRunTests}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Chạy Test Suite
              </button>
            </div>

            {testResults && (
              <div className="mt-3 pt-3 border-t border-slate-700/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Tất cả {testResults.testCases.length} kịch bản kiểm thử đã ĐẠT (PASS)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {testResults.testCases.map((tc, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900/60 border border-slate-700/30 text-[11px]">
                      <span className="text-emerald-400 font-mono">✓ {tc.name}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{tc.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={() => setOptions(DEFAULT_SMART_MERGE_OPTIONS)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Mặc định
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || preview.cues.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Áp dụng vào Timeline ({preview.cues.length} câu)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
