import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseTripRatingOptions {
  tripId: string;
  driverId?: string | null;
}

export const useTripRating = ({ tripId, driverId }: UseTripRatingOptions) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitRating = async (rating: number, comment?: string) => {
    if (!user || !tripId || rating < 1 || rating > 5) {
      toast.error("يرجى اختيار تقييم صالح");
      return false;
    }

    setLoading(true);
    try {
      // Update trip rating
      const { error: tripError } = await supabase
        .from("trips")
        .update({ rating })
        .eq("id", tripId)
        .eq("client_id", user.id);

      if (tripError) throw tripError;

      // Update driver's average rating if driver exists
      if (driverId) {
        // Get all completed trips for this driver
        const { data: driverTrips, error: fetchError } = await supabase
          .from("trips")
          .select("rating")
          .eq("driver_id", driverId)
          .eq("status", "completed")
          .not("rating", "is", null);

        if (!fetchError && driverTrips) {
          const ratings = driverTrips.map(t => t.rating).filter(r => r !== null) as number[];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
            : 0;

          await supabase
            .from("profiles")
            .update({ rating: Math.round(avgRating * 10) / 10 })
            .eq("user_id", driverId);
        }
      }

      toast.success("شكراً على تقييمك!");
      return true;
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("حدث خطأ في حفظ التقييم");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitRating,
    loading,
  };
};
