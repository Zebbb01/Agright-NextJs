// src/hooks/map/useLocations.ts
import { useState, useEffect } from "react";

interface LocationData {
  id: number;
  latitude: number;
  longitude: number;
  farmName: string;
  terrain: string;
  typeOfDisease: string;
  blocks: string[];
  image: string; // URL of the image
}

export function useLocations() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        const response = await fetch("/api/routes/map"); // Your API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LocationData[] = await response.json();
        setLocations(data);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch locations:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  return { locations, loading, error };
}