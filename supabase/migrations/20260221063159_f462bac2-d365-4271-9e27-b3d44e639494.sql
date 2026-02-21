
-- Add Telegram user info columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_username text,
  ADD COLUMN IF NOT EXISTS telegram_first_name text,
  ADD COLUMN IF NOT EXISTS telegram_last_name text;

-- Create VPN keys table
CREATE TABLE public.vpn_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.subscriptions(id),
  vpn_key text NOT NULL,
  server_id uuid REFERENCES public.servers(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'trial'
);

-- RLS for vpn_keys
ALTER TABLE public.vpn_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vpn keys"
  ON public.vpn_keys FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage vpn keys"
  ON public.vpn_keys FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
