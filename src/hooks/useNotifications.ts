import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "trip_request" | "trip_accepted" | "trip_started" | "trip_completed" | "trip_cancelled";
  tripId?: string;
  createdAt: Date;
  read: boolean;
}

interface UseNotificationsOptions {
  userId: string | null;
  userType: "client" | "driver" | null;
  enabled?: boolean;
}

export const useNotifications = ({
  userId,
  userType,
  enabled = true,
}: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio element if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio();
        // Use a simple beep sound data URI
        audioRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleO/QxeHkk0j/y9TI1OawbU5eo9rs2pxOIjqIv+HqsXhJNmqg0+Xpu3YiKIGf3umqdEpLbpre5dqpZ0o6bJnT4sWVbGFjj7/d6sGXWzpCbZLE3c6kf2dZX4nC3c2VUzA/eJC/2MugfnBkZ3bC08STWjBBcoXG1sCAalmDn7naw5xbPjxzj8bgy5Jhb3J8pcfYv4hGO3WPw9TWnoVRRIeo0tbKflo3Y4e92NS6i1c8ZYKx09Wxgk88bIe219KrelI6YoW80NaoelI8YoSx0NWndU8";
      }
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user hasn't interacted yet)
      });
    } catch (error) {
      console.log("Audio not supported");
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback((
    title: string,
    message: string,
    type: Notification["type"],
    tripId?: string
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      tripId,
      createdAt: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);
    
    // Play sound
    playNotificationSound();
    
    // Show toast
    toast({
      title,
      description: message,
      duration: 5000,
    });

    // Try to show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
      });
    }
  }, [toast, playNotificationSound]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  // Subscribe to trip updates
  useEffect(() => {
    if (!userId || !userType || !enabled) return;

    const channel = supabase
      .channel("trip-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Driver notifications - new trip requests
          if (userType === "driver" && payload.eventType === "INSERT") {
            if (newData.status === "pending") {
              addNotification(
                "🚕 طلب رحلة جديد!",
                `طلب جديد من: ${newData.pickup_address}`,
                "trip_request",
                newData.id
              );
            }
          }

          // Client notifications - trip status changes
          if (userType === "client" && newData.client_id === userId) {
            // Trip accepted
            if (oldData?.status === "pending" && newData.status === "accepted") {
              addNotification(
                "✅ تم قبول رحلتك!",
                "السائق في الطريق إليك",
                "trip_accepted",
                newData.id
              );
            }

            // Trip started
            if (oldData?.status === "accepted" && newData.status === "in_progress") {
              addNotification(
                "🚗 بدأت الرحلة!",
                "انطلقت رحلتك الآن",
                "trip_started",
                newData.id
              );
            }

            // Trip completed
            if (newData.status === "completed" && oldData?.status !== "completed") {
              addNotification(
                "🎉 اكتملت الرحلة!",
                "شكراً لاستخدامك Taxicity",
                "trip_completed",
                newData.id
              );
            }

            // Trip cancelled
            if (newData.status === "cancelled" && oldData?.status !== "cancelled") {
              addNotification(
                "❌ تم إلغاء الرحلة",
                "تم إلغاء رحلتك",
                "trip_cancelled",
                newData.id
              );
            }
          }

          // Driver notifications - their trip status changes
          if (userType === "driver" && newData.driver_id === userId) {
            if (newData.status === "cancelled" && oldData?.status !== "cancelled") {
              addNotification(
                "❌ تم إلغاء الرحلة",
                "الزبون ألغى الرحلة",
                "trip_cancelled",
                newData.id
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userType, enabled, addNotification]);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };
};
