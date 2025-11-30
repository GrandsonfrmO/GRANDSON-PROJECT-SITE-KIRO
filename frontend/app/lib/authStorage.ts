/**
 * AuthStorage Service
 * 
 * Handles secure and reliable storage of authentication data with retry mechanisms
 * for mobile browser compatibility.
 */

export interface AuthData {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  timestamp: number;
  expiresAt?: number;
}

export interface StorageResult {
  success: boolean;
  error?: string;
  retries?: number;
}

const STORAGE_KEY = 'admin_auth';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [100, 200, 400]; // Exponential backoff in milliseconds

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get device information for logging
 * Requirement 4.1: Include device information in logs
 */
const getDeviceInfo = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      userAgent: 'unknown',
      isMobile: false,
      platform: 'unknown',
      language: 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  
  // Detect specific mobile browser
  let browser = 'unknown';
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  }

  return {
    userAgent: ua,
    isMobile,
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'unknown',
    browser,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timestamp: new Date().toISOString()
  };
};

class AuthStorageService {
  /**
   * Store authentication data with retry mechanism
   * Implements exponential backoff: 100ms, 200ms, 400ms
   * Requirement 4.2: Log localStorage operations with timing information
   */
  async storeAuthData(data: AuthData): Promise<StorageResult> {
    const startTime = Date.now();
    const deviceInfo = getDeviceInfo();
    
    console.log('[AuthStorage] Starting storage operation', {
      ...deviceInfo,
      hasToken: !!data.token,
      username: data.user.username,
      tokenLength: data.token.length,
      operation: 'storeAuthData'
    });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const attemptStartTime = Date.now();
      
      try {
        // Synchronous localStorage write
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // Verify the write was successful
        const verification = this.verifyStorage(data.token);
        
        if (verification) {
          const attemptDuration = Date.now() - attemptStartTime;
          const totalDuration = Date.now() - startTime;
          
          console.log('[AuthStorage] Storage successful', {
            attempt: attempt + 1,
            attemptDuration: `${attemptDuration}ms`,
            totalDuration: `${totalDuration}ms`,
            verified: true,
            retries: attempt,
            timestamp: new Date().toISOString()
          });
          
          return {
            success: true,
            retries: attempt
          };
        } else {
          throw new Error('Storage verification failed');
        }
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const attemptDuration = Date.now() - attemptStartTime;
        
        console.error('[AuthStorage] Storage attempt failed', {
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES + 1,
          error: errorMessage,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined,
          attemptDuration: `${attemptDuration}ms`,
          isLastAttempt,
          timestamp: new Date().toISOString()
        });

        if (isLastAttempt) {
          console.error('[AuthStorage] All retry attempts exhausted', {
            totalAttempts: MAX_RETRIES + 1,
            totalDuration: `${Date.now() - startTime}ms`,
            finalError: errorMessage
          });
          
          return {
            success: false,
            error: errorMessage,
            retries: attempt
          };
        }

        // Wait before retry with exponential backoff
        const delay = RETRY_DELAYS[attempt];
        console.log(`[AuthStorage] Retrying in ${delay}ms...`, {
          nextAttempt: attempt + 2,
          remainingAttempts: MAX_RETRIES - attempt
        });
        await sleep(delay);
      }
    }

    // Should never reach here, but TypeScript needs it
    return {
      success: false,
      error: 'Max retries exceeded',
      retries: MAX_RETRIES
    };
  }

  /**
   * Verify that storage was successful by reading back the token
   * This is a synchronous operation to ensure immediate verification
   * Requirement 4.2: Log storage verification with timing
   */
  verifyStorage(expectedToken: string): boolean {
    const startTime = Date.now();
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.warn('[AuthStorage] Verification failed: No data found', {
          expectedTokenLength: expectedToken.length,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      const data = JSON.parse(stored) as AuthData;
      const isValid = data.token === expectedToken;
      const duration = Date.now() - startTime;
      
      console.log('[AuthStorage] Storage verification', {
        found: !!stored,
        tokenMatches: isValid,
        hasUser: !!data.user,
        username: data.user?.username,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      return isValid;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[AuthStorage] Verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Retrieve authentication data from storage
   * Requirement 4.2: Log retrieval operations with auth state
   */
  getAuthData(): AuthData | null {
    const startTime = Date.now();
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('[AuthStorage] No auth data found', {
          operation: 'getAuthData',
          timestamp: new Date().toISOString()
        });
        return null;
      }

      const data = JSON.parse(stored) as AuthData;
      
      // Check if token is expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        const tokenAge = Date.now() - data.timestamp;
        console.log('[AuthStorage] Token expired, clearing storage', {
          username: data.user.username,
          tokenAge: `${tokenAge}ms`,
          expiresAt: new Date(data.expiresAt).toISOString(),
          now: new Date().toISOString(),
          timestamp: new Date().toISOString()
        });
        this.clearAuthData();
        return null;
      }

      const duration = Date.now() - startTime;
      const tokenAge = Date.now() - data.timestamp;
      
      console.log('[AuthStorage] Retrieved auth data', {
        username: data.user.username,
        userId: data.user.id,
        hasToken: !!data.token,
        tokenAge: `${tokenAge}ms`,
        storedAt: new Date(data.timestamp).toISOString(),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[AuthStorage] Error retrieving auth data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * Clear authentication data from storage
   * Requirement 4.2: Log clear operations
   */
  clearAuthData(): void {
    const startTime = Date.now();
    
    try {
      // Get current data before clearing for logging
      const currentData = localStorage.getItem(STORAGE_KEY);
      let username = 'unknown';
      
      if (currentData) {
        try {
          const parsed = JSON.parse(currentData) as AuthData;
          username = parsed.user?.username || 'unknown';
        } catch {
          // Ignore parse errors
        }
      }
      
      localStorage.removeItem(STORAGE_KEY);
      const duration = Date.now() - startTime;
      
      console.log('[AuthStorage] Auth data cleared', {
        username,
        hadData: !!currentData,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[AuthStorage] Error clearing auth data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check if user is authenticated
   * Requirement 4.2: Log authentication checks with auth state
   */
  isAuthenticated(): boolean {
    const startTime = Date.now();
    const data = this.getAuthData();
    const isAuth = data !== null && !!data.token;
    const duration = Date.now() - startTime;
    
    console.log('[AuthStorage] Authentication check', {
      isAuthenticated: isAuth,
      hasData: data !== null,
      username: data?.user?.username || 'none',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return isAuth;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    const data = this.getAuthData();
    return data?.token || null;
  }

  /**
   * Get the current user
   */
  getUser(): AuthData['user'] | null {
    const data = this.getAuthData();
    return data?.user || null;
  }
}

// Export singleton instance
export const authStorage = new AuthStorageService();
