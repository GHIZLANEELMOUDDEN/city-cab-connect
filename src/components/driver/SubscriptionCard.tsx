import { Check, Star, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDriverSubscription, PLAN_DETAILS, type PlanType } from "@/hooks/useDriverSubscription";

const planIcons = {
  basic: Star,
  premium: Zap,
  professional: Crown,
};

interface SubscriptionCardProps {
  showFullPlans?: boolean;
}

export default function SubscriptionCard({ showFullPlans = false }: SubscriptionCardProps) {
  const { subscribed, planType, subscriptionEnd, loading, subscribe, manageSubscription } = useDriverSubscription();

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show current subscription status
  if (subscribed && planType && !showFullPlans) {
    const plan = PLAN_DETAILS[planType];
    const Icon = planIcons[planType];
    const endDate = subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("ar-MA") : "";

    return (
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">اشتراكك الحالي</div>
            <div className="text-xl font-bold text-foreground">{plan.name}</div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">السعر الشهري</span>
            <span className="font-semibold">{plan.price} درهم</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ينتهي في</span>
            <span className="font-semibold">{endDate}</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={manageSubscription}
        >
          إدارة الاشتراك
        </Button>
      </div>
    );
  }

  // Show all plans for selection
  if (showFullPlans || !subscribed) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground mb-4">اختر باقتك</h3>
        
        {(Object.keys(PLAN_DETAILS) as PlanType[]).map((key) => {
          const plan = PLAN_DETAILS[key];
          const Icon = planIcons[key];
          const isCurrentPlan = subscribed && planType === key;
          const isPopular = key === "premium";

          return (
            <div
              key={key}
              className={`relative bg-card rounded-2xl p-5 border transition-all ${
                isCurrentPlan 
                  ? "border-primary shadow-glow" 
                  : isPopular 
                    ? "border-accent/50" 
                    : "border-border/50"
              }`}
            >
              {isPopular && !subscribed && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  الأكثر شعبية
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  باقتك الحالية
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isCurrentPlan ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{plan.name}</div>
                  <div className="text-2xl font-bold text-primary">{plan.price} <span className="text-sm text-muted-foreground">درهم/شهر</span></div>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={isCurrentPlan ? "outline" : isPopular ? "default" : "secondary"}
                onClick={() => isCurrentPlan ? manageSubscription() : subscribe(key)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? "باقتك الحالية" : "اشترك الآن"}
              </Button>
            </div>
          );
        })}

        <p className="text-center text-sm text-muted-foreground">
          + رسم <span className="font-semibold text-foreground">1 درهم</span> لكل رحلة مكتملة
        </p>
      </div>
    );
  }

  return null;
}
