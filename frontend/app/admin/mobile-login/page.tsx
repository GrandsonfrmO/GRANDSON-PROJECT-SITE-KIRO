'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy mobile login page - Redirects to unified login
 * 
 * This page is kept for backward compatibility but immediately redirects
 * to the new unified responsive login page at /admin/login
 */
export default function MobileAdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to unified login page
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-semibold">Redirection vers la page de connexion...</p>
      </div>
    </div>
  );
}
