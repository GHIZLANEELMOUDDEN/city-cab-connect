import { useState, useMemo } from "react";
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
  Locate
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LeafletMap from "@/components/map/LeafletMap";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const nearbyTaxis = [
  { id: 1, name: "محمد أمين", rating: 4.9, distance: "2 دقائق", taxiNumber: "A-1234", trips: 1520, lat: 33.5751, lng: -7.5878 },
  { id: 2, name: "كريم الحسني", rating: 4.7, distance: "4 دقائق", taxiNumber: "B-5678", trips: 890, lat: 33.5711, lng: -7.5918 },
  { id: 3, name: "عبد الله", rating: 4.8, distance: "5 دقائق", taxiNumber: "C-9012", trips: 2100, lat: 33.5771, lng: -7.5858 },
];

const ClientApp = () => {
  const [selectedTaxi, setSelectedTaxi] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, loading, error, refresh } = useGeoLocation();

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

  const taxiMarkers = useMemo(() => {
    return nearbyTaxis.map((taxi) => ({
      id: taxi.id,
      latitude: taxi.lat,
      longitude: taxi.lng,
      type: "taxi" as const,
      label: `${taxi.name} - ${taxi.taxiNumber}`,
    }));
  }, []);

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
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <History className="w-5 h-5 text-muted-foreground" />
                <span>سجل الرحلات</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span>الأشياء المفقودة</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>المساعدة</span>
              </a>
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
      <div className="pt-16 h-[60vh] relative">
        <LeafletMap
          center={mapCenter}
          zoom={15}
          markers={taxiMarkers}
          userLocation={userLocation}
          className="w-full h-full"
        />

        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <input 
              type="text" 
              placeholder="إلى أين تريد الذهاب؟" 
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* My Location Button */}
        <button 
          onClick={refresh}
          className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-card rounded-full shadow-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Locate className={`w-5 h-5 text-accent ${loading ? "animate-pulse" : ""}`} />
        </button>

        {/* GPS Status */}
        {error && (
          <div className="absolute bottom-4 left-4 right-20 z-[1000] bg-destructive/90 text-destructive-foreground text-sm p-3 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Bottom Sheet - Nearby Taxis */}
      <div className="bg-card rounded-t-3xl -mt-8 relative z-10 shadow-card min-h-[40vh]">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 mb-4" />
        
        <div className="px-4 pb-8">
          <h2 className="text-lg font-bold mb-4">الطاكسيات القريبة منك</h2>
          
          <div className="space-y-3">
            {nearbyTaxis.map((taxi) => (
              <div 
                key={taxi.id}
                onClick={() => setSelectedTaxi(taxi.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedTaxi === taxi.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚕</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{taxi.name}</span>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-primary" />
                        <span className="font-medium">{taxi.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>رقم: {taxi.taxiNumber}</span>
                      <span>•</span>
                      <span>{taxi.trips} رحلة</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{taxi.distance}</span>
                  </div>
                  
                  {selectedTaxi === taxi.id && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Phone className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedTaxi && (
            <Button variant="hero" size="xl" className="w-full mt-6">
              احجز الآن
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientApp;
