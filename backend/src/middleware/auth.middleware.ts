import { Request, Response, NextFunction } from "express";

const SECRET_TOKEN = process.env.SECRET_TOKEN || "SECRET_TOKEN";

export interface AuthenticatedRequest extends Request {
  user?: {
    token: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authorization header is required",
    });
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      message: 'Authorization header must start with "Bearer "',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (token !== SECRET_TOKEN) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token",
    });
    return;
  }

  // Attach user info to request for potential future use
  (req as AuthenticatedRequest).user = { token };
  next();
};
