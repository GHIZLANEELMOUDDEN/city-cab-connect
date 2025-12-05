import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Car,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bell,
  User,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Navigation,
  Phone,
  MessageCircle,
  Locate,
  Play,
  Flag,
  History,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LeafletMap from "@/components/map/LeafletMap";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useTrips } from "@/hooks/useTrips";

const DriverApp = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, loading, error, refresh } = useGeoLocation();
  const { pendingTrips, activeTrip, acceptTrip, startTrip, completeTrip, cancelTrip } = useTrips();

  const stats = {
    todayTrips: 12,
    todayEarnings: "340 درهم",
    rating: profile?.rating || 4.8,
    monthlyTrips: profile?.total_trips || 245,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userLocation = useMemo(() => {
    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }, [latitude, longitude]);

  const mapCenter = useMemo((): [number, number] => {
    if (latitude && longitude) {
      return [latitude, longitude];
    }
    return [33.5731, -7.5898]; // Default to Casablanca
  }, [latitude, longitude]);

  // Markers for pending trips and active trip
  const tripMarkers = useMemo(() => {
    const markers: Array<{
      id: string;
      latitude: number;
      longitude: number;
      type: "taxi" | "user" | "destination";
      label?: string;
    }> = [];

    if (activeTrip) {
      markers.push({
        id: activeTrip.id,
        latitude: Number(activeTrip.pickup_lat),
        longitude: Number(activeTrip.pickup_lng),
        type: "destination",
        label: activeTrip.pickup_address,
      });
    } else {
      pendingTrips.slice(0, 5).forEach((trip) => {
        markers.push({
          id: trip.id,
          latitude: Number(trip.pickup_lat),
          longitude: Number(trip.pickup_lng),
          type: "destination",
          label: trip.pickup_address,
        });
      });
    }

    return markers;
  }, [pendingTrips, activeTrip]);

  const handleAcceptTrip = async (tripId: string) => {
    await acceptTrip(tripId);
  };

  const handleStartTrip = async () => {
    if (activeTrip) {
      await startTrip(activeTrip.id);
    }
  };

  const handleCompleteTrip = async () => {
    if (activeTrip) {
      await completeTrip(activeTrip.id);
    }
  };

  const handleCancelTrip = async () => {
    if (activeTrip) {
      await cancelTrip(activeTrip.id);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "اذهب لاستلام الزبون";
      case "in_progress":
        return "الرحلة جارية";
      default:
        return status;
    }
  };

  if (activeTab === "map") {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Map View */}
        <div className="h-[calc(100vh-80px)] relative">
          <LeafletMap
            center={mapCenter}
            zoom={15}
            markers={tripMarkers}
            userLocation={userLocation}
            className="w-full h-full"
          />

          {/* Back button */}
          <button 
            onClick={() => setActiveTab("home")}
            className="absolute top-4 right-4 z-[1000] w-12 h-12 bg-card rounded-full shadow-card flex items-center justify-center"
          >
            <Navigation className="w-5 h-5 text-primary" />
          </button>

          {/* My Location Button */}
          <button 
            onClick={refresh}
            className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-card rounded-full shadow-card flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Locate className={`w-5 h-5 text-accent ${loading ? "animate-pulse" : ""}`} />
          </button>

          {/* Online status */}
          <div className="absolute top-4 left-4 z-[1000] bg-card rounded-full shadow-card px-4 py-2 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
            <span className="text-sm font-medium">{isOnline ? "متصل" : "غير متصل"}</span>
          </div>

          {/* GPS Error */}
          {error && (
            <div className="absolute bottom-20 left-4 right-4 z-[1000] bg-destructive/90 text-destructive-foreground text-sm p-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="flex items-center justify-around h-16">
            <button 
              onClick={() => setActiveTab("home")}
              className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
            >
              <Car className="w-6 h-6" />
              <span className="text-xs">الرئيسية</span>
            </button>
            <button 
              onClick={() => setActiveTab("map")}
              className="flex flex-col items-center gap-1 p-2 text-primary"
            >
              <Navigation className="w-6 h-6" />
              <span className="text-xs">الخريطة</span>
            </button>
            <button 
              onClick={() => setActiveTab("wallet")}
              className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
            >
              <Wallet className="w-6 h-6" />
              <span className="text-xs">المحفظة</span>
            </button>
            <button 
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xs">خروج</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-bold">{profile?.full_name || "سائق"}</div>
              <div className="text-sm text-secondary-foreground/70">{profile?.taxi_number || "A-XXXX"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-6 h-6" />
              {pendingTrips.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs text-destructive-foreground">
                  {pendingTrips.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Online Toggle */}
        <div className="flex items-center justify-between bg-secondary-foreground/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
            <span className="font-medium">{isOnline ? "متصل - جاهز للطلبات" : "غير متصل"}</span>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`w-14 h-8 rounded-full transition-colors ${isOnline ? "bg-accent" : "bg-muted"} relative`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isOnline ? "right-1" : "left-1"}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Active Trip Card */}
        {activeTrip && (
          <div className="bg-accent/10 border-2 border-accent rounded-2xl p-4 mb-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
              <span className="font-bold text-accent">{getStatusText(activeTrip.status)}</span>
            </div>

            <div className="bg-card rounded-xl p-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                  <div className="w-0.5 h-8 bg-border" />
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground">موقع الزبون</div>
                    <div className="font-medium">{activeTrip.pickup_address}</div>
                  </div>
                  {activeTrip.dropoff_address && (
                    <div>
                      <div className="text-xs text-muted-foreground">الوجهة</div>
                      <div className="font-medium">{activeTrip.dropoff_address}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {activeTrip.status === "accepted" && (
                <>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleCancelTrip}
                  >
                    <XCircle className="w-5 h-5 ml-2" />
                    إلغاء
                  </Button>
                  <Button 
                    variant="accent" 
                    size="lg" 
                    className="flex-1"
                    onClick={handleStartTrip}
                  >
                    <Play className="w-5 h-5 ml-2" />
                    بدء الرحلة
                  </Button>
                </>
              )}
              {activeTrip.status === "in_progress" && (
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  onClick={handleCompleteTrip}
                >
                  <Flag className="w-5 h-5 ml-2" />
                  إنهاء الرحلة
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Car className="w-4 h-4" />
              <span className="text-sm">رحلات اليوم</span>
            </div>
            <div className="text-2xl font-bold">{stats.todayTrips}</div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">أرباح اليوم</span>
            </div>
            <div className="text-2xl font-bold text-accent">{stats.todayEarnings}</div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="w-4 h-4" />
              <span className="text-sm">التقييم</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.rating}</div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">هذا الشهر</span>
            </div>
            <div className="text-2xl font-bold">{stats.monthlyTrips}</div>
          </div>
        </div>

        {/* Pending Requests */}
        {!activeTrip && isOnline && pendingTrips.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-lg">طلبات جديدة ({pendingTrips.length})</h3>
            {pendingTrips.map((trip) => (
              <div 
                key={trip.id}
                className="bg-primary/10 border-2 border-primary rounded-2xl p-4 animate-scale-in"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
                  <span className="font-bold text-primary">طلب جديد!</span>
                </div>

                <div className="bg-card rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-accent rounded-full" />
                      <div className="w-0.5 h-8 bg-border" />
                      <div className="w-3 h-3 bg-primary rounded-full" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="text-xs text-muted-foreground">موقع الزبون</div>
                        <div className="font-medium">{trip.pickup_address}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">الوقت</div>
                        <div className="font-medium text-accent">
                          {new Date(trip.created_at).toLocaleTimeString("ar-MA")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="w-5 h-5 ml-2" />
                    رفض
                  </Button>
                  <Button 
                    variant="accent" 
                    size="lg" 
                    className="flex-1"
                    onClick={() => handleAcceptTrip(trip.id)}
                  >
                    <CheckCircle className="w-5 h-5 ml-2" />
                    قبول
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Requests Message */}
        {!activeTrip && isOnline && pendingTrips.length === 0 && (
          <div className="bg-muted/50 rounded-2xl p-6 text-center mb-6">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
            <p className="text-sm text-muted-foreground">انتظر قليلاً، ستصلك الطلبات قريباً</p>
          </div>
        )}

        {/* Wallet Section */}
        <div className="bg-gradient-to-br from-secondary to-taxi-navy-light text-secondary-foreground rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">المحفظة</span>
            </div>
            <Link to="/driver/wallet" className="text-sm text-primary">التفاصيل ←</Link>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-secondary-foreground/70 mb-1">المستحقات الشهرية</div>
            <div className="text-3xl font-bold">345 درهم</div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-secondary-foreground/70">الاشتراك</div>
              <div className="font-medium">100 درهم</div>
            </div>
            <div className="text-center">
              <div className="text-secondary-foreground/70">العمليات</div>
              <div className="font-medium">245 × 1 درهم</div>
            </div>
            <div className="text-left">
              <div className="text-secondary-foreground/70">الحالة</div>
              <div className="font-medium text-accent">{profile?.is_active ? "مفعّل" : "غير مفعّل"}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">الإحصائيات</span>
          </button>
          <Link to="/history" className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">السجل</span>
          </Link>
          <Link to="/about" className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
              <Info className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-xs text-muted-foreground">حول</span>
          </Link>
          <button className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">الإعدادات</span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "home" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Car className="w-6 h-6" />
            <span className="text-xs">الرئيسية</span>
          </button>
          <button 
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "map" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Navigation className="w-6 h-6" />
            <span className="text-xs">الخريطة</span>
          </button>
          <button 
            onClick={() => setActiveTab("wallet")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "wallet" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Wallet className="w-6 h-6" />
            <span className="text-xs">المحفظة</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs">خروج</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DriverApp;
