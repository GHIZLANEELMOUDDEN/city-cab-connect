import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type TripStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export interface Trip {
  id: string;
  client_id: string;
  driver_id: string | null;
  status: TripStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  estimated_price: number | null;
  final_price: number | null;
  distance_km: number | null;
  rating: number | null;
  client_rating: number | null;
  client_note: string | null;
  driver_note: string | null;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
  client_profile?: {
    full_name: string | null;
    phone: string | null;
    rating: number | null;
    total_trips: number | null;
  };
  driver_profile?: {
    full_name: string | null;
    phone: string | null;
    rating: number | null;
    taxi_number: string | null;
  };
}

export const useTrips = () => {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trips based on user type
  const fetchTrips = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tripsData = (data || []) as Trip[];
      setTrips(tripsData);

      // Find active trip (not completed or cancelled)
      const active = tripsData.find(
        (t) => t.status !== "completed" && t.status !== "cancelled"
      );
      setActiveTrip(active || null);

      // For drivers, filter pending trips
      if (profile?.user_type === "driver") {
        const pending = tripsData.filter((t) => t.status === "pending");
        setPendingTrips(pending);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.user_type]);

  // Create a new trip (client only)
  const createTrip = async (tripData: {
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_address?: string;
    dropoff_lat?: number;
    dropoff_lng?: number;
    client_note?: string;
    estimated_price?: number;
    distance_km?: number;
  }) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          client_id: user.id,
          ...tripData,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("تم إرسال طلب الرحلة بنجاح");
      return data as Trip;
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("حدث خطأ في إنشاء الرحلة");
      return null;
    }
  };

  // Accept a trip (driver only)
  const acceptTrip = async (tripId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          driver_id: user.id,
          status: "accepted" as TripStatus,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", tripId)
        .eq("status", "pending");

      if (error) throw error;

      toast.success("تم قبول الرحلة بنجاح");
      return true;
    } catch (error) {
      console.error("Error accepting trip:", error);
      toast.error("حدث خطأ في قبول الرحلة");
      return false;
    }
  };

  // Start a trip (driver only)
  const startTrip = async (tripId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          status: "in_progress" as TripStatus,
          started_at: new Date().toISOString(),
        })
        .eq("id", tripId)
        .eq("driver_id", user.id);

      if (error) throw error;

      toast.success("بدأت الرحلة");
      return true;
    } catch (error) {
      console.error("Error starting trip:", error);
      toast.error("حدث خطأ في بدء الرحلة");
      return false;
    }
  };

  // Complete a trip (driver only)
  const completeTrip = async (tripId: string, finalPrice?: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          status: "completed" as TripStatus,
          completed_at: new Date().toISOString(),
          final_price: finalPrice,
        })
        .eq("id", tripId)
        .eq("driver_id", user.id);

      if (error) throw error;

      toast.success("تم إنهاء الرحلة بنجاح");
      return true;
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error("حدث خطأ في إنهاء الرحلة");
      return false;
    }
  };

  // Cancel a trip
  const cancelTrip = async (tripId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          status: "cancelled" as TripStatus,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id,
        })
        .eq("id", tripId);

      if (error) throw error;

      toast.success("تم إلغاء الرحلة");
      return true;
    } catch (error) {
      console.error("Error cancelling trip:", error);
      toast.error("حدث خطأ في إلغاء الرحلة");
      return false;
    }
  };

  // Rate a trip (client only)
  const rateTrip = async (tripId: string, rating: number) => {
    if (!user || rating < 1 || rating > 5) return false;

    try {
      const { error } = await supabase
        .from("trips")
        .update({ rating })
        .eq("id", tripId)
        .eq("client_id", user.id);

      if (error) throw error;

      toast.success("شكراً على تقييمك");
      return true;
    } catch (error) {
      console.error("Error rating trip:", error);
      toast.error("حدث خطأ في حفظ التقييم");
      return false;
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchTrips();

    const channel = supabase
      .channel("trips-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
        },
        (payload) => {
          console.log("Trip update:", payload);
          
          if (payload.eventType === "INSERT") {
            const newTrip = payload.new as Trip;
            setTrips((prev) => [newTrip, ...prev]);
            
            if (profile?.user_type === "driver" && newTrip.status === "pending") {
              setPendingTrips((prev) => [newTrip, ...prev]);
              toast.info("طلب رحلة جديد!");
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedTrip = payload.new as Trip;
            setTrips((prev) =>
              prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
            );
            
            // Update active trip
            if (
              activeTrip?.id === updatedTrip.id ||
              (updatedTrip.client_id === user.id || updatedTrip.driver_id === user.id)
            ) {
              if (updatedTrip.status === "completed" || updatedTrip.status === "cancelled") {
                setActiveTrip(null);
              } else {
                setActiveTrip(updatedTrip);
              }
            }

            // Update pending trips for drivers
            if (profile?.user_type === "driver") {
              if (updatedTrip.status === "pending") {
                setPendingTrips((prev) => {
                  const exists = prev.find((t) => t.id === updatedTrip.id);
                  if (exists) {
                    return prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
                  }
                  return [updatedTrip, ...prev];
                });
              } else {
                setPendingTrips((prev) => prev.filter((t) => t.id !== updatedTrip.id));
              }
            }

            // Notify client when trip is accepted
            if (
              profile?.user_type === "client" &&
              updatedTrip.client_id === user.id &&
              updatedTrip.status === "accepted"
            ) {
              toast.success("تم قبول طلبك! السائق في الطريق إليك");
            }
          } else if (payload.eventType === "DELETE") {
            const deletedTrip = payload.old as Trip;
            setTrips((prev) => prev.filter((t) => t.id !== deletedTrip.id));
            setPendingTrips((prev) => prev.filter((t) => t.id !== deletedTrip.id));
            if (activeTrip?.id === deletedTrip.id) {
              setActiveTrip(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.user_type, fetchTrips, activeTrip?.id]);

  return {
    trips,
    activeTrip,
    pendingTrips,
    loading,
    createTrip,
    acceptTrip,
    startTrip,
    completeTrip,
    cancelTrip,
    rateTrip,
    refetch: fetchTrips,
  };
};
