-- Create trigger to prevent user_type changes
CREATE OR REPLACE FUNCTION public.prevent_user_type_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
    RAISE EXCEPTION 'Cannot change user_type - please contact admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prevent_user_type_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_type_change();

-- Create a secure view for public driver info (without phone)
CREATE OR REPLACE VIEW public.driver_public_info AS
SELECT 
  id, 
  user_id,
  full_name, 
  rating, 
  taxi_number, 
  city,
  avatar_url,
  is_active,
  is_verified,
  total_trips
FROM public.profiles 
WHERE user_type = 'driver' AND is_active = true;

-- Grant access to the view
GRANT SELECT ON public.driver_public_info TO anon, authenticated;

-- Update profiles policy to only allow authenticated users (not public)
DROP POLICY IF EXISTS "Public can view driver profiles without sensitive data" ON public.profiles;
DROP POLICY IF EXISTS "Public can view driver profiles" ON public.profiles;

-- Create policy for authenticated users only to see driver profiles
CREATE POLICY "Authenticated can view driver profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  user_type = 'driver' AND is_active = true
);

-- Add unique constraint for driver_subscriptions to allow upsert
ALTER TABLE public.driver_subscriptions 
DROP CONSTRAINT IF EXISTS driver_subscriptions_driver_id_key;

ALTER TABLE public.driver_subscriptions 
ADD CONSTRAINT driver_subscriptions_driver_id_key UNIQUE (driver_id);

-- Add INSERT policy for driver_subscriptions (needed for upsert from edge function)
CREATE POLICY "System can insert driver subscriptions"
ON public.driver_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = driver_id);