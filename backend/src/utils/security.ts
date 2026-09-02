import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'facilityops_ai_secret_jwt_key_2026_x89a';

/**
 * Hashes password using PBKDF2 with HMAC-SHA256 and salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

/**
 * Verifies password against stored hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false;
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  facilityId: string;
  exp: number;
}

/**
 * Generates a signed token with 24-hour expiration
 */
export function generateToken(payload: Omit<TokenPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  const fullPayload: TokenPayload = { ...payload, exp };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies token signature and checks expiration
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (error) {
    return null;
  }
}
