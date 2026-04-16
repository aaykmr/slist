import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "../lib/prisma.js";
import { processParseJob } from "../services/processParseJob.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

export const resumesRouter = Router();

resumesRouter.post(
  "/",
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file?.buffer) {
        res.status(400).json({ error: "Missing file field `file`" });
        return;
      }
      const companyId = req.auth!.companyId;
      const job = await prisma.parseJob.create({
        data: {
          companyId,
          originalName: req.file.originalname,
          status: "PENDING",
        },
      });
      const ext = path.extname(req.file.originalname || "") || ".pdf";
      const uploadRoot = path.join(process.cwd(), "uploads");
      await mkdir(uploadRoot, { recursive: true });
      const storedPath = path.join(uploadRoot, `${job.id}${ext}`);
      await writeFile(storedPath, req.file.buffer);
      await prisma.parseJob.update({
        where: { id: job.id },
        data: { storedPath },
      });
      res.status(202).json({ jobId: job.id });
      void processParseJob(job.id).catch((err) =>
        console.error("processParseJob", job.id, err)
      );
    } catch (e) {
      next(e);
    }
  }
);

resumesRouter.get("/jobs/:id", async (req, res, next) => {
  try {
    const job = await prisma.parseJob.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      select: {
        id: true,
        status: true,
        originalName: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        candidate: { select: { id: true, displayName: true } },
      },
    });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  } catch (e) {
    next(e);
  }
});
