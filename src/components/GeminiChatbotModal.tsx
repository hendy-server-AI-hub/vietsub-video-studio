import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, Brain, Cpu, MessageSquare, RefreshCw, User, Check, Zap } from "lucide-react";

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCuesSummary?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingEnabled?: boolean;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  currentCuesSummary,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Xin chào! Tôi là Trợ lý AI Vietsub Studio (Gemini AI). Tôi có thể giúp bạn tối ưu lời thoại, dịch các đoạn hội thoại phức tạp, gọt dũa từ ngữ điện ảnh, hoặc giải đáp các thắc mắc về hệ thống biên tập.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("subtitle_expert");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [enableThinking, setEnableThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // When high thinking mode is toggled on, auto-switch to gemini-3.1-pro-preview
  useEffect(() => {
    if (enableThinking) {
      setSelectedModel("gemini-3.1-pro-preview");
    }
  }, [enableThinking]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          role: selectedRole,
          model: enableThinking ? "gemini-3.1-pro-preview" : selectedModel,
          enableThinking,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi trò chuyện.");

      const botMsg: ChatMessage = {
        id: "m_" + Date.now(),
        role: "model",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        thinkingEnabled: data.thinkingEnabled,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "model",
          content: `⚠️ Có lỗi xảy ra: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl h-[680px] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Gemini AI Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                  Multi-Turn Chat
                </span>
                {enableThinking && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold animate-pulse">
                    <Brain className="w-3 h-3" /> High Thinking Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Cố vấn dịch thuật, phân vai lồng tiếng và hỗ trợ kịch bản phim
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

        {/* Configuration Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Vai trò:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="subtitle_expert">🎬 Chuyên gia Dịch phim (Subtitle Master)</option>
              <option value="script_doctor">📝 Cố vấn Kịch bản (Script Doctor)</option>
              <option value="voiceover_director">🎙️ Đạo diễn Lồng tiếng (Voiceover Director)</option>
              <option value="system_support">⚙️ Kỹ sư Hệ thống Vietsub (System Support)</option>
            </select>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                if (e.target.value !== "gemini-3.1-pro-preview") {
                  setEnableThinking(false);
                }
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (Thông thường / Cân bằng)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Siêu nhanh / Realtime)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Nhiệm vụ phức tạp / Pro)</option>
            </select>
          </div>

          {/* High Thinking Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition">
            <input
              type="checkbox"
              checked={enableThinking}
              onChange={(e) => setEnableThinking(e.target.checked)}
              className="rounded border-slate-600 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-amber-300 font-medium flex items-center gap-1 text-[11px]">
              <Brain className="w-3.5 h-3.5 text-amber-400" /> High Thinking Mode
            </span>
          </label>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  m.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 border border-slate-700 text-indigo-400"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs shadow-md whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-purple-600 text-white rounded-tr-xs"
                    : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-tl-xs"
                }`}
              >
                {m.content}
                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.modelUsed && (
                    <span className="font-mono text-purple-300">
                      {m.modelUsed} {m.thinkingEnabled && "• 🧠 High Thinking"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-purple-300 italic">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <span>
                Gemini đang suy nghĩ và tạo câu trả lời
                {enableThinking ? " với chế độ High Thinking Level..." : "..."}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0">Gợi ý:</span>
          <button
            onClick={() => setInput("Hãy dịch và chỉnh sửa câu phụ đề này sang phong cách điện ảnh tự nhiên:")}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition"
          >
            🎬 Dịch phong cách điện ảnh
          </button>
          <button
            onClick={() => setInput("Làm thế nào để phân vai giọng Nam/Nữ/Trẻ em phù hợp nhất với video này?")}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition"
          >
            🎙️ Tư vấn phân vai giọng đọc
          </button>
          <button
            onClick={() => setInput("Giải thích cách hoạt động của SmartMergeEngine và khi nào nên gộp sub?")}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition"
          >
            ⚡ Hỏi về SmartMergeEngine
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Hỏi Gemini AI về dịch thuật, thuyết minh, hoặc câu hỏi kỹ thuật..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};
