import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, ChatSession, ChatMessage } from '@/types';

export default function ChatScreen() {
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatRef = useRef<FlatList>(null);

  // Load sessions
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ChatSession[]>>('/chat/sessions');
      return res.data.data ?? [];
    },
  });

  // Load messages when session changes
  useEffect(() => {
    if (!activeSessionId) return;
    void api.get<ApiResponse<ChatMessage[]>>(`/chat/sessions/${activeSessionId}/messages`)
      .then((res) => setMessages(res.data.data ?? []));
  }, [activeSessionId]);

  // Auto select first session
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
        `/chat/sessions/${sessionId}/messages`,
        { content }
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.userMessage && data?.assistantMessage) {
        setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
  });

  const onSend = () => {
    const text = input.trim();
    if (!text || isPending) return;
    const tempMsg: ChatMessage = { id: `temp-${Date.now()}`, sessionId: activeSessionId ?? '', role: 'USER', content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setInput('');
    sendMessage(text);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const newChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Chat</Text>
        <TouchableOpacity style={styles.newBtn} onPress={newChat}>
          <Text style={styles.newBtnText}>+ Baru</Text>
        </TouchableOpacity>
      </View>

      {/* Session list */}
      {sessions.length > 0 && (
        <View style={styles.sessionBar}>
          <FlatList
            horizontal
            data={sessions}
            keyExtractor={(s) => s.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.sessionChip, activeSessionId === item.id && styles.sessionChipActive]}
                onPress={() => {
                  setActiveSessionId(item.id);
                  setMessages([]);
                }}
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

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatIcon}>💬</Text>
            <Text style={styles.emptyChatTitle}>Halo! Saya Nara</Text>
            <Text style={styles.emptyChatSubtitle}>Asisten AI untuk kesehatan hipertensi Anda. Tanya apa saja!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isUser = item.role?.toUpperCase() === 'USER';
          return (
            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
                {item.content}
              </Text>
            </View>
          );
        }}
      />

      {/* Typing indicator */}
      {isPending && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingText}>Nara sedang mengetik...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ketik pesan..."
          placeholderTextColor={Colors.primaryMid}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          onSubmitEditing={onSend}
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || isPending) && styles.sendBtnDisabled]} onPress={onSend} disabled={!input.trim() || isPending}>
          <Text style={styles.sendBtnText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  newBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  newBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  sessionBar: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sessionChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, maxWidth: 150 },
  sessionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sessionChipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  sessionChipTextActive: { color: '#fff' },
  messageList: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyChatIcon: { fontSize: 48, marginBottom: 12 },
  emptyChatTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  emptyChatSubtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 6, maxWidth: 260 },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleUser: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: Colors.text },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  typingText: { fontSize: 12, color: Colors.textMuted },
  inputBar: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  textInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.text, maxHeight: 100 },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
