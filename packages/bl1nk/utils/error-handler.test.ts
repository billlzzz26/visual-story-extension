import { describe, it, expect } from 'vitest';
import { ExaError, handleRateLimitError, retryWithBackoff, formatToolError } from './error-handler.js';

describe('error-handler', () => {
  describe('ExaError', () => {
    it('creates error with status code and timestamp', () => {
      const error = new ExaError('Test error', 429, '2026-04-01T12:00:00Z');
      expect(error.name).toBe('ExaError');
      expect(error.statusCode).toBe(429);
      expect(error.timestamp).toBe('2026-04-01T12:00:00Z');
      expect(error.message).toBe('Test error');
    });

    it('creates error without timestamp', () => {
      const error = new ExaError('Test error', 500);
      expect(error.name).toBe('ExaError');
      expect(error.statusCode).toBe(500);
      expect(error.timestamp).toBeUndefined();
    });
  });

  describe('handleRateLimitError', () => {
    it('returns null for non-ExaError', () => {
      const result = handleRateLimitError(new Error('Regular error'), false, 'test_tool');
      expect(result).toBeNull();
    });

    it('returns null for ExaError with non-429 status', () => {
      const error = new ExaError('Server error', 500);
      const result = handleRateLimitError(error, false, 'test_tool');
      expect(result).toBeNull();
    });

    it('returns null for 429 with user-provided API key', () => {
      const error = new ExaError('Rate limited', 429);
      const result = handleRateLimitError(error, true, 'test_tool');
      expect(result).toBeNull();
    });

    it('returns rate limit message for 429 without user API key', () => {
      const error = new ExaError('Rate limited', 429);
      const result = handleRateLimitError(error, false, 'test_tool');
      expect(result).not.toBeNull();
      expect(result?.content[0].text).toContain("You've hit Exa's free MCP rate limit");
      expect(result?.content[0].text).toContain('https://dashboard.exa.ai/api-keys');
    });
  });

  describe('retryWithBackoff', () => {
    it('returns successful result on first try', async () => {
      const fn = async () => 'success';
      const result = await retryWithBackoff(fn);
      expect(result).toBe('success');
    });

    it('retries on transient 5xx errors', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new ExaError('Server error', 503);
        }
        return 'success after retry';
      };
      const result = await retryWithBackoff(fn, 3);
      expect(result).toBe('success after retry');
      expect(attempts).toBe(3);
    });

    it('throws immediately on non-transient error', async () => {
      const fn = async () => {
        throw new ExaError('Bad request', 400);
      };
      await expect(retryWithBackoff(fn)).rejects.toThrow('Bad request');
    });

    it('throws after max retries exceeded', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new ExaError('Server error', 503);
      };
      await expect(retryWithBackoff(fn, 2)).rejects.toThrow('Server error');
      expect(attempts).toBe(3); // initial + 2 retries
    });
  });

  describe('formatToolError', () => {
    it('formats regular Error', () => {
      const error = new Error('Something went wrong');
      const result = formatToolError(error, 'test_tool');
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('test_tool error: Something went wrong');
    });

    it('formats ExaError with status code and timestamp', () => {
      const error = new ExaError('API failed', 502, '2026-04-01T12:00:00Z');
      const result = formatToolError(error, 'exa_search');
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('exa_search error (502): API failed');
      expect(result.content[0].text).toContain('Timestamp: 2026-04-01T12:00:00Z');
    });

    it('formats ExaError without timestamp', () => {
      const error = new ExaError('API failed', 400);
      const result = formatToolError(error, 'exa_search');
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('exa_search error (400): API failed');
      expect(result.content[0].text).not.toContain('Timestamp:');
    });

    it('formats rate limit error for free MCP user', () => {
      const error = new ExaError('Rate limited', 429);
      const result = formatToolError(error, 'exa_search', false);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("You've hit Exa's free MCP rate limit");
    });

    it('formats unknown error types', () => {
      const result = formatToolError('string error', 'test_tool');
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('test_tool error: string error');
    });
  });
});
