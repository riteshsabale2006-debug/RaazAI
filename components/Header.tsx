'use client';

import React from 'react';
import { PanelLeft, Plus } from 'lucide-react';
import type { ModeInfo } from '@/lib/types';

interface HeaderProps {
  activeMode: ModeInfo;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export default function Header({ activeMode, onToggleSidebar, onNewChat }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-raaz-border glass sticky top-0 z-20">
      {/* Left: sidebar toggle + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          className="p-2 rounded-lg text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface transition-all btn-press"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                boxShadow: '0 0 14px rgba(124,58,237,0.5)',
              }}
            >
              <span className="text-white">R</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-lg tracking-tight text-gradient">RAAZ AI</span>
          </div>
        </div>
      </div>

      {/* Center: active mode pill */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
        style={{
          background: `${activeMode.color}15`,
          borderColor: `${activeMode.color}40`,
          color: activeMode.color,
        }}
      >
        <span>{activeMode.icon}</span>
        <span className="hidden sm:inline">{activeMode.name}</span>
      </div>

      {/* Right: new chat */}
      <button
        onClick={onNewChat}
        title="New chat"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
          bg-raaz-violet hover:bg-raaz-violet-light transition-all btn-press text-white"
        style={{ boxShadow: '0 0 14px rgba(124,58,237,0.35)' }}
      >
        <Plus size={15} />
        <span className="hidden sm:inline">New Chat</span>
      </button>
    </header>
  );
}
