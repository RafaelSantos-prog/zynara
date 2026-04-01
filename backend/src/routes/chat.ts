import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError, sendSuccess } from "../lib/http.js";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { generateGeminiReply } from "../lib/gemini.js";

const router = Router();
router.use(authMiddleware);

router.post("/session", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const sessionCount = await prisma.session.count({ where: { userId: req.auth.userId } });
  const session = await prisma.session.create({
    data: {
      userId: req.auth.userId,
      title: `Sessão ${sessionCount + 1}`
    }
  });

  return sendSuccess(res, session, 201);
});

router.get("/sessions", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const sessions = await prisma.session.findMany({
    where: { userId: req.auth.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { sentAt: "asc" },
        take: 1
      }
    }
  });

  return sendSuccess(res, sessions);
});

router.delete("/sessions/:id", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const session = await prisma.session.findFirst({
    where: { id: req.params.id, userId: req.auth.userId }
  });

  if (!session) {
    return sendError(res, "Session not found", 404);
  }

  await prisma.session.delete({
    where: { id: session.id }
  });

  return sendSuccess(res, { id: session.id });
});

const sendSchema = z.object({
  sessionId: z.string().min(1),
  content: z.string().min(1).max(4000)
});

router.post("/send", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, "Invalid chat payload", 400, parsed.error.flatten());
  }

  const session = await prisma.session.findFirst({
    where: { id: parsed.data.sessionId, userId: req.auth.userId }
  });

  if (!session) {
    return sendError(res, "Session not found", 404);
  }

  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: "user",
      content: parsed.data.content
    }
  });

  const onboardingAnswers = await prisma.onboardingAnswer.findMany({
    where: { userId: req.auth.userId },
    orderBy: { answeredAt: "asc" }
  });

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { lang: true }
  });

  const recentHistory = await prisma.message.findMany({
    where: { sessionId: session.id },
    orderBy: { sentAt: "desc" },
    take: 8
  });

  const reply = await generateGeminiReply({
    userMessage: parsed.data.content,
    onboardingSummary: onboardingAnswers.map((item) => `${item.questionKey}: ${item.answer}`).join(" | "),
    recentHistory: recentHistory.reverse().map((entry) => ({
      role: entry.role as "user" | "assistant",
      content: entry.content
    })),
    language: user?.lang ?? req.auth.lang
  });

  const assistantMessage = await prisma.message.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      content: reply.reply
    }
  });

  const shouldRetitle = /^Sessão \d+$/.test(session.title);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      title: shouldRetitle ? parsed.data.content.slice(0, 42) || session.title : session.title
    }
  });

  return sendSuccess(res, {
    reply: reply.reply,
    replySource: reply.source,
    assistantMessage
  });
});

router.get("/history/:id", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const session = await prisma.session.findFirst({
    where: { id: req.params.id, userId: req.auth.userId }
  });

  if (!session) {
    return sendError(res, "Session not found", 404);
  }

  const messages = await prisma.message.findMany({
    where: { sessionId: session.id },
    orderBy: { sentAt: "asc" }
  });

  return sendSuccess(res, messages);
});

export default router;
