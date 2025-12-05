import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Car,
  Shield,
  Zap,
  MapPin,
  Star,
  Users,
  Phone,
  Mail,
  Globe,
  Heart,
  CheckCircle,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "حجز فوري",
      description: "احجز سيارتك بضغطة زر واحصل على سائق في ثوانٍ",
    },
    {
      icon: Shield,
      title: "أمان تام",
      description: "جميع السائقين موثقون ومعتمدون لضمان سلامتك",
    },
    {
      icon: MapPin,
      title: "تتبع مباشر",
      description: "تابع رحلتك في الوقت الفعلي على الخريطة",
    },
    {
      icon: Star,
      title: "تقييم الخدمة",
      description: "قيّم تجربتك وساعدنا في تحسين الخدمة",
    },
  ];

  const stats = [
    { value: "10,000+", label: "رحلة مكتملة" },
    { value: "500+", label: "سائق معتمد" },
    { value: "4.8", label: "متوسط التقييم" },
    { value: "24/7", label: "خدمة متواصلة" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">حول التطبيق</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="w-24 h-24 mx-auto rounded-2xl taxi-gradient flex items-center justify-center shadow-lg glow-effect">
            <Car className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">
            تاكسي<span className="text-gradient">سيتي</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            تطبيق حجز سيارات الأجرة الأول في العراق. نوصلك بأمان وراحة إلى وجهتك.
          </p>
          <p className="text-sm text-muted-foreground">الإصدار 1.0.0</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              مميزات التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              كيف يعمل التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {[
                { step: 1, title: "حدد موقعك", desc: "اختر نقطة الانطلاق والوجهة" },
                { step: 2, title: "أكد الطلب", desc: "راجع التفاصيل واحجز الرحلة" },
                { step: 3, title: "انتظر السائق", desc: "سيصلك السائق في أقرب وقت" },
                { step: 4, title: "استمتع بالرحلة", desc: "قيّم تجربتك بعد الوصول" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full taxi-gradient flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* For Drivers */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              للسائقين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              انضم إلى فريق تاكسي سيتي واحصل على دخل إضافي بمرونة تامة.
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "اعمل في الأوقات التي تناسبك",
                "احصل على أرباحك بشكل أسبوعي",
                "دعم فني متواصل على مدار الساعة",
                "مكافآت وحوافز للسائقين المتميزين",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              تواصل معنا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span dir="ltr">+964 770 123 4567</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>support@taxicity.iq</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span>www.taxicity.iq</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            صنع بـ <Heart className="w-4 h-4 text-destructive fill-destructive" /> في العراق
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 تاكسي سيتي. جميع الحقوق محفوظة.
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
