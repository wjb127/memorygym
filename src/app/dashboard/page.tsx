'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Card, cardService } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const { signOut, session } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [todayCards, setTodayCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        // 모든 카드 가져오기
        const allCards = await cardService.getCards();
        setCards(allCards);

        // 오늘 복습할 카드 가져오기
        const today = await cardService.getTodayCards();
        setTodayCards(today);
      } catch (error) {
        console.error('Error fetching cards:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('카드를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (session.user) {
      fetchCards();
    }
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 헤더 */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MemoryGym</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-md bg-gray-200 dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* 요약 정보 */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">총 카드</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : cards.length}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">오늘 복습</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {isLoading ? '...' : todayCards.length}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">앞으로 복습</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : cards.length - todayCards.length}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mb-10 flex flex-wrap gap-4">
            <Link
              href="/cards/new"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              + 새 카드 만들기
            </Link>
            <Link
              href="/cards/review"
              className={`rounded-full px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                todayCards.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  : 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed'
              }`}
              aria-disabled={todayCards.length === 0}
              onClick={(e) => {
                if (todayCards.length === 0) e.preventDefault();
              }}
            >
              {todayCards.length > 0
                ? `오늘의 복습 시작 (${todayCards.length})`
                : '오늘 복습할 카드 없음'}
            </Link>
          </div>

          {/* 카드 목록 */}
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">내 카드 목록</h2>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-foreground mx-auto"></div>
              <p className="mt-4">카드를 불러오는 중...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-lg bg-white p-8 shadow text-center dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                아직 카드가 없습니다. 새 카드를 만들어보세요!
              </p>
              <Link
                href="/cards/new"
                className="mt-4 inline-block rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                + 새 카드 만들기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 border-l-4"
                  style={{
                    borderLeftColor:
                      new Date(card.next_review_at) <= new Date()
                        ? '#4f46e5' // 오늘 복습
                        : '#d1d5db', // 나중에 복습
                  }}
                >
                  <div className="mb-2 flex justify-between items-center">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      Box {card.box_number}
                    </span>
                    <Link
                      href={`/cards/${card.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      수정
                    </Link>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2">
                    {card.front}
                  </h3>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(card.next_review_at) <= new Date() ? (
                      <span className="text-indigo-600 dark:text-indigo-400">오늘 복습</span>
                    ) : (
                      <span>
                        다음 복습:{' '}
                        {new Date(card.next_review_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 