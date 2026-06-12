'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import api from '@/lib/api';
import type { ChatSession, ChatMessage, ApiResponse } from '@/types';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load sessions on mount
  useEffect(() => {
    void loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await api.get<ApiResponse<ChatSession[]>>('/chat/sessions');
      if (res.data.success && res.data.data) {
        setSessions(res.data.data);
        if (res.data.data.length > 0 && !activeSessionId) {
          const first = res.data.data[0];
          setActiveSessionId(first.id);
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
        setMessages(res.data.data);
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
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(session.id);
        setMessages([]);
        return session.id;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) return;
      setError(null);

      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = await startNewSession();
        if (!sessionId) {
          setError('Gagal membuat sesi chat baru');
          return;
        }
      }

      // Optimistically add user message
      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
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
          setMessages((prev) => {
            // Replace temp user message + add assistant reply
            const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
            return [
              ...filtered,
              res.data.data!.userMessage,
              res.data.data!.assistantMessage,
            ];
          });
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'CanceledError') {
          setError('Gagal mengirim pesan. Coba lagi.');
          // Remove the optimistic message on error
          setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        }
      } finally {
        setIsTyping(false);
      }
    },
    [activeSessionId, startNewSession]
  );

  const switchSession = useCallback(
    async (sessionId: string) => {
      setActiveSessionId(sessionId);
      await loadMessages(sessionId);
    },
    [] // eslint-disable-line
  );

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
  };
}
