import { SubtitleCue } from "../types";

export interface SmartMergeOptions {
  maxDurationSec: number; // e.g. 4.5 seconds
  maxGapMs: number;       // e.g. 400 milliseconds
  maxCharLength: number;  // e.g. 70 characters
  respectPunctuation: boolean; // don't merge if first cue ends with terminal punctuation (. ? !)
  respectSpeakerChange: boolean; // don't merge if speaker role/gender changes
}

export const DEFAULT_SMART_MERGE_OPTIONS: SmartMergeOptions = {
  maxDurationSec: 4.5,
  maxGapMs: 400,
  maxCharLength: 70,
  respectPunctuation: true,
  respectSpeakerChange: true,
};

export interface SmartMergeResult {
  cues: SubtitleCue[];
  originalCount: number;
  mergedCount: number;
  reducedCount: number;
  reducedPercentage: number;
}

/**
 * Format milliseconds / seconds to SRT timecode "HH:MM:SS,mmm"
 */
export function formatTimecode(seconds: number): string {
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const hours = Math.floor(totalMin / 60);

  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  return `${pad(hours)}:${pad(min)}:${pad(sec)},${pad(ms, 3)}`;
}

/**
 * SmartMergeEngine algorithm ported from Kotlin SmartMergeEngine.kt
 * Merges fragmented subtitle cues caused by speech-to-text pauses into coherent, natural lines.
 */
export function smartMergeSubtitles(
  cues: SubtitleCue[],
  options: Partial<SmartMergeOptions> = {}
): SmartMergeResult {
  const opts: SmartMergeOptions = { ...DEFAULT_SMART_MERGE_OPTIONS, ...options };

  if (!cues || cues.length <= 1) {
    return {
      cues: [...(cues || [])],
      originalCount: cues?.length || 0,
      mergedCount: cues?.length || 0,
      reducedCount: 0,
      reducedPercentage: 0,
    };
  }

  const merged: SubtitleCue[] = [];
  let current: SubtitleCue = { ...cues[0] };

  for (let i = 1; i < cues.length; i++) {
    const next = cues[i];
    const gapMs = Math.max(0, (next.start - current.end) * 1000);
    const combinedDuration = next.end - current.start;
    const combinedLength = (current.textVi || "").trim().length + (next.textVi || "").trim().length;

    // Check terminal punctuation on current cue
    const currentTrimmed = (current.textVi || "").trim();
    const endsWithTerminal = /[.!?]$/.test(currentTrimmed);

    // Check speaker compatibility
    const sameSpeaker =
      !opts.respectSpeakerChange ||
      !current.speakerRole ||
      !next.speakerRole ||
      current.speakerRole === next.speakerRole;

    const canMerge =
      sameSpeaker &&
      gapMs <= opts.maxGapMs &&
      combinedDuration <= opts.maxDurationSec &&
      combinedLength <= opts.maxCharLength &&
      (!opts.respectPunctuation || !endsWithTerminal);

    if (canMerge) {
      current.end = next.end;
      current.endTime = formatTimecode(next.end);
      current.textVi = `${current.textVi.trim()} ${next.textVi.trim()}`;
      if (current.textOriginal || next.textOriginal) {
        current.textOriginal = `${(current.textOriginal || "").trim()} ${(next.textOriginal || "").trim()}`.trim();
      }
      // Preserve speaker tags
      if (!current.speakerRole && next.speakerRole) {
        current.speakerRole = next.speakerRole;
        current.speakerGender = next.speakerGender;
        current.voicePersona = next.voicePersona;
      }
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);

  // Re-number cue IDs sequentially
  const finalCues = merged.map((c, idx) => ({
    ...c,
    id: idx + 1,
  }));

  const reducedCount = cues.length - finalCues.length;
  const reducedPercentage = Math.round((reducedCount / cues.length) * 100);

  return {
    cues: finalCues,
    originalCount: cues.length,
    mergedCount: finalCues.length,
    reducedCount,
    reducedPercentage,
  };
}

/**
 * Built-in test suite matching SmartMergeEngineTest.kt
 */
export function runSmartMergeEngineTests(): { passed: boolean; testCases: { name: string; success: boolean; details: string }[] } {
  const results = [];

  // Test Case 1: Merge rapid short fragments
  const mockCues1: SubtitleCue[] = [
    { id: 1, start: 1.0, end: 1.8, startTime: "00:00:01,000", endTime: "00:00:01,800", textOriginal: "Hello", textVi: "Xin chào" },
    { id: 2, start: 1.9, end: 2.7, startTime: "00:00:01,900", endTime: "00:00:02,700", textOriginal: "my friend", textVi: "bạn của tôi" },
  ];
  const res1 = smartMergeSubtitles(mockCues1, { maxGapMs: 300, maxDurationSec: 4.0 });
  const t1Passed = res1.cues.length === 1 && res1.cues[0].textVi === "Xin chào bạn của tôi";
  results.push({
    name: "testMergeRapidFragments",
    success: t1Passed,
    details: `Input: 2 cues -> Output: ${res1.cues.length} cue ("${res1.cues[0]?.textVi}")`,
  });

  // Test Case 2: Respect Long Pause (> maxGapMs)
  const mockCues2: SubtitleCue[] = [
    { id: 1, start: 1.0, end: 2.0, startTime: "00:00:01,000", endTime: "00:00:02,000", textOriginal: "Part one", textVi: "Đoạn một" },
    { id: 2, start: 3.5, end: 4.5, startTime: "00:00:03,500", endTime: "00:00:04,500", textOriginal: "Part two", textVi: "Đoạn hai" }, // gap = 1500ms
  ];
  const res2 = smartMergeSubtitles(mockCues2, { maxGapMs: 400 });
  const t2Passed = res2.cues.length === 2;
  results.push({
    name: "testRespectLongPauseGap",
    success: t2Passed,
    details: `Gap 1500ms > maxGapMs 400ms -> Preserved 2 cues independently`,
  });

  // Test Case 3: Respect Different Speakers
  const mockCues3: SubtitleCue[] = [
    { id: 1, start: 1.0, end: 2.0, startTime: "00:00:01,000", endTime: "00:00:02,000", textOriginal: "Who are you?", textVi: "Bạn là ai?", speakerRole: "Nam" },
    { id: 2, start: 2.1, end: 3.0, startTime: "00:00:02,100", endTime: "00:00:03,000", textOriginal: "I am Linh", textVi: "Tôi là Linh", speakerRole: "Nữ" },
  ];
  const res3 = smartMergeSubtitles(mockCues3, { respectSpeakerChange: true, maxGapMs: 500 });
  const t3Passed = res3.cues.length === 2;
  results.push({
    name: "testRespectDifferentSpeakers",
    success: t3Passed,
    details: `Speaker Nam & Nữ -> Không bị gộp lẫn lộn`,
  });

  const allPassed = results.every(r => r.success);
  return { passed: allPassed, testCases: results };
}
