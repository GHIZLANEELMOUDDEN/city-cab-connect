import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PlanType = "basic" | "premium" | "professional";

interface SubscriptionStatus {
  subscribed: boolean;
  planType: PlanType | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

export const PLAN_DETAILS = {
  basic: {
    name: "الأساسية",
    price: 100,
    features: [
      "ظهور في الخريطة",
      "استقبال الطلبات",
      "محادثة مع الزبائن",
      "لوحة تحكم شخصية",
      "دعم فني",
    ],
  },
  premium: {
    name: "المميزة",
    price: 150,
    features: [
      "كل مميزات الباقة الأساسية",
      "أولوية في الظهور",
      "علامة 'موصى به'",
      "إحصائيات متقدمة",
      "دعم فني أولوية",
    ],
  },
  professional: {
    name: "الاحترافية",
    price: 200,
    features: [
      "كل مميزات الباقة المميزة",
      "ظهور في المقدمة دائماً",
      "شارة السائق المحترف",
      "تقارير شهرية مفصلة",
      "دعم فني VIP",
    ],
  },
};

export function useDriverSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    planType: null,
    subscriptionEnd: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke("check-driver-subscription");
      
      if (error) throw error;
      
      setStatus({
        subscribed: data.subscribed,
        planType: data.plan_type,
        subscriptionEnd: data.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const subscribe = async (planType: PlanType) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-driver-subscription", {
        body: { planType },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("حدث خطأ أثناء إنشاء الاشتراك");
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("driver-customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("حدث خطأ أثناء فتح بوابة الإدارة");
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Check every minute
    const interval = setInterval(checkSubscription, 60000);
    
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return {
    ...status,
    subscribe,
    manageSubscription,
    refreshSubscription: checkSubscription,
  };
}
