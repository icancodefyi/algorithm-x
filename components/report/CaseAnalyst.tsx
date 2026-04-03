"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useReportWorkflow } from "@/components/report/ReportWorkflowContext";
import { buildCaseRef } from "@/components/report/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_CHIPS = [
  "What does the ELA score mean for this image?",
  "Is this image manipulated?",
  "Explain the C2PA result",
];

export function CaseAnalyst({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { caseId, caseData, analysis } = useReportWorkflow();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const caseRef = buildCaseRef(caseId);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setStreaming(true);

      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMsg]);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/analyst", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            caseContext: {
              caseData: caseData as Record<string, unknown> | null,
              analysis: analysis as Record<string, unknown> | null,
            },
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          let errText = `Error ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.error) errText = errJson.error;
          } catch { /* use default */ }
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: `[${errText}]` };
            return copy;
          });
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snapshot = accumulated;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: snapshot };
            return copy;
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "[Connection error — check your network and try again.]",
          };
          return copy;
        });
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, caseData, analysis],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#fafaf8] border-l border-[#e8e4de] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-[#0a0a0a] text-white px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-mono font-bold tracking-[0.15em] uppercase">Case Analyst</p>
            <p className="text-[10px] font-mono text-white/50 tracking-wider">{caseRef}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="pt-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] mx-auto mb-3 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-[#0a0a0a] mb-1">Forensic Case Analyst</p>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed max-w-[280px] mx-auto">
                  Ask about any finding in this case. I have access to all forensic data, scores, and signals.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-[#c4bdb5] uppercase tracking-[0.15em] px-1">Suggested queries</p>
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg border border-[#e8e4de] bg-white hover:border-[#0a0a0a] hover:bg-[#fafaf8] transition-all group"
                  >
                    <span className="text-[12px] text-[#6b7280] group-hover:text-[#0a0a0a] transition-colors">{chip}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="max-w-[90%]">
                  <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.15em] mb-1 px-0.5">Analyst</p>
                  <div className="rounded-lg bg-[#0a0a0a] text-white/90 px-3.5 py-2.5">
                    <p className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content || (streaming && i === messages.length - 1 ? "" : "")}
                      {streaming && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-3.5 bg-white/60 animate-pulse ml-0.5 align-middle" />
                      )}
                    </p>
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div className="max-w-[85%]">
                  <div className="rounded-lg bg-white border border-[#e8e4de] px-3.5 py-2.5">
                    <p className="text-[12px] text-[#0a0a0a] leading-relaxed break-words">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="shrink-0 border-t border-[#e8e4de] bg-white px-4 py-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this case..."
            disabled={streaming}
            className="flex-1 text-[13px] text-[#0a0a0a] placeholder:text-[#c4bdb5] bg-transparent outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="w-8 h-8 rounded-lg bg-[#0a0a0a] text-white flex items-center justify-center shrink-0 hover:bg-[#1a1a1a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        {/* Powered by strip */}
        <div className="shrink-0 px-4 py-2 bg-[#f5f3f0] border-t border-[#e8e4de]">
          <p className="text-[9px] font-mono text-[#c4bdb5] tracking-wider text-center">
            Powered by Groq · LLaMA 3.3 70B · Context-aware forensic analysis
          </p>
        </div>
      </aside>
    </>
  );
}
