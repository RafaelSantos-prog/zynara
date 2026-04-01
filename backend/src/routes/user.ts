import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError, sendSuccess } from "../lib/http.js";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware.js";

const router = Router();
const publicUserSelect = {
  id: true,
  googleId: true,
  email: true,
  name: true,
  avatarUrl: true,
  lang: true,
  plan: true,
  createdAt: true,
  updatedAt: true
} as const;

router.use(authMiddleware);

router.get("/profile", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: {
      ...publicUserSelect,
      onboardingAnswers: {
        orderBy: { answeredAt: "desc" },
        select: {
          id: true,
          questionKey: true,
          answer: true,
          answeredAt: true
        }
      }
    }
  });

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  return sendSuccess(res, {
    ...user,
    onboardingComplete: user.onboardingAnswers.length >= 3
  });
});

const profileSchema = z.object({
  lang: z.enum(["pt-BR", "en-US", "es"]).optional()
});

router.patch("/profile", async (req: AuthenticatedRequest, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, "Invalid profile payload", 400, parsed.error.flatten());
  }

  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const user = await prisma.user.update({
    where: { id: req.auth.userId },
    data: {
      ...(parsed.data.lang ? { lang: parsed.data.lang } : {})
    },
    select: publicUserSelect
  });

  return sendSuccess(res, user);
});

const onboardingSchema = z.object({
  answers: z.array(
    z.object({
      questionKey: z.string().min(1),
      answer: z.string().optional().default("")
    })
  ).min(1)
});

router.get("/onboarding", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const answers = await prisma.onboardingAnswer.findMany({
    where: { userId: req.auth.userId },
    orderBy: { answeredAt: "asc" }
  });

  return sendSuccess(res, answers);
});

router.post("/onboarding", async (req: AuthenticatedRequest, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, "Invalid onboarding payload", 400, parsed.error.flatten());
  }

  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  await prisma.onboardingAnswer.deleteMany({
    where: { userId: req.auth.userId }
  });

  await prisma.onboardingAnswer.createMany({
    data: parsed.data.answers.map((answer) => ({
      userId: req.auth!.userId,
      questionKey: answer.questionKey,
      answer: answer.answer ?? ""
    }))
  });

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    include: { onboardingAnswers: true }
  });

  return sendSuccess(res, {
    completed: true,
    onboardingComplete: (user?.onboardingAnswers.length ?? 0) >= 3
  });
});

export default router;
