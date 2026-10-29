import type { Message, ChatSession, UserPreferences } from './types';

// ─── ID generation ────────────────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── LocalStorage helpers (safe – SSR won't crash) ────────────────────────────
const HISTORY_KEY = 'raaz-chat-history';
const PREFS_KEY = 'raaz-preferences';

export function loadHistory(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep at most 30 sessions to avoid excessive storage usage
    const trimmed = sessions.slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full – silently ignore
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined')
    return { language: 'en', style: 'friendly', theme: 'dark' };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw
      ? { language: 'en', style: 'friendly', theme: 'dark', ...JSON.parse(raw) }
      : { language: 'en', style: 'friendly', theme: 'dark' };
  } catch {
    return { language: 'en', style: 'friendly', theme: 'dark' };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

// ─── Message formatting ───────────────────────────────────────────────────────
export function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function truncate(text: string, maxLen = 60): string {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

export function deriveTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user');
  return first ? truncate(first.content, 50) : 'New Chat';
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Input validation (client-side mirror of server-side) ─────────────────────
export const MAX_MESSAGE_LENGTH = 10_000;
export const MAX_HISTORY_MESSAGES = 40; // keep context window reasonable

export function validateMessage(content: string): string | null {
  if (!content.trim()) return 'Message cannot be empty.';
  if (content.length > MAX_MESSAGE_LENGTH)
    return `Message is too long (max ${MAX_MESSAGE_LENGTH.toLocaleString()} characters).`;
  return null;
}
