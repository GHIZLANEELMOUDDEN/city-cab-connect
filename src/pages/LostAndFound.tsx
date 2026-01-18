import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Package, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface LostItem {
  id: string;
  item_type: string;
  description: string;
  status: string;
  contact_phone: string | null;
  found_by_driver: boolean;
  image_url: string | null;
  created_at: string;
  trip_id: string | null;
}

const LostAndFound = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  
  // Form state
  const [itemType, setItemType] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchItems();
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("lost_and_found")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!itemType || !description) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;

      if (selectedImage && user) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("lost-found-images")
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lost-found-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("lost_and_found")
        .insert({
          reporter_id: user!.id,
          item_type: itemType,
          description,
          contact_phone: contactPhone || null,
          image_url: imageUrl,
          found_by_driver: profile?.user_type === "driver",
          driver_id: profile?.user_type === "driver" ? user!.id : null,
        });

      if (error) throw error;

      toast.success("تم إضافة البلاغ بنجاح");
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error submitting item:", error);
      toast.error("حدث خطأ في إرسال البلاغ");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemType("");
    setDescription("");
    setContactPhone("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><Clock className="w-3 h-3 ml-1" />قيد البحث</Badge>;
      case "claimed":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><AlertCircle className="w-3 h-3 ml-1" />تم المطالبة</Badge>;
      case "returned":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 ml-1" />تم الإرجاع</Badge>;
      case "closed":
        return <Badge variant="outline">مغلق</Badge>;
      default:
        return null;
    }
  };

  const itemTypes = [
    "هاتف محمول",
    "محفظة",
    "حقيبة",
    "مفاتيح",
    "نظارات",
    "مستندات",
    "ملابس",
    "أخرى"
  ];

  const filteredItems = items.filter(item => {
    if (filter === "all") return true;
    return item.status === filter;
  });

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
      <header className="bg-primary text-primary-foreground p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">المفقودات</h1>
          <div className="w-6" />
        </div>
        <p className="text-primary-foreground/80 text-sm text-center">
          ابحث عن مفقوداتك أو أبلغ عن غرض وجدته
        </p>
      </header>

      <main className="p-4 space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1" size="lg">
                <Plus className="w-5 h-5 ml-2" />
                إضافة بلاغ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة بلاغ جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الغرض *</label>
                  <Select value={itemType} onValueChange={setItemType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الغرض" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الوصف *</label>
                  <Textarea 
                    placeholder="صف الغرض المفقود بالتفصيل..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">رقم الهاتف للتواصل</label>
                  <Input 
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">صورة (اختياري)</label>
                  <div className="border-2 border-dashed border-muted rounded-xl p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        <button 
                          onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-destructive-foreground" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">اضغط لرفع صورة</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageSelect}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال البلاغ"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "الكل" },
            { id: "pending", label: "قيد البحث" },
            { id: "claimed", label: "تم المطالبة" },
            { id: "returned", label: "تم الإرجاع" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.id)}
              className="whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد مفقودات حالياً</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="shadow-soft overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {item.image_url && (
                      <div className="w-24 h-24 flex-shrink-0">
                        <img 
                          src={item.image_url} 
                          alt={item.item_type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{item.item_type}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(item.created_at).toLocaleDateString("ar-MA")}</span>
                        {item.contact_phone && (
                          <a href={`tel:${item.contact_phone}`} className="flex items-center gap-1 text-primary">
                            <Phone className="w-3 h-3" />
                            تواصل
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default LostAndFound;
