import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseClientRatingOptions {
  tripId: string;
  clientId?: string | null;
}

export const useClientRating = ({ tripId, clientId }: UseClientRatingOptions) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitClientRating = async (rating: number, comment?: string) => {
    if (!user || !tripId || rating < 1 || rating > 5) {
      toast.error("يرجى اختيار تقييم صالح");
      return false;
    }

    setLoading(true);
    try {
      // Update trip with client rating
      const { error: tripError } = await supabase
        .from("trips")
        .update({ client_rating: rating })
        .eq("id", tripId)
        .eq("driver_id", user.id);

      if (tripError) throw tripError;

      toast.success("شكراً على تقييمك للعميل!");
      return true;
    } catch (error) {
      console.error("Error submitting client rating:", error);
      toast.error("حدث خطأ في حفظ التقييم");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitClientRating,
    loading,
  };
};
