import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  User,
  Phone,
  MapPin,
  Star,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  Bell,
  Loader2,
  AlertCircle,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Send,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "sonner";

interface DriverDetails {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  taxi_number: string | null;
  rating: number | null;
  total_trips: number | null;
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  driver_subscriptions: Array<{
    id: string;
    plan_type: string;
    status: string;
    current_period_end: string | null;
    price_amount: number;
  }>;
}

interface DriverStats {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
}

interface Trip {
  id: string;
  pickup_address: string;
  dropoff_address: string | null;
  status: string;
  final_price: number | null;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const DriverDetails = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const { hasAdminAccess, loading: roleLoading } = useAdminRole();

  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Notification dialog
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [sendingNotif, setSendingNotif] = useState(false);

  const fetchDriverDetails = useCallback(async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke("admin-driver", {
        body: { action: "get", driverId },
      });

      if (fetchError) throw new Error(fetchError.message);
      if (data.error) throw new Error(data.error);

      setDriver(data.driver);
      setStats(data.stats);
      setRecentTrips(data.recentTrips);
      setTransactions(data.transactions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    if (!roleLoading && !hasAdminAccess) {
      toast.error("ليس لديك صلاحية الوصول");
      navigate("/");
      return;
    }

    if (hasAdminAccess) {
      fetchDriverDetails();
    }
  }, [hasAdminAccess, roleLoading, navigate, fetchDriverDetails]);

