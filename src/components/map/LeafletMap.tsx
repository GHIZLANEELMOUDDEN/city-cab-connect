import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: string | number;
  latitude: number;
  longitude: number;
  type: "taxi" | "user" | "destination";
  label?: string;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

// Custom taxi icon
const createTaxiIcon = () => {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-primary-foreground animate-bounce-soft">
      <span class="text-lg">🚕</span>
    </div>`,
    className: "custom-taxi-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// Custom user icon
const createUserIcon = () => {
  return L.divIcon({
    html: `<div class="relative">
      <div class="absolute -inset-4 bg-accent/30 rounded-full animate-ping"></div>
      <div class="w-6 h-6 bg-accent rounded-full border-3 border-background shadow-lg flex items-center justify-center">
        <svg class="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
      </div>
    </div>`,
    className: "custom-user-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom destination icon
const createDestinationIcon = () => {
  return L.divIcon({
    html: `<div class="w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-lg">
      <svg class="w-4 h-4 text-destructive-foreground" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>
    </div>`,
    className: "custom-destination-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const LeafletMap = ({
  center = [33.5731, -7.5898], // Default to Casablanca, Morocco
  zoom = 14,
  markers = [],
  userLocation,
  onMapClick,
  className = "",
}: LeafletMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    if (onMapClick) {
      map.on("click", (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current && isMapReady) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom, isMapReady]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      let icon: L.DivIcon;
      
      switch (markerData.type) {
        case "taxi":
          icon = createTaxiIcon();
          break;
        case "destination":
          icon = createDestinationIcon();
          break;
        default:
          icon = createUserIcon();
      }

      const marker = L.marker([markerData.latitude, markerData.longitude], { icon })
        .addTo(mapRef.current!);

      if (markerData.label) {
        marker.bindPopup(markerData.label);
      }

      markersRef.current.push(marker);
    });
  }, [markers, isMapReady]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Add new user marker
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const userIcon = createUserIcon();
      userMarkerRef.current = L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon }
      ).addTo(mapRef.current);
    }
  }, [userLocation, isMapReady]);

  // Center on user location
  const centerOnUser = () => {
    if (mapRef.current && userLocation && userLocation.latitude && userLocation.longitude) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 16);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Custom styles for markers */}
      <style>{`
        .custom-taxi-marker,
        .custom-user-marker,
        .custom-destination-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default LeafletMap;
export { LeafletMap };
