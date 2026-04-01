import crypto from "node:crypto";

type GuestMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentAt: Date;
};

export type GuestSession = {
  id: string;
  messages: GuestMessage[];
  createdAt: Date;
  updatedAt: Date;
  userMessageCount: number;
};

const sessions = new Map<string, GuestSession>();

export const GUEST_MESSAGE_LIMIT = Number(process.env.GUEST_MAX_USER_MESSAGES ?? 50);
const SESSION_TTL_MINUTES = Number(process.env.GUEST_SESSION_TTL_MIN ?? 120);

function isExpired(session: GuestSession) {
  const ageMinutes = (Date.now() - session.updatedAt.getTime()) / 60000;
  return ageMinutes > SESSION_TTL_MINUTES;
}

function cleanupExpired() {
  for (const [id, session] of sessions.entries()) {
    if (isExpired(session)) {
      sessions.delete(id);
    }
  }
}

export function createGuestSession(): GuestSession {
  cleanupExpired();
  const session: GuestSession = {
    id: crypto.randomUUID(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    userMessageCount: 0
  };
  sessions.set(session.id, session);
  return session;
}

export function getGuestSession(id: string) {
  cleanupExpired();
  const session = sessions.get(id);
  if (!session) {
    return null;
  }
  if (isExpired(session)) {
    sessions.delete(id);
    return null;
  }
  return session;
}

export function appendGuestMessage(session: GuestSession, message: Omit<GuestMessage, "id" | "sentAt">) {
  const entry: GuestMessage = {
    id: crypto.randomUUID(),
    sentAt: new Date(),
    ...message
  };
  session.messages.push(entry);
  session.updatedAt = new Date();
  if (entry.role === "user") {
    session.userMessageCount += 1;
  }
  return entry;
}

export function getRemainingGuestMessages(session: GuestSession) {
  return Math.max(GUEST_MESSAGE_LIMIT - session.userMessageCount, 0);
}

export function serializeGuestMessages(session: GuestSession) {
  return session.messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    sentAt: message.sentAt.toISOString()
  }));
}
