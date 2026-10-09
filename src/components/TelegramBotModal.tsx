import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Smartphone, ExternalLink, Download, Shield, Activity, RefreshCw, Check } from "lucide-react";

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadModal?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  buttons?: Array<{ text: string; action: string; url?: string }>;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  onOpenDownloadModal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_1",
      sender: "bot",
      text: "👋 Xin chào! Tôi là Vietsub Bot (Hendy AI Hub). Bạn có thể gửi lệnh hoặc gửi video để bóc tách và dịch phụ đề tự động.",
      timestamp: "12:00",
      buttons: [
        { text: "🚀 Mở AI Translation Mini App", action: "open_tma" },
        { text: "📥 Tải App Đa Nền Tảng", action: "open_download" },
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      // Send to server's Telegram Webhook route
      const payload: any = {
        update_id: Date.now(),
      };

      if (text.startsWith("cb:")) {
        payload.callback_query = {
          id: "cq_" + Date.now(),
          from: { id: 6138197737, first_name: "Hendy Admin", username: "hendy_admin" },
          message: {
            message_id: Math.floor(Math.random() * 1000),
            chat: { id: 6138197737, type: "private" },
          },
          data: text.replace(/^cb:/, ""),
        };
      } else {
        payload.message = {
          message_id: Math.floor(Math.random() * 1000),
          from: { id: 6138197737, first_name: "Hendy Admin", username: "hendy_admin" },
          chat: { id: 6138197737, type: "private" },
          date: Math.floor(Date.now() / 1000),
          text,
        };
      }

      const res = await fetch("/api/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const botResponse = data.result;

      const inlineButtons: Array<{ text: string; action: string; url?: string }> = [];
      if (botResponse?.reply_markup?.inline_keyboard) {
        botResponse.reply_markup.inline_keyboard.flat().forEach((b: any) => {
          inlineButtons.push({
            text: b.text,
            action: b.callback_data || (b.web_app ? "open_tma" : "url"),
            url: b.url || b.web_app?.url,
          });
        });
      }

      const botMsg: Message = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: botResponse?.text || "Đã nhận lệnh từ bạn.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        buttons: inlineButtons.length > 0 ? inlineButtons : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "bot",
          text: `⚠️ Lỗi kết nối Webhook: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (btn: { text: string; action: string; url?: string }) => {
    if (btn.action === "open_download") {
      onClose();
      onOpenDownloadModal?.();
    } else if (btn.action === "open_tma") {
      onClose();
    } else if (btn.action === "cmd_status") {
      handleSendMessage("/status");
    } else if (btn.action === "cmd_admin") {
      handleSendMessage("/admin");
    } else if (btn.url) {
      window.open(btn.url, "_blank");
    } else {
      handleSendMessage("cb:" + btn.action);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg h-[640px] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Telegram Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#24A1DE] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">Vietsub Bot</h3>
                <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-mono">bot</span>
              </div>
              <p className="text-[11px] text-white/80">@VietsubBot • TMA & Hardsub Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Commands Bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/70 border-b border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => handleSendMessage("/start")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono shrink-0 transition"
          >
            /start
          </button>
          <button
            onClick={() => handleSendMessage("/app")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono shrink-0 transition"
          >
            /app
          </button>
          <button
            onClick={() => handleSendMessage("/status")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono shrink-0 transition"
          >
            /status
          </button>
          <button
            onClick={() => handleSendMessage("/render")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono shrink-0 transition"
          >
            /render
          </button>
          <button
            onClick={() => handleSendMessage("/admin")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 font-mono shrink-0 transition"
          >
            /admin
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/90 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-[#24A1DE] text-white rounded-br-xs"
                    : "bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-xs"
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === "user" ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {/* Inline Keyboards */}
              {m.buttons && m.buttons.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5 w-full max-w-[85%]">
                  {m.buttons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleButtonClick(btn)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800/95 hover:bg-slate-700 border border-sky-500/40 text-sky-300 text-xs font-medium flex items-center justify-center gap-2 transition shadow-sm hover:shadow-sky-500/10 active:scale-98"
                    >
                      {btn.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              Bot đang phản hồi qua webhook...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Nhập lệnh (/start, /status, /app)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#24A1DE] hover:bg-[#1f8fc5] text-white disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
