import { Car, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Taxi<span className="text-primary">city</span>
              </span>
            </Link>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed mb-6">
              التطبيق الأول للطاكسيات في المغرب. نربطك بأقرب سائق بكل سهولة وأمان.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-secondary-foreground/70 hover:text-primary transition-colors">المميزات</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-secondary-foreground/70 hover:text-primary transition-colors">كيف يعمل</a>
              </li>
              <li>
                <a href="#pricing" className="text-secondary-foreground/70 hover:text-primary transition-colors">الاشتراكات</a>
              </li>
              <li>
                <Link to="/driver" className="text-secondary-foreground/70 hover:text-primary transition-colors">للسائقين</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4">الدعم</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">الأسئلة الشائعة</a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">سياسة الخصوصية</a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">شروط الاستخدام</a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">تواصل معنا</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="text-secondary-foreground/70">contact@taxicity.ma</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-secondary-foreground/70">+212 5XX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-secondary-foreground/70">الدار البيضاء، المغرب</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary-foreground/50 text-sm">
              © 2024 Taxicity. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-secondary-foreground/50 text-sm">صُنع بـ ❤️ في المغرب</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
