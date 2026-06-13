'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Send, Plus, Lightbulb, Activity, Pill, MessageSquare, Menu, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateWIB } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useBPRecords } from '@/hooks/useBPRecords';
import { useTodayMedications } from '@/hooks/useMedications';
import { getBPCategoryDef } from '@/constants/bp-categories';
import type { ChatMessage, ChatSession } from '@/types';

const QUICK_REPLIES = [
  'Berapa tekanan darah normal?',
  'Apa gejala hipertensi berbahaya?',
  'Tips diet rendah garam',
  'Obat apa yang biasa untuk hipertensi?',
  'Kapan harus ke dokter?',
  'Olahraga apa yang aman untuk hipertensi?',
];

function formatSessionTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function SessionItem({
  session,
  isActive,
  onClick,
}: {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-xl transition-all group',
        isActive
          ? 'bg-white/20 text-white'
          : 'text-[#AED6F1] hover:bg-white/10 hover:text-white'
      )}
    >
      <div className="flex items-start gap-2">
        <MessageSquare size={13} className="shrink-0 mt-0.5 opacity-70" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate leading-snug">
            {session.title ?? 'Percakapan baru'}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={10} className="opacity-50" />
            <span className="text-[10px] opacity-60">{formatSessionTime(session.updatedAt ?? session.createdAt)}</span>
            {session.messageCount > 0 && (
              <span className="text-[10px] opacity-50 ml-auto">{session.messageCount} pesan</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message, userInitial }: { message: ChatMessage; userInitial: string }) {
  const isUser = message.role?.toUpperCase() === 'USER';

  return (
    <div className={cn('flex gap-2 mb-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 shadow-sm">
          <Image src="/nara-avatar.png" alt="Nara" width={32} height={32} className="w-full h-full object-cover" />
        </div>
      )}

      <div className={cn('flex flex-col gap-0.5 max-w-[75%] sm:max-w-[65%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#2E86C1] text-white rounded-2xl rounded-tr-sm'
            : 'bg-white text-[#1A2A3A] rounded-2xl rounded-tl-sm shadow-sm border border-[#E8F4FD]'
        )}>
          {message.content.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>
        <span className="text-[10px] text-[#AED6F1] px-1">
          {formatDateWIB(message.createdAt, { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
        </span>
      </div>

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
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
        <Image src="/nara-avatar.png" alt="Nara" width={32} height={32} className="w-full h-full object-cover" />
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
  const { messages, sessions, activeSessionId, isTyping, isLoading, error, sendMessage, startNewSession, switchSession, openNewChat } = useChat();
  const { user } = useAuthStore();
  const { data: bpPaginated } = useBPRecords(1, 1);
  const { data: todayMeds = [] } = useTodayMedications();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userInitial = user?.fullName?.charAt(0).toUpperCase() ?? 'A';
  const lastBP = bpPaginated?.items?.[0];
  const catDef = lastBP ? getBPCategoryDef(lastBP.category) : null;
  const takenMeds = todayMeds.filter(m => m.todayLogs.some(l => l.status === 'TAKEN')).length;

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

  const handleNewChat = async () => {
    openNewChat();
    setSidebarOpen(false);
  };

  const handleSelectSession = async (sessionId: string) => {
    await switchSession(sessionId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full bg-[#EEF2F7] relative overflow-hidden">

      {/* ── Sidebar History ──────────────────────────────────────── */}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside className={cn(
        'absolute md:relative inset-y-0 left-0 z-30 w-64 bg-[#0F3251] flex flex-col transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Sidebar header */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <Image src="/nara-avatar.png" alt="Nara" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-semibold text-sm">Nara</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#AED6F1] hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#2E86C1] hover:bg-[#2980B9] text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            Chat Baru
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {sessions.length === 0 ? (
            <p className="text-[#AED6F1] text-xs text-center py-6 opacity-60">
              Belum ada riwayat chat
            </p>
          ) : (
            <>
              <p className="text-[10px] text-[#AED6F1] opacity-50 px-3 py-1 uppercase tracking-wider font-semibold">
                Riwayat
              </p>
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  onClick={() => void handleSelectSession(session.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* User info bottom */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#154360] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitial}
          </div>
          <p className="text-xs text-[#AED6F1] truncate">{user?.fullName ?? user?.email}</p>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="bg-[#154360] text-white shrink-0 shadow-md">
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Hamburger — mobile to open sidebar, desktop just shows avatar */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#AED6F1] hover:text-white md:hidden shrink-0"
              aria-label="Buka riwayat"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow ring-2 ring-white/20 shrink-0">
                <Image src="/nara-avatar.png" alt="Nara" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Nara</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-[#AED6F1]">Online</span>
                </div>
              </div>
            </div>

            {/* New chat button — visible on desktop in header too */}
            <button
              onClick={handleNewChat}
              className="hidden md:flex items-center gap-1.5 text-xs text-[#AED6F1] hover:text-white font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Plus size={13} />
              Chat Baru
            </button>
          </div>

          {/* Health chips */}
          {(lastBP || todayMeds.length > 0) && (
            <div className="px-4 pb-2.5 flex items-center gap-2 overflow-x-auto">
              {lastBP && (
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 shrink-0">
                  <Activity size={11} className="text-[#AED6F1]" />
                  <span className="text-xs text-white font-mono font-semibold">
                    {lastBP.systolic}/{lastBP.diastolic}
                  </span>
                  {catDef && (
                    <span className="text-[10px] font-medium" style={{ color: catDef.textColor }}>
                      {catDef.label}
                    </span>
                  )}
                </div>
              )}
              {todayMeds.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 shrink-0">
                  <Pill size={11} className="text-[#AED6F1]" />
                  <span className="text-xs text-white">
                    {takenMeds}/{todayMeds.length} obat diminum
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Disclaimer ─────────────────────────────────────────── */}
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
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 shadow-md ring-4 ring-[#2E86C1]/20">
                <Image src="/nara-avatar.png" alt="Nara" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <p className="text-[#1A2A3A] font-semibold mb-1">Halo! Saya Nara 👋</p>
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

        {/* ── Input bar ──────────────────────────────────────────── */}
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
    </div>
  );
}
