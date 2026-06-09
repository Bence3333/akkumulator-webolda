import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Loader2, Search, Map, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AddressMapPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

interface SearchResult {
  place_name: string;
  center: [number, number];
}

const AddressMapPicker = ({
  address,
  onAddressChange,
  onCoordinatesChange,
}: AddressMapPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<"map" | "manual">("map");
  const [manualAddress, setManualAddress] = useState("");
  const mapInitialized = useRef(false);
  
  // Store callbacks in refs to avoid re-initializing the map
  const onAddressChangeRef = useRef(onAddressChange);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);
  
  // Keep refs updated
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onAddressChange, onCoordinatesChange]);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError("Mapbox token nem érhető el");
        }
      } catch (err) {
        console.error("Error fetching Mapbox token:", err);
        setError("Nem sikerült betölteni a térképet");
      }
    };
    fetchToken();
  }, []);

  // Update marker position
  const updateMarker = useCallback((lng: number, lat: number) => {
    if (!map.current) return;
    
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
  }, []);

  // Initialize map - only once when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapInitialized.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [19.0402, 47.4979], // Budapest
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker on click
    map.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      
      updateMarker(lng, lat);
      onCoordinatesChangeRef.current(lat, lng);

      // Reverse geocoding
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=hu`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const placeName = data.features[0].place_name;
          onAddressChangeRef.current(placeName);
          setSearchQuery(placeName);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    });

    map.current.on("load", () => {
      setLoading(false);
      mapInitialized.current = true;
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitialized.current = false;
      }
    };
  }, [mapboxToken, updateMarker]);

  // Search for addresses - only when user is typing in search
  useEffect(() => {
    if (!mapboxToken || !searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Don't search if the query matches the current address (user selected from dropdown)
    if (searchQuery === address) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&country=hu&language=hu&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setSearchResults(data.features.map((f: any) => ({
            place_name: f.place_name,
            center: f.center,
          })));
          setShowResults(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, mapboxToken, address]);

  // Select a search result
  const handleSelectResult = (result: SearchResult) => {
    const [lng, lat] = result.center;
    
    setSearchQuery(result.place_name);
    onAddressChange(result.place_name);
    onCoordinatesChange(lat, lng);
    setShowResults(false);
    setSearchResults([]);

    if (map.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 16 });
      updateMarker(lng, lat);
    }
  };

  // Handle manual address save
  const handleManualAddressSave = () => {
    if (manualAddress.trim()) {
      onAddressChange(manualAddress.trim());
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowResults(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-card border border-border flex items-center justify-center rounded-lg">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Adja meg a címet manuálisan</label>
          <Input
            type="text"
            value={manualAddress}
            onChange={(e) => {
              setManualAddress(e.target.value);
              onAddressChange(e.target.value);
            }}
            placeholder="1234 Budapest, Példa utca 1."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "map" | "manual")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Térkép
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            Manuális
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4 mt-4">
          {/* Search input */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Keresse meg a címet..."
                className="pl-10 pr-10"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                  >
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{result.place_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative">
            <div
              ref={mapContainer}
              className="aspect-video bg-card border border-border rounded-lg overflow-hidden"
            />
            {loading && (
              <div className="absolute inset-0 bg-card/80 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Keresse meg a címet a keresővel, vagy kattintson a térképre a pontos hely kiválasztásához
          </p>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cím</label>
            <Input
              type="text"
              value={manualAddress || address}
              onChange={(e) => {
                setManualAddress(e.target.value);
                onAddressChange(e.target.value);
              }}
              placeholder="1234 Budapest, Példa utca 1."
              className="text-lg py-6"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Adja meg a telepítés pontos címét
          </p>
        </TabsContent>
      </Tabs>

      {/* Selected address display */}
      {address && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-2 text-primary mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Kiválasztott cím</span>
          </div>
          <p className="text-foreground">{address}</p>
        </div>
      )}
    </div>
  );
};

export default AddressMapPicker;
