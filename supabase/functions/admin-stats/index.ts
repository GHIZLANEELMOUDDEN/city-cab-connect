import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-STATS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: userData.user.id });

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["admin", "moderator"])
      .single();

    if (!roleData) {
      throw new Error("Access denied - admin role required");
    }

    logStep("Admin role verified", { role: roleData.role });

    // Get statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total drivers
    const { count: totalDrivers } = await supabaseClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "driver");

    // Active drivers (with active subscription)
    const { count: activeDrivers } = await supabaseClient
      .from("driver_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Total trips
    const { count: totalTrips } = await supabaseClient
      .from("trips")
      .select("*", { count: "exact", head: true });

    // Monthly trips
    const { count: monthlyTrips } = await supabaseClient
      .from("trips")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonth.toISOString());

    // Today's trips
    const { count: todayTrips } = await supabaseClient
      .from("trips")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Pending drivers (not subscribed)
    const { count: pendingDrivers } = await supabaseClient
      .from("profiles")
      .select(`
        *,
        driver_subscriptions!left(id)
      `, { count: "exact", head: true })
      .eq("user_type", "driver")
      .is("driver_subscriptions.id", null);

    // Monthly revenue from subscriptions
    const { data: subscriptionRevenue } = await supabaseClient
      .from("driver_subscriptions")
      .select("price_amount")
      .eq("status", "active")
      .gte("created_at", thisMonth.toISOString());

    const monthlyRevenue = subscriptionRevenue?.reduce((sum, sub) => sum + (sub.price_amount || 0), 0) || 0;

    // Subscription breakdown by plan
    const { data: planBreakdown } = await supabaseClient
      .from("driver_subscriptions")
      .select("plan_type")
      .eq("status", "active");

    const planCounts = {
      basic: planBreakdown?.filter(p => p.plan_type === "basic").length || 0,
      premium: planBreakdown?.filter(p => p.plan_type === "premium").length || 0,
      professional: planBreakdown?.filter(p => p.plan_type === "professional").length || 0,
    };

    // Recent drivers
    const { data: recentDrivers } = await supabaseClient
      .from("profiles")
      .select(`
        id,
        user_id,
        full_name,
        city,
        rating,
        total_trips,
        is_active,
        is_verified,
        created_at,
        driver_subscriptions(plan_type, status)
      `)
      .eq("user_type", "driver")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get expiring subscriptions (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringSubscriptions } = await supabaseClient
      .from("driver_subscriptions")
      .select(`
        id,
        driver_id,
        plan_type,
        current_period_end,
        profiles!driver_subscriptions_driver_id_fkey(full_name)
      `)
      .eq("status", "active")
      .lte("current_period_end", sevenDaysFromNow.toISOString())
      .gte("current_period_end", today.toISOString());

    const stats = {
      totalDrivers: totalDrivers || 0,
      activeDrivers: activeDrivers || 0,
      totalTrips: totalTrips || 0,
      monthlyTrips: monthlyTrips || 0,
      todayTrips: todayTrips || 0,
      pendingDrivers: pendingDrivers || 0,
      monthlyRevenue,
      planCounts,
      recentDrivers: recentDrivers || [],
      expiringSubscriptions: expiringSubscriptions || [],
    };

    logStep("Stats compiled", stats);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
