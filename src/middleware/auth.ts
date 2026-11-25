import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { eq } from 'drizzle-orm';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { profiles } from '../db/schema.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  profile?: typeof profiles.$inferSelect;
}

const DEFAULT_OWNER_EMAIL = 'maivinamrhoo@gmail.com';

export function getAuthorizedAdminEmails(): string[] {
  const configured = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([DEFAULT_OWNER_EMAIL, ...configured]));
}

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Sign in required.' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token.' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = (decoded.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(403).json({ error: 'Forbidden: Account email is required.' });
    }

    const adminEmails = getAuthorizedAdminEmails();
    const isBootstrapAdmin = adminEmails.includes(email);

    // Look up existing profile by UID or email
    const existingByUid = await db
      .select()
      .from(profiles)
      .where(eq(profiles.uid, decoded.uid))
      .limit(1);

    let profile = existingByUid[0];

    if (!profile) {
      const existingByEmail = await db
        .select()
        .from(profiles)
        .where(eq(profiles.email, email))
        .limit(1);

      if (existingByEmail[0]) {
        const updated = await db
          .update(profiles)
          .set({
            uid: decoded.uid,
            fullName: decoded.name || existingByEmail[0].fullName || '',
            role: isBootstrapAdmin ? 'admin' : existingByEmail[0].role,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, existingByEmail[0].id))
          .returning();
        profile = updated[0];
      } else if (isBootstrapAdmin) {
        const inserted = await db
          .insert(profiles)
          .values({
            uid: decoded.uid,
            email,
            fullName: decoded.name || 'Vinit Singh Rajput',
            role: 'admin',
          })
          .onConflictDoUpdate({
            target: profiles.email,
            set: {
              uid: decoded.uid,
              role: 'admin',
              updatedAt: new Date(),
            },
          })
          .returning();
        profile = inserted[0];
      }
    } else if (isBootstrapAdmin && profile.role !== 'admin') {
      const promoted = await db
        .update(profiles)
        .set({ role: 'admin', updatedAt: new Date() })
        .where(eq(profiles.id, profile.id))
        .returning();
      profile = promoted[0];
    }

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: Only authorized administrators may access this area.',
      });
    }

    req.user = decoded;
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session.' });
  }
};
