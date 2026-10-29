// Shared TypeScript interfaces for RAAZ AI

export type AIMode =
  | 'smart'
  | 'study'
  | 'creator'
  | 'coding'
  | 'mystery'
  | 'writing';

export type Language = 'en' | 'hi' | 'mr';

export type ResponseStyle = 'concise' | 'detailed' | 'friendly' | 'creative';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  mode?: AIMode;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  mode: AIMode;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  language: Language;
  style: ResponseStyle;
  theme: 'dark' | 'light';
}

export interface ChatRequest {
  messages: { role: MessageRole; content: string }[];
  mode: AIMode;
  language: Language;
  style: ResponseStyle;
}

export interface ModeInfo {
  id: AIMode;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  suggestions: string[];
}
