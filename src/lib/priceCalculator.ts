// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Pricing configuration (Iraqi Dinar)
export const PRICING_CONFIG = {
  baseFare: 2500, // Base fare in IQD
  perKmRate: 750, // Rate per kilometer in IQD
  perMinuteRate: 100, // Rate per minute in IQD (for time estimate)
  minimumFare: 3000, // Minimum fare in IQD
  averageSpeedKmH: 30, // Average speed for time estimation
};

export interface PriceEstimate {
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
}

export function calculatePriceEstimate(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): PriceEstimate {
  const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const estimatedMinutes = Math.ceil((distanceKm / PRICING_CONFIG.averageSpeedKmH) * 60);
  
  const baseFare = PRICING_CONFIG.baseFare;
  const distanceFare = Math.round(distanceKm * PRICING_CONFIG.perKmRate);
  const timeFare = Math.round(estimatedMinutes * PRICING_CONFIG.perMinuteRate);
  
  const rawTotal = baseFare + distanceFare + timeFare;
  const totalFare = Math.max(rawTotal, PRICING_CONFIG.minimumFare);
  
  // Round to nearest 250 IQD for cleaner pricing
  const roundedTotal = Math.ceil(totalFare / 250) * 250;
  
  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    estimatedMinutes,
    baseFare,
    distanceFare,
    timeFare,
    totalFare: roundedTotal,
  };
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ar-IQ') + ' د.ع';
}
