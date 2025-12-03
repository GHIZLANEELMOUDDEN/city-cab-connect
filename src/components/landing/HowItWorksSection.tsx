import { MapPin, UserCheck, Car, Star } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    number: "01",
    title: "حدد موقعك",
    description: "افتح التطبيق وشاهد موقعك الحالي مع الطاكسيات القريبة منك",
  },
  {
    icon: UserCheck,
    number: "02",
    title: "اختر سائقك",
    description: "اختر السائق المناسب بناءً على التقييم والمسافة ووقت الوصول",
  },
  {
    icon: Car,
    number: "03",
    title: "استمتع برحلتك",
    description: "تواصل مع السائق وتتبع رحلتك في الوقت الحقيقي حتى الوصول",
  },
  {
    icon: Star,
    number: "04",
    title: "قيّم تجربتك",
    description: "شارك رأيك وساعد في تحسين جودة الخدمة للجميع",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            كيف يعمل
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            أربع خطوات <span className="text-gradient">بسيطة</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            احجز طاكسيك في أقل من دقيقة واستمتع برحلة آمنة ومريحة
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 -translate-x-1/2" style={{ left: "100%" }} />
              )}
              
              <div className="text-center group">
                {/* Number Badge */}
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-card shadow-card flex items-center justify-center group-hover:shadow-glow transition-all duration-300 border border-border/50">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-glow">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
