/**
 * Secure logging utility that prevents sensitive data exposure
 * In production, consider integrating with logging services like Winston, Pino, or DataDog
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

/**
 * Sensitive fields that should be redacted from logs
 * All lowercase since we compare with toLowerCase()
 */
const SENSITIVE_FIELDS = new Set([
  "password",
  "token",
  "apikey",
  "api_key",
  "secret",
  "authorization",
  "creditcard",
  "credit_card",
  "ssn",
  "cvv",
  "pin",
  "privatekey",
  "private_key",
]);

/**
 * Redact sensitive information from objects
 */
function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.has(lowerKey)) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Format log message with context
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(5);

  if (!context || Object.keys(context).length === 0) {
    return `[${timestamp}] ${levelStr} ${message}`;
  }

  const safeContext = redactSensitiveData(context);
  return `[${timestamp}] ${levelStr} ${message} ${JSON.stringify(safeContext)}`;
}

/**
 * Check if logging should be enabled for this level
 */
function shouldLog(level: LogLevel): boolean {
  const env = process.env.NODE_ENV;
  const logLevel = process.env.LOG_LEVEL || "info";

  // In production, only log warn and error by default
  if (env === "production") {
    return level === "warn" || level === "error";
  }

  // In development, respect LOG_LEVEL env var
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  const currentLevelIndex = levels.indexOf(logLevel as LogLevel);
  const messageLevelIndex = levels.indexOf(level);

  return messageLevelIndex >= currentLevelIndex;
}

/**
 * Secure logger that redacts sensitive information
 */
export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog("debug")) {
      console.debug(formatLogMessage("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    if (shouldLog("info")) {
      console.info(formatLogMessage("info", message, context));
    }
  },

  warn(message: string, context?: LogContext) {
    if (shouldLog("warn")) {
      console.warn(formatLogMessage("warn", message, context));
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (shouldLog("error")) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
        } : error,
      };
      console.error(formatLogMessage("error", message, errorContext));
    }
  },
};

/**
 * Redact sensitive data from objects (exported for testing)
 */
export { redactSensitiveData };
