'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session.isLoading && !session.user) {
      router.push('/login');
    }
  }, [session, router]);

  // 로딩 중이거나 로그인하지 않은 상태면 로딩 표시
  if (session.isLoading || !session.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-foreground mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인한 사용자만 컨텐츠 표시
  return <>{children}</>;
} 