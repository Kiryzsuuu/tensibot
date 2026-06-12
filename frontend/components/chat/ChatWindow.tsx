'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Bot, Plus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateWIB } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage } from '@/types';

const QUICK_REPLIES = [
  'Berapa tekanan darah normal?',
  'Apa gejala hipertensi berbahaya?',
  'Tips diet rendah garam',
  'Obat apa yang biasa untuk hipertensi?',
  'Kapan harus ke dokter?',
  'Olahraga apa yang aman untuk hipertensi?',
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'USER';

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#2E86C1] flex items-center justify-center shrink-0 mt-0.5 shadow">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start', 'max-w-[75%]')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm',
            isUser
              ? 'bg-[#2E86C1] text-white rounded-tr-sm'
              : 'bg-white text-[#1A2A3A] border border-[#D6E8F5] rounded-tl-sm'
          )}
        >
          {/* Render line breaks */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-[#AED6F1] px-1">
          {formatDateWIB(message.createdAt, {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
          })}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#154360] flex items-center justify-center shrink-0 mt-0.5 shadow text-white text-xs font-bold">
          A
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-[#2E86C1] flex items-center justify-center shrink-0">
        <Bot size={16} className="text-white" />
      </div>
      <div className="bg-white border border-[#D6E8F5] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot w-2 h-2 rounded-full bg-[#AED6F1] block"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow() {
  const { messages, isTyping, isLoading, error, sendMessage, startNewSession } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="flex flex-col h-full bg-[#F4F8FC]">
      {/* Chat header */}
      <div className="bg-white border-b border-[#D6E8F5] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2E86C1] flex items-center justify-center shadow">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#1A2A3A] text-sm">Asisten Tensi-Bot</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[#5D8AA8]">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => void startNewSession()}
          className="flex items-center gap-1.5 text-xs text-[#2E86C1] hover:text-[#1A5276] font-medium transition-colors bg-[#EAF4FB] px-3 py-1.5 rounded-lg hover:bg-[#AED6F1]/30"
        >
          <Plus size={14} />
          Sesi Baru
        </button>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-[#FEF9C3] border-b border-yellow-200 px-4 py-2 flex items-center gap-2 shrink-0">
        <Lightbulb size={14} className="text-yellow-600 shrink-0" />
        <p className="text-xs text-yellow-800">
          Asisten AI ini bukan pengganti dokter. Selalu konsultasikan kondisi Anda dengan tenaga
          medis profesional.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <span className="text-[#AED6F1] text-sm">Memuat percakapan...</span>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-[#EAF4FB] rounded-full flex items-center justify-center mb-4">
              <Bot size={28} className="text-[#2E86C1]" />
            </div>
            <p className="text-[#1A2A3A] font-semibold mb-1">Halo! Saya Tensi-Bot</p>
            <p className="text-[#5D8AA8] text-sm mb-6 max-w-xs">
              Tanyakan apa saja tentang hipertensi, tekanan darah, atau kesehatan Anda.
            </p>
            {/* Quick reply suggestions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {QUICK_REPLIES.slice(0, 4).map((r) => (
                <button
                  key={r}
                  onClick={() => void sendMessage(r)}
                  className="text-xs text-[#2E86C1] bg-white border border-[#AED6F1] px-3 py-1.5 rounded-full hover:bg-[#EAF4FB] transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}
        {error && (
          <p className="text-center text-red-500 text-xs py-2">{error}</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-[#D6E8F5] bg-white overflow-x-auto shrink-0">
          <div className="flex gap-2 w-max">
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                onClick={() => void sendMessage(r)}
                disabled={isTyping}
                className="text-xs text-[#2E86C1] bg-[#EAF4FB] border border-[#AED6F1] px-3 py-1.5 rounded-full hover:bg-[#AED6F1]/40 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-[#D6E8F5] px-4 py-3 shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-[#F4F8FC] border border-[#D6E8F5] rounded-2xl px-4 py-2.5 focus-within:border-[#2E86C1] focus-within:ring-2 focus-within:ring-[#2E86C1]/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan Anda..."
              rows={1}
              disabled={isTyping}
              className="w-full bg-transparent text-sm text-[#1A2A3A] placeholder-gray-400 resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-[#2E86C1] hover:bg-[#2980B9] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow"
            aria-label="Kirim"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-[#AED6F1] mt-1.5 text-center">
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
