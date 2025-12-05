import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Search, 
  Star, 
  MessageCircle, 
  Phone, 
  Clock, 
  Navigation,
  Menu,
  X,
  User,
  Car,
  History,
  HelpCircle,
  LogOut,
  Locate,
  Loader2,
  DollarSign,
  Route,
  Timer
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LeafletMap from "@/components/map/LeafletMap";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useTrips } from "@/hooks/useTrips";
import { calculatePriceEstimate, formatPrice, type PriceEstimate } from "@/lib/priceCalculator";

const ClientApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showPriceEstimate, setShowPriceEstimate] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
  
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, loading: gpsLoading, error: gpsError, refresh } = useGeoLocation();
  const { activeTrip, createTrip, cancelTrip, loading: tripsLoading } = useTrips();

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
    return [33.3152, 44.3661]; // Default to Baghdad
  }, [latitude, longitude]);

  // Map markers for pickup and dropoff
  const markers = useMemo(() => {
    const m: Array<{
      id: string;
      latitude: number;
      longitude: number;
      type: "taxi" | "user" | "destination";
      label?: string;
    }> = [];
    
    if (dropoffCoords) {
      m.push({
        id: "dropoff",
        latitude: dropoffCoords.lat,
        longitude: dropoffCoords.lng,
        type: "destination",
        label: dropoffAddress || "الوجهة",
      });
    }
    
    return m;
  }, [dropoffCoords, dropoffAddress]);

  // Calculate price estimate when dropoff is set
  useEffect(() => {
    if (latitude && longitude && dropoffCoords) {
      const estimate = calculatePriceEstimate(
        latitude,
        longitude,
        dropoffCoords.lat,
        dropoffCoords.lng
      );
      setPriceEstimate(estimate);
      setShowPriceEstimate(true);
    } else {
      setPriceEstimate(null);
      setShowPriceEstimate(false);
    }
  }, [latitude, longitude, dropoffCoords]);

  // Simulate setting dropoff coords when address is entered
  // In a real app, you would use a geocoding API
  const handleDropoffSearch = () => {
    if (dropoffAddress && latitude && longitude) {
      // Simulate a dropoff location ~3-8 km away
      const randomOffset = () => (Math.random() - 0.5) * 0.1;
      setDropoffCoords({
        lat: latitude + randomOffset(),
        lng: longitude + randomOffset(),
      });
    }
  };

  const handleBookTaxi = async () => {
    if (!latitude || !longitude) {
      return;
    }

    setIsBooking(true);
    const trip = await createTrip({
      pickup_address: pickupAddress || "موقعي الحالي",
      pickup_lat: latitude,
      pickup_lng: longitude,
      dropoff_address: dropoffAddress || undefined,
      dropoff_lat: dropoffCoords?.lat,
      dropoff_lng: dropoffCoords?.lng,
      estimated_price: priceEstimate?.totalFare,
      distance_km: priceEstimate?.distanceKm,
    });
    setIsBooking(false);

    if (trip) {
      setPickupAddress("");
      setDropoffAddress("");
      setDropoffCoords(null);
      setShowPriceEstimate(false);
    }
  };

  const handleCancelTrip = async () => {
    if (activeTrip) {
      await cancelTrip(activeTrip.id);
    }
  };

  const clearDropoff = () => {
    setDropoffAddress("");
    setDropoffCoords(null);
    setShowPriceEstimate(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "جاري البحث عن سائق...";
      case "accepted":
        return "السائق في الطريق إليك";
      case "in_progress":
        return "الرحلة جارية";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-primary";
      case "accepted":
        return "bg-accent";
      case "in_progress":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={() => setIsMenuOpen(true)} className="p-2">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Taxicity</span>
          </Link>

          <button className="p-2">
            <User className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-2xl animate-slide-left">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{profile?.full_name || "مستخدم"}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <Link to="/history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <History className="w-5 h-5 text-muted-foreground" />
                <span>سجل الرحلات</span>
              </Link>
              <Link to="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>حول التطبيق</span>
              </Link>
              <div className="border-t border-border my-4" />
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-destructive w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Map Area */}
      <div className="pt-16 h-[55vh] relative">
        <LeafletMap
          center={mapCenter}
          zoom={15}
          markers={markers}
          userLocation={userLocation}
          className="w-full h-full"
        />

        {/* Search Bars */}
        <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
          {/* Pickup */}
          <div className="bg-card rounded-2xl shadow-card p-3 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <input 
              type="text" 
              placeholder="موقع الانطلاق (موقعك الحالي)" 
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Navigation className="w-4 h-4 text-accent" />
          </div>
          
          {/* Dropoff */}
          <div className="bg-card rounded-2xl shadow-card p-3 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <input 
              type="text" 
              placeholder="إلى أين تريد الذهاب؟" 
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              onBlur={handleDropoffSearch}
              onKeyDown={(e) => e.key === "Enter" && handleDropoffSearch()}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            {dropoffCoords ? (
              <button onClick={clearDropoff} className="p-1">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* My Location Button */}
        <button 
          onClick={refresh}
          className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-card rounded-full shadow-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Locate className={`w-5 h-5 text-accent ${gpsLoading ? "animate-pulse" : ""}`} />
        </button>

        {/* GPS Status */}
        {gpsError && (
          <div className="absolute bottom-4 left-4 right-20 z-[1000] bg-destructive/90 text-destructive-foreground text-sm p-3 rounded-xl">
            {gpsError}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl -mt-8 relative z-10 shadow-card min-h-[45vh]">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 mb-4" />
        
        <div className="px-4 pb-8">
          {/* Active Trip Status */}
          {activeTrip ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(activeTrip.status)}`} />
                <h2 className="text-lg font-bold">{getStatusText(activeTrip.status)}</h2>
              </div>

              {/* Trip Details */}
              <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-accent rounded-full" />
                    <div className="w-0.5 h-8 bg-border" />
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground">موقع الانطلاق</div>
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

                {/* Estimated Price Display */}
                {activeTrip.estimated_price && (
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">السعر التقديري</span>
                    <span className="font-bold text-primary">{formatPrice(Number(activeTrip.estimated_price))}</span>
                  </div>
                )}
              </div>

              {/* Driver Info (when accepted) */}
              {activeTrip.status !== "pending" && (
                <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚕</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">السائق في الطريق</div>
                      <div className="text-sm text-muted-foreground">سيصل خلال دقائق</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel Button (only for pending/accepted) */}
              {(activeTrip.status === "pending" || activeTrip.status === "accepted") && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleCancelTrip}
                >
                  إلغاء الرحلة
                </Button>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-4">احجز طاكسي الآن</h2>
              
              {/* Price Estimate Card */}
              {showPriceEstimate && priceEstimate && (
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 mb-4 animate-scale-in">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="font-semibold">تقدير السعر</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-card/50 rounded-xl p-3 text-center">
                      <Route className="w-5 h-5 text-accent mx-auto mb-1" />
                      <div className="text-lg font-bold">{priceEstimate.distanceKm}</div>
                      <div className="text-xs text-muted-foreground">كم</div>
                    </div>
                    <div className="bg-card/50 rounded-xl p-3 text-center">
                      <Timer className="w-5 h-5 text-accent mx-auto mb-1" />
                      <div className="text-lg font-bold">{priceEstimate.estimatedMinutes}</div>
                      <div className="text-xs text-muted-foreground">دقيقة</div>
                    </div>
                    <div className="bg-primary/20 rounded-xl p-3 text-center">
                      <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                      <div className="text-lg font-bold text-primary">{priceEstimate.totalFare.toLocaleString('ar-IQ')}</div>
                      <div className="text-xs text-muted-foreground">د.ع</div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm border-t border-border/50 pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">أجرة البدء</span>
                      <span>{formatPrice(priceEstimate.baseFare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">أجرة المسافة ({priceEstimate.distanceKm} كم)</span>
                      <span>{formatPrice(priceEstimate.distanceFare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">أجرة الوقت (~{priceEstimate.estimatedMinutes} د)</span>
                      <span>{formatPrice(priceEstimate.timeFare)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-border/50">
                      <span>الإجمالي التقديري</span>
                      <span className="text-primary">{formatPrice(priceEstimate.totalFare)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    * السعر النهائي قد يختلف حسب حركة المرور والمسار الفعلي
                  </p>
                </div>
              )}

              {/* Location Info */}
              {!showPriceEstimate && (
                <div className="bg-muted/50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">موقعك الحالي</div>
                      <div className="font-medium">
                        {gpsLoading ? "جاري تحديد الموقع..." : 
                         gpsError ? "تعذر تحديد الموقع" : 
                         "تم تحديد موقعك"}
                      </div>
                    </div>
                    {latitude && longitude && (
                      <div className="text-xs text-muted-foreground">
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {!showPriceEstimate && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-primary/10 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs">وصول سريع</div>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-3 text-center">
                    <Star className="w-5 h-5 text-accent mx-auto mb-1" />
                    <div className="text-xs">سائقين موثوقين</div>
                  </div>
                  <div className="bg-secondary/20 rounded-xl p-3 text-center">
                    <Car className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <div className="text-xs">أسعار منافسة</div>
                  </div>
                </div>
              )}

              {/* Instruction text */}
              {!showPriceEstimate && !dropoffAddress && (
                <p className="text-sm text-muted-foreground text-center mb-4">
                  أدخل وجهتك لمعرفة السعر التقديري
                </p>
              )}

              {/* Book Button */}
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full"
                onClick={handleBookTaxi}
                disabled={!latitude || !longitude || isBooking || gpsLoading}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري الحجز...
                  </>
                ) : showPriceEstimate ? (
                  <>
                    تأكيد الحجز - {formatPrice(priceEstimate?.totalFare || 0)}
                  </>
                ) : (
                  "احجز طاكسي الآن"
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientApp;
