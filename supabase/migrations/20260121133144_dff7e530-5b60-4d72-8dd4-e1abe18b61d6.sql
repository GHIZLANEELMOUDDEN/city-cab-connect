-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER DEFAULT NULL, -- null means unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  min_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon usage table to track which users used which coupons
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add client_rating column to trips table for driver to rate client
ALTER TABLE public.trips
ADD COLUMN client_rating INTEGER DEFAULT NULL CHECK (client_rating >= 1 AND client_rating <= 5);

-- Enable RLS on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Policies for coupons (read-only for authenticated users)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Policies for coupon_usage
CREATE POLICY "Users can view their own coupon usage"
ON public.coupon_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coupon usage"
ON public.coupon_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for coupons
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample coupons
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, min_amount) VALUES
('WELCOME10', 'percentage', 10, 100, 500),
('FIRST50', 'fixed', 500, 50, 1000),
('VIP20', 'percentage', 20, NULL, 2000);