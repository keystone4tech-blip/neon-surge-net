
-- Add telegram_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id bigint UNIQUE;

-- Table for one-time link codes (website user → Telegram bot)
CREATE TABLE public.telegram_link_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean NOT NULL DEFAULT false
);

ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own link codes"
  ON public.telegram_link_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own link codes"
  ON public.telegram_link_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all codes"
  ON public.telegram_link_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast code lookup
CREATE INDEX idx_telegram_link_codes_code ON public.telegram_link_codes(code);
CREATE INDEX idx_profiles_telegram_id ON public.profiles(telegram_id);
