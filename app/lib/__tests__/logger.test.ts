/**
 * Logger Tests
 * 
 * Basic tests to verify logger functionality
 */

import { logger, LogLevel, OperationType } from '../logger';

describe('Logger', () => {
  // Capture console output
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger.clearContext();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Basic Logging', () => {
    test('logs info message', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.INFO);
      expect(logOutput.message).toBe('Test info message');
      expect(logOutput.timestamp).toBeDefined();
    });

    test('logs warning message', () => {
      logger.warning('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.WARNING);
      expect(logOutput.message).toBe('Test warning message');
    });

    test('logs error with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.ERROR);
      expect(logOutput.message).toBe('Error occurred');
      expect(logOutput.error).toBeDefined();
      expect(logOutput.error.message).toBe('Test error');
    });
  });

  describe('Context Management', () => {
    test('sets and includes context in logs', () => {
      logger.setContext({ userId: 'user123', userName: 'Test User' });
      logger.info('Test with context');
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.context).toBeDefined();
      expect(logOutput.context.userId).toBe('user123');
      expect(logOutput.context.userName).toBe('Test User');
    });

    test('clears context', () => {
      logger.setContext({ userId: 'user123' });
      logger.clearContext();
      logger.info('Test without context');
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.context).toBeUndefined();
    });
  });

  describe('Product Operations', () => {
    test('logs product creation', () => {
      const productData = {
        name: 'Test Product',
        category: 'Test Category',
        price: 99.99,
        stock: 10
      };
      
      logger.logProductCreate('prod123', productData);
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.operation).toBe(OperationType.CREATE);
      expect(logOutput.message).toBe('Product created');
      expect(logOutput.details.productId).toBe('prod123');
      expect(logOutput.details.productName).toBe('Test Product');
    });

    test('logs product update with changes', () => {
      const changes = { price: 89.99, stock: 15 };
      const oldValues = { price: 99.99, stock: 10 };
      
      logger.logProductUpdate('prod123', changes, oldValues);
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.operation).toBe(OperationType.UPDATE);
      expect(logOutput.message).toBe('Product updated');
      expect(logOutput.details.changes).toEqual(changes);
      expect(logOutput.details.oldValues).toEqual(oldValues);
    });

    test('logs product deletion', () => {
      logger.logProductDelete('prod123', 'Test Product');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.operation).toBe(OperationType.DELETE);
      expect(logOutput.message).toBe('Product deleted');
      expect(logOutput.details.productId).toBe('prod123');
    });
  });

  describe('Image Upload Logging', () => {
    test('logs image upload with details', () => {
      logger.logImageUpload(
        'https://cloudinary.com/image.jpg',
        1024000,
        'test-image.jpg',
        'public123'
      );
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.operation).toBe(OperationType.UPLOAD);
      expect(logOutput.message).toBe('Image uploaded');
      expect(logOutput.details.cloudinaryUrl).toBe('https://cloudinary.com/image.jpg');
      expect(logOutput.details.fileSize).toBe(1024000);
      expect(logOutput.details.fileSizeMB).toBeDefined();
    });
  });

  describe('Sensitive Data Sanitization', () => {
    test('sanitizes password fields', () => {
      logger.info('User login', { username: 'test', password: 'secret123' });
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.details.username).toBe('test');
      expect(logOutput.details.password).toBe('[REDACTED]');
    });

    test('sanitizes token fields', () => {
      logger.info('API call', { endpoint: '/api/test', token: 'abc123' });
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.details.endpoint).toBe('/api/test');
      expect(logOutput.details.token).toBe('[REDACTED]');
    });

    test('sanitizes nested sensitive data', () => {
      logger.info('Complex data', {
        user: {
          name: 'Test',
          apiKey: 'secret'
        }
      });
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.details.user.name).toBe('Test');
      expect(logOutput.details.user.apiKey).toBe('[REDACTED]');
    });
  });

  describe('Authentication Logging', () => {
    test('logs successful authentication', () => {
      logger.logAuth(true, 'admin@test.com');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.operation).toBe(OperationType.AUTH);
      expect(logOutput.message).toBe('Authentication successful');
      expect(logOutput.details.success).toBe(true);
    });

    test('logs failed authentication', () => {
      logger.logAuth(false, 'admin@test.com', 'Invalid password');
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.WARNING);
      expect(logOutput.message).toBe('Authentication failed');
      expect(logOutput.details.reason).toBe('Invalid password');
    });
  });

  describe('API Call Logging', () => {
    test('logs successful API call', () => {
      logger.logApiCall('GET', '/api/products', 200, 150);
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.operation).toBe(OperationType.API_CALL);
      expect(logOutput.details.statusCode).toBe(200);
      expect(logOutput.details.duration).toBe('150ms');
    });

    test('logs failed API call as warning', () => {
      logger.logApiCall('POST', '/api/products', 500);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      const logOutput = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.WARNING);
      expect(logOutput.details.statusCode).toBe(500);
    });
  });

  describe('Metadata', () => {
    test('includes environment and service metadata', () => {
      logger.info('Test metadata');
      
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.metadata).toBeDefined();
      expect(logOutput.metadata.environment).toBeDefined();
      expect(logOutput.metadata.service).toBeDefined();
    });
  });
});
