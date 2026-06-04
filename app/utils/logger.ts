/**
 * Simple structured logger with [BinLocator] prefix and timestamps.
 * Wraps console methods for consistent, searchable log output.
 * @module
 */

/** Structured logger interface. */
export interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

/**
 * Application logger that prefixes all messages with `[BinLocator]`
 * and includes ISO timestamps for structured log analysis.
 */
export const logger: Logger = {
  /** Log an informational message. */
  info(message: string, ...args: unknown[]): void {
    console.log(`[BinLocator] [${new Date().toISOString()}] INFO: ${message}`, ...args);
  },

  /** Log a warning message. */
  warn(message: string, ...args: unknown[]): void {
    console.log(`[BinLocator] [${new Date().toISOString()}] WARN: ${message}`, ...args);
  },

  /** Log an error message. */
  error(message: string, ...args: unknown[]): void {
    console.log(`[BinLocator] [${new Date().toISOString()}] ERROR: ${message}`, ...args);
  },
};
