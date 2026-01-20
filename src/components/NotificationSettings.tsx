import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, BellRing, Check, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const NotificationSettings = () => {
  const { permission, isSupported, isEnabled, requestPermission, playNotificationSound } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-destructive" />
            <CardTitle className="text-lg">الإشعارات غير مدعومة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            متصفحك الحالي لا يدعم الإشعارات. يرجى استخدام متصفح حديث مثل Chrome أو Firefox أو Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <BellRing className="w-5 h-5 text-accent" />
            ) : (
              <Bell className="w-5 h-5 text-muted-foreground" />
            )}
            <CardTitle className="text-lg">إشعارات التطبيق</CardTitle>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            isEnabled ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
          }`}>
            {isEnabled ? (
              <>
                <Check className="w-3 h-3" />
                مفعّل
              </>
            ) : (
              <>
                <X className="w-3 h-3" />
                غير مفعّل
              </>
            )}
          </div>
        </div>
        <CardDescription>
          {isEnabled 
            ? "ستصلك إشعارات عند وجود طلبات جديدة أو تحديثات على رحلاتك"
            : "فعّل الإشعارات لتلقي التنبيهات المهمة"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {permission === "denied" ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">
              تم رفض إذن الإشعارات. يرجى تفعيلها من إعدادات المتصفح.
            </p>
          </div>
        ) : !isEnabled ? (
          <Button onClick={requestPermission} className="w-full" variant="accent">
            <Bell className="w-4 h-4 ml-2" />
            تفعيل الإشعارات
          </Button>
        ) : (
          <div className="space-y-2">
            <Button 
              onClick={playNotificationSound} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <BellRing className="w-4 h-4 ml-2" />
              اختبار صوت الإشعار
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              الإشعارات مفعّلة وستصلك عند وجود تحديثات
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
