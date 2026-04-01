import { Router } from "express";
import { z } from "zod";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";
import { sendError, sendSuccess } from "../lib/http.js";

const router = Router();
router.use(authMiddleware);

const subscribeSchema = z.object({
  planId: z.string().default("pro")
});

router.post("/subscribe", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const parsed = subscribeSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, "Invalid subscription payload", 400, parsed.error.flatten());
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const subscription = await prisma.subscription.create({
    data: {
      userId: req.auth.userId,
      planId: parsed.data.planId,
      status: "active",
      mpSubscriptionId: `mp_${Date.now()}`,
      startedAt: new Date(),
      expiresAt
    }
  });

  await prisma.user.update({
    where: { id: req.auth.userId },
    data: { plan: parsed.data.planId }
  });

  return sendSuccess(res, {
    subscription,
    checkoutUrl: `/payment/mock-checkout/${subscription.id}`
  }, 201);
});

router.get("/status", async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: req.auth.userId },
    orderBy: { startedAt: "desc" }
  });

  return sendSuccess(res, {
    status: subscription?.status ?? "free",
    plan: subscription?.planId ?? "free",
    expiresAt: subscription?.expiresAt ?? null
  });
});

export default router;

