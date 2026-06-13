'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { useChatStore } from '@/store/chatStore';
import type { ChatSession, ChatMessage, ApiResponse } from '@/types';

export function useChat() {
  const {
    sessions,
    activeSessionId,
    messageCache,
    setSessions,
    setActiveSession,
    setMessagesForSession,
    addMessageToSession,
    replaceMessageInSession,
    removeMessageFromSession,
    prependSession,
    updateSessionTitle,
    startFresh,
  } = useChatStore();

  const messages: ChatMessage[] = activeSessionId
    ? (messageCache[activeSessionId] ?? [])
    : [];

  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    void loadSessions();
  }, []); // eslint-disable-line

  // Jika activeSessionId sudah ada di store tapi cache kosong → fetch dari server
  useEffect(() => {
    if (activeSessionId && !messageCache[activeSessionId]) {
      void loadMessages(activeSessionId);
    }
  }, [activeSessionId]); // eslint-disable-line

  const loadSessions = async () => {
    try {
      const res = await api.get<ApiResponse<ChatSession[]>>('/chat/sessions');
      if (res.data.success && res.data.data) {
        setSessions(res.data.data);
        const currentId = useChatStore.getState().activeSessionId;
        // Jika tidak ada sesi aktif dan ada sesi tersimpan, pilih yang pertama
        if (!currentId && res.data.data.length > 0) {
          const first = res.data.data[0];
          setActiveSession(first.id);
          await loadMessages(first.id);
        }
      }
    } catch {
      // silently fail
    }
  };

  const loadMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<ChatMessage[]>>(
        `/chat/sessions/${sessionId}/messages`
      );
      if (res.data.success && res.data.data) {
        setMessagesForSession(sessionId, res.data.data);
      }
    } catch {
      setError('Gagal memuat pesan');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = useCallback(async (): Promise<string | null> => {
    try {
      const res = await api.post<ApiResponse<ChatSession>>('/chat/sessions');
      if (res.data.success && res.data.data) {
        const session = res.data.data;
        prependSession(session);
        setActiveSession(session.id);
        setMessagesForSession(session.id, []);
        return session.id;
      }
      return null;
    } catch {
      return null;
    }
  }, [prependSession, setActiveSession, setMessagesForSession]);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) return;
      setError(null);

      let sessionId = useChatStore.getState().activeSessionId;
      if (!sessionId) {
        sessionId = await startNewSession();
        if (!sessionId) {
          setError('Gagal membuat sesi chat baru');
          return;
        }
      }

      const tempId = `temp-${Date.now()}`;
      const tempUserMsg: ChatMessage = {
        id: tempId,
        sessionId,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      addMessageToSession(sessionId, tempUserMsg);
      setIsTyping(true);

      try {
        abortRef.current = new AbortController();
        const res = await api.post<
          ApiResponse<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>
        >(
          `/chat/sessions/${sessionId}/messages`,
          { content },
          { signal: abortRef.current.signal }
        );

        if (res.data.success && res.data.data) {
          replaceMessageInSession(sessionId, tempId, res.data.data.userMessage);
          addMessageToSession(sessionId, res.data.data.assistantMessage);

          // Auto-generate title dari pesan pertama
          const currentMessages = useChatStore.getState().messageCache[sessionId] ?? [];
          const sess = useChatStore.getState().sessions.find((s) => s.id === sessionId);
          if (currentMessages.length <= 2 && sess && !sess.title) {
            const title = content.slice(0, 40) + (content.length > 40 ? '…' : '');
            updateSessionTitle(sessionId, title);
          }
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'CanceledError') {
          setError('Gagal mengirim pesan. Coba lagi.');
          removeMessageFromSession(sessionId, tempId);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [startNewSession, addMessageToSession, replaceMessageInSession, removeMessageFromSession, updateSessionTitle]
  );

  const switchSession = useCallback(
    async (sessionId: string) => {
      setActiveSession(sessionId);
      // Jika belum ada cache, fetch dari server
      if (!useChatStore.getState().messageCache[sessionId]) {
        await loadMessages(sessionId);
      }
    },
    [setActiveSession] // eslint-disable-line
  );

  const openNewChat = useCallback(() => {
    startFresh();
  }, [startFresh]);

  return {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    isLoading,
    error,
    sendMessage,
    startNewSession,
    switchSession,
    openNewChat,
  };
}
