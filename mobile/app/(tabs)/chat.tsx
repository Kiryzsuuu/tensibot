import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, ChatSession, ChatMessage } from '@/types';

interface BotSettings {
  botName: string;
  botDescription: string;
  avatarBase64: string | null;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Hari ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

type MessageItem = ChatMessage | { type: 'separator'; date: string; id: string };

function insertSeparators(messages: ChatMessage[]): MessageItem[] {
  const result: MessageItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (dateKey !== lastDate) {
      result.push({ type: 'separator', date: msg.createdAt, id: `sep-${msg.id}` });
      lastDate = dateKey;
    }
    result.push(msg);
  }
  return result;
}

function AIAvatar({ avatarBase64, initial }: { avatarBase64?: string | null; initial: string }) {
  if (avatarBase64) {
    return (
      <Image source={{ uri: avatarBase64 }} style={styles.aiAvatar} />
    );
  }
  return (
    <View style={styles.aiAvatar}>
      <Text style={styles.aiAvatarText}>{initial[0]?.toUpperCase() ?? 'N'}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: botSettings } = useQuery<BotSettings>({
    queryKey: ['bot-settings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BotSettings>>('/settings/bot');
      return res.data.data ?? { botName: 'Nara', botDescription: 'Asisten Kesehatan AI', avatarBase64: null };
    },
    staleTime: 10 * 60 * 1000,
  });

  const botName = botSettings?.botName ?? 'Nara';
  const botDesc = botSettings?.botDescription ?? 'Asisten Kesehatan AI';
  const botAvatar = botSettings?.avatarBase64 ?? null;
  const userInitial = user?.fullName?.[0]?.toUpperCase() ?? 'U';
  const [input, setInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatRef = useRef<FlatList>(null);

  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ChatSession[]>>('/chat/sessions');
      return res.data.data ?? [];
    },
  });

  useEffect(() => {
    if (!activeSessionId) return;
    void api.get<ApiResponse<ChatMessage[]>>(`/chat/sessions/${activeSessionId}/messages`)
      .then((res) => setMessages(res.data.data ?? []));
  }, [activeSessionId]);

  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0]!.id);
    }
  }, [sessions]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (content: string) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const newSess = await api.post<ApiResponse<ChatSession>>('/chat/sessions');
        sessionId = newSess.data.data?.id ?? null;
        if (sessionId) {
          setActiveSessionId(sessionId);
          void qc.invalidateQueries({ queryKey: ['chat-sessions'] });
        }
      }
      if (!sessionId) throw new Error('Gagal membuat sesi');
      const res = await api.post<ApiResponse<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>>(
        `/chat/sessions/${sessionId}/messages`, { content }
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.userMessage && data?.assistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => !m.id.startsWith('temp-')),
          data.userMessage,
          data.assistantMessage,
        ]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    onError: () => {
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    },
  });

  const onSend = () => {
    const text = input.trim();
    if (!text || isPending) return;
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: activeSessionId ?? '',
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput('');
    sendMessage(text);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const newChat = () => { setActiveSessionId(null); setMessages([]); };

  const items = insertSeparators(messages);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header like WhatsApp */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AIAvatar avatarBase64={botAvatar} initial={botName} />
          <View>
            <Text style={styles.headerName}>{botName}</Text>
            <Text style={styles.headerStatus}>{botDesc}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={newChat}>
          <Ionicons name="create-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Session tabs */}
      {sessions.length > 1 && (
        <View style={styles.sessionBar}>
          <FlatList
            horizontal
            data={sessions}
            keyExtractor={(s) => s.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.sessionChip, activeSessionId === item.id && styles.sessionChipActive]}
                onPress={() => { setActiveSessionId(item.id); setMessages([]); }}
              >
                <Text style={[styles.sessionChipText, activeSessionId === item.id && styles.sessionChipTextActive]} numberOfLines={1}>
                  {item.title ?? 'Sesi baru'}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          />
        </View>
      )}

      {/* Message list */}
      <FlatList
        ref={flatRef}
        data={items}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <AIAvatar avatarBase64={botAvatar} initial={botName} />
            <View style={styles.emptyChatBubble}>
              <Text style={styles.emptyChatName}>{botName}</Text>
              <Text style={styles.emptyChatText}>
                Halo! Saya {botName}, asisten kesehatan hipertensi Anda. Tanya apa saja tentang tekanan darah, obat-obatan, atau gaya hidup sehat. Saya siap membantu! 😊
              </Text>
              <Text style={styles.emptyChatTime}>{formatTime(new Date().toISOString())}</Text>
            </View>
            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>Saya bukan pengganti dokter. Selalu konsultasikan kondisi Anda ke tenaga medis.</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if ('type' in item && item.type === 'separator') {
            return (
              <View style={styles.dateSep}>
                <View style={styles.dateSepLine} />
                <Text style={styles.dateSepText}>{formatDateSeparator(item.date)}</Text>
                <View style={styles.dateSepLine} />
              </View>
            );
          }
          const msg = item as ChatMessage;
          const isUser = msg.role?.toUpperCase() === 'USER';
          const isTemp = msg.id.startsWith('temp-');
          return (
            <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAI]}>
              {!isUser && <AIAvatar avatarBase64={botAvatar} initial={botName} />}
              <View style={styles.bubbleContent}>
                {!isUser && <Text style={styles.senderName}>{botName}</Text>}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
                  <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
                    {msg.content}
                  </Text>
                  <View style={styles.bubbleMeta}>
                    <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
                      {isTemp ? 'mengirim...' : formatTime(msg.createdAt)}
                    </Text>
                    {isUser && !isTemp && (
                      <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.7)" />
                    )}
                  </View>
                </View>
              </View>
              {isUser && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{userInitial}</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Typing indicator */}
      {isPending && (
        <View style={styles.typingWrap}>
          <AIAvatar avatarBase64={botAvatar} initial={botName} />
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, { opacity: 0.4 }]} />
              <View style={[styles.typingDot, { opacity: 0.7 }]} />
              <View style={styles.typingDot} />
            </View>
          </View>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ketik pesan..."
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          onSubmitEditing={onSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isPending) && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!input.trim() || isPending}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },

  // Header
  header: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerStatus: { fontSize: 11, color: Colors.primaryMid, marginTop: 1 },
  newBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Session bar
  sessionBar: { backgroundColor: Colors.primaryDark, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  sessionChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', maxWidth: 150 },
  sessionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sessionChipText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  sessionChipTextActive: { color: '#fff' },

  // Messages
  messageList: { padding: 12, paddingBottom: 8, flexGrow: 1 },

  // Date separator
  dateSep: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  dateSepLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dateSepText: { fontSize: 11, color: '#666', backgroundColor: '#D9D3CA', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },

  // Bubble wrapper
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4, gap: 6 },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI: { justifyContent: 'flex-start' },
  bubbleContent: { maxWidth: '72%' },
  senderName: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 3, marginLeft: 2 },

  // Bubble
  bubble: { padding: 10, paddingBottom: 6, borderRadius: 12 },
  bubbleUser: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 2,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 2, elevation: 1,
  },
  bubbleAI: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 2, elevation: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#1a1a1a' },
  bubbleTextAI: { color: '#1a1a1a' },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2 },
  bubbleTime: { fontSize: 10, color: '#888' },
  bubbleTimeUser: { color: '#5a8a5a' },

  // Avatars
  aiAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  aiAvatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  userAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  userAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Typing
  typingWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 12, paddingBottom: 4 },
  typingBubble: { backgroundColor: '#fff', borderRadius: 12, borderBottomLeftRadius: 2, padding: 12, elevation: 1 },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  // Empty state
  emptyChat: { paddingTop: 30, alignItems: 'flex-start', gap: 8 },
  emptyChatBubble: {
    backgroundColor: '#fff', borderRadius: 12, borderTopLeftRadius: 0,
    padding: 12, maxWidth: '80%', marginLeft: 40,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 2, elevation: 1,
  },
  emptyChatName: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  emptyChatText: { fontSize: 14, color: '#1a1a1a', lineHeight: 20 },
  emptyChatTime: { fontSize: 10, color: '#888', textAlign: 'right', marginTop: 4 },
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10,
    padding: 10, marginTop: 8, maxWidth: '90%', alignSelf: 'center',
  },
  disclaimerText: { fontSize: 11, color: '#666', flex: 1, lineHeight: 16 },

  // Input bar
  inputBar: {
    backgroundColor: '#F0F0F0',
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 8, gap: 8,
    borderTopWidth: 1, borderTopColor: '#DDD',
  },
  textInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: Colors.text, maxHeight: 100,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
