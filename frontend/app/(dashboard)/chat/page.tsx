'use client';

import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  return (
    /*
     * Negative margin escapes dashboard padding so chat fills edge-to-edge.
     * h-[calc(100vh-64px)] = viewport minus topbar (64px).
     */
    <div className="-m-4 md:-m-6 lg:-m-8 h-[calc(100vh-64px)] flex flex-col">
      <ChatWindow />
    </div>
  );
}
