import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/modes';
import type { ChatRequest } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 10_000;
const MAX_HISTORY_MESSAGES = 40;
const MAX_TOTAL_CHARS = 80_000; // ~20k tokens safety cap

// ─── Rate limiting (simple in-memory, resets on cold start) ──────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Retry helpers ────────────────────────────────────────────────────────────
// Only transient 503 UNAVAILABLE errors are retried.
// Quota (429), auth (401/403), and model-not-found (404) errors fail fast.
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1500; // 1.5s → 3s → 6s (exponential backoff)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(msg: string): boolean {
  return (
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('"code":503') ||
    msg.includes('status: 503')
  );
}

function isQuotaError(msg: string): boolean {
  return (
    msg.includes('quota_exceeded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('"code":429') ||
    msg.includes('status: 429')
  );
}

function isAuthError(msg: string): boolean {
  return (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid api key') ||
    msg.includes('provide an api key') ||
    msg.includes('"code":401') ||
    msg.includes('"code":403') ||
    msg.includes('permission_denied')
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 },
    );
  }

  // API key validation
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'RAAZ AI is not configured. Please add your GEMINI_API_KEY environment variable.',
      },
      { status: 503 },
    );
  }

  // Parse body
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { messages, mode, language, style } = body;

  // Input validation
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage?.content?.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
  }

  if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message is too long (max ${MAX_MESSAGE_LENGTH.toLocaleString()} characters).` },
      { status: 400 },
    );
  }

  // Trim conversation history
  const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  // Total content size guard
  const totalChars = trimmedMessages.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return NextResponse.json(
      { error: 'Conversation is too long. Please start a new chat.' },
      { status: 400 },
    );
  }

  // Validate mode/language/style values
  const validModes = ['smart', 'study', 'creator', 'coding', 'mystery', 'writing'];
  const validLangs = ['en', 'hi', 'mr'];
  const validStyles = ['concise', 'detailed', 'friendly', 'creative'];

  if (!validModes.includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });
  }
  if (!validLangs.includes(language)) {
    return NextResponse.json({ error: 'Invalid language.' }, { status: 400 });
  }
  if (!validStyles.includes(style)) {
    return NextResponse.json({ error: 'Invalid style.' }, { status: 400 });
  }

  // Build Gemini client
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash-lite';

  // ─── Retry loop (503 UNAVAILABLE only) ───────────────────────────────────────
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(mode, language, style),
      });

      // Build Gemini history (all messages except the last)
      const history = trimmedMessages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });

      // Attempt to stream the response
      const result = await chat.sendMessageStream(lastMessage.content);

      if (attempt > 1) {
        console.info(
          `[RAAZ AI] ${new Date().toISOString()} | model:${modelName} | attempt:${attempt}/${MAX_RETRIES} | status:recovered`,
        );
      }

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err: unknown) {
      lastError = err;
      const rawMsg = err instanceof Error ? err.message : String(err);
      const msg = rawMsg.toLowerCase();

      // Structured log: timestamp, model, attempt, and raw error (no API key)
      console.error(
        `[RAAZ AI] ${new Date().toISOString()} | model:${modelName} | attempt:${attempt}/${MAX_RETRIES} | error: ${rawMsg}`,
      );

      // Fail fast for quota/auth errors — retrying burns quota or won't help
      if (isQuotaError(msg) || isAuthError(msg)) break;

      // Only sleep+retry for transient 503 overload errors
      if (!isRetryable(msg)) break;

      if (attempt < MAX_RETRIES) {
        const backoffMs = RETRY_BASE_MS * Math.pow(2, attempt - 1); // 1.5s, 3s, 6s
        console.info(
          `[RAAZ AI] ${new Date().toISOString()} | model:${modelName} | 503 transient — retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await sleep(backoffMs);
      }
    }
  }

  // ─── Map final error to user-facing response ──────────────────────────────────
  const rawMsg = lastError instanceof Error ? lastError.message : String(lastError);
  const msg = rawMsg.toLowerCase();

  // HTTP 401 / invalid API key
  if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid api key') ||
    msg.includes('provide an api key') ||
    msg.includes('status: 401') ||
    msg.includes('"code":401')
  ) {
    return NextResponse.json(
      { error: 'Invalid API key. Please check your GEMINI_API_KEY.' },
      { status: 401 },
    );
  }

  // HTTP 403 / permission denied or billing required
  if (
    msg.includes('permission_denied') ||
    msg.includes('billing') ||
    msg.includes('status: 403') ||
    msg.includes('"code":403')
  ) {
    return NextResponse.json(
      { error: 'API access denied. Please check billing or API permissions.' },
      { status: 403 },
    );
  }

  // HTTP 404 / model not found or retired
  if (
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('no longer available') ||
    msg.includes('status: 404') ||
    msg.includes('"code":404')
  ) {
    return NextResponse.json(
      { error: 'The AI model is unavailable. The service may be updating — please try again shortly.' },
      { status: 503 },
    );
  }

  // HTTP 429 / quota or rate limit
  if (isQuotaError(msg)) {
    return NextResponse.json(
      { error: 'API rate limit reached. Please wait a moment and try again.' },
      { status: 429 },
    );
  }

  // HTTP 503 / model overloaded after all retries
  if (isRetryable(msg)) {
    return NextResponse.json(
      { error: 'The AI service is currently busy. Please try again in a few seconds.' },
      { status: 503 },
    );
  }

  // Safety / content filter
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harm')) {
    return NextResponse.json(
      { error: 'Your request was blocked by content safety filters. Please rephrase.' },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: 'Something went wrong with the AI service. Please try again.' },
    { status: 500 },
  );
}
