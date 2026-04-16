import type { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../lib/auth.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
