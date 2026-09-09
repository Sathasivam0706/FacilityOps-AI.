import { Request, Response } from 'express';
import { findUserByEmailDb, createUserDb, UserData } from '../../../database/models/store';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../utils/security';

function sanitizeUser(user: UserData) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

export async function login(req: Request, res: Response) {
  try {
    const rawIdentifier = (req.body.userId || req.body.email || '').trim();
    const password = req.body.password || req.body.pin || '';
    const securIdPasscode = (req.body.securIdPasscode || req.body.tokenCode || req.body.passcode || '').toString().trim();

    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, error: 'User ID and Password/PIN are required' });
    }

    // Validate SecurID Passcode format if present or requested
    if (securIdPasscode && !/^\d{6}$/.test(securIdPasscode)) {
      return res.status(400).json({ 
        success: false, 
        error: 'SecurID Passcode must be a valid 6-digit synchronous token code' 
      });
    }

    const email = rawIdentifier.includes('@') 
      ? rawIdentifier.toLowerCase() 
      : `${rawIdentifier.toLowerCase()}@apexhighrise.com`;

    const existingUser = await findUserByEmailDb(email);

    if (existingUser) {
      // If user has stored password hash, verify password
      if (existingUser.passwordHash && existingUser.salt) {
        const isValid = verifyPassword(password, existingUser.passwordHash, existingUser.salt);
        if (!isValid) {
          return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
      } else {
        // First login or legacy user, set password hash
        const { hash, salt } = hashPassword(password);
        existingUser.passwordHash = hash;
        existingUser.salt = salt;
      }

      const token = generateToken({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        facilityId: existingUser.facilityId,
      });

      return res.json({
        success: true,
        token,
        user: sanitizeUser(existingUser),
      });
    }

    // Auto-provision user for demo account if user doesn't exist yet
    const { hash, salt } = hashPassword(password);
    const newUser: UserData = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: email.split('@')[0].replace('.', ' ') || 'Facility Manager',
      email: email.toLowerCase(),
      role: 'Facility Manager',
      facilityId: 'apex-hq',
      passwordHash: hash,
      salt: salt,
    };
    const savedUser = await createUserDb(newUser);

    const token = generateToken({
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      facilityId: savedUser.facilityId,
    });

    return res.json({
      success: true,
      token,
      user: sanitizeUser(savedUser),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Login failed' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await findUserByEmailDb(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const { hash, salt } = hashPassword(password);

    const newUser: UserData = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email: email.toLowerCase(),
      role: role || 'Facility Manager',
      facilityId: 'apex-hq',
      passwordHash: hash,
      salt: salt,
    };

    const savedUser = await createUserDb(newUser);

    const token = generateToken({
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      facilityId: savedUser.facilityId,
    });

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(savedUser),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const user = await findUserByEmailDb(payload.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch current user' });
  }
}

export async function logout(req: Request, res: Response) {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
