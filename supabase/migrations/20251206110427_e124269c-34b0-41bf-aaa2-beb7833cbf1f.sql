-- Add driver location columns to trips for real-time tracking
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS driver_lat numeric,
ADD COLUMN IF NOT EXISTS driver_lng numeric,
ADD COLUMN IF NOT EXISTS driver_location_updated_at timestamp with time zone;