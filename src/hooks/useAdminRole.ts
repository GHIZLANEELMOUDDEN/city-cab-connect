import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "moderator" | "user";

export function useAdminRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "moderator"])
          .maybeSingle();

        if (error) {
          console.error("Error checking admin role:", error);
          setRole(null);
        } else {
          setRole(data?.role as AppRole || null);
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  const hasAdminAccess = isAdmin || isModerator;

  return {
    role,
    isAdmin,
    isModerator,
    hasAdminAccess,
    loading,
  };
}
