import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 익명 키를 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export type Card = {
  id: string;
  user_id: string;
  front: string;
  back: string;
  box_number: number;
  next_review_at: string;
  created_at: string;
  updated_at: string;
};

// Card 관련 함수들
export const cardService = {
  // 사용자의 모든 카드 가져오기
  getCards: async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('next_review_at', { ascending: true });
    
    if (error) throw error;
    return data as Card[];
  },

  // 오늘 복습해야 할 카드 가져오기
  getTodayCards: async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .lte('next_review_at', new Date().toISOString())
      .order('next_review_at', { ascending: true });
    
    if (error) throw error;
    return data as Card[];
  },

  // 새 카드 생성하기
  createCard: async (card: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'next_review_at'>) => {
    const { data, error } = await supabase
      .from('cards')
      .insert([{
        ...card,
        box_number: 1,
        next_review_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data[0] as Card;
  },

  // 카드 업데이트하기
  updateCard: async (id: string, updates: Partial<Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Card;
  },

  // 카드 삭제하기
  deleteCard: async (id: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // 복습 후 카드 업데이트하기 (Leitner 시스템에 따라)
  reviewCard: async (id: string, remembered: boolean) => {
    // 현재 카드 정보 가져오기
    const { data: currentCard, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // 일별 간격 계산 (박스 번호에 따라)
    const calculateNextReview = (boxNumber: number) => {
      const now = new Date();
      switch(boxNumber) {
        case 1: return new Date(now.setDate(now.getDate() + 1)); // 1일 후
        case 2: return new Date(now.setDate(now.getDate() + 3)); // 3일 후
        case 3: return new Date(now.setDate(now.getDate() + 7)); // 7일 후
        case 4: return new Date(now.setDate(now.getDate() + 14)); // 14일 후
        case 5: return new Date(now.setDate(now.getDate() + 30)); // 30일 후
        default: return now;
      }
    };
    
    // 새 박스 번호 계산
    let newBoxNumber = currentCard.box_number;
    if (remembered) {
      // 기억했으면 한 단계 올림 (최대 5)
      newBoxNumber = Math.min(5, currentCard.box_number + 1);
    } else {
      // 기억하지 못했으면 박스 1로 돌아감
      newBoxNumber = 1;
    }
    
    // 다음 복습 날짜 계산
    const nextReviewAt = calculateNextReview(newBoxNumber);
    
    // 카드 업데이트
    const { data, error } = await supabase
      .from('cards')
      .update({
        box_number: newBoxNumber,
        next_review_at: nextReviewAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Card;
  }
}; 