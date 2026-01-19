import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UseTripChatOptions {
  tripId: string | null;
  enabled?: boolean;
}

export const useTripChat = ({ tripId, enabled = true }: UseTripChatOptions) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!tripId || !user || !enabled) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const msgs = (data || []) as ChatMessage[];
      setMessages(msgs);
      
      // Count unread messages from other users
      const unread = msgs.filter(m => !m.is_read && m.sender_id !== user.id).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    } finally {
      setLoading(false);
    }
  }, [tripId, user, enabled]);

  // Send message
  const sendMessage = async (message: string) => {
    if (!tripId || !user || !message.trim()) return false;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          trip_id: tripId,
          sender_id: user.id,
          message: message.trim(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("فشل في إرسال الرسالة");
      return false;
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!tripId || !user) return;

    try {
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("trip_id", tripId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!tripId || !user || !enabled) return;

    fetchMessages();

    const channel = supabase
      .channel(`chat-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
          
          if (newMessage.sender_id !== user.id) {
            setUnreadCount((prev) => prev + 1);
            // Play notification sound
            const audio = new Audio("/notification.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, user, enabled, fetchMessages]);

  return {
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};
