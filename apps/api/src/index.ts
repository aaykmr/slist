import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { resumesRouter } from "./routes/resumes.js";
import { candidatesRouter } from "./routes/candidates.js";
import { metaRouter } from "./routes/meta.js";
import { publicRouter } from "./routes/public.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/public", publicRouter);
app.use(requireAuth);
app.use("/resumes", resumesRouter);
app.use("/candidates", candidatesRouter);
app.use("/meta", metaRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
