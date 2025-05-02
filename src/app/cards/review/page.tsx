'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, cardService } from '@/lib/supabase';
import Link from 'next/link';

export default function ReviewCardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  // 카드 로드
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const todayCards = await cardService.getTodayCards();

        if (todayCards.length === 0) {
          router.push('/dashboard');
        }

        setCards(todayCards);
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

    fetchCards();
  }, [router]);

  // 현재 카드
  const currentCard = cards[currentCardIndex];

  // 카드 뒤집기
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // 기억 여부에 따른 카드 업데이트
  const handleCardReview = async (remembered: boolean) => {
    if (!currentCard || isUpdating) return;

    try {
      setIsUpdating(true);
      await cardService.reviewCard(currentCard.id, remembered);

      // 다음 카드로 이동하거나 완료
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error updating card:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('카드 업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg">카드를 불러오는 중...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (completed) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">복습 완료!</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                오늘의 모든 카드 복습을 완료했습니다. 내일 또 복습해보세요!
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  대시보드로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!currentCard) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              복습할 카드가 없습니다.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                대시보드로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 헤더 */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">카드 복습</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentCardIndex + 1} / {cards.length}
                </span>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  대시보드로 돌아가기
                </Link>
              </div>
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

          <div className="mb-4 flex justify-center">
            <div className="text-center">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${
                      i + 1 === currentCard.box_number
                        ? 'bg-indigo-600'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                박스 {currentCard.box_number}/5
              </p>
            </div>
          </div>

          {/* 카드 */}
          <div
            className={`mx-auto mb-8 aspect-[3/2] w-full max-w-lg cursor-pointer rounded-xl shadow-lg transition-all duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={flipCard}
          >
            <div className="relative h-full w-full transform-style-3d">
              {/* 앞면 */}
              <div
                className={`absolute h-full w-full rounded-xl bg-white p-6 backface-hidden dark:bg-gray-800 ${
                  isFlipped ? 'invisible' : ''
                }`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="text-center">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">질문</h2>
                  </div>
                  <div className="flex-grow py-6">
                    <p className="text-center text-xl text-gray-900 dark:text-white">
                      {currentCard.front}
                    </p>
                  </div>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    클릭하여 정답 확인
                  </div>
                </div>
              </div>

              {/* 뒷면 */}
              <div
                className={`absolute h-full w-full rounded-xl bg-white p-6 backface-hidden rotate-y-180 dark:bg-gray-800 ${
                  isFlipped ? '' : 'invisible'
                }`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="text-center">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">정답</h2>
                  </div>
                  <div className="flex-grow py-6">
                    <p className="text-center text-xl text-gray-900 dark:text-white">
                      {currentCard.back}
                    </p>
                  </div>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    기억 여부를 평가해주세요
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className={`rounded-md bg-red-500 px-4 py-2 text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                !isFlipped || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isFlipped || isUpdating}
              onClick={() => handleCardReview(false)}
            >
              기억 못함
            </button>
            <button
              type="button"
              className={`rounded-md bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                !isFlipped || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isFlipped || isUpdating}
              onClick={() => handleCardReview(true)}
            >
              기억함
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 