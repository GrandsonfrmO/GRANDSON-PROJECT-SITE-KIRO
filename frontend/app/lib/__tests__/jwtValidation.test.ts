/**
 * JWT Validation Tests
 * 
 * Tests for centralized JWT validation utility
 * Requirements: 6.3, 6.4
 */

import { validateToken } from '../jwtValidation';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

describe('JWT Validation', () => {
  describe('validateToken', () => {
    it('should validate a valid admin token', () => {
      const payload = {
        id: 'user-123',
        username: 'admin',
        email: 'admin@test.com',
        role: 'admin',
        isAdmin: true
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const result = validateToken(token);
      
      expect(result.success).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.id).toBe('user-123');
      expect(result.payload?.username).toBe('admin');
    });

    it('should reject token without admin role', () => {
      const payload = {
        id: 'user-123',
        username: 'user',
        email: 'user@test.com',
        role: 'user',
        isAdmin: false
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const result = validateToken(token);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FORBIDDEN');
      expect(result.error?.message).toContain('Admin privileges required');
    });

    it('should reject expired token with clear message', () => {
      const payload = {
        id: 'user-123',
        username: 'admin',
        email: 'admin@test.com',
        role: 'admin',
        isAdmin: true
      };
      
      // Create token that expired 1 hour ago
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });
      const result = validateToken(token);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_EXPIRED');
      expect(result.error?.message).toContain('session has expired');
      expect(result.error?.message).toContain('log in again');
    });

    it('should reject invalid token with clear message', () => {
      const result = validateToken('invalid-token-string');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_TOKEN');
      expect(result.error?.message).toContain('Invalid authentication token');
      expect(result.error?.message).toContain('log in again');
    });

    it('should reject token signed with wrong secret', () => {
      const payload = {
        id: 'user-123',
        username: 'admin',
        email: 'admin@test.com',
        role: 'admin',
        isAdmin: true
      };
      
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
      const result = validateToken(token);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_TOKEN');
    });
  });

  // Note: extractToken tests are skipped because they require Next.js Request object
  // which is not available in Jest environment. These are tested through integration tests.
});
