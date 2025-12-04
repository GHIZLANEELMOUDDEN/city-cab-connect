import { useState, useEffect, useCallback } from "react";

interface GeoLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeoLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useGeoLocation = (options: UseGeoLocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = true,
  } = options;

  const [state, setState] = useState<GeoLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = "حدث خطأ في تحديد الموقع";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "يرجى السماح بالوصول إلى موقعك";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "الموقع غير متاح حالياً";
        break;
      case error.TIMEOUT:
        errorMessage = "انتهت مهلة تحديد الموقع";
        break;
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "المتصفح لا يدعم تحديد الموقع",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "المتصفح لا يدعم تحديد الموقع",
        loading: false,
      }));
      return;
    }

    let watchId: number | null = null;

    if (watch) {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  return {
    ...state,
    refresh: getCurrentPosition,
  };
};
