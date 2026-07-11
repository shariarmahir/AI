/**
 * Device-local chat history.
 *
 * There is no accounts backend, so sessions live in localStorage — consistent
 * with the app's promise that records stay private to this device. File
 * attachments are stored as metadata only (no File objects, no base64
 * previews) to stay well under the localStorage quota.
 */

export interface StoredFile {
  id: string;
  name: string;
  category: string | null;
  size: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'analyzing' | 'done';
  files?: StoredFile[];
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number; // ms epoch
  messages: StoredMessage[];
}

const KEY = 'lifeguard_chat_sessions_v1';
const MAX_SESSIONS = 20;

function read(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

function write(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // Quota exceeded or storage disabled — drop oldest and retry once.
    try {
      window.localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 5)));
    } catch {
      /* give up silently — history is a convenience, not critical */
    }
  }
}

/** All sessions, newest first. */
export function listSessions(): ChatSession[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadSession(id: string): ChatSession | undefined {
  return read().find(s => s.id === id);
}

/** Insert or update a session, keeping at most MAX_SESSIONS (newest kept). */
export function saveSession(session: ChatSession): void {
  const rest = read().filter(s => s.id !== session.id);
  const all = [session, ...rest].sort((a, b) => b.updatedAt - a.updatedAt);
  write(all.slice(0, MAX_SESSIONS));
}

export function deleteSession(id: string): void {
  write(read().filter(s => s.id !== id));
}

export function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Compact "time ago" label for the sidebar list. */
export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}
