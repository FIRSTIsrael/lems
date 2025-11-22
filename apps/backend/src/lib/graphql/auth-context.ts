import type { ConnectionInitMessage } from 'graphql-ws';
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import db from '../database';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface VolunteerUser {
  userId: string;
  eventId: string;
  role: string;
  identifier: string | null;
  roleInfo: Record<string, unknown> | null;
  divisions: string[];
}

function extractTokenFromRequest(req?: Request): string | null {
  if (!req?.cookies) {
    return null;
  }

  return req.cookies['lems-auth-token'] || null;
}

function extractTokenFromWebsocketConnection(
  connectionParams?: ConnectionInitMessage['payload']
): string | null {
  if (!connectionParams || typeof connectionParams !== 'object') {
    return null;
  }

  const token = (connectionParams as Record<string, unknown>)['token'];
  return typeof token === 'string' ? token : null;
}

function verifyToken(token: string): { userId: string; userType: string } | null {
  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; userType: string };
    if (decoded.userType !== 'volunteer') {
      console.warn('[Auth] Invalid user type in token:', decoded.userType);
      return null;
    }
    return decoded;
  } catch (error) {
    console.warn(
      '[Auth] Token verification failed:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function fetchUserWithDivisions(userId: string): Promise<VolunteerUser | null> {
  try {
    const eventUser = await db.eventUsers.byId(userId).get();

    if (!eventUser) {
      console.warn('[Auth] User not found:', userId);
      return null;
    }

    return {
      userId: eventUser.id,
      eventId: eventUser.event_id,
      role: eventUser.role,
      identifier: eventUser.identifier,
      roleInfo: eventUser.role_info,
      divisions: eventUser.divisions
    };
  } catch (error) {
    console.error('[Auth] Error fetching user:', error);
    return null;
  }
}

/**
 * Authenticates user from HTTP request
 * Extracts token from cookies, verifies JWT, and fetches user data with divisions
 *
 * @param req - Express request object
 * @returns AuthenticatedUser if valid token and user exists, null otherwise
 */
export async function authenticateHttp(req?: Request): Promise<VolunteerUser | null> {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return fetchUserWithDivisions(decoded.userId);
}

/**
 * Authenticates user from WebSocket connection parameters
 * Extracts token from connection init message, verifies JWT, and fetches user data with divisions
 *
 * @param connectionParams - WebSocket connection init message payload
 * @returns AuthenticatedUser if valid token and user exists, null otherwise
 */
export async function authenticateWebsocket(
  connectionParams?: ConnectionInitMessage['payload']
): Promise<VolunteerUser | null> {
  const token = extractTokenFromWebsocketConnection(connectionParams);

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return fetchUserWithDivisions(decoded.userId);
}
