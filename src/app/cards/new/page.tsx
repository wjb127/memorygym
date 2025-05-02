'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cardService } from '@/lib/supabase';
import Link from 'next/link';

export default function NewCardPage() {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!front.trim() || !back.trim()) {
      setError('질문과 정답을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await cardService.createCard({
        front: front.trim(),
        back: back.trim(),
        box_number: 1,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating card:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('카드 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 헤더 */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">새 카드 만들기</h1>
              <Link 
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                대시보드로 돌아가기
              </Link>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  카드 정보
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  질문(앞면)과 정답(뒷면)을 입력하세요.
                </p>
                <div className="mt-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-blue-700 dark:text-blue-200">
                      <p>
                        새 카드는 박스 1에 저장되며, 다음 날 복습할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="overflow-hidden shadow sm:rounded-md">
                  <div className="bg-white px-4 py-5 sm:p-6 dark:bg-gray-800">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label htmlFor="front" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          질문 (앞면)
                        </label>
                        <textarea
                          id="front"
                          name="front"
                          rows={3}
                          value={front}
                          onChange={(e) => setFront(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                          placeholder="질문을 입력하세요..."
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="back" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          정답 (뒷면)
                        </label>
                        <textarea
                          id="back"
                          name="back"
                          rows={3}
                          value={back}
                          onChange={(e) => setBack(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                          placeholder="정답을 입력하세요..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-right sm:px-6 dark:bg-gray-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
                    >
                      {isSubmitting ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 