/**
 * Structured logging utility for production
 * Provides consistent logging format with timestamps, levels, and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment: boolean;
  private isServer: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.isServer = typeof window === 'undefined';
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.message}`);
      if (this.isDevelopment && entry.error.stack) {
        parts.push(`\nStack: ${entry.error.stack}`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        code: (error as any).code
      };
    }

    return entry;
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    const formatted = this.formatLog(entry);

    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }

    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    if (!this.isDevelopment && this.isServer) {
      // TODO: Send to logging service
      // Example: sendToLoggingService(entry);
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('debug', message, context);
    this.output(entry);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);
    this.output(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);
    this.output(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('error', message, context, error);
    this.output(entry);
  }

  /**
   * Log product creation
   */
  productCreated(productId: string, productName: string, userId?: string): void {
    this.info('Product created', {
      operation: 'product_create',
      productId,
      productName,
      userId
    });
  }

  /**
   * Log product update
   */
  productUpdated(
    productId: string,
    productName: string,
    changes: string[],
    userId?: string
  ): void {
    this.info('Product updated', {
      operation: 'product_update',
      productId,
      productName,
      changes: changes.join(', '),
      changeCount: changes.length,
      userId
    });
  }

  /**
   * Log product deletion
   */
  productDeleted(productId: string, productName: string, userId?: string): void {
    this.info('Product deleted', {
      operation: 'product_delete',
      productId,
      productName,
      userId
    });
  }

  /**
   * Log image upload
   */
  imageUploaded(
    url: string,
    publicId: string,
    sizeBytes: number,
    userId?: string
  ): void {
    this.info('Image uploaded', {
      operation: 'image_upload',
      url,
      publicId,
      sizeKB: (sizeBytes / 1024).toFixed(2),
      userId
    });
  }

  /**
   * Log API request
   */
  apiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const entry = this.createLogEntry(level, `API ${method} ${path}`, {
      operation: 'api_request',
      method,
      path,
      statusCode,
      duration,
      userId
    });
    this.output(entry);
  }

  /**
   * Log API error
   */
  apiError(
    method: string,
    path: string,
    error: Error,
    userId?: string
  ): void {
    this.error(`API ${method} ${path} failed`, error, {
      operation: 'api_error',
      method,
      path,
      userId
    });
  }

  /**
   * Log authentication event
   */
  authEvent(
    event: 'login' | 'logout' | 'token_refresh' | 'token_expired',
    userId?: string,
    success: boolean = true
  ): void {
    const level = success ? 'info' : 'warn';
    const entry = this.createLogEntry(level, `Auth: ${event}`, {
      operation: 'auth',
      event,
      userId,
      success
    });
    this.output(entry);
  }

  /**
   * Log database operation
   */
  dbOperation(
    operation: 'select' | 'insert' | 'update' | 'delete',
    table: string,
    duration: number,
    success: boolean = true,
    error?: Error
  ): void {
    if (success) {
      this.debug(`DB ${operation} on ${table}`, {
        operation: 'db_operation',
        dbOperation: operation,
        table,
        duration
      });
    } else {
      this.error(`DB ${operation} on ${table} failed`, error, {
        operation: 'db_operation',
        dbOperation: operation,
        table,
        duration
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logProductCreated = logger.productCreated.bind(logger);
export const logProductUpdated = logger.productUpdated.bind(logger);
export const logProductDeleted = logger.productDeleted.bind(logger);
export const logImageUploaded = logger.imageUploaded.bind(logger);
export const logApiRequest = logger.apiRequest.bind(logger);
export const logApiError = logger.apiError.bind(logger);
export const logAuthEvent = logger.authEvent.bind(logger);
export const logDbOperation = logger.dbOperation.bind(logger);
