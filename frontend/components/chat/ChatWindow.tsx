'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Bot, Plus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateWIB } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/types';

const QUICK_REPLIES = [
  'Berapa tekanan darah normal?',
  'Apa gejala hipertensi berbahaya?',
  'Tips diet rendah garam',
  'Obat apa yang biasa untuk hipertensi?',
  'Kapan harus ke dokter?',
  'Olahraga apa yang aman untuk hipertensi?',
];

function MessageBubble({ message, userInitial }: { message: ChatMessage; userInitial: string }) {
  const isUser = message.role === 'USER';

  return (
    <div className={cn('flex gap-2 mb-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#2E86C1] flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <Bot size={15} className="text-white" />
        </div>
      )}

      <div className={cn('flex flex-col gap-0.5 max-w-[72%] sm:max-w-[65%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#2E86C1] text-white rounded-2xl rounded-tr-sm'
            : 'bg-white text-[#1A2A3A] rounded-2xl rounded-tl-sm shadow-sm border border-[#E8F4FD]'
        )}>
          {message.content.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-[#AED6F1] px-1">
          {formatDateWIB(message.createdAt, { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#154360] flex items-center justify-center shrink-0 mt-1 shadow-sm text-white text-xs font-bold">
          {userInitial}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-[#2E86C1] flex items-center justify-center shrink-0 mt-1">
        <Bot size={15} className="text-white" />
      </div>
      <div className="bg-white border border-[#E8F4FD] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="typing-dot w-2 h-2 rounded-full bg-[#AED6F1] block" style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow() {
  const { messages, isTyping, isLoading, error, sendMessage, startNewSession } = useChat();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userInitial = user?.fullName?.charAt(0).toUpperCase() ?? 'A';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8]">

      {/* ── Header (WhatsApp-style) ─────────────────────────────── */}
      <div className="bg-[#154360] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2E86C1] flex items-center justify-center shadow">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Asisten Tensi-Bot</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-[#AED6F1]">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => void startNewSession()}
          className="flex items-center gap-1.5 text-xs text-[#AED6F1] hover:text-white font-medium transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
        >
          <Plus size={13} />
          Sesi Baru
        </button>
      </div>

      {/* ── Disclaimer banner ──────────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 shrink-0">
        <Lightbulb size={13} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700">
          Asisten AI ini bukan pengganti dokter. Selalu konsultasikan kondisi Anda dengan tenaga medis profesional.
        </p>
      </div>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <span className="text-[#AED6F1] text-sm">Memuat percakapan...</span>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Bot size={28} className="text-[#2E86C1]" />
            </div>
            <p className="text-[#1A2A3A] font-semibold mb-1">Halo! Saya Tensi-Bot</p>
            <p className="text-[#5D8AA8] text-sm mb-5 max-w-xs">
              Tanyakan apa saja tentang hipertensi, tekanan darah, atau kesehatan Anda.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {QUICK_REPLIES.slice(0, 4).map((r) => (
                <button
                  key={r}
                  onClick={() => void sendMessage(r)}
                  className="text-xs text-[#2E86C1] bg-white border border-[#AED6F1] px-3 py-1.5 rounded-full hover:bg-[#EAF4FB] transition-colors shadow-sm"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} userInitial={userInitial} />
        ))}

        {isTyping && <TypingIndicator />}
        {error && <p className="text-center text-red-500 text-xs py-2">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick replies ──────────────────────────────────────── */}
      {messages.length > 0 && (
        <div className="px-3 py-2 bg-white border-t border-[#E8F4FD] overflow-x-auto shrink-0">
          <div className="flex gap-2 w-max">
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                onClick={() => void sendMessage(r)}
                disabled={isTyping}
                className="text-xs text-[#2E86C1] bg-[#EAF4FB] px-3 py-1.5 rounded-full hover:bg-[#AED6F1]/40 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar (WhatsApp-style) ──────────────────────────── */}
      <div className="bg-white border-t border-[#E8F4FD] px-3 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#F4F8FC] border border-[#D6E8F5] rounded-2xl px-4 py-2.5 focus-within:border-[#2E86C1] focus-within:ring-2 focus-within:ring-[#2E86C1]/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan Anda..."
              rows={1}
              disabled={isTyping}
              className="w-full bg-transparent text-sm text-[#1A2A3A] placeholder-[#AED6F1] resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-[#2E86C1] hover:bg-[#2980B9] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md active:scale-95"
            aria-label="Kirim"
          >
            <Send size={17} />
          </button>
        </div>
        <p className="text-[10px] text-[#AED6F1] mt-1.5 text-center hidden sm:block">
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
