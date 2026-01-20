import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, MessageCircle, User, Car, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface TripWithMessages {
  id: string;
  pickup_address: string;
  dropoff_address: string | null;
  created_at: string;
  status: string;
  messages: ChatMessage[];
  otherPartyName?: string;
}

const ChatHistory = () => {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<TripWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripWithMessages | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        // First fetch trips with messages
        const isDriver = profile?.user_type === "driver";
        const userIdField = isDriver ? "driver_id" : "client_id";

        const { data: tripsData, error: tripsError } = await supabase
          .from("trips")
          .select("*")
          .eq(userIdField, user.id)
          .in("status", ["completed", "cancelled"])
          .order("created_at", { ascending: false })
          .limit(50);

        if (tripsError) throw tripsError;

        // Fetch messages for each trip
        const tripsWithMessages: TripWithMessages[] = [];

        for (const trip of tripsData || []) {
          const { data: messages } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("trip_id", trip.id)
            .order("created_at", { ascending: true });

          if (messages && messages.length > 0) {
            tripsWithMessages.push({
              ...trip,
              messages: messages as ChatMessage[],
              otherPartyName: isDriver ? "الزبون" : "السائق",
            });
          }
        }

        setTrips(tripsWithMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [user, profile?.user_type]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ar-IQ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedTrip) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTrip(null)}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold">محادثة مع {selectedTrip.otherPartyName}</h1>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedTrip.created_at)}
              </p>
            </div>
          </div>
        </header>

        {/* Trip Info */}
        <div className="p-4 bg-muted/30 border-b border-border">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-accent mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedTrip.pickup_address}</p>
              {selectedTrip.dropoff_address && (
                <p className="text-sm text-muted-foreground">
                  ← {selectedTrip.dropoff_address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" style={{ height: "calc(100vh - 180px)" }}>
          <div className="space-y-3">
            {selectedTrip.messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to={profile?.user_type === "driver" ? "/driver" : "/client"}>
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">سجل المحادثات</h1>
        </div>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">لا توجد محادثات سابقة</p>
            <p className="text-sm">ستظهر هنا المحادثات من الرحلات المكتملة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedTrip(trip)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {profile?.user_type === "driver" ? (
                        <User className="w-6 h-6 text-primary" />
                      ) : (
                        <Car className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{trip.otherPartyName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(trip.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {trip.pickup_address}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {trip.messages[trip.messages.length - 1]?.message || ""}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {trip.messages.length} رسالة
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatHistory;
