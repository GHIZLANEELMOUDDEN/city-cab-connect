import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDriverSubscription } from "@/hooks/useDriverSubscription";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const { refreshSubscription, planType, subscribed } = useDriverSubscription();

  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();
  }, [refreshSubscription]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/driver");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white text-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute top-8 right-8 animate-pulse delay-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute bottom-4 left-1/2 animate-pulse delay-200">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          
          {/* Success icon with animation */}
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">تم الاشتراك بنجاح! 🎉</h1>
            <p className="text-white/90">مرحباً بك في عائلة سائقي التاكسي</p>
          </div>
        </div>

        <CardContent className="p-6 text-center space-y-6">
          {/* Plan details */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Car className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800">
                {subscribed && planType ? (
                  <>الباقة {planType === "basic" ? "الأساسية" : planType === "premium" ? "المميزة" : "الاحترافية"}</>
                ) : (
                  "جاري تحميل البيانات..."
                )}
              </span>
            </div>
            <p className="text-sm text-amber-700">
              يمكنك الآن استقبال طلبات الرحلات والظهور للزبائن
            </p>
          </div>

          {/* Benefits list */}
          <div className="text-right space-y-2">
            <p className="text-sm text-muted-foreground font-medium mb-3">ما يمكنك فعله الآن:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>الظهور على الخريطة للزبائن</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>استقبال وقبول طلبات الرحلات</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>التواصل مع الزبائن</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>إدارة رحلاتك وأرباحك</span>
              </li>
            </ul>
          </div>

          {/* Countdown and redirect */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              سيتم توجيهك تلقائياً خلال{" "}
              <span className="font-bold text-primary text-lg">{countdown}</span>{" "}
              ثواني
            </p>
            <Button 
              onClick={() => navigate("/driver")} 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              الذهاب للوحة التحكم الآن
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
