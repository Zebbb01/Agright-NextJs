// src/components/widget/MapPanel.tsx
"use client";
import { GoogleMap, Marker, MarkerClusterer } from "@react-google-maps/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocations } from "@/hooks/map/useLocations";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../ui/spinner";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 7.081125, // Current location is Davao City, Davao Region, Philippines.
  lng: 125.610725, // Current location is Davao City, Davao Region, Philippines.
};

export default function MapPanel() {
  const { locations, loading, error } = useLocations();
  const [selected, setSelected] = useState<number | null>(null);

  const selectedLocation = locations.find((loc) => loc.id === selected);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-lg mt-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative flex h-[80vh] w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={{
                    // Apply Cloudinary transformations for the marker icon
                    url: location.image.replace(
                      "/upload/",
                      "/upload/f_auto,q_auto,w_50,h_50,c_fill/"
                    ),
                    scaledSize: new window.google.maps.Size(50, 50),
                  }}
                  clusterer={clusterer}
                  onClick={() => setSelected(location.id)}
                />
              ))}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-0 right-0 h-full w-full sm:w-[350px] bg-card text-card-foreground shadow-lg p-4 overflow-y-auto z-10"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 bg-background hover:bg-muted rounded-full p-1 shadow-sm border border-border transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-foreground" />
            </button>

            <Card className="border-none shadow-none mt-8 bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-2xl font-bold pr-8">
                  {selectedLocation.farmName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  // Apply Cloudinary transformations for the main image
                  src={selectedLocation.image.replace(
                    "/upload/",
                    "/upload/f_auto,q_auto,w_400,h_200,c_fill/"
                  )}
                  alt={selectedLocation.farmName}
                  className="w-full h-40 object-cover rounded-md"
                />
                <p className="text-base">
                  <strong>Terrain:</strong> {selectedLocation.terrain}
                </p>
                <p className="text-base">
                  <strong>Type of Disease:</strong>{" "}
                  {selectedLocation.typeOfDisease}
                </p>
                <p className="text-base">
                  <strong>Location:</strong> {selectedLocation.latitude},{" "}
                  {selectedLocation.longitude}
                </p>
                <p className="text-base">
                  <strong>Blocks:</strong> {selectedLocation.blocks.join(", ")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
