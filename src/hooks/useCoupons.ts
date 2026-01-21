import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  min_amount: number;
  is_active: boolean;
  expires_at: string | null;
}

interface UseCouponsResult {
  appliedCoupon: Coupon | null;
  loading: boolean;
  validateCoupon: (code: string, orderAmount: number) => Promise<Coupon | null>;
  applyCoupon: (code: string, orderAmount: number) => Promise<boolean>;
  clearCoupon: () => void;
  calculateDiscount: (amount: number) => number;
  getFinalPrice: (amount: number) => number;
}

export const useCoupons = (): UseCouponsResult => {
  const { user } = useAuth();
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);

  const validateCoupon = useCallback(async (code: string, orderAmount: number): Promise<Coupon | null> => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لاستخدام الكوبون");
      return null;
    }

    setLoading(true);
    try {
      // Fetch coupon by code
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !coupon) {
        toast.error("كود الخصم غير صالح");
        return null;
      }

      // Check if expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("انتهت صلاحية كود الخصم");
        return null;
      }

      // Check max uses
      if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        toast.error("تم استخدام هذا الكود الحد الأقصى من المرات");
        return null;
      }

      // Check minimum amount
      if (orderAmount < coupon.min_amount) {
        toast.error(`الحد الأدنى للطلب هو ${coupon.min_amount.toLocaleString('ar-IQ')} دينار`);
        return null;
      }

      // Check if user already used this coupon
      const { data: usageData } = await supabase
        .from("coupon_usage")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id)
        .limit(1);

      if (usageData && usageData.length > 0) {
        toast.error("لقد استخدمت هذا الكود من قبل");
        return null;
      }

      return coupon as Coupon;
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error("حدث خطأ في التحقق من الكوبون");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const applyCoupon = useCallback(async (code: string, orderAmount: number): Promise<boolean> => {
    const coupon = await validateCoupon(code, orderAmount);
    if (coupon) {
      setAppliedCoupon(coupon);
      const discount = coupon.discount_type === "percentage"
        ? (orderAmount * coupon.discount_value / 100)
        : coupon.discount_value;
      toast.success(`تم تطبيق الخصم: ${discount.toLocaleString('ar-IQ')} دينار`);
      return true;
    }
    return false;
  }, [validateCoupon]);

  const clearCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const calculateDiscount = useCallback((amount: number): number => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      return Math.round(amount * appliedCoupon.discount_value / 100);
    }
    return appliedCoupon.discount_value;
  }, [appliedCoupon]);

  const getFinalPrice = useCallback((amount: number): number => {
    const discount = calculateDiscount(amount);
    return Math.max(0, amount - discount);
  }, [calculateDiscount]);

  return {
    appliedCoupon,
    loading,
    validateCoupon,
    applyCoupon,
    clearCoupon,
    calculateDiscount,
    getFinalPrice,
  };
};
