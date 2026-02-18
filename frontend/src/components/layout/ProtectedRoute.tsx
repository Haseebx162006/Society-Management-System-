'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken } from '@/lib/features/auth/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // delay slightly to avoid synchronous setState warning during effect
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isClient && !token) {
      router.push('/?login=true'); 
    }
  }, [token, router, isClient]);

  if (!isClient) {
    return null; 
  }

  if (!token) {
    return null;
  }
  
  if (user?.locked_until && new Date(user.locked_until) > new Date()) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
              <div className="text-center p-8 bg-gray-900 rounded-lg shadow-2xl border border-red-500/30 max-w-md mx-4">
                  <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 bg-red-500/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <h1 className="text-2xl font-bold text-red-500 mb-2">Account Locked</h1>
                  <p className="text-gray-300 mb-4">Your account is temporarily locked due to multiple failed login attempts.</p>
                  <p className="text-sm text-gray-500 bg-gray-950 py-2 px-4 rounded-md inline-block border border-gray-800">
                    Try again after <span className="font-mono text-red-400">{new Date(user.locked_until).toLocaleTimeString()}</span>
                  </p>
              </div>
          </div>
      );
  }

  if (user?.status === 'SUSPENDED') {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
              <div className="text-center p-8 bg-gray-900 rounded-lg shadow-2xl border border-red-500/30 max-w-md mx-4">
                  <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 bg-red-500/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  </div>
                  <h1 className="text-2xl font-bold text-red-500 mb-2">Account Suspended</h1>
                  <p className="text-gray-300 mb-4">Your account has been suspended by an administrator.</p>
                  <p className="text-sm text-gray-500">Please contact support for assistance.</p>
              </div>
          </div>
      );
  }

  return <>{children}</>;
}
