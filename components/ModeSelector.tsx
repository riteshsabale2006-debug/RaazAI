'use client';

import React from 'react';
import { MODES } from '@/lib/modes';
import type { AIMode } from '@/lib/types';

interface ModeSelectorProps {
  activeMode: AIMode;
  onChange: (mode: AIMode) => void;
  compact?: boolean;
}

export default function ModeSelector({ activeMode, onChange, compact = false }: ModeSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'justify-center'}`}>
      {MODES.map((mode) => {
        const isActive = mode.id === activeMode;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            title={mode.description}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
              border transition-all duration-200 btn-press
              ${compact ? 'text-xs px-2.5 py-1' : ''}
              ${isActive
                ? 'text-white border-transparent mode-active'
                : 'text-raaz-muted border-raaz-border hover:border-raaz-violet hover:text-raaz-text bg-transparent hover:bg-raaz-surface'
              }
            `}
            style={isActive ? {
              background: `linear-gradient(135deg, ${mode.color}cc, ${mode.color}99)`,
              boxShadow: `0 0 0 2px ${mode.color}60, 0 0 16px ${mode.color}30`,
            } : {}}
          >
            <span>{mode.icon}</span>
            <span>{mode.name}</span>
          </button>
        );
      })}
    </div>
  );
}
