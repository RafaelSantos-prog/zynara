import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import authRoutes from "./routes/auth.js";
import assistantRoutes from "./routes/assistant.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import paymentRoutes from "./routes/payment.js";
import { sendError } from "./lib/http.js";

const rootEnvPath = path.resolve(process.cwd(), "../.env");
dotenv.config({ path: rootEnvPath });
dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "zynara-backend"
  });
});

app.use("/auth", authRoutes);
app.use("/assistant", assistantRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/payment", paymentRoutes);

app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(500).json({ success: false, error: message });
});

app.listen(port, () => {
  console.log(`Zynara backend running on http://localhost:${port}`);
  console.log(`[env] GEMINI_API_KEY ${process.env.GEMINI_API_KEY ? "loaded" : "missing"}`);
});
