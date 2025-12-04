/**
 * Structured Logging System
 * 
 * Provides comprehensive logging for all operations with:
 * - Timestamps
 * - Log levels (info, warning, error)
 * - User context
 * - Operation details
 * - Stack traces for errors
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  UPLOAD = 'upload',
  AUTH = 'auth',
  API_CALL = 'api_call'
}

export interface LogContext {
  userId?: string;
  userName?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  operation?: OperationType;
  message: string;
  context?: LogContext;
  details?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: {
    environment: string;
    service: string;
  };
}

class Logger {
  private context: LogContext = {};
  private environment: string;
  private service: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.service = typeof window === 'undefined' ? 'backend' : 'frontend';
  }

  /**
   * Set global context for all subsequent logs
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Get current context
   */
  getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    operation?: OperationType,
    details?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: {
        environment: this.environment,
        service: this.service
      }
    };

    if (operation) {
      entry.operation = operation;
    }

    if (Object.keys(this.context).length > 0) {
      entry.context = { ...this.context };
    }

    if (details && Object.keys(details).length > 0) {
      entry.details = this.sanitizeDetails(details);
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: this.environment === 'development' ? error.stack : undefined,
        code: (error as any).code
      };
    }

    return entry;
  }

  /**
   * Sanitize sensitive data from log details
   */
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details };
    const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'api_key', 'authorization'];

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        if (sensitiveKeys.some(sk => keyLower.includes(sk))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Format and output log entry
   */
  private output(entry: LogEntry): void {
    const formattedLog = this.formatLog(entry);

    // In production, you might want to send logs to a service
    // For now, we'll use console with appropriate methods
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARNING:
        console.warn(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.environment === 'development') {
          console.debug(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }

    // In production, send to logging service
    if (this.environment === 'production' && typeof window === 'undefined') {
      this.sendToLoggingService(entry);
    }
  }

  /**
   * Format log entry for console output
   */
  private formatLog(entry: LogEntry): string {
    if (this.environment === 'development') {
      // Pretty format for development
      return JSON.stringify(entry, null, 2);
    } else {
      // Single line JSON for production
      return JSON.stringify(entry);
    }
  }

  /**
   * Send logs to external logging service (placeholder)
   */
  private sendToLoggingService(entry: LogEntry): void {
    // TODO: Implement integration with logging service
    // Examples: Datadog, LogRocket, Sentry, CloudWatch, etc.
    // For now, this is a placeholder
  }

  /**
   * Log an info message
   */
  info(message: string, details?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, undefined, details);
    this.output(entry);
  }

  /**
   * Log a warning message
   */
  warning(message: string, details?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARNING, message, undefined, details);
    this.output(entry);
  }

  /**
   * Log an error with stack trace
   */
  error(message: string, error?: Error, details?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, undefined, details, error);
    this.output(entry);
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, details?: Record<string, any>): void {
    if (this.environment === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, undefined, details);
      this.output(entry);
    }
  }

  /**
   * Log a product creation operation
   * Requirement 7.1: Logger l'opération avec l'ID du produit et l'utilisateur
   */
  logProductCreate(productId: string, productData: Record<string, any>): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      'Product created',
      OperationType.CREATE,
      {
        productId,
        productName: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock
      }
    );
    this.output(entry);
  }

  /**
   * Log a product update operation
   * Requirement 7.2: Logger les champs modifiés et les anciennes valeurs
   */
  logProductUpdate(
    productId: string,
    changes: Record<string, any>,
    oldValues: Record<string, any>
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      'Product updated',
      OperationType.UPDATE,
      {
        productId,
        changes,
        oldValues
      }
    );
    this.output(entry);
  }

  /**
   * Log a product deletion operation
   */
  logProductDelete(productId: string, productName?: string): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      'Product deleted',
      OperationType.DELETE,
      {
        productId,
        productName
      }
    );
    this.output(entry);
  }

  /**
   * Log an image upload operation
   * Requirement 7.4: Logger l'URL Cloudinary et la taille du fichier
   */
  logImageUpload(
    cloudinaryUrl: string,
    fileSize: number,
    fileName: string,
    publicId?: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      'Image uploaded',
      OperationType.UPLOAD,
      {
        cloudinaryUrl,
        fileSize,
        fileName,
        publicId,
        fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2)
      }
    );
    this.output(entry);
  }

  /**
   * Log an authentication operation
   */
  logAuth(success: boolean, username?: string, reason?: string): void {
    const entry = this.createLogEntry(
      success ? LogLevel.INFO : LogLevel.WARNING,
      success ? 'Authentication successful' : 'Authentication failed',
      OperationType.AUTH,
      {
        success,
        username,
        reason
      }
    );
    this.output(entry);
  }

  /**
   * Log an API call
   */
  logApiCall(
    method: string,
    endpoint: string,
    statusCode: number,
    duration?: number
  ): void {
    const entry = this.createLogEntry(
      statusCode >= 400 ? LogLevel.WARNING : LogLevel.INFO,
      `API ${method} ${endpoint}`,
      OperationType.API_CALL,
      {
        method,
        endpoint,
        statusCode,
        duration: duration ? `${duration}ms` : undefined
      }
    );
    this.output(entry);
  }

  /**
   * Log an order creation
   */
  logOrderCreate(orderId: string, orderNumber: string, totalAmount: number): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      'Order created',
      OperationType.CREATE,
      {
        orderId,
        orderNumber,
        totalAmount
      }
    );
    this.output(entry);
  }

  /**
   * Log an order status update
   */
  logOrderUpdate(
    orderId: string,
    orderNumber: string,
    oldStatus: string,
    newStatus: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      'Order status updated',
      OperationType.UPDATE,
      {
        orderId,
        orderNumber,
        oldStatus,
        newStatus
      }
    );
    this.output(entry);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logInfo = (message: string, details?: Record<string, any>) => 
  logger.info(message, details);

export const logWarning = (message: string, details?: Record<string, any>) => 
  logger.warning(message, details);

export const logError = (message: string, error?: Error, details?: Record<string, any>) => 
  logger.error(message, error, details);

export const logDebug = (message: string, details?: Record<string, any>) => 
  logger.debug(message, details);

export default logger;
