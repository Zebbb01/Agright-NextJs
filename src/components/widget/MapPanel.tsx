// src/components/widget/MapPanel.tsx
"use client";
import { GoogleMap, Marker, MarkerClusterer } from "@react-google-maps/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocations } from "@/hooks/map/useLocations";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 7.081125,
  lng: 125.610725,
};

export default function MapPanel() {
  const { locations, loading, error } = useLocations();
  const [selected, setSelected] = useState<number | null>(null);

  const selectedLocation = locations.find((loc) => loc.id === selected);

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading map data...</div>;
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
      {" "}
      {/* Ensure full width for responsiveness */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          // You can customize the map style here for dark mode if needed
          // For example, using a custom map ID or adjusting default styles
          // styles: [
          //   { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          //   { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          //   { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          //   // ... more styles for dark mode map appearance
          // ]
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
                    url: location.image,
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
            initial={{ x: "100%" }} // Starts off-screen to the right
            animate={{ x: "0%" }} // Slides in to its natural position
            exit={{ x: "100%" }} // Slides out to the right when unmounted
            transition={{ duration: 0.2, ease: "easeOut" }} // Controls animation speed and easing
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
                  src={selectedLocation.image}
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
