import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { 
  ArrowRight, 
  User, 
  Car, 
  MapPin, 
  Phone, 
  Star,
  Save,
  Loader2,
  Shield,
  Award
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const moroccanCities = [
  "الدار البيضاء",
  "الرباط",
  "فاس",
  "مراكش",
  "طنجة",
  "أكادير",
  "مكناس",
  "وجدة",
  "القنيطرة",
  "تطوان",
  "سلا",
  "الجديدة",
  "أخرى"
];

const DriverProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [taxiNumber, setTaxiNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [taxiImageUrl, setTaxiImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setTaxiNumber(data.taxi_number || "");
        setAvatarUrl(data.avatar_url);
        setTaxiImageUrl(data.taxi_image_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("الاسم الكامل مطلوب");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          city,
          taxi_number: taxiNumber,
          avatar_url: avatarUrl,
          taxi_image_url: taxiImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("حدث خطأ في حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-24 relative">
        <div className="flex items-center justify-between mb-4">
          <Link to="/driver" className="flex items-center gap-2">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">الملف الشخصي</h1>
          <div className="w-6" />
        </div>

        {/* Profile Image - Absolute positioned */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="relative">
            <ImageUpload
              bucket="profile-images"
              userId={user!.id}
              currentUrl={avatarUrl}
              onUpload={setAvatarUrl}
              shape="circle"
              size="lg"
            />
            {profile?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-4 h-4 text-accent-foreground" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 pt-20 space-y-6">
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Star className="w-5 h-5 fill-primary" />
              {profile?.rating || 0}
            </div>
            <div className="text-xs text-muted-foreground">التقييم</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile?.total_trips || 0}</div>
            <div className="text-xs text-muted-foreground">الرحلات</div>
          </div>
          <div className="text-center">
            {profile?.is_verified ? (
              <Badge className="bg-accent/20 text-accent">
                <Shield className="w-3 h-3 ml-1" />
                موثق
              </Badge>
            ) : (
              <Badge variant="outline">غير موثق</Badge>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">الاسم الكامل *</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06XXXXXXXX"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">المدينة</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مدينتك" />
                </SelectTrigger>
                <SelectContent>
                  {moroccanCities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Taxi Info */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              معلومات الطاكسي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">رقم الطاكسي</label>
              <Input
                value={taxiNumber}
                onChange={(e) => setTaxiNumber(e.target.value)}
                placeholder="مثال: A-1234"
              />
            </div>

            <ImageUpload
              bucket="taxi-images"
              userId={user!.id}
              currentUrl={taxiImageUrl}
              onUpload={setTaxiImageUrl}
              label="صورة الطاكسي"
              shape="rectangle"
              size="lg"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
          size="lg"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 ml-2" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </main>
    </div>
  );
};

export default DriverProfile;
