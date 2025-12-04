-- Create trip status enum
CREATE TYPE public.trip_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status trip_status NOT NULL DEFAULT 'pending',
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT,
  dropoff_lat DECIMAL(10, 8),
  dropoff_lng DECIMAL(11, 8),
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  distance_km DECIMAL(10, 2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  client_note TEXT,
  driver_note TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can view their own trips"
ON public.trips FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Drivers can view their assigned trips"
ON public.trips FOR SELECT
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can view pending trips"
ON public.trips FOR SELECT
USING (status = 'pending' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_type = 'driver' 
  AND is_active = true
));

CREATE POLICY "Clients can create trips"
ON public.trips FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Drivers can accept pending trips"
ON public.trips FOR UPDATE
USING (
  status = 'pending' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'driver' 
    AND is_active = true
  )
);

CREATE POLICY "Drivers can update their assigned trips"
ON public.trips FOR UPDATE
USING (auth.uid() = driver_id);

CREATE POLICY "Clients can update their own trips"
ON public.trips FOR UPDATE
USING (auth.uid() = client_id AND status IN ('pending', 'accepted'));

-- Trigger for updated_at
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for trips table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;