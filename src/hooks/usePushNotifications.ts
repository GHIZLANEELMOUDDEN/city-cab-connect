import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UsePushNotificationsOptions {
  enabled?: boolean;
}

export const usePushNotifications = ({ enabled = true }: UsePushNotificationsOptions = {}) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("متصفحك لا يدعم الإشعارات");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("تم تفعيل الإشعارات بنجاح");
        // Show a test notification
        showNotification("تم تفعيل الإشعارات", {
          body: "ستصلك الإشعارات الآن عند وجود تحديثات",
          icon: "/favicon.ico",
        });
        return true;
      } else if (result === "denied") {
        toast.error("تم رفض إذن الإشعارات");
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("حدث خطأ في طلب إذن الإشعارات");
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        dir: "rtl",
        lang: "ar",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }, [isSupported, permission]);

  const showTripNotification = useCallback((type: "new_request" | "accepted" | "started" | "completed" | "cancelled" | "message", details?: string) => {
    const titles: Record<string, string> = {
      new_request: "🚕 طلب رحلة جديد!",
      accepted: "✅ تم قبول طلبك",
      started: "🚗 بدأت الرحلة",
      completed: "🎉 تم إتمام الرحلة",
      cancelled: "❌ تم إلغاء الرحلة",
      message: "💬 رسالة جديدة",
    };

    const bodies: Record<string, string> = {
      new_request: details || "يوجد طلب رحلة جديد في انتظارك",
      accepted: details || "السائق في الطريق إليك",
      started: details || "أنت الآن في الرحلة",
      completed: details || "شكراً لاستخدامك تطبيقنا",
      cancelled: details || "تم إلغاء الرحلة",
      message: details || "لديك رسالة جديدة",
    };

    return showNotification(titles[type], {
      body: bodies[type],
      tag: type, // Prevents duplicate notifications of same type
      requireInteraction: type === "new_request" || type === "message",
    });
  }, [showNotification]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: use Web Audio API beep
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      });
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  return {
    permission,
    isSupported,
    isEnabled: permission === "granted",
    requestPermission,
    showNotification,
    showTripNotification,
    playNotificationSound,
  };
};
