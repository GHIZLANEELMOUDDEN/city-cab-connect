import { Button } from "@/components/ui/button";
import { MapPin, Clock, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-20 md:pt-24 overflow-hidden hero-gradient">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 animate-fade-in">
              <Star className="w-4 h-4 fill-primary" />
              <span>التطبيق الأول للطاكسيات في المغرب</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
              احجز طاكسيك
              <br />
              <span className="text-gradient">بضغطة زر</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 lg:mr-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              تطبيق ذكي يربطك بأقرب طاكسي في مدينتك. سريع، آمن، وموثوق. 
              استمتع بتجربة تنقل عصرية داخل المدن المغربية.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-center lg:text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground">+1000</div>
                <div className="text-sm text-muted-foreground">سائق نشط</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground">+50K</div>
                <div className="text-sm text-muted-foreground">رحلة مكتملة</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">تقييم التطبيق</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/client">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <MapPin className="w-5 h-5" />
                  احجز طاكسي الآن
                </Button>
              </Link>
              <Link to="/driver">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  انضم كسائق
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image / Map Preview */}
          <div className="order-1 lg:order-2 relative animate-scale-in">
            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              {/* Phone Mockup */}
              <div className="relative bg-secondary rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-background rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* Status Bar */}
                  <div className="bg-secondary h-8 flex items-center justify-center">
                    <div className="w-20 h-5 bg-foreground/20 rounded-full" />
                  </div>
                  
                  {/* Map Preview */}
                  <div className="relative h-full bg-gradient-to-b from-taxi-yellow-light/20 to-background p-4">
                    {/* Map Grid Lines */}
                    <div className="absolute inset-4 opacity-10">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute w-full h-px bg-foreground" style={{ top: `${i * 14}%` }} />
                      ))}
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute h-full w-px bg-foreground" style={{ left: `${i * 20}%` }} />
                      ))}
                    </div>

                    {/* Taxi Markers */}
                    <div className="absolute top-1/4 left-1/4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-glow animate-bounce-soft">
                      <span className="text-lg">🚕</span>
                    </div>
                    <div className="absolute top-1/2 right-1/4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-glow animate-bounce-soft" style={{ animationDelay: "0.5s" }}>
                      <span className="text-lg">🚕</span>
                    </div>
                    <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-glow animate-bounce-soft" style={{ animationDelay: "1s" }}>
                      <span className="text-lg">🚕</span>
                    </div>

                    {/* User Location */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 bg-accent/20 rounded-full animate-ping" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-accent rounded-full border-4 border-background shadow-lg" />
                    </div>

                    {/* Bottom Card */}
                    <div className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl p-4 shadow-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🚕</span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">طاكسي قريب منك</div>
                          <div className="text-sm text-muted-foreground">2 دقائق للوصول</div>
                        </div>
                      </div>
                      <div className="w-full h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-semibold">
                        احجز الآن
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-3 shadow-card animate-bounce-soft">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">سريع وآمن</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-3 shadow-card animate-bounce-soft" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">سائقين موثوقين</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
