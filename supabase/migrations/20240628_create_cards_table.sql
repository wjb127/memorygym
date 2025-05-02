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