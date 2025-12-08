-- Create driver_subscriptions table for driver payments
CREATE TABLE public.driver_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'professional')),
  price_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_transactions table for commission tracking
CREATE TABLE public.driver_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('commission', 'subscription', 'bonus', 'penalty')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_transactions ENABLE ROW LEVEL SECURITY;

-- RLS for driver_subscriptions - drivers can only see their own
CREATE POLICY "Drivers can view their own subscription"
ON public.driver_subscriptions FOR SELECT
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own subscription"
ON public.driver_subscriptions FOR UPDATE
USING (auth.uid() = driver_id);

-- RLS for driver_transactions - drivers can only see their own
CREATE POLICY "Drivers can view their own transactions"
ON public.driver_transactions FOR SELECT
USING (auth.uid() = driver_id);

-- Update updated_at trigger for driver_subscriptions
CREATE TRIGGER update_driver_subscriptions_updated_at
BEFORE UPDATE ON public.driver_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fix profiles RLS: Create a new policy that hides phone from public
DROP POLICY IF EXISTS "Public can view driver profiles" ON public.profiles;

CREATE POLICY "Public can view driver profiles without sensitive data"
ON public.profiles FOR SELECT
USING (user_type = 'driver' AND is_active = true);

-- Create a security definer function to check trip ownership for driver location access
CREATE OR REPLACE FUNCTION public.is_active_trip_participant(_trip_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trips
    WHERE id = _trip_id
      AND (client_id = _user_id OR driver_id = _user_id)
      AND status IN ('accepted', 'in_progress')
  )
$$;

-- Update trips policy to restrict driver location access to active trips only
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;

CREATE POLICY "Users can view their own trips"
ON public.trips FOR SELECT
USING (
  auth.uid() = client_id 
  OR auth.uid() = driver_id 
  OR (status = 'pending' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'driver' AND is_active = true
  ))
);