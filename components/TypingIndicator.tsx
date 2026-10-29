'use client';

import React from 'react';
import type { ModeInfo } from '@/lib/types';

interface TypingIndicatorProps {
  mode: ModeInfo;
}

export default function TypingIndicator({ mode }: TypingIndicatorProps) {
  return (
    <div className="message-enter flex items-start gap-3 px-4 py-2">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
        style={{ background: `linear-gradient(135deg, ${mode.color}60, ${mode.color}30)`, border: `1px solid ${mode.color}40` }}
      >
        <span>{mode.icon}</span>
      </div>

      {/* Bubble */}
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
