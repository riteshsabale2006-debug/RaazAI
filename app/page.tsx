'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatArea from '@/components/ChatArea';
import { getModeById } from '@/lib/modes';
import {
  generateId,
  loadHistory,
  saveHistory,
  clearHistory,
  loadPreferences,
  savePreferences,
  deriveTitle,
} from '@/lib/utils';
import type { AIMode, ChatSession, Message, UserPreferences } from '@/lib/types';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<AIMode>('smart');
  const [prefs, setPrefs] = useState<UserPreferences>({
    language: 'en',
    style: 'friendly',
    theme: 'dark',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const history = loadHistory();
    const savedPrefs = loadPreferences();
    setSessions(history);
    setPrefs(savedPrefs);

    // Auto-open sidebar on desktop
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];
  const modeInfo = getModeById(activeMode);

  // ── Session management ──────────────────────────────────────────────────────

  const createNewSession = useCallback((): ChatSession => {
    return {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      mode: activeMode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }, [activeMode]);

  const handleNewChat = useCallback(() => {
    const session = createNewSession();
    setSessions((prev) => {
      const updated = [session, ...prev];
      saveHistory(updated);
      return updated;
    });
    setActiveSessionId(session.id);
    setActiveMode(session.mode);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [createNewSession]);

  const handleSelectSession = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (session) {
        setActiveSessionId(id);
        setActiveMode(session.mode);
        if (window.innerWidth < 1024) setSidebarOpen(false);
      }
    },
    [sessions],
  );

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveHistory(updated);
      return updated;
    });
    setActiveSessionId((prev) => (prev === id ? null : prev));
  }, []);

  const handleModeChange = useCallback((mode: AIMode) => {
    setActiveMode(mode);
    // Update the active session's mode if one exists
    if (activeSessionId) {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === activeSessionId ? { ...s, mode } : s,
        );
        saveHistory(updated);
        return updated;
      });
    }
  }, [activeSessionId]);

  const handlePrefsChange = useCallback((newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    savePreferences(newPrefs);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  const handleMessagesUpdate = useCallback(
    (newMessages: Message[]) => {
      if (!activeSessionId) {
        // Create a new session automatically
        const session: ChatSession = {
          id: generateId(),
          title: deriveTitle(newMessages),
          messages: newMessages,
          mode: activeMode,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions((prev) => {
          const updated = [session, ...prev];
          saveHistory(updated);
          return updated;
        });
        setActiveSessionId(session.id);
      } else {
        setSessions((prev) => {
          const updated = prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: newMessages,
                  title: deriveTitle(newMessages),
                  updatedAt: Date.now(),
                }
              : s,
          );
          saveHistory(updated);
          return updated;
        });
      }
    },
    [activeSessionId, activeMode],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-raaz-black">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 sidebar-transition flex
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'}
        `}
      >
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          activeMode={activeMode}
          prefs={prefs}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewChat={handleNewChat}
          onModeChange={handleModeChange}
          onPrefsChange={handlePrefsChange}
          onClearHistory={handleClearHistory}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeMode={modeInfo}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onNewChat={handleNewChat}
        />

        <ChatArea
          messages={messages}
          activeMode={activeMode}
          language={prefs.language}
          style={prefs.style}
          onMessagesUpdate={handleMessagesUpdate}
        />
      </main>
    </div>
  );
}
