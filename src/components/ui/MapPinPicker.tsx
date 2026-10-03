import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  Crosshair, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export interface LocationDetails {
  lat: string;
  lng: string;
  venue?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  formattedAddress?: string;
}

interface MapPinPickerProps {
  latitude: string | number;
  longitude: string | number;
  onChange: (lat: string, lng: string, details?: LocationDetails) => void;
  pinLabel?: string;
  venueName?: string;
  className?: string;
}

// Official recommended Google Maps bootstrap dynamic loader
// Prevents "loaded directly without loading=async" warning (https://goo.gle/js-api-loading)
let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const w = window as any;
    w.google = w.google || {};
    const d = (w.google.maps = w.google.maps || {});
    const r = new Set<string>(['maps', 'marker', 'places', 'geocoding']);
    const e = new URLSearchParams();

    let h: Promise<void> | null = null;
    const u = () =>
      h ||
      (h = new Promise<void>((f, n) => {
        const existing = document.getElementById('google-maps-api-script') as HTMLScriptElement | null;
        if (existing) {
          f();
          resolve();
          return;
        }

        const a = document.createElement('script');
        a.id = 'google-maps-api-script';
        e.set('libraries', [...r].join(','));
        e.set('key', apiKey);
        e.set('v', 'weekly');
        e.set('loading', 'async');
        e.set('callback', 'google.maps.__ib__');
        a.src = `https://maps.googleapis.com/maps/api/js?` + e.toString();
        a.async = true;

        d.__ib__ = () => {
          f();
          resolve();
        };

        a.onerror = () => {
          googleMapsPromise = null;
          n(new Error('Google Maps could not load'));
          reject(new Error('Google Maps could not load'));
        };

        document.head.append(a);
      }));

    d.importLibrary = (f: string, ..._n: any[]) => {
      r.add(f);
      return u().then(() => d.importLibrary(f, ..._n));
    };

    // Preload required libraries
    Promise.all([
      d.importLibrary('maps'),
      d.importLibrary('marker'),
      d.importLibrary('places'),
      d.importLibrary('geocoding'),
    ])
      .then(() => resolve())
      .catch((err) => {
        googleMapsPromise = null;
        reject(err);
      });
  });

  return googleMapsPromise;
}

