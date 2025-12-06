import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Calendar, Clock, MapPin, Star, User, Car, ArrowLeft, Info, Phone, DollarSign, TrendingUp, Route, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ar } from "date-fns/locale";

const TripHistory = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { trips, rateTrip } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "month" | "week">("all");

  const isDriver = profile?.user_type === "driver";

  // Filter trips by date
  const filteredTrips = useMemo(() => {
    const now = new Date();
    let filtered = trips.filter((t) => ["completed", "cancelled"].includes(t.status));
    
    if (dateFilter === "month") {
      filtered = filtered.filter((t) => 
        isWithinInterval(new Date(t.created_at), {
          start: startOfMonth(now),
          end: endOfMonth(now),
        })
      );
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((t) => new Date(t.created_at) >= weekAgo);
    }
    
    return filtered;
  }, [trips, dateFilter]);

  const completedTrips = filteredTrips.filter((t) => t.status === "completed");
  const cancelledTrips = filteredTrips.filter((t) => t.status === "cancelled");
  const allTrips = filteredTrips;

  // Statistics
  const stats = useMemo(() => {
    const completed = completedTrips;
    const totalEarnings = completed.reduce((sum, t) => sum + (Number(t.final_price) || 0), 0);
    const totalDistance = completed.reduce((sum, t) => sum + (Number(t.distance_km) || 0), 0);
    const avgRating = completed.length > 0
      ? completed.reduce((sum, t) => sum + (t.rating || 0), 0) / completed.filter(t => t.rating).length
      : 0;
    
    return {
      totalTrips: completed.length,
      totalEarnings,
      totalDistance: totalDistance.toFixed(1),
      avgRating: avgRating.toFixed(1),
      cancelledCount: cancelledTrips.length,
    };
  }, [completedTrips, cancelledTrips]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "مكتملة", variant: "default" },
      cancelled: { label: "ملغاة", variant: "destructive" },
      pending: { label: "قيد الانتظار", variant: "outline" },
      accepted: { label: "مقبولة", variant: "secondary" },
      in_progress: { label: "جارية", variant: "secondary" },
    };
    const config = statusConfig[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleRate = async (tripId: string) => {
    if (rating > 0) {
      await rateTrip(tripId, rating);
      setIsRatingOpen(false);
      setRating(0);
    }
  };

  const TripCard = ({ trip }: { trip: any }) => (
    <Card className="glass-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(trip.created_at), "d MMMM yyyy", { locale: ar })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(trip.created_at), "hh:mm a", { locale: ar })}
              </p>
            </div>
          </div>
          {getStatusBadge(trip.status)}
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-accent mt-2" />
            <p className="text-sm line-clamp-1">{trip.pickup_address}</p>
          </div>
          {trip.dropoff_address && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
              <p className="text-sm line-clamp-1">{trip.dropoff_address}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            {trip.final_price && (
              <span className="font-bold text-primary">{trip.final_price} د.ع</span>
            )}
            {trip.distance_km && (
              <span className="text-xs text-muted-foreground">{trip.distance_km} كم</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {trip.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm">{trip.rating}</span>
              </div>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTrip(trip)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>تفاصيل الرحلة</DialogTitle>
                </DialogHeader>
                <TripDetails trip={trip} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {trip.status === "completed" && !trip.rating && !isDriver && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-3"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTrip(trip);
              setIsRatingOpen(true);
            }}
          >
            <Star className="w-4 h-4 ml-2" />
            قيّم الرحلة
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const TripDetails = ({ trip }: { trip: any }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {getStatusBadge(trip.status)}
        <span className="text-sm text-muted-foreground">
          #{trip.id.slice(0, 8)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{format(new Date(trip.created_at), "EEEE، d MMMM yyyy", { locale: ar })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{format(new Date(trip.created_at), "hh:mm a", { locale: ar })}</span>
        </div>
      </div>

      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-accent mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">نقطة الانطلاق</p>
            <p className="text-sm">{trip.pickup_address}</p>
          </div>
        </div>
        {trip.dropoff_address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-destructive mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">الوجهة</p>
              <p className="text-sm">{trip.dropoff_address}</p>
            </div>
          </div>
        )}
      </div>

      {trip.client_note && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
          <p className="text-sm">{trip.client_note}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {trip.distance_km && (
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">المسافة</p>
            <p className="font-bold">{trip.distance_km} كم</p>
          </div>
        )}
        {trip.final_price && (
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">السعر</p>
            <p className="font-bold text-primary">{trip.final_price} د.ع</p>
          </div>
        )}
      </div>

      {trip.rating && (
        <div className="flex items-center justify-center gap-1 p-3 bg-primary/5 rounded-lg">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= trip.rating ? "fill-primary text-primary" : "text-muted"}`}
            />
          ))}
          <span className="mr-2 font-bold">{trip.rating}/5</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(isDriver ? "/driver" : "/client")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">سجل الرحلات</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <Car className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalTrips}</div>
              <div className="text-xs text-muted-foreground">رحلات مكتملة</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">إجمالي {isDriver ? "الأرباح" : "المدفوعات"}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardContent className="p-4 text-center">
              <Route className="w-6 h-6 text-secondary-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalDistance}</div>
              <div className="text-xs text-muted-foreground">كم مقطوعة</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.avgRating || "-"}</div>
              <div className="text-xs text-muted-foreground">متوسط التقييم</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("all")}
          >
            الكل
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("month")}
          >
            هذا الشهر
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("week")}
          >
            آخر أسبوع
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">الكل ({allTrips.length})</TabsTrigger>
            <TabsTrigger value="completed">مكتملة ({completedTrips.length})</TabsTrigger>
            <TabsTrigger value="cancelled">ملغاة ({cancelledTrips.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allTrips.length === 0 ? (
              <EmptyState />
            ) : (
              allTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTrips.length === 0 ? (
              <EmptyState message="لا توجد رحلات مكتملة" />
            ) : (
              completedTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledTrips.length === 0 ? (
              <EmptyState message="لا توجد رحلات ملغاة" />
            ) : (
              cancelledTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>قيّم الرحلة</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? "fill-primary text-primary" : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 0
                ? "اختر تقييمك"
                : rating <= 2
                ? "نأسف لتجربتك"
                : rating <= 4
                ? "شكراً لتقييمك"
                : "رائع! شكراً لك"}
            </p>
            <Button
              onClick={() => selectedTrip && handleRate(selectedTrip.id)}
              disabled={rating === 0}
              className="w-full"
            >
              إرسال التقييم
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EmptyState = ({ message = "لا توجد رحلات سابقة" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
      <Car className="w-10 h-10 text-muted-foreground" />
    </div>
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export default TripHistory;
