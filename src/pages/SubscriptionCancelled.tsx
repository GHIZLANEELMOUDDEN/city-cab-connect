import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowRight, Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLAN_DETAILS } from "@/hooks/useDriverSubscription";

const SubscriptionCancelled = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-8 text-white text-center relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">تم إلغاء الاشتراك</h1>
          <p className="text-white/90">لا تقلق، يمكنك العودة في أي وقت!</p>
        </div>

        <CardContent className="p-6 text-center space-y-6">
          {/* Encouraging message */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-amber-800">نحن في انتظارك!</span>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              نحن نقدر اهتمامك ونتفهم أن الوقت قد لا يكون مناسباً الآن. 
              يمكنك العودة والاشتراك في أي وقت للاستفادة من مميزاتنا الرائعة.
            </p>
          </div>

          {/* What you're missing */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground font-medium mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              ما ستحصل عليه عند الاشتراك:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {PLAN_DETAILS.basic.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Special offer hint */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              💡 ابدأ بالباقة الأساسية بـ {PLAN_DETAILS.basic.price} درهم/شهر فقط!
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t space-y-3">
            <Button 
              onClick={() => navigate("/driver")} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة واختيار باقة
            </Button>
            
            <p className="text-xs text-muted-foreground">
              سيتم توجيهك تلقائياً خلال{" "}
              <span className="font-bold text-primary">{countdown}</span>{" "}
              ثواني
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCancelled;
