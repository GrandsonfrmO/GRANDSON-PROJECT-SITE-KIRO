import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for admin routes
 * 
 * Note: Mobile redirect has been disabled to provide a unified responsive login experience.
 * The login page at /admin/login now adapts to all device types automatically.
 * 
 * Previous behavior: Redirected mobile users to /admin/mobile-login
 * Current behavior: All users access the same responsive /admin/login page
 */
export function middleware(request: NextRequest) {
  // Pass through all requests without modification
  // The unified login page handles both mobile and desktop responsively
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/login'],
};
