
-- Create chat messages table for trip conversations
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
CREATE POLICY "Trip participants can view messages"
  ON public.chat_messages
  FOR SELECT
  USING (is_active_trip_participant(trip_id, auth.uid()));

CREATE POLICY "Trip participants can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND 
    is_active_trip_participant(trip_id, auth.uid())
  );

CREATE POLICY "Message sender can mark as read"
  ON public.chat_messages
  FOR UPDATE
  USING (is_active_trip_participant(trip_id, auth.uid()));

-- Create payment records table
CREATE TABLE public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  driver_id UUID,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Create policies for payment records
CREATE POLICY "Users can view their payment records"
  ON public.payment_records
  FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = driver_id);

CREATE POLICY "System can insert payment records"
  ON public.payment_records
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "System can update payment records"
  ON public.payment_records
  FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = driver_id);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
