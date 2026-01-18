-- Create lost_and_found table
CREATE TABLE public.lost_and_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  trip_id UUID REFERENCES public.trips(id),
  item_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'returned', 'closed')),
  contact_phone TEXT,
  found_by_driver BOOLEAN DEFAULT false,
  driver_id UUID,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lost_and_found
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;

-- Users can view their own lost items
CREATE POLICY "Users can view own lost items"
ON public.lost_and_found
FOR SELECT
USING (auth.uid() = reporter_id OR auth.uid() = driver_id);

-- Users can create lost items
CREATE POLICY "Users can create lost items"
ON public.lost_and_found
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Users can update own lost items
CREATE POLICY "Users can update own lost items"
ON public.lost_and_found
FOR UPDATE
USING (auth.uid() = reporter_id OR auth.uid() = driver_id);

-- Admins can view all lost items
CREATE POLICY "Admins can view all lost items"
ON public.lost_and_found
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Admins can update all lost items
CREATE POLICY "Admins can update all lost items"
ON public.lost_and_found
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('taxi-images', 'taxi-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-found-images', 'lost-found-images', true);

-- Storage policies for taxi images
CREATE POLICY "Public taxi images access"
ON storage.objects FOR SELECT
USING (bucket_id = 'taxi-images');

CREATE POLICY "Drivers can upload taxi images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'taxi-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Drivers can update own taxi images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'taxi-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Drivers can delete own taxi images"
ON storage.objects FOR DELETE
USING (bucket_id = 'taxi-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for profile images
CREATE POLICY "Public profile images access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for lost and found images
CREATE POLICY "Public lost found images access"
ON storage.objects FOR SELECT
USING (bucket_id = 'lost-found-images');

CREATE POLICY "Users can upload lost found images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lost-found-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add taxi_image_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS taxi_image_url TEXT;

-- Trigger for updating updated_at
CREATE TRIGGER update_lost_and_found_updated_at
BEFORE UPDATE ON public.lost_and_found
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();