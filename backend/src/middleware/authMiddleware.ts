import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/jwt.js";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    email: string;
    lang: string;
  };
};

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Missing authorization token" });
  }

  const token = header.slice(7);

  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired authorization token" });
  }
}

