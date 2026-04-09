import crypto from 'crypto';

/**
 * Generate PKCE (Proof Key for Code Exchange) parameters
 * Uses S256 challenge method for maximum security
 */
export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  
  return { verifier, challenge };
}

/**
 * Generate state parameter for CSRF protection
 */
export function generateState() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Verify PKCE code challenge
 */
export function verifyPKCE(verifier: string, challenge: string): boolean {
  const computedChallenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  
  return computedChallenge === challenge;
}
