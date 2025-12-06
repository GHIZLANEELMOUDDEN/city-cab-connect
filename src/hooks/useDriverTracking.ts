import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGeoLocation } from "./useGeoLocation";

interface DriverLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
}

interface UseDriverTrackingOptions {
  tripId: string | null;
  isDriver: boolean;
  enabled?: boolean;
}

export const useDriverTracking = ({
  tripId,
  isDriver,
  enabled = true,
}: UseDriverTrackingOptions) => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const { latitude, longitude } = useGeoLocation({ watch: true });

  // Driver: Update location in database
  const updateDriverLocation = useCallback(async () => {
    if (!tripId || !latitude || !longitude || !isDriver) return;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          driver_lat: latitude,
          driver_lng: longitude,
          driver_location_updated_at: new Date().toISOString(),
        })
        .eq("id", tripId);

      if (error) {
        console.error("Error updating driver location:", error);
      }
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  }, [tripId, latitude, longitude, isDriver]);

  // Driver: Send location updates periodically
  useEffect(() => {
    if (!isDriver || !tripId || !enabled) return;

    setIsTracking(true);

    // Initial update
    updateDriverLocation();

    // Update every 5 seconds
    const interval = setInterval(updateDriverLocation, 5000);

    return () => {
      clearInterval(interval);
      setIsTracking(false);
    };
  }, [isDriver, tripId, enabled, updateDriverLocation]);

  // Client: Subscribe to driver location updates
  useEffect(() => {
    if (isDriver || !tripId || !enabled) return;

    const channel = supabase
      .channel(`trip-tracking-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.driver_lat && newData.driver_lng) {
            setDriverLocation({
              lat: Number(newData.driver_lat),
              lng: Number(newData.driver_lng),
              updatedAt: new Date(newData.driver_location_updated_at),
            });
          }
        }
      )
      .subscribe();

    // Fetch initial driver location
    const fetchInitialLocation = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("driver_lat, driver_lng, driver_location_updated_at")
        .eq("id", tripId)
        .single();

      if (!error && data?.driver_lat && data?.driver_lng) {
        setDriverLocation({
          lat: Number(data.driver_lat),
          lng: Number(data.driver_lng),
          updatedAt: new Date(data.driver_location_updated_at),
        });
      }
    };

    fetchInitialLocation();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDriver, tripId, enabled]);

  return {
    driverLocation,
    isTracking,
    updateDriverLocation,
  };
};
