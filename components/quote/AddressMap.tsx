import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  address: string;
  lat?: number;
  lng?: number;
  onAddressChange: (address: string, lat?: number, lng?: number) => void;
}

const AddressMap = ({ address, lat, lng, onAddressChange }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch the mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`
        );
        if (response.ok) {
          const data = await response.json();
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error("Failed to fetch mapbox token:", error);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const initialCenter: [number, number] = [lng || 19.0402, lat || 47.4979]; // Budapest default

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: lat && lng ? 15 : 7,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: "hsl(var(--primary))",
    })
      .setLngLat(initialCenter)
      .addTo(map.current);

    // Handle marker drag
    marker.current.on("dragend", async () => {
      if (!marker.current || !mapboxToken) return;
      const lngLat = marker.current.getLngLat();
      
      // Reverse geocode
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxToken}&country=HU&language=hu`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const newAddress = data.features[0].place_name;
          setSearchQuery(newAddress);
          onAddressChange(newAddress, lngLat.lat, lngLat.lng);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    });

    // Handle map click
    map.current.on("click", async (e) => {
      if (!marker.current || !mapboxToken) return;
      marker.current.setLngLat(e.lngLat);

      // Reverse geocode
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng},${e.lngLat.lat}.json?access_token=${mapboxToken}&country=HU&language=hu`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const newAddress = data.features[0].place_name;
          setSearchQuery(newAddress);
          onAddressChange(newAddress, e.lngLat.lat, e.lngLat.lng);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Search for addresses
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3 || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery
          )}.json?access_token=${mapboxToken}&country=HU&language=hu&types=address,place,locality`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Geocoding failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, mapboxToken]);

  const selectSuggestion = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    onAddressChange(suggestion.place_name, lat, lng);

    if (map.current && marker.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 16 });
      marker.current.setLngLat([lng, lat]);
    }
  };

  if (!mapboxToken) {
    return (
      <div className="h-80 rounded-xl border border-border bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Keresés címre..."
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}

        {suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-sm">{suggestion.place_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={mapContainer}
        className="h-80 rounded-xl overflow-hidden border border-border"
      />
      
      <p className="text-xs text-muted-foreground text-center">
        Kattintson a térképre vagy húzza a jelölőt a pontos cím kiválasztásához
      </p>
    </div>
  );
};

export default AddressMap;
