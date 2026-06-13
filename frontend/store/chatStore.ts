'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage, ChatSession } from '@/types';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  // Cache pesan per-sesi: key = sessionId
  messageCache: Record<string, ChatMessage[]>;

  setSessions: (sessions: ChatSession[]) => void;
  setActiveSession: (id: string | null) => void;
  setMessagesForSession: (sessionId: string, messages: ChatMessage[]) => void;
  addMessageToSession: (sessionId: string, msg: ChatMessage) => void;
  replaceMessageInSession: (sessionId: string, tempId: string, real: ChatMessage) => void;
  removeMessageFromSession: (sessionId: string, id: string) => void;
  prependSession: (session: ChatSession) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  startFresh: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      messageCache: {},

      setSessions: (sessions) => set({ sessions }),

      setActiveSession: (id) => set({ activeSessionId: id }),

      setMessagesForSession: (sessionId, messages) =>
        set((s) => ({
          messageCache: { ...s.messageCache, [sessionId]: messages },
        })),

      addMessageToSession: (sessionId, msg) =>
        set((s) => ({
          messageCache: {
            ...s.messageCache,
            [sessionId]: [...(s.messageCache[sessionId] ?? []), msg],
          },
        })),

      replaceMessageInSession: (sessionId, tempId, real) =>
        set((s) => ({
          messageCache: {
            ...s.messageCache,
            [sessionId]: (s.messageCache[sessionId] ?? []).map((m) =>
              m.id === tempId ? real : m
            ),
          },
        })),

      removeMessageFromSession: (sessionId, id) =>
        set((s) => ({
          messageCache: {
            ...s.messageCache,
            [sessionId]: (s.messageCache[sessionId] ?? []).filter((m) => m.id !== id),
          },
        })),

      prependSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),

      updateSessionTitle: (sessionId, title) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, title } : sess
          ),
        })),

      // Buka sesi baru tanpa hapus history lama
      startFresh: () => set({ activeSessionId: null }),
    }),
    {
      name: 'tensibot-chat-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        activeSessionId: s.activeSessionId,
        sessions: s.sessions.slice(0, 50),
        // Simpan max 30 pesan per sesi, max 20 sesi terakhir
        messageCache: Object.fromEntries(
          Object.entries(s.messageCache)
            .slice(-20)
            .map(([k, v]) => [k, v.slice(-30)])
        ),
      }),
    }
  )
);

// Selector helper
export const getSessionMessages = (sessionId: string | null) =>
  sessionId ? (useChatStore.getState().messageCache[sessionId] ?? []) : [];
