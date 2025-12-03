import { Check, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "الأساسية",
    price: "100",
    icon: Star,
    features: [
      "ظهور في الخريطة",
      "استقبال الطلبات",
      "محادثة مع الزبائن",
      "لوحة تحكم شخصية",
      "دعم فني",
    ],
    popular: false,
    buttonVariant: "outline" as const,
  },
  {
    name: "المميزة",
    price: "150",
    icon: Zap,
    features: [
      "كل مميزات الباقة الأساسية",
      "أولوية في الظهور",
      "علامة 'موصى به'",
      "إحصائيات متقدمة",
      "دعم فني أولوية",
    ],
    popular: true,
    buttonVariant: "default" as const,
  },
  {
    name: "الاحترافية",
    price: "200",
    icon: Crown,
    features: [
      "كل مميزات الباقة المميزة",
      "ظهور في المقدمة دائماً",
      "شارة السائق المحترف",
      "تقارير شهرية مفصلة",
      "دعم فني VIP",
    ],
    popular: false,
    buttonVariant: "secondary" as const,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            للسائقين
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            اشتراكات <span className="text-gradient">مرنة</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اختر الباقة المناسبة لك واستمتع بـ 7 أيام تجريبية مجانية عند التسجيل
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? "border-primary shadow-glow scale-105 z-10" 
                  : "border-border/50 shadow-soft hover:shadow-card"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-glow">
                  الأكثر شعبية
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              }`}>
                <plan.icon className="w-8 h-8" />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">درهم/شهر</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent"
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button variant={plan.buttonVariant} size="lg" className="w-full">
                ابدأ الآن
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            جميع الباقات تشمل رسم <span className="text-foreground font-semibold">1 درهم</span> لكل عملية مكتملة
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
