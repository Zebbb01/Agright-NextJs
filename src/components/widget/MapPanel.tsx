// src/components/MapPanel.tsx
"use client";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import { useState } from "react";
import { locationData } from "@/data/locations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const containerStyle = {
  width: "100%",
  height: "85vh",
};

// Center map based on your region (e.g., Mindanao, Philippines)
const center = {
  lat: 7.15,
  lng: 125.09,
};

export default function MapPanel() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedLocation = locationData.find((loc) => loc.id === selected);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {locationData.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={{
                    url: location.image,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  clusterer={clusterer}
                  onClick={() => setSelected(location.id)}
                />
              ))}
            </>
          )}
        </MarkerClusterer>

        {selectedLocation && (
          <InfoWindow
            position={{
              lat: selectedLocation.latitude,
              lng: selectedLocation.longitude,
            }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="w-[280px]">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {selectedLocation.farmName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img
                    src={selectedLocation.image}
                    alt={selectedLocation.farmName}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <p className="text-sm">
                    <strong>Terrain:</strong> {selectedLocation.terrain}
                  </p>
                  <p className="text-sm">
                    <strong>Type of Disease:</strong> {selectedLocation.typeOfDisease}
                  </p>
                  <p className="text-sm">
                    <strong>Location:</strong> {selectedLocation.latitude}, {selectedLocation.longitude}
                  </p>
                  <p className="text-sm">
                    <strong>Blocks:</strong>{" "}
                    {selectedLocation.blocks.join(", ")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
