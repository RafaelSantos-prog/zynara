import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError, sendSuccess } from "../lib/http.js";
import { signAuthToken } from "../lib/jwt.js";
import { verifyGoogleIdToken } from "../lib/google.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import crypto from "node:crypto";

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

const bodySchema = z.object({
  idToken: z.string().min(1)
});

router.post("/google", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, "idToken is required", 400, parsed.error.flatten());
  }

  try {
    const profile = await verifyGoogleIdToken(parsed.data.idToken);
    if (!profile.googleId || !profile.email) {
      return sendError(res, "Unable to resolve Google profile", 400);
    }

    const existingByGoogle = await prisma.user.findUnique({
      where: { googleId: profile.googleId },
      select: publicUserSelect
    });

    const user = existingByGoogle
      ? await prisma.user.update({
          where: { id: existingByGoogle.id },
          data: {
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatarUrl ?? null
          },
          select: publicUserSelect
        })
      : await prisma.user.upsert({
          where: { email: profile.email },
          create: {
            googleId: profile.googleId,
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatarUrl ?? null
          },
          update: {
            googleId: profile.googleId,
            name: profile.name,
            avatarUrl: profile.avatarUrl ?? null
          },
          select: publicUserSelect
        });

    const onboardingCount = await prisma.onboardingAnswer.count({
      where: { userId: user.id }
    });

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      lang: user.lang
    });

    return sendSuccess(res, {
      token,
      user: {
        ...user,
        onboardingComplete: onboardingCount >= 3
      }
    });
  } catch (error) {
    return sendError(res, "Google authentication failed", 401, error instanceof Error ? error.message : error);
  }
});

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, "Invalid registration payload", 400, parsed.error.flatten());
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true }
  });

  if (existing?.passwordHash) {
    return sendError(res, "E-mail already registered", 409);
  }

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    create: {
      googleId: `local_${crypto.randomUUID()}`,
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: hashPassword(parsed.data.password)
    },
    update: {
      name: parsed.data.name,
      passwordHash: hashPassword(parsed.data.password)
    },
    select: publicUserSelect
  });

  const onboardingCount = await prisma.onboardingAnswer.count({
    where: { userId: user.id }
  });

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    lang: user.lang
  });

  return sendSuccess(res, {
    token,
    user: {
      ...user,
      onboardingComplete: onboardingCount >= 3
    }
  }, 201);
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128)
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, "Invalid login payload", 400, parsed.error.flatten());
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      ...publicUserSelect,
      passwordHash: true
    }
  });

  if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return sendError(res, "Invalid email or password", 401);
  }

  const onboardingCount = await prisma.onboardingAnswer.count({
    where: { userId: user.id }
  });

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    lang: user.lang
  });

  const { passwordHash, ...publicUser } = user;

  return sendSuccess(res, {
    token,
    user: {
      ...publicUser,
      onboardingComplete: onboardingCount >= 3
    }
  });
});

export default router;
