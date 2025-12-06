import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { searchPlaces, formatAddress, type GeocodingResult } from "@/services/geocodingService";

interface AddressSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: { address: string; lat: number; lng: number }) => void;
  icon?: "pickup" | "dropoff";
  className?: string;
}

const AddressSearch = ({
  placeholder = "ابحث عن عنوان...",
  value,
  onChange,
  onSelect,
  icon = "dropoff",
  className = "",
}: AddressSearchProps) => {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(value, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setIsSearching(false);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    const shortAddress = formatAddress(result.displayName);
    onChange(shortAddress);
    onSelect({
      address: shortAddress,
      lat: result.lat,
      lng: result.lng,
    });
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="bg-card rounded-2xl shadow-card p-3 flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            icon === "pickup" ? "bg-accent" : "bg-primary"
          }`}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
          dir="rtl"
        />
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        ) : value ? (
          <button onClick={handleClear} className="p-1">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border z-50 max-h-60 overflow-y-auto">
          {suggestions.map((result, index) => (
            <button
              key={`${result.lat}-${result.lng}-${index}`}
              className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-right"
              onClick={() => handleSelect(result)}
            >
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{formatAddress(result.displayName)}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {result.displayName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;
