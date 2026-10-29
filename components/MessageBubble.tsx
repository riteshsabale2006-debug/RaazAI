'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { copyToClipboard, formatTimestamp } from '@/lib/utils';
import type { Message, ModeInfo } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  mode: ModeInfo;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export default function MessageBubble({
  message,
  mode,
  isStreaming = false,
  onRegenerate,
  isLast = false,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUser) {
    return (
      <div className="message-enter flex items-end justify-end gap-2 px-4 py-1.5 group">
        <div className="flex flex-col items-end gap-1 max-w-[80%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
            style={{
              background: `linear-gradient(135deg, ${mode.color}cc, ${mode.color}99)`,
              boxShadow: `0 2px 12px ${mode.color}30`,
            }}
          >
            <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="text-xs text-raaz-muted opacity-0 group-hover:opacity-100 transition-opacity pr-1">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="message-enter flex items-start gap-3 px-4 py-1.5 group">
      {/* AI Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 transition-all"
        style={{
          background: `linear-gradient(135deg, ${mode.color}50, ${mode.color}25)`,
          border: `1px solid ${mode.color}40`,
        }}
      >
        <span>{mode.icon}</span>
      </div>

      <div className="flex flex-col gap-1.5 max-w-[85%] min-w-0">
        {/* Bubble */}
        <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
          {message.content ? (
            <div className="prose-raaz">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
          {isStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />
          )}
        </div>

        {/* Action bar */}
        {!isStreaming && message.content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy response"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface transition-all text-xs btn-press"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-raaz-muted hover:text-raaz-text hover:bg-raaz-surface transition-all text-xs btn-press"
              >
                <RefreshCw size={12} />
                <span>Regenerate</span>
              </button>
            )}

            <span className="text-xs text-raaz-muted ml-1">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
