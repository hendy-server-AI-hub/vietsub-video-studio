import React, { useState, useEffect } from "react";
import {
  X,
  Dna,
  Atom,
  BookOpen,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  Database,
  Check,
  Activity,
  FileText,
} from "lucide-react";
import { SubtitleCue } from "../types";

interface ScienceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  cues: SubtitleCue[];
  onApplyEnrichedCues?: (updatedCues: SubtitleCue[]) => void;
}

export const ScienceStudioModal: React.FC<ScienceStudioModalProps> = ({
  isOpen,
  onClose,
  cues,
  onApplyEnrichedCues,
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "enrich" | "architecture">("search");
  const [searchQuery, setSearchQuery] = useState("TP53");
  const [searchDomain, setSearchDomain] = useState<"all" | "protein" | "chemistry" | "literature">("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  // Subtitle Enricher state
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedTerms, setEnrichedTerms] = useState<any[]>([]);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  // Quick example chips per Science Skill Guidelines
  const EXAMPLE_CHIPS = [
    { label: "TP53", domain: "protein", desc: "Tumor Protein p53" },
    { label: "BRCA1", domain: "protein", desc: "Breast Cancer Gene" },
    { label: "EGFR", domain: "protein", desc: "Epidermal Growth Factor" },
    { label: "Imatinib", domain: "chemistry", desc: "Tyrosine Kinase Inhibitor" },
    { label: "CRISPR-Cas9", domain: "protein", desc: "Gene Editing Enzyme" },
    { label: "mRNA Vaccine", domain: "literature", desc: "Nanoparticle Delivery" },
  ];

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/science/search?q=${encodeURIComponent(q)}&domain=${searchDomain}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err: any) {
      console.warn("Science search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen && !searchResults) {
      handleSearch("TP53");
    }
  }, [isOpen]);

  const handleEnrichCurrentSubtitles = async () => {
    if (cues.length === 0) return;
    setIsEnriching(true);
    setAppliedCount(null);
    try {
      const res = await fetch("/api/science/enrich-subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cues }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrichedTerms(data.terms || []);
      }
    } catch (err: any) {
      alert("Lỗi phân tích: " + err.message);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleApplyTermToSubtitles = (term: any) => {
    if (!onApplyEnrichedCues || cues.length === 0) return;

    const regex = new RegExp(`\\b${term.term}\\b`, "gi");
    let count = 0;
    const updated = cues.map((c) => {
      if (regex.test(c.textVi)) {
        count++;
        return {
          ...c,
          textVi: c.textVi.replace(regex, `${term.term} (${term.vietnameseMeaning})`),
        };
      }
      return c;
    });

    onApplyEnrichedCues(updated);
    setAppliedCount(count);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header - Publication Grade Lab Theme */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Google DeepMind Science Skills Hub</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium font-mono">
                  Bioinformatics & Terminology
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chuẩn hóa thuật ngữ y sinh, gen di truyền (UniProt/AlphaFold), hóa chất (PubChem) & tài liệu (Europe PMC/PubMed)
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition ${
              activeTab === "search"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Tra cứu Khoa học & Cấu trúc Phân tử
          </button>
          <button
            onClick={() => setActiveTab("enrich")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition ${
              activeTab === "enrich"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Chuẩn hóa Thuật ngữ Phụ đề ({cues.length} câu)
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition ${
              activeTab === "architecture"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Sơ đồ Hệ thống & CI/CD Multiplatform
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SCIENCE SEARCH & KNOWLEDGE SCOUT */}
          {activeTab === "search" && (
            <div className="space-y-6">
              {/* Quick-Try Example Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Gợi ý tra cứu nhanh:</span>
                {EXAMPLE_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setSearchQuery(chip.label);
                      handleSearch(chip.label);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-mono text-sky-300 transition flex items-center gap-1.5"
                  >
                    <span>{chip.label}</span>
                    <span className="text-[10px] text-slate-400">({chip.desc})</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Nhập tên gen, protein, công thức hóa chất, hoặc chủ đề khoa học (vd: TP53, Imatinib, mRNA)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <select
                  value={searchDomain}
                  onChange={(e: any) => setSearchDomain(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả Cơ sở Dữ liệu</option>
                  <option value="protein">UniProt & AlphaFold DB</option>
                  <option value="chemistry">PubChem (Hóa chất & Dược phẩm)</option>
                  <option value="literature">Europe PMC & PubMed (Y sinh)</option>
                </select>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-sky-500/20 shrink-0"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Tra cứu
                </button>
              </div>

              {/* Results Grid */}
              {searchResults && (
                <div className="space-y-6">
                  {/* AlphaFold DB Structure Card */}
                  {searchResults.alphafold && (
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Dna className="w-4 h-4 text-sky-400" />
                            AlphaFold DB Structure Prediction
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold font-mono">
                            {searchResults.alphafold.uniprotAccession}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Độ tin cậy dự đoán (Mean pLDDT):{" "}
                          <strong className="text-emerald-400 font-mono">
                            {searchResults.alphafold.plddtScore.toFixed(1)} / 100
                          </strong>{" "}
                          (Very High Confidence &gt; 90)
                        </p>
                        {/* 4-Band pLDDT Scale Indicator */}
                        <div className="flex items-center gap-3 mt-2 text-[10px]">
                          <span className="flex items-center gap-1 text-[#0053D6]">● &gt;90 Rất cao</span>
                          <span className="flex items-center gap-1 text-[#65CBF3]">● 70-90 Tự tin</span>
                          <span className="flex items-center gap-1 text-[#FFDB13]">● 50-70 Thấp</span>
                          <span className="flex items-center gap-1 text-[#FF7D45]">● &lt;50 Rất thấp</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {searchResults.alphafold.pdbUrl && (
                          <a
                            href={searchResults.alphafold.pdbUrl}
                            download
                            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-mono transition"
                          >
                            Tải file .PDB
                          </a>
                        )}
                        <a
                          href={searchResults.alphafold.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                        >
                          <span>Xem 3D trên AlphaFold</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Proteins (UniProt) */}
                  {searchResults.proteins?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-sky-400" /> Protein & Gen (UniProtKB)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.proteins.map((p: any) => (
                          <div
                            key={p.accession}
                            className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white font-mono">{p.geneName || p.id}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                                  {p.accession}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 font-medium mt-1">{p.proteinName}</p>
                              {p.organism && <p className="text-[11px] text-slate-400 italic mt-0.5">{p.organism}</p>}
                              {p.function && (
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.function}</p>
                              )}
                            </div>
                            <div className="pt-2 border-t border-slate-700/40 flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 font-mono">Source: UniProtKB</span>
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:underline flex items-center gap-1"
                              >
                                Hồ sơ UniProt <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chemicals (PubChem) */}
                  {searchResults.chemicals?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Atom className="w-3.5 h-3.5 text-amber-400" /> Hóa chất & Dược phẩm (PubChem PUG)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.chemicals.map((c: any) => (
                          <div
                            key={c.cid}
                            className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-4"
                          >
                            {c.imageUrl && (
                              <img
                                src={c.imageUrl}
                                alt={c.name}
                                className="w-20 h-20 rounded-lg bg-white p-1 object-contain shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-white capitalize">{c.name}</h5>
                                <span className="text-[10px] font-mono text-amber-400">CID: {c.cid}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                                Công thức: <strong>{c.formula}</strong> (MW: {c.weight})
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={c.smiles}>
                                SMILES: {c.smiles}
                              </p>
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline mt-2"
                              >
                                Xem trên PubChem <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Literature (Europe PMC & PubMed) */}
                  {searchResults.literature?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Tài liệu Khoa học & Bài báo Y sinh (Europe PMC / PubMed)
                      </h4>
                      <div className="space-y-2.5">
                        {searchResults.literature.map((art: any) => (
                          <div
                            key={art.id}
                            className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-semibold text-white leading-snug">{art.title}</h5>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {art.pubYear || "2026"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {art.authorString} • <span className="italic">{art.journalTitle || "BioRxiv"}</span>
                            </p>
                            {art.abstractText && (
                              <p className="text-[11px] text-slate-300 line-clamp-2">{art.abstractText}</p>
                            )}
                            <div className="pt-1 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-mono">
                                {art.pmid ? `PMID: ${art.pmid}` : art.doi ? `DOI: ${art.doi}` : ""}
                              </span>
                              <a
                                href={art.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                Đọc bài báo gốc <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBTITLE SCIENTIFIC ENRICHER */}
          {activeTab === "enrich" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Quét Thuật ngữ Khoa học trong Video hiện tại
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tự động nhận diện tên gen, protein, hóa chất và cung cấp nghĩa tiếng Việt chuẩn y khoa
                  </p>
                </div>
                <button
                  onClick={handleEnrichCurrentSubtitles}
                  disabled={isEnriching || cues.length === 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 transition disabled:opacity-50 shrink-0"
                >
                  {isEnriching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
                  Quét Phụ đề Video ({cues.length} câu)
                </button>
              </div>

              {appliedCount !== null && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã áp dụng và chuẩn hóa thành công vào {appliedCount} câu phụ đề trong Timeline!
                </div>
              )}

              {enrichedTerms.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Các thuật ngữ khoa học phát hiện được ({enrichedTerms.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {enrichedTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{term.term}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 uppercase font-mono">
                            {term.domain}
                          </span>
                        </div>
                        <p className="text-xs text-amber-300 font-medium">➔ {term.vietnameseMeaning}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{term.explanation}</p>
                        <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">ID: {term.canonicalId || "N/A"}</span>
                          <button
                            onClick={() => handleApplyTermToSubtitles(term)}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-medium transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Chuẩn hóa vào Phụ đề
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-800/20 border border-slate-700/40 text-center text-slate-500 text-xs space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Bấm nút "Quét Phụ đề Video" để bắt đầu nhận diện các thuật ngữ khoa học chuyên sâu.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM ARCHITECTURE & DIAGRAM */}
          {activeTab === "architecture" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{`========================================================================================
[ HỆ THỐNG TỔNG THỂ: VIETSUB VIDEO STUDIO & TELEGRAM BOT HENDY ]
========================================================================================

[ USER & CLIENT TIER ]
 ├── Telegram App User (Mini App / TMA - WasmJS)
 ├── Web / Wasm Client (Hosted on Cloudflare Pages)
 └── Native Clients:
     ├── AndroidApp (Media3 ExoPlayer)
     ├── iOSApp (AVKit AVPlayer)
     └── DesktopApp (JVM/Native: Windows .msi/.exe, macOS .dmg, Linux .deb)

[ API GATEWAY / KTOR BACKEND (:server) ]
 ├── Infrastructure Plugins: Netty Server, CORS, WebSockets, Auth/Security, JSON
 ├── Route Handlers:
 │   ├── GET  /api/releases/latest    (Phân phối bản dựng theo OS)
 │   ├── POST /api/telegram/webhook   (Bot Router: /start, /app, /status, /admin)
 │   ├── GET  /api/admin/system       (CPU, RAM, Queue, FFmpeg jobs)
 │   ├── POST /api/admin/maintenance  (Màn hình khóa bảo trì hệ thống)
 │   ├── POST /api/vietsub/tts        (gemini-3.8-flash-tts đa giọng đọc)
 │   ├── POST /api/vietsub/smart-merge (Thuật toán SmartMergeEngine)
 │   └── GET  /api/science/search     (DeepMind Science Skills Suite)

[ INTERNAL MICRO-SERVICES ]
 ├── AI ENGINE: WhisperService (Audio->SRT), AiService (Gemini Translation)
 ├── MEDIA PROCESSOR: FFmpegService (Hardsub CLI Wrapper, GPU Rendering)
 └── SYSTEM & TELEGRAM OP: SystemMonitorService, TelegramBotService, FeatureFlagService

[ CI/CD AUTOMATION (GitHub Actions & Fastlane) ]
 ├── deploy-cloudflare-pages.yml (Tự động build Wasm/JS & Set Webhook)
 ├── deploy-android.yml          (Build .aab, Keystore Signing -> Play Store)
 ├── deploy-ios.yml              (xcodebuild, Fastlane Match -> TestFlight)
 └── deploy-desktop.yml          (Matrix strategy: Windows .msi, macOS .dmg, Linux .deb)`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400">
          <span>Tích hợp 32 cơ sở dữ liệu khoa học quốc tế theo chuẩn Google DeepMind Science Skills</span>
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
