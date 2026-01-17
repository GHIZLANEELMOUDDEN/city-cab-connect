import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DriverInfo {
  id: string;
  user_id: string;
  full_name: string | null;
  city: string | null;
  rating: number | null;
  total_trips: number | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  created_at: string;
  driver_subscriptions: Array<{
    plan_type: string;
    status: string;
  }>;
}

interface ExpiringSubscription {
  id: string;
  driver_id: string;
  plan_type: string;
  current_period_end: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface AdminStats {
  totalDrivers: number;
  activeDrivers: number;
  totalTrips: number;
  monthlyTrips: number;
  todayTrips: number;
  pendingDrivers: number;
  monthlyRevenue: number;
  planCounts: {
    basic: number;
    premium: number;
    professional: number;
  };
  recentDrivers: DriverInfo[];
  expiringSubscriptions: ExpiringSubscription[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke("admin-stats");

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(errorMessage);
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
