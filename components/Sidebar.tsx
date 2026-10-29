'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Settings,
  Trash2,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { MODES, getModeById } from '@/lib/modes';
import type { ChatSession, AIMode, UserPreferences } from '@/lib/types';
import SettingsPanel from './SettingsPanel';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeMode: AIMode;
  prefs: UserPreferences;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  onModeChange: (mode: AIMode) => void;
  onPrefsChange: (prefs: UserPreferences) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  activeMode,
  prefs,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onModeChange,
  onPrefsChange,
  onClearHistory,
  onClose,
}: SidebarProps) {
  const [view, setView] = useState<'main' | 'settings'>('main');

  return (
    <div className="flex flex-col h-full w-72 glass border-r border-raaz-border">
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-raaz-border">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              boxShadow: '0 0 14px rgba(124,58,237,0.5)',
            }}
          >
            <span className="text-white">R</span>
          </div>
          <div>
            <div className="font-black text-base tracking-tight text-gradient leading-none">RAAZ AI</div>
            <div className="text-[10px] text-raaz-muted leading-none mt-0.5">One AI. Many Possibilities.</div>
          </div>
        </div>
        {/* Close on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {view === 'settings' ? (
        <SettingsPanel
          prefs={prefs}
          onChange={onPrefsChange}
          onClearHistory={onClearHistory}
          onClose={() => setView('main')}
        />
      ) : (
        <>
          {/* Mode Selection */}
          <div className="p-4 border-b border-raaz-border">
            <p className="text-[10px] text-raaz-muted font-semibold uppercase tracking-wider mb-3">AI Mode</p>
            <div className="flex flex-col gap-1.5">
              {MODES.map((mode) => {
                const isActive = mode.id === activeMode;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all btn-press text-left
                      ${isActive
                        ? 'text-white'
                        : 'text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface'
                      }`}
                    style={isActive ? {
                      background: `linear-gradient(135deg, ${mode.color}cc, ${mode.color}80)`,
                      boxShadow: `0 2px 12px ${mode.color}35`,
                    } : {}}
                  >
                    <span className="text-base">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{mode.name}</div>
                      <div className={`text-[10px] leading-tight truncate ${isActive ? 'text-white/70' : 'text-raaz-muted'}`}>
                        {mode.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto chat-scroll">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[10px] text-raaz-muted font-semibold uppercase tracking-wider">History</p>
              <button
                onClick={onNewChat}
                className="flex items-center gap-1 text-[10px] text-raaz-violet hover:text-raaz-violet-light transition-colors"
              >
                <Plus size={11} />
                New
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <MessageSquare size={24} className="text-raaz-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-raaz-muted">No conversations yet.</p>
                <p className="text-[10px] text-raaz-muted opacity-60 mt-1">Start chatting to see history here.</p>
              </div>
            ) : (
              <div className="px-2 pb-2 space-y-0.5">
                {sessions.map((session) => {
                  const m = getModeById(session.mode);
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                        ${isActive ? 'bg-raaz-surface border border-raaz-border' : 'hover:bg-raaz-surface/60'}`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <span className="text-sm flex-shrink-0">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${isActive ? 'text-raaz-text font-medium' : 'text-raaz-muted'}`}>
                          {session.title}
                        </p>
                        <p className="text-[10px] text-raaz-muted opacity-60">{m.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-raaz-muted hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-raaz-border p-3">
            <button
              onClick={() => setView('settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface transition-all text-sm btn-press"
            >
              <Settings size={15} />
              <span>Settings & Preferences</span>
              <ChevronRight size={14} className="ml-auto" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
