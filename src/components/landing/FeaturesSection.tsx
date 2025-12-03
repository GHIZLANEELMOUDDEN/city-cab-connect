import { MapPin, MessageCircle, Star, Shield, Clock, CreditCard, Search, Phone } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "خريطة تفاعلية",
    description: "شاهد أقرب الطاكسيات حولك في الوقت الحقيقي مع تتبع مباشر",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Clock,
    title: "حجز سريع",
    description: "احجز طاكسيك في ثوانٍ معدودة بضغطة زر واحدة",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: MessageCircle,
    title: "محادثة مباشرة",
    description: "تواصل مع السائق عبر الرسائل أو الاتصال داخل التطبيق",
    color: "bg-taxi-navy/10 text-taxi-navy",
  },
  {
    icon: Star,
    title: "نظام تقييم",
    description: "قيّم رحلتك وساعد في تحسين جودة الخدمة",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "أمان وثقة",
    description: "سائقين موثوقين ومتحققين مع تتبع الرحلة كاملة",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Search,
    title: "الأشياء المفقودة",
    description: "نسيت شيئاً؟ تواصل مباشرة مع السائق لاسترجاعه",
    color: "bg-taxi-navy/10 text-taxi-navy",
  },
  {
    icon: CreditCard,
    title: "دفع إلكتروني",
    description: "ادفع بسهولة عبر البطاقة البنكية أو المحفظة الإلكترونية",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Phone,
    title: "دعم فني 24/7",
    description: "فريق دعم متواجد دائماً لمساعدتك في أي وقت",
    color: "bg-accent/10 text-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            المميزات
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            لماذا <span className="text-gradient">Taxicity</span>؟
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نقدم لك تجربة تنقل متكاملة تجمع بين السهولة والأمان والسرعة
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
