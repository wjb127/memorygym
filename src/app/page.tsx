'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from "next/image";

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session.isLoading) return;

    if (session.user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [session, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-foreground mx-auto"></div>
        <p className="mt-4">리디렉션 중...</p>
      </div>
    </div>
  );
}
