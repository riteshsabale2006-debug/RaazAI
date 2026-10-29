'use client';

import React from 'react';
import { X, Globe, Palette, Trash2, Shield } from 'lucide-react';
import type { UserPreferences, Language, ResponseStyle } from '@/lib/types';

interface SettingsPanelProps {
  prefs: UserPreferences;
  onChange: (prefs: UserPreferences) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी' },
  { value: 'mr', label: 'Marathi', native: 'मराठी' },
];

const STYLES: { value: ResponseStyle; label: string; desc: string }[] = [
  { value: 'friendly', label: 'Friendly', desc: 'Warm & conversational' },
  { value: 'concise', label: 'Concise', desc: 'Brief & to the point' },
  { value: 'detailed', label: 'Detailed', desc: 'Thorough & comprehensive' },
  { value: 'creative', label: 'Creative', desc: 'Imaginative & expressive' },
];

export default function SettingsPanel({ prefs, onChange, onClearHistory, onClose }: SettingsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-raaz-border">
        <h2 className="font-semibold text-raaz-text text-sm">Settings</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Language */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-raaz-violet" />
            <h3 className="text-xs font-semibold text-raaz-muted uppercase tracking-wider">Language</h3>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => onChange({ ...prefs, language: lang.value })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all btn-press
                  ${prefs.language === lang.value
                    ? 'border-raaz-violet bg-raaz-violet/10 text-raaz-text'
                    : 'border-raaz-border text-raaz-muted hover:border-raaz-border hover:bg-raaz-surface hover:text-raaz-text'
                  }`}
              >
                <span>{lang.label}</span>
                <span className="text-raaz-muted text-xs">{lang.native}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Response Style */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={14} className="text-raaz-violet" />
            <h3 className="text-xs font-semibold text-raaz-muted uppercase tracking-wider">Response Style</h3>
          </div>
          <div className="space-y-2">
            {STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...prefs, style: style.value })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all btn-press
                  ${prefs.style === style.value
                    ? 'border-raaz-violet bg-raaz-violet/10 text-raaz-text'
                    : 'border-raaz-border text-raaz-muted hover:border-raaz-border hover:bg-raaz-surface hover:text-raaz-text'
                  }`}
              >
                <span>{style.label}</span>
                <span className="text-raaz-muted text-xs">{style.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-raaz-violet" />
            <h3 className="text-xs font-semibold text-raaz-muted uppercase tracking-wider">Privacy & Data</h3>
          </div>
          <div className="p-3 rounded-xl border border-raaz-border bg-raaz-surface/50 text-xs text-raaz-muted space-y-2 mb-3">
            <p>Chat history is stored only in your browser&apos;s local storage. It is never sent to our servers.</p>
            <p>Your conversations are processed by the AI model to generate responses. Do not share sensitive personal information.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Delete all local chat history? This cannot be undone.')) {
                onClearHistory();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-900/50
              text-red-400 hover:bg-red-950/30 hover:border-red-800 transition-all text-sm btn-press"
          >
            <Trash2 size={14} />
            <span>Clear All Chat History</span>
          </button>
        </section>
      </div>
    </div>
  );
}
