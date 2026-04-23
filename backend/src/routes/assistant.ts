import { Router } from "express";
import { sendSuccess } from "../lib/http.js";

const router = Router();

router.get("/status", (_req, res) => {
  return sendSuccess(res, {
    backend: "ready",
    voiceAssistant: {
      sharedEnv: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      voicePrefsPath: process.env.VOICE_ASSISTANT_PREFS_PATH ?? null
    }
  });
});

export default router;
