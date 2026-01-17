import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-DRIVER] ${step}${detailsStr}`);
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

    const { action, driverId, data } = await req.json();
    logStep("Request received", { action, driverId });

    switch (action) {
      case "get": {
        // Get driver details
        const { data: driver, error: driverError } = await supabaseClient
          .from("profiles")
          .select(`
            *,
            driver_subscriptions(*)
          `)
          .eq("user_id", driverId)
          .eq("user_type", "driver")
          .single();

        if (driverError) {
          throw new Error("Driver not found");
        }

        // Get driver's trip statistics
        const { count: totalTrips } = await supabaseClient
          .from("trips")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", driverId);

        const { count: completedTrips } = await supabaseClient
          .from("trips")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", driverId)
          .eq("status", "completed");

        const { count: cancelledTrips } = await supabaseClient
          .from("trips")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", driverId)
          .eq("status", "cancelled");

        // Get recent trips
        const { data: recentTrips } = await supabaseClient
          .from("trips")
          .select("*")
          .eq("driver_id", driverId)
          .order("created_at", { ascending: false })
          .limit(10);

        // Get transactions
        const { data: transactions } = await supabaseClient
          .from("driver_transactions")
          .select("*")
          .eq("driver_id", driverId)
          .order("created_at", { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({
          driver,
          stats: {
            totalTrips: totalTrips || 0,
            completedTrips: completedTrips || 0,
            cancelledTrips: cancelledTrips || 0,
          },
          recentTrips: recentTrips || [],
          transactions: transactions || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "updateStatus": {
        const { is_active, is_verified } = data;
        
        const updateData: any = {};
        if (typeof is_active === "boolean") updateData.is_active = is_active;
        if (typeof is_verified === "boolean") updateData.is_verified = is_verified;

        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update(updateData)
          .eq("user_id", driverId);

        if (updateError) {
          throw new Error("Failed to update driver status");
        }

        logStep("Driver status updated", { driverId, updateData });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "sendNotification": {
        const { title, message, type = "info" } = data;

        // In a real app, you'd send a push notification or email here
        // For now, we'll create a record in a notifications table

        // Create notification for admin log
        await supabaseClient
          .from("admin_notifications")
          .insert({
            title: `إشعار للسائق: ${title}`,
            message: `تم إرسال إشعار للسائق ${driverId}: ${message}`,
            type: "success",
          });

        logStep("Notification sent", { driverId, title });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
