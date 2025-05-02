# MemoryGym

암기 학습을 위한 플래시카드 애플리케이션입니다. Leitner 시스템을 기반으로 효율적인 학습을 지원합니다.

## Supabase 설정

### 1. Supabase 프로젝트 생성하기

1. [Supabase 웹사이트](https://supabase.com)에 접속하여 로그인하세요.
2. 새 프로젝트를 생성하세요.
3. 프로젝트 생성 후, 설정에서 `API URL`과 `anon public key`를 확인하세요.

### 2. 환경 변수 설정하기

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 테이블 생성하기

Supabase 대시보드의 SQL 편집기에서 다음 SQL을 실행하여 `cards` 테이블을 생성하세요:

```sql
-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    box_number INTEGER NOT NULL DEFAULT 1 CHECK (box_number BETWEEN 1 AND 5),
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own cards
CREATE POLICY "Users can only view their own cards" 
ON public.cards 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to only insert their own cards
CREATE POLICY "Users can only insert their own cards" 
ON public.cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to only update their own cards
CREATE POLICY "Users can only update their own cards" 
ON public.cards 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to only delete their own cards
CREATE POLICY "Users can only delete their own cards" 
ON public.cards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_next_review_at ON public.cards(next_review_at);
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 사용 방법

1. 회원 가입 및 로그인
2. 새 카드 생성
3. 카드 복습하기
   - 기억 여부에 따라 카드는 다른 박스로 이동
   - 박스 번호에 따라 복습 주기 자동 계산

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