export const MapPinPicker: React.FC<MapPinPickerProps> = ({
  latitude,
  longitude,
  onChange,
  pinLabel = 'Event Entrance',
  venueName = 'Arena Marker',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const pinElementRef = useRef<HTMLImageElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isDragging, setIsDragging] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [lastResolvedLocation, setLastResolvedLocation] = useState<LocationDetails | null>(null);

  // Default coordinates (Lagos, Nigeria)
  const parsedLat = parseFloat(String(latitude)) || 6.4253;
  const parsedLng = parseFloat(String(longitude)) || 3.4219;

  // Active API Key (from env or official key)
  const googleApiKey = 
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 
    'AIzaSyCv17bAH3bdwMWeXJ-QfqkXLwv85GE0cRc';

  // Trigger bounce animation on pin
  const triggerPinBounce = useCallback(() => {
    if (pinElementRef.current) {
      const el = pinElementRef.current;
      el.classList.remove('pin-dropped-anim');
      void el.offsetWidth;
      el.classList.add('pin-dropped-anim');
      setTimeout(() => el.classList.remove('pin-dropped-anim'), 600);
    } else if (markerRef.current && 'setAnimation' in markerRef.current && window.google?.maps?.Animation) {
      (markerRef.current as google.maps.Marker).setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => (markerRef.current as google.maps.Marker).setAnimation(null), 600);
    }
  }, []);

  // Reverse Geocoding: Extracts street address and venue name (like "Crisma Hall")
  const reverseGeocode = useCallback((lat: number, lng: number): Promise<LocationDetails> => {
    return new Promise((resolve) => {
      const defaultDetails: LocationDetails = {
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
      };

      if (!window.google || !window.google.maps) {
        resolve(defaultDetails);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const primary = results[0];
          let streetNumber = '';
          let route = '';
          let locality = '';
          let adminArea = '';
          let country = '';
          let detectedVenue = '';

          const estResult = results.find((r) =>
            r.types.some((t) => [
              'establishment',
              'point_of_interest',
              'premise',
              'stadium',
              'church',
              'night_club',
              'restaurant',
              'lodging'
            ].includes(t))
          );

          let postalCode = '';

          for (const comp of primary.address_components) {
            if (comp.types.includes('street_number')) streetNumber = comp.long_name;
            if (comp.types.includes('route')) route = comp.long_name;
            if (comp.types.includes('locality')) locality = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) adminArea = comp.long_name;
            if (comp.types.includes('postal_code')) postalCode = comp.long_name;
            if (comp.types.includes('country')) country = comp.long_name;
          }

          if (estResult) {
            for (const comp of estResult.address_components) {
              if (comp.types.some((t) => ['point_of_interest', 'establishment', 'premise'].includes(t))) {
                if (comp.long_name !== route && comp.long_name !== locality) {
                  detectedVenue = comp.long_name;
                  break;
                }
              }
            }
          }

          const parts = primary.formatted_address.split(', ');
          if (!detectedVenue && parts.length > 2) {
            const firstChunk = parts[0].trim();
            const lowerChunk = firstChunk.toLowerCase();
            const isStreetSuffix = lowerChunk.includes('street') || 
                                   lowerChunk.includes('road') || 
                                   lowerChunk.includes('close') || 
                                   lowerChunk.includes('crescent') || 
                                   lowerChunk.includes('avenue') || 
                                   lowerChunk.includes('expressway') || 
                                   lowerChunk.includes('boulevard') || 
                                   lowerChunk.includes('way');
            if (firstChunk !== route && !/^\d+$/.test(firstChunk) && !isStreetSuffix) {
              detectedVenue = firstChunk;
            }
          }

          let streetAddress = '';
          if (streetNumber && route) {
            streetAddress = `${streetNumber} ${route}`;
          } else if (route) {
            streetAddress = route;
          } else if (parts[0] && parts[0] !== detectedVenue) {
            streetAddress = parts[0];
          }

          // Use PlacesService nearbySearch to pinpoint venue/hall name (e.g. Crisma Hall)
          if (mapInstanceRef.current && window.google.maps.places) {
            try {
              const placesService = new window.google.maps.places.PlacesService(mapInstanceRef.current);
              placesService.nearbySearch(
                {
                  location: { lat, lng },
                  radius: 50,
                },
                (places, pStatus) => {
                  if (pStatus === window.google.maps.places.PlacesServiceStatus.OK && places && places.length > 0) {
                    const bestPlace = places.find(
                      (p) =>
                        p.name &&
                        !p.types?.includes('route') &&
                        !p.types?.includes('locality') &&
                        !p.types?.includes('political')
                    );
                    if (bestPlace && bestPlace.name) {
                      detectedVenue = bestPlace.name;
                      if (bestPlace.vicinity && !streetAddress) {
                        streetAddress = bestPlace.vicinity;
                      }
                    }
                  }

                  resolve({
                    lat: lat.toFixed(6),
                    lng: lng.toFixed(6),
                    venue: detectedVenue || undefined,
                    streetAddress: streetAddress || undefined,
                    city: locality || undefined,
                    state: adminArea || undefined,
                    zipCode: postalCode || undefined,
                    country: country || undefined,
                    formattedAddress: primary.formatted_address,
                  });
                }
              );
              return;
            } catch {
              // fallback
            }
          }

          resolve({
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
            venue: detectedVenue || undefined,
            streetAddress: streetAddress || undefined,
            city: locality || undefined,
            state: adminArea || undefined,
            zipCode: postalCode || undefined,
            country: country || undefined,
            formattedAddress: primary.formatted_address,
          });
        } else {
          // OpenStreetMap Nominatim fallback
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then((r) => r.json())
            .then((data) => {
              if (data && data.address) {
                const a = data.address;
                const v = a.amenity || a.building || a.leisure || a.tourism || a.office || data.name || undefined;
                const s = a.road ? (a.house_number ? `${a.house_number} ${a.road}` : a.road) : undefined;
                resolve({
                  lat: lat.toFixed(6),
                  lng: lng.toFixed(6),
                  venue: v,
                  streetAddress: s,
                  city: a.city || a.town || a.suburb || undefined,
                  state: a.state || undefined,
                  zipCode: a.postcode || undefined,
                  country: a.country || undefined,
                  formattedAddress: data.display_name,
                });
              } else {
                resolve(defaultDetails);
              }
            })
            .catch(() => resolve(defaultDetails));
        }
      });
    });
  }, []);

  // Handle location pick (click or dragend)
  const handlePinPicked = useCallback(async (newLat: number, newLng: number) => {
    setIsResolving(true);
    try {
      const details = await reverseGeocode(newLat, newLng);
      setLastResolvedLocation(details);
      onChange(newLat.toFixed(6), newLng.toFixed(6), details);
    } catch (err) {
      console.error('Error resolving location:', err);
      onChange(newLat.toFixed(6), newLng.toFixed(6));
    } finally {
      setIsResolving(false);
    }
  }, [onChange, reverseGeocode]);

  // Helper to extract lat and lng from position (supports LatLng or LatLngLiteral)
  const getCoordsFromPos = (pos: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined) => {
    if (!pos) return { lat: parsedLat, lng: parsedLng };
    const lat = typeof (pos as any).lat === 'function' ? (pos as google.maps.LatLng).lat() : (pos as google.maps.LatLngLiteral).lat;
    const lng = typeof (pos as any).lng === 'function' ? (pos as google.maps.LatLng).lng() : (pos as google.maps.LatLngLiteral).lng;
    return { lat, lng };
  };

  // Initialize Official Google Maps Instance with AdvancedMarkerElement
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || !window.google || !window.google.maps) return;

    const initialPos = { lat: parsedLat, lng: parsedLng };

    // Google Maps Canvas Options (mapId is required for AdvancedMarkerElement)
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: initialPos,
      zoom: 16,
      mapId: 'DEMO_MAP_ID', // Activates Google Maps Advanced Markers
      mapTypeId: mapStyle === 'satellite' ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      backgroundColor: '#f4f4f5',
    });

    // Create custom spotlight pin DOM element
    const pinImg = document.createElement('img');
    pinImg.src = 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png';
    pinImg.style.width = '26px';
    pinImg.style.height = '37px';
    pinImg.style.userSelect = 'none';
    pinImg.style.pointerEvents = 'auto';
    pinImg.style.cursor = 'grab';
    pinImg.draggable = false;
    pinImg.className = 'google-spotlight-advanced-pin';
    pinElementRef.current = pinImg;

    let marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;

    // Use Modern AdvancedMarkerElement (avoids google.maps.Marker deprecation)
    if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
      const advMarker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: initialPos,
        content: pinImg,
        gmpDraggable: true,
        title: pinLabel || 'Drop point - Click anywhere or drag to reposition',
      });

      advMarker.addListener('dragstart', () => {
        setIsDragging(true);
        pinImg.style.cursor = 'grabbing';
      });

      advMarker.addListener('drag', () => {
        const coords = getCoordsFromPos(advMarker.position as any);
        setLiveCoords({
          lat: coords.lat.toFixed(6),
          lng: coords.lng.toFixed(6),
        });
      });

      advMarker.addListener('dragend', () => {
        setIsDragging(false);
        pinImg.style.cursor = 'grab';
        setLiveCoords(null);
        const coords = getCoordsFromPos(advMarker.position as any);
        triggerPinBounce();
        handlePinPicked(coords.lat, coords.lng);
      });

      marker = advMarker;
    } else {
      // Legacy fallback
      const legMarker = new window.google.maps.Marker({
        position: initialPos,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: pinLabel || 'Drop point - Click anywhere or drag to reposition',
        icon: {
          url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png',
          scaledSize: new window.google.maps.Size(26, 37),
          anchor: new window.google.maps.Point(13, 37),
        },
      });

      legMarker.addListener('dragstart', () => setIsDragging(true));
      legMarker.addListener('drag', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setLiveCoords({ lat: e.latLng.lat().toFixed(6), lng: e.latLng.lng().toFixed(6) });
      });
      legMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        setIsDragging(false);
        setLiveCoords(null);
        if (!e.latLng) return;
        triggerPinBounce();
        handlePinPicked(e.latLng.lat(), e.latLng.lng());
      });

      marker = legMarker;
    }

    // Click anywhere on map to drop pin and update address + venue
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();

      if ('position' in marker) {
        marker.position = e.latLng;
      } else if ('setPosition' in marker) {
        (marker as google.maps.Marker).setPosition(e.latLng);
      }
      triggerPinBounce();
      handlePinPicked(newLat, newLng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  }, [handlePinPicked, mapStyle, parsedLat, parsedLng, pinLabel, triggerPinBounce]);

  // Load Google Maps Script with loading=async
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    loadGoogleMapsScript(googleApiKey)
      .then(() => {
        if (!isMounted) return;
        setIsLoading(false);
        setTimeout(() => {
          if (isMounted) initMap();
        }, 50);
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoading(false);
        setLoadError('Failed to load Google Maps JavaScript API. Please check network connection.');
        console.error('Google Maps loading error:', err);
      });

    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
      markerRef.current = null;
      pinElementRef.current = null;
    };
  }, [googleApiKey, initMap]);

  // Sync marker position when external coordinates update (e.g. presets or manual typing)
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current || !window.google) return;

    const marker = markerRef.current;
    let currLat = parsedLat;
    let currLng = parsedLng;

    if ('position' in marker && marker.position) {
      const coords = getCoordsFromPos(marker.position as any);
      currLat = coords.lat;
      currLng = coords.lng;
    }

    const diffLat = Math.abs(currLat - parsedLat);
    const diffLng = Math.abs(currLng - parsedLng);

    if (diffLat > 0.00001 || diffLng > 0.00001) {
      const newPos = { lat: parsedLat, lng: parsedLng };
      if ('position' in marker) {
        marker.position = newPos;
      }
      triggerPinBounce();
      mapInstanceRef.current.panTo(newPos);
    }
  }, [parsedLat, parsedLng, triggerPinBounce]);

  // Switch between Roadmap and Satellite modes
  const handleToggleMapStyle = (style: 'roadmap' | 'satellite') => {
    setMapStyle(style);
    if (!mapInstanceRef.current || !window.google) return;
    mapInstanceRef.current.setMapTypeId(
      style === 'satellite' ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom() || 16;
    mapInstanceRef.current.setZoom(currentZoom + 1);
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom() || 16;
    mapInstanceRef.current.setZoom(currentZoom - 1);
  };

  // Recenter map on pin
  const handleCenterOnPin = () => {
    if (!mapInstanceRef.current || !window.google) return;
    const pos = new window.google.maps.LatLng(parsedLat, parsedLng);
    mapInstanceRef.current.panTo(pos);
    mapInstanceRef.current.setZoom(17);
    triggerPinBounce();
  };

  // Copy GPS Coordinates
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${parsedLat}, ${parsedLng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const currentDisplayLat = liveCoords ? liveCoords.lat : parsedLat.toFixed(6);
  const currentDisplayLng = liveCoords ? liveCoords.lng : parsedLng.toFixed(6);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parsedLat},${parsedLng}`;

  const resolvedHeading = 
    lastResolvedLocation?.venue || 
    lastResolvedLocation?.streetAddress || 
    venueName || 
    pinLabel || 
    'Drop Point';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Authentic Google Maps Openhand/Closedhand and Advanced Pin Styles */}
      <style>{`
        .google-map-native-container {
          cursor: url("https://maps.gstatic.com/mapfiles/openhand_8_8.cur"), default !important;
          touch-action: none;
        }
        .google-map-native-container:active,
        .google-map-native-container.is-dragging-state {
          cursor: url("https://maps.gstatic.com/mapfiles/closedhand_8_8.cur"), grabbing, default !important;
        }
        .google-map-native-container [role="region"],
        .google-map-native-container [tabindex="0"],
        .google-map-native-container canvas {
          cursor: inherit !important;
        }
        .google-spotlight-advanced-pin {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.45));
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .google-spotlight-advanced-pin:hover {
          transform: scale(1.12) translateY(-2px);
        }
        .google-spotlight-advanced-pin:active {
          transform: scale(1.2) translateY(-6px);
        }
        @keyframes pinDropBounce {
          0% { transform: translateY(-24px) scale(1.12); opacity: 0.7; }
          45% { transform: translateY(2px) scale(0.96); opacity: 1; }
          75% { transform: translateY(-6px) scale(1.03); }
          100% { transform: translateY(0px) scale(1); }
        }
        .pin-dropped-anim {
          animation: pinDropBounce 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
        }
      `}</style>

      {/* Map Outer Canvas Frame */}
      <div 
        className={`relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm group select-none bg-zinc-100 ${
          isDragging ? 'is-dragging-state' : ''
        }`}
      >
        {/* Native Google Maps Element */}
        <div 
          ref={mapContainerRef} 
          className="google-map-native-container w-full h-full z-0"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-zinc-50 flex flex-col items-center justify-center gap-2 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#E31B23]" />
            <span className="text-xs font-bold">Loading Google Maps...</span>
          </div>
        )}

        {/* Error Fallback State */}
        {loadError && !isLoading && (
          <div className="absolute inset-0 z-30 bg-zinc-50/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#E31B23]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-800 max-w-sm">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                googleMapsPromise = null;
                initMap();
              }}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-zinc-800 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading Map</span>
            </button>
          </div>
        )}

        {/* ================= FLOATING TOP HEADER HUD ================= */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-[20] pointer-events-none">
          {/* Active Marker Status Pill */}
          <div className="bg-white/95 backdrop-blur-md border border-zinc-200/90 py-1.5 px-3 rounded-xl shadow-md flex items-center gap-2.5 pointer-events-auto">
            <div className="w-6 h-6 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#E31B23] flex-shrink-0">
              {isResolving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5 fill-red-100" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isResolving ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900 truncate max-w-[130px] sm:max-w-[200px]">
                  {isResolving ? 'Resolving Address...' : resolvedHeading}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                  ({currentDisplayLat}°, {currentDisplayLng}°)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCoords}
              className="ml-1 p-1 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-md transition-colors cursor-pointer"
              title="Copy GPS coordinates"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Interactive Drop Hint Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-md border border-white/10 pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Click or drag pin to update street & venue</span>
          </div>
        </div>

        {/* ================= FLOATING MAP CONTROLS ================= */}
        <div className="absolute right-3 bottom-3 flex flex-col items-end gap-2 z-[20] pointer-events-auto">
          {/* Style Switcher (Roadmap vs Satellite) */}
          <div className="bg-white/95 backdrop-blur-md border border-zinc-200 p-1 rounded-xl shadow-md flex items-center gap-1 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleToggleMapStyle('roadmap')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'roadmap'
                  ? 'bg-zinc-950 text-white shadow-2xs font-black'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => handleToggleMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'satellite'
                  ? 'bg-zinc-950 text-white shadow-2xs font-black'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Zoom & Recenter Controls */}
          <div className="flex flex-col bg-white/95 backdrop-blur-md border border-zinc-200 rounded-xl shadow-md overflow-hidden divide-y divide-zinc-100">
            <button
              type="button"
              onClick={handleCenterOnPin}
              title="Recenter Map on Pin"
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-[#E31B23]" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Test Directions Action Button */}
        <div className="absolute left-3 bottom-3 z-[20] pointer-events-auto">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-[11px] font-black rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Test Attendee Directions</span>
          </a>
        </div>
      </div>

      {/* Helper caption row with live detected venue/street */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-zinc-500 font-medium px-1">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 text-[#E31B23] flex-shrink-0" />
          {lastResolvedLocation?.venue || lastResolvedLocation?.streetAddress ? (
            <span className="text-zinc-800 font-bold">
              Detected: {[lastResolvedLocation.venue, lastResolvedLocation.streetAddress].filter(Boolean).join(' • ')}
            </span>
          ) : (
            <span>Pins automatically sync with Street Address, Venue Name, and attendees' tickets.</span>
          )}
        </span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`}
          target="_blank"
          rel="noreferrer"
          className="text-[#E31B23] hover:underline font-bold inline-flex items-center gap-1 flex-shrink-0"
        >
          <span>Verify on Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default MapPinPicker;
