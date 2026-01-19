import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UsePaymentNotificationsOptions {
  enabled?: boolean;
}

export const usePaymentNotifications = ({ enabled = true }: UsePaymentNotificationsOptions = {}) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !enabled) return;

    const channel = supabase
      .channel(`payment-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_records",
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const record = payload.new as { status: string; amount: number; payment_method: string };
            
            if (record.status === "completed") {
              toast.success(`تم الدفع بنجاح - ${record.amount.toLocaleString('ar-IQ')} د.ع`, {
                description: record.payment_method === 'card' ? 'بطاقة ائتمان' : 'نقداً',
                duration: 5000,
              });
            } else if (record.status === "failed") {
              toast.error("فشل عملية الدفع", {
                description: "يرجى المحاولة مرة أخرى",
              });
            }
          }
        }
      )
      .subscribe();

    // Also listen for driver payments
    const driverChannel = supabase
      .channel(`driver-payment-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_records",
          filter: `driver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const record = payload.new as { status: string; amount: number };
            
            if (record.status === "completed") {
              toast.success(`تم استلام دفعة جديدة - ${record.amount.toLocaleString('ar-IQ')} د.ع`, {
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(driverChannel);
    };
  }, [user, enabled]);
};
