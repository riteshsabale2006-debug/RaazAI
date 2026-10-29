'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Square, AlertCircle } from 'lucide-react';
import { getModeById } from '@/lib/modes';
import { generateId, validateMessage, MAX_MESSAGE_LENGTH } from '@/lib/utils';
import type { Message, AIMode, Language, ResponseStyle } from '@/lib/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import PromptChips from './PromptChips';

interface ChatAreaProps {
  messages: Message[];
  activeMode: AIMode;
  language: Language;
  style: ResponseStyle;
  onMessagesUpdate: (messages: Message[]) => void;
}

export default function ChatArea({
  messages,
  activeMode,
  language,
  style,
  onMessagesUpdate,
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeInfo = getModeById(activeMode);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isLoading]);

  // Auto resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }, [input]);

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const sendMessage = useCallback(
    async (content: string = input) => {
      const text = content.trim();
      const validationError = validateMessage(text);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setInput('');
      setStreamingContent('');

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
        mode: activeMode,
      };

      const updatedMessages = [...messages, userMessage];
      onMessagesUpdate(updatedMessages);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode: activeMode,
            language,
            style,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        // Stream the response
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulated = '';

        setIsLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamingContent(accumulated);
        }

        // Finalize the assistant message
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: accumulated,
          timestamp: Date.now(),
          mode: activeMode,
        };

        setStreamingContent('');
        onMessagesUpdate([...updatedMessages, assistantMessage]);
      } catch (err: unknown) {
        setIsLoading(false);
        setStreamingContent('');
        if (err instanceof Error && err.name === 'AbortError') {
          // User stopped generation — that's fine
        } else {
          setError(
            err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          );
        }
      }
    },
    [input, messages, activeMode, language, style, onMessagesUpdate],
  );

  const handleRegenerate = useCallback(() => {
    // Find the index of the last user message
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;
    const lastUserContent = messages[lastUserIdx].content;
    // Keep all messages up to (but NOT including) the last user message
    // sendMessage will re-add the user message
    const trimmedHistory = messages.slice(0, lastUserIdx);
    onMessagesUpdate(trimmedHistory);
    sendMessage(lastUserContent);
  }, [messages, onMessagesUpdate, sendMessage]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 chat-scroll overflow-y-auto">
        {isEmpty ? (
          /* Welcome / Hero */
          <div className="flex flex-col items-center justify-center h-full px-4 py-12 gap-8">
            {/* Hero */}
            <div className="text-center space-y-4 max-w-lg">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 0 60px rgba(124,58,237,0.2)',
                }}
              >
                <span className="text-white">R</span>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gradient mb-2">
                  RAAZ AI
                </h1>
                <p className="text-raaz-muted text-base">One AI. Many Possibilities.</p>
              </div>
              <p className="text-raaz-muted text-sm leading-relaxed">
                Currently in{' '}
                <span
                  className="font-semibold"
                  style={{ color: modeInfo.color }}
                >
                  {modeInfo.icon} {modeInfo.name}
                </span>
                . Switch modes anytime in the sidebar.
              </p>
            </div>

            {/* Prompt chips */}
            <PromptChips mode={activeMode} onSelect={(p) => sendMessage(p)} />
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((message, i) => (
              <MessageBubble
                key={message.id}
                message={message}
                mode={modeInfo}
                isLast={i === messages.length - 1 && message.role === 'assistant'}
                onRegenerate={
                  i === messages.length - 1 && message.role === 'assistant'
                    ? handleRegenerate
                    : undefined
                }
              />
            ))}

            {/* Streaming message */}
            {streamingContent && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: Date.now(),
                }}
                mode={modeInfo}
                isStreaming
              />
            )}

            {/* Typing indicator (before first chunk arrives) */}
            {isLoading && !streamingContent && <TypingIndicator mode={modeInfo} />}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-sm animate-fade-in">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 transition-colors text-xs flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div
          className="input-glow glass-elevated rounded-2xl flex flex-col transition-all"
          style={{ borderColor: 'rgba(124,58,237,0.2)' }}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading) sendMessage();
              }
            }}
            placeholder="Ask anything. Discover more..."
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isLoading && !streamingContent}
            className="w-full bg-transparent text-raaz-text placeholder-raaz-muted text-sm
              px-4 pt-3.5 pb-2 resize-none outline-none leading-relaxed
              disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Chat message input"
          />

          <div className="flex items-center justify-between px-3 pb-3 gap-2">
            {/* Character count */}
            <span className="text-xs text-raaz-muted">
              {input.length > 0 && `${input.length.toLocaleString()} / ${MAX_MESSAGE_LENGTH.toLocaleString()}`}
            </span>

            <div className="flex items-center gap-2">
              {/* Mode indicator */}
              <span
                className="text-xs px-2 py-1 rounded-lg border hidden sm:inline-flex items-center gap-1"
                style={{
                  color: modeInfo.color,
                  borderColor: `${modeInfo.color}30`,
                  background: `${modeInfo.color}10`,
                }}
              >
                {modeInfo.icon} {modeInfo.name}
              </span>

              {/* Stop or Send */}
              {(isLoading || streamingContent) ? (
                <button
                  onClick={stopGeneration}
                  title="Stop generation"
                  className="p-2.5 rounded-xl bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-red-300 transition-all btn-press border border-red-900/50"
                >
                  <Square size={15} />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  title="Send message (Enter)"
                  id="send-button"
                  className="p-2.5 rounded-xl transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{
                    background: input.trim()
                      ? 'linear-gradient(135deg, #7c3aed, #9f67f0)'
                      : 'rgba(124,58,237,0.3)',
                    boxShadow: input.trim() ? '0 0 14px rgba(124,58,237,0.4)' : 'none',
                  }}
                >
                  <Send size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-raaz-muted mt-2 opacity-60">
          RAAZ AI can make mistakes. Verify important information. Press Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
}
