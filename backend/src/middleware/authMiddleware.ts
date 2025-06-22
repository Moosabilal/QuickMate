// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Ensure dotenv is configured to load JWT_SECRET

// Extend the Request type to include the 'user' property
interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

/**
 * Middleware to authenticate the JWT token.
 * Attaches decoded user info to req.user if token is valid.
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return; // Explicitly return void after sending response
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      res.status(500).json({ message: 'Server configuration error.' });
      return; // Explicitly return void
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; role: string };
    console.log("decoded", decoded);
    req.user = decoded;
    next(); // Calls the next middleware
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: 'Invalid token' });
    return; // Explicitly return void
  }
};

/**
 * Middleware to authorize user based on roles.
 * Must be used AFTER authenticateToken.
 * @param roles An array of roles that are allowed to access the route.
 */
export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => { // Added : void return type for the inner function
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated for role check.' });
      return; // Explicitly return void
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
      return; // Explicitly return void
    }
    next(); // Calls the next middleware
  };
};