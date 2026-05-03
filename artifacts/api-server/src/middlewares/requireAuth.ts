import type { NextFunction, Request, Response } from "express";
import { verifyToken, type TokenPayload } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.auth = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, () => {
      if (!req.auth || !roles.includes(req.auth.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    });
  };
}
