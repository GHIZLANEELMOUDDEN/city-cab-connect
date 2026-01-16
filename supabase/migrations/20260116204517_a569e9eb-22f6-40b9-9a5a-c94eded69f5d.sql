-- Fix the view to use security_invoker instead of security_definer
DROP VIEW IF EXISTS public.driver_public_info;

CREATE VIEW public.driver_public_info 
WITH (security_invoker = true)
AS
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

-- Grant access to the view for both anon and authenticated users
GRANT SELECT ON public.driver_public_info TO anon, authenticated;