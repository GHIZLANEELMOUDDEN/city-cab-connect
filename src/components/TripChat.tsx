import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, X } from "lucide-react";
import { useTripChat } from "@/hooks/useTripChat";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface TripChatProps {
  tripId: string;
  otherPartyName?: string;
  disabled?: boolean;
}

const TripChat = ({ tripId, otherPartyName = "المستخدم", disabled = false }: TripChatProps) => {
  const { user } = useAuth();
  const { messages, unreadCount, sendMessage, markAsRead, loading } = useTripChat({
    tripId,
    enabled: !disabled,
  });
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when sheet opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAsRead();
    }
  }, [isOpen, unreadCount, markAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (disabled) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-right">محادثة مع {otherPartyName}</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-60px)]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>لا توجد رسائل بعد</p>
                <p className="text-sm">ابدأ المحادثة الآن</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
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
                          {new Date(msg.created_at).toLocaleTimeString("ar-IQ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك..."
                className="flex-1"
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TripChat;