  const handleStatusUpdate = async (field: "is_active" | "is_verified", value: boolean) => {
    if (!driverId) return;

    try {
      setUpdating(true);

      const { data, error: updateError } = await supabase.functions.invoke("admin-driver", {
        body: {
          action: "updateStatus",
          driverId,
          data: { [field]: value },
        },
      });

      if (updateError) throw new Error(updateError.message);
      if (data.error) throw new Error(data.error);

      setDriver((prev) => prev ? { ...prev, [field]: value } : null);
      toast.success("تم تحديث حالة السائق بنجاح");
    } catch (err) {
      toast.error("فشل في تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendNotification = async () => {
    if (!driverId || !notifTitle.trim() || !notifMessage.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      setSendingNotif(true);

      const { data, error: sendError } = await supabase.functions.invoke("admin-driver", {
        body: {
          action: "sendNotification",
          driverId,
          data: {
            title: notifTitle,
            message: notifMessage,
            type: notifType,
          },
        },
      });

      if (sendError) throw new Error(sendError.message);
      if (data.error) throw new Error(data.error);

      toast.success("تم إرسال الإشعار بنجاح");
      setNotifDialogOpen(false);
      setNotifTitle("");
      setNotifMessage("");
      setNotifType("info");
    } catch (err) {
      toast.error("فشل في إرسال الإشعار");
    } finally {
      setSendingNotif(false);
    }
  };

  const getPlanBadge = (planType: string | null) => {
    if (!planType) return <Badge variant="outline">غير مشترك</Badge>;
    
    switch (planType) {
      case "basic":
        return <Badge className="bg-slate-500/20 text-slate-600">أساسية</Badge>;
      case "premium":
        return <Badge className="bg-amber-500/20 text-amber-600">مميزة</Badge>;
      case "professional":
        return <Badge className="bg-purple-500/20 text-purple-600">احترافية</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600">مكتملة</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغاة</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-600">جارية</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate("/admin")}>العودة للوحة التحكم</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!driver) return null;

  const currentSubscription = driver.driver_subscriptions?.[0];

  return (
    <div className="min-h-screen bg-muted/30 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">تفاصيل السائق</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Driver Info Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {driver.avatar_url ? (
                  <img
                    src={driver.avatar_url}
                    alt={driver.full_name || ""}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <h2 className="text-xl font-bold">{driver.full_name || "بدون اسم"}</h2>
              <div className="flex items-center gap-2 mt-2">
                {driver.is_verified && (
                  <Badge className="bg-accent/20 text-accent">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    موثق
                  </Badge>
                )}
                {driver.is_active ? (
                  <Badge className="bg-green-500/20 text-green-600">نشط</Badge>
                ) : (
                  <Badge variant="destructive">غير نشط</Badge>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">رقم الهاتف</div>
                  <div className="font-medium">{driver.phone || "-"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">المدينة</div>
                  <div className="font-medium">{driver.city || "-"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Car className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">رقم التاكسي</div>
                  <div className="font-medium">{driver.taxi_number || "-"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Star className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs text-muted-foreground">التقييم</div>
                  <div className="font-medium">
                    {driver.rating ? Number(driver.rating).toFixed(1) : "-"} / 5
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">تاريخ التسجيل</div>
                  <div className="font-medium">
                    {new Date(driver.created_at).toLocaleDateString("ar-MA")}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-semibold">الاشتراك</span>
              </div>
              {currentSubscription ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الباقة</span>
                    {getPlanBadge(currentSubscription.plan_type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الحالة</span>
                    <Badge className={currentSubscription.status === "active" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}>
                      {currentSubscription.status === "active" ? "نشط" : "منتهي"}
                    </Badge>
                  </div>
                  {currentSubscription.current_period_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ينتهي في</span>
                      <span className="text-sm font-medium">
                        {new Date(currentSubscription.current_period_end).toLocaleDateString("ar-MA")}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا يوجد اشتراك</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                إدارة الحالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <div className="font-medium">حالة النشاط</div>
                    <div className="text-sm text-muted-foreground">
                      {driver.is_active ? "السائق نشط ويظهر للزبائن" : "السائق غير نشط"}
                    </div>
                  </div>
                  <Switch
                    checked={driver.is_active}
                    onCheckedChange={(checked) => handleStatusUpdate("is_active", checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <div className="font-medium">التوثيق</div>
                    <div className="text-sm text-muted-foreground">
                      {driver.is_verified ? "السائق موثق" : "السائق غير موثق"}
                    </div>
                  </div>
                  <Switch
                    checked={driver.is_verified}
                    onCheckedChange={(checked) => handleStatusUpdate("is_verified", checked)}
                    disabled={updating}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Bell className="w-4 h-4 ml-2" />
                      إرسال إشعار للسائق
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إرسال إشعار</DialogTitle>
                      <DialogDescription>
                        أرسل إشعاراً مباشراً للسائق {driver.full_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>نوع الإشعار</Label>
                        <Select value={notifType} onValueChange={setNotifType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">معلومات</SelectItem>
                            <SelectItem value="success">نجاح</SelectItem>
                            <SelectItem value="warning">تحذير</SelectItem>
                            <SelectItem value="error">خطأ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>العنوان</Label>
                        <Input
                          value={notifTitle}
                          onChange={(e) => setNotifTitle(e.target.value)}
                          placeholder="عنوان الإشعار"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الرسالة</Label>
                        <Textarea
                          value={notifMessage}
                          onChange={(e) => setNotifMessage(e.target.value)}
                          placeholder="محتوى الإشعار..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNotifDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleSendNotification} disabled={sendingNotif}>
                        {sendingNotif ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 ml-2" />
                        )}
                        إرسال
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                إحصائيات الرحلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.totalTrips || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">إجمالي الرحلات</div>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.completedTrips || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">رحلات مكتملة</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">
                    {stats?.cancelledTrips || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">رحلات ملغاة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                آخر الرحلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTrips.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد رحلات
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm line-clamp-1">
                            {trip.pickup_address}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(trip.created_at).toLocaleString("ar-MA")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {trip.final_price && (
                          <span className="font-medium text-accent">
                            {trip.final_price} درهم
                          </span>
                        )}
                        {getStatusBadge(trip.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                آخر المعاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد معاملات
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.transaction_type === "earning" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          <DollarSign className={`w-5 h-5 ${
                            tx.transaction_type === "earning" ? "text-green-600" : "text-red-600"
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {tx.description || tx.transaction_type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleString("ar-MA")}
                          </div>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        tx.transaction_type === "earning" ? "text-green-600" : "text-red-600"
                      }`}>
                        {tx.transaction_type === "earning" ? "+" : "-"}{tx.amount} درهم
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;
