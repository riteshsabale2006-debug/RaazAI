'use client';

import React from 'react';
import { getModeById } from '@/lib/modes';
import type { AIMode } from '@/lib/types';

interface PromptChipsProps {
  mode: AIMode;
  onSelect: (prompt: string) => void;
}

export default function PromptChips({ mode, onSelect }: PromptChipsProps) {
  const modeInfo = getModeById(mode);

  return (
    <div className="flex flex-col gap-3 items-center max-w-2xl mx-auto w-full px-4">
      <p className="text-raaz-muted text-xs font-medium uppercase tracking-wider">
        Suggested prompts
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {modeInfo.suggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelect(prompt)}
            className="px-4 py-2 rounded-xl text-sm border border-raaz-border text-raaz-muted
              hover:border-raaz-violet hover:text-raaz-text hover:bg-raaz-surface
              transition-all duration-200 btn-press text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
