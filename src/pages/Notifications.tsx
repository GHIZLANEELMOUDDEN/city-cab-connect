import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  ArrowRight, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info,
  CheckCheck,
  Trash2,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const Notifications = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead
  } = useNotifications({
    userId: user?.id || null,
    userType: profile?.user_type || null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">نجاح</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">تحذير</Badge>;
      case "error":
        return <Badge variant="destructive">خطأ</Badge>;
      case "trip":
        return <Badge className="bg-primary/20 text-primary border-primary/30">رحلة</Badge>;
      default:
        return <Badge variant="outline">معلومة</Badge>;
    }
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <Link to={profile?.user_type === "driver" ? "/driver" : "/client"} className="flex items-center gap-2">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">الإشعارات</h1>
          <div className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={markAllAsRead}
            className="w-full"
          >
            <CheckCheck className="w-4 h-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        )}
      </header>

      <main className="p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            الكل ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            غير مقروء ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {filter === "unread" ? "لا توجد إشعارات غير مقروءة" : "لا توجد إشعارات"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`shadow-soft transition-all cursor-pointer hover:shadow-md ${
                  !notification.read ? "border-r-4 border-r-primary bg-primary/5" : ""
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {getTypeBadge(notification.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </span>
                        {!notification.read && (
                          <Badge variant="outline" className="text-xs">جديد</Badge>
                        )}
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

export default Notifications;
