// Geocoding service using Nominatim (OpenStreetMap) - Free and no API key required

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  addressType?: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
}

interface ReverseGeocodingResult {
  displayName: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

// Convert address text to GPS coordinates
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          "User-Agent": "Taxicity App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data: NominatimResponse[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      addressType: data[0].type,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Convert GPS coordinates to address (reverse geocoding)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodingResult | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "Taxicity App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding request failed");
    }

    const data = await response.json();

    return {
      displayName: data.display_name,
      address: {
        road: data.address?.road,
        suburb: data.address?.suburb,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
      },
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Search for places with autocomplete
export const searchPlaces = async (
  query: string,
  limit: number = 5
): Promise<GeocodingResult[]> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}`,
      {
        headers: {
          "User-Agent": "Taxicity App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const data: NominatimResponse[] = await response.json();

    return data.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      addressType: item.type,
    }));
  } catch (error) {
    console.error("Place search error:", error);
    return [];
  }
};

// Format address for display (shorter version)
export const formatAddress = (displayName: string): string => {
  const parts = displayName.split(",").slice(0, 3);
  return parts.join("،").trim();
};
