import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentOptions {
  tripId: string;
  amount: number;
  description?: string;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async ({ tripId, amount, description }: PaymentOptions) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { tripId, amount, description },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
        toast.success("جاري تحويلك لصفحة الدفع...");
        return { success: true, url: data.url };
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("حدث خطأ في عملية الدفع");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading,
  };
};
