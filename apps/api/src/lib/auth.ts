import jwt from "jsonwebtoken";

export type AuthPayload = {
  sub: string;
  companyId: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to apps/api/.env.");
  }
  return secret;
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token payload");
  }
  const sub = typeof decoded.sub === "string" ? decoded.sub : "";
  const companyId = typeof decoded.companyId === "string" ? decoded.companyId : "";
  const email = typeof decoded.email === "string" ? decoded.email : "";
  if (!sub || !companyId || !email) {
    throw new Error("Invalid token claims");
  }
  return { sub, companyId, email };
}
