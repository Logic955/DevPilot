'use client';

import { useEffect, useState, use } from 'react';
import type { Message, MessagesResponse, ChatSession } from '@/types';
import { ChatView } from '@/components/chat/ChatView';
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";
import { usePanel } from '@/hooks/usePanel';

interface ChatSessionPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [sessionModel, setSessionModel] = useState<string>('');
  const [sessionMode, setSessionMode] = useState<string>('');
  const { setWorkingDirectory, setSessionId, setSessionTitle: setPanelSessionTitle, setPanelOpen } = usePanel();

  // Load session info and set working directory
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/chat/sessions/${id}`);
        if (res.ok) {
          const data: { session: ChatSession } = await res.json();
          if (data.session.working_directory) {
            setWorkingDirectory(data.session.working_directory);
          }
          setSessionId(id);
          setPanelOpen(true);
          const title = data.session.title || 'New Conversation';
          setSessionTitle(title);
          setPanelSessionTitle(title);
          setSessionModel(data.session.model || '');
          setSessionMode(data.session.mode || 'code');
        }
      } catch {
        // Session info load failed - panel will still work without directory
      }
    }

    loadSession();
  }, [id, setWorkingDirectory, setSessionId, setPanelSessionTitle, setPanelOpen]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat/sessions/${id}/messages`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Session not found');
            return;
          }
          throw new Error('Failed to load messages');
        }
        const data: MessagesResponse = await res.json();
        setMessages(data.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <HugeiconsIcon icon={Loading02Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">{error}</p>
          <a href="/chat" className="text-sm text-muted-foreground hover:underline">
            Start a new chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Chat title bar */}
      {sessionTitle && (
        <div
          className="flex items-center justify-center px-4 py-2"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <h2 className="text-sm font-medium text-foreground/80 truncate max-w-md">
            {sessionTitle}
          </h2>
        </div>
      )}
      <ChatView sessionId={id} initialMessages={messages} modelName={sessionModel} initialMode={sessionMode} />
    </div>
  );
}
