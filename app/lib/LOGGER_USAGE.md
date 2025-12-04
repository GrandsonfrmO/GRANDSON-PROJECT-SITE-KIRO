# Logger Usage Guide

This document provides examples of how to use the structured logging system.

## Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Simple info log
logger.info('Application started');

// Log with details
logger.info('User action', { 
  action: 'button_click', 
  buttonId: 'submit' 
});

// Warning log
logger.warning('Slow API response', { 
  endpoint: '/api/products', 
  duration: 5000 
});

// Error log with stack trace
try {
  // some code
} catch (error) {
  logger.error('Failed to process request', error as Error, {
    userId: 'user123',
    operation: 'checkout'
  });
}
```

## Setting Context

Set global context that will be included in all subsequent logs:

```typescript
import { logger } from '@/lib/logger';

// Set user context after login
logger.setContext({
  userId: 'user123',
  userName: 'John Doe',
  sessionId: 'session456'
});

// All logs will now include this context
logger.info('User performed action'); // Will include userId, userName, sessionId

// Clear context on logout
logger.clearContext();
```

## Product Operations

```typescript
import { logger } from '@/lib/logger';

// Log product creation
const product = await createProduct(productData);
logger.logProductCreate(product.id, {
  name: product.name,
  category: product.category,
  price: product.price,
  stock: product.stock
});

// Log product update with changes
const oldProduct = await getProduct(productId);
const updatedProduct = await updateProduct(productId, changes);
logger.logProductUpdate(productId, changes, {
  price: oldProduct.price,
  stock: oldProduct.stock
});

// Log product deletion
logger.logProductDelete(productId, product.name);
```

## Image Upload Logging

```typescript
import { logger } from '@/lib/logger';

// Log successful image upload
const result = await uploadToCloudinary(file);
logger.logImageUpload(
  result.secure_url,
  file.size,
  file.name,
  result.public_id
);
```

## Authentication Logging

```typescript
import { logger } from '@/lib/logger';

// Successful login
logger.logAuth(true, 'admin@example.com');

// Failed login
logger.logAuth(false, 'admin@example.com', 'Invalid password');
```

## API Call Logging

```typescript
import { logger } from '@/lib/logger';

const startTime = Date.now();
try {
  const response = await fetch('/api/products');
  const duration = Date.now() - startTime;
  
  logger.logApiCall('GET', '/api/products', response.status, duration);
} catch (error) {
  const duration = Date.now() - startTime;
  logger.logApiCall('GET', '/api/products', 500, duration);
}
```

## Order Operations

```typescript
import { logger } from '@/lib/logger';

// Log order creation
logger.logOrderCreate(order.id, order.order_number, order.total_amount);

// Log order status update
logger.logOrderUpdate(
  order.id,
  order.order_number,
  'PENDING',
  'CONFIRMED'
);
```

## Sensitive Data Protection

The logger automatically redacts sensitive fields:

```typescript
import { logger } from '@/lib/logger';

// These fields will be automatically redacted: [REDACTED]
logger.info('User login attempt', {
  username: 'admin',
  password: 'secret123',  // Will be [REDACTED]
  token: 'abc123',        // Will be [REDACTED]
  apiKey: 'key123'        // Will be [REDACTED]
});
```

## Integration in API Routes

### Example: Product Creation Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Set context from auth token
    const userId = getUserIdFromToken(request);
    logger.setContext({ userId });
    
    const productData = await request.json();
    
    // Create product
    const product = await createProduct(productData);
    
    // Log successful creation
    logger.logProductCreate(product.id, productData);
    
    // Log API call
    const duration = Date.now() - startTime;
    logger.logApiCall('POST', '/api/admin/products', 200, duration);
    
    return NextResponse.json({ success: true, data: product });
    
  } catch (error) {
    // Log error with stack trace
    logger.error('Failed to create product', error as Error, {
      endpoint: '/api/admin/products'
    });
    
    const duration = Date.now() - startTime;
    logger.logApiCall('POST', '/api/admin/products', 500, duration);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  } finally {
    logger.clearContext();
  }
}
```

## Log Output Format

### Development Environment
Logs are formatted with pretty-print JSON:

```json
{
  "timestamp": "2024-12-04T10:30:00.000Z",
  "level": "info",
  "operation": "create",
  "message": "Product created",
  "context": {
    "userId": "user123",
    "userName": "Admin User"
  },
  "details": {
    "productId": "prod456",
    "productName": "Test Product",
    "category": "Electronics",
    "price": 99.99,
    "stock": 10
  },
  "metadata": {
    "environment": "development",
    "service": "frontend"
  }
}
```

### Production Environment
Logs are single-line JSON for efficient parsing:

```json
{"timestamp":"2024-12-04T10:30:00.000Z","level":"info","operation":"create","message":"Product created","context":{"userId":"user123"},"details":{"productId":"prod456","productName":"Test Product"},"metadata":{"environment":"production","service":"backend"}}
```

## Best Practices

1. **Always log operations**: Create, update, delete operations should always be logged
2. **Include context**: Set user context at the start of authenticated requests
3. **Log errors with details**: Always include relevant details when logging errors
4. **Clear context**: Clear context at the end of request handlers
5. **Use appropriate log levels**: 
   - `info` for normal operations
   - `warning` for recoverable issues
   - `error` for failures
   - `debug` for development-only information
6. **Don't log sensitive data**: The logger sanitizes common sensitive fields, but be mindful of what you log
7. **Include timing information**: Log API call durations for performance monitoring

## Requirements Coverage

This logging system satisfies the following requirements:

- **7.1**: Logs product creation with ID and user
- **7.2**: Logs product updates with changed fields and old values
- **7.3**: Logs errors with complete stack traces
- **7.4**: Logs image uploads with Cloudinary URL and file size
- **7.5**: All logs include timestamp and log level
