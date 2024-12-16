import { useState, useCallback } from "react";
import { ClockInLocation } from "../types";
import { getCurrentPosition, getAddressFromLocation } from "../utils/locationUtils";

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<ClockInLocation | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const position = await getCurrentPosition();
      const location: ClockInLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      
      try {
        const address = await getAddressFromLocation(location.latitude, location.longitude);
        location.address = address;
      } catch (error) {
        console.warn("Failed to get address:", error);
      }
      
      setCurrentLocation(location);
      return location;
    } catch (error: any) {
      let errorMessage = "获取位置信息失败";
      if (error.code === 1) {
        errorMessage = "请允许访问位置信息";
      } else if (error.code === 2) {
        errorMessage = "位置信息不可用";
      } else if (error.code === 3) {
        errorMessage = "获取位置信息超时";
      }
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentLocation,
    error,
    isLoading,
    getLocation,
    clearError: () => setError("")
  };
};