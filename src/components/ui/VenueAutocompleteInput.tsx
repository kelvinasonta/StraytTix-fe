import React, { useEffect, useRef, useState } from 'react';
import { Search, X, MapPin, Loader2, Sparkles } from 'lucide-react';

export interface SelectedPlaceDetails {
  venue: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat: string;
  lng: string;
  formattedAddress: string;
}

// Robust mapping of country names/aliases to ISO 3166-1 alpha-2 codes
export const resolveCountryIso = (input?: string): string => {
  if (!input) return 'ng';
  const clean = input.trim().toLowerCase();

  // If already a 2-letter ISO code (e.g. "ng", "us", "gb", "gh", "ke", "za")
  if (clean.length === 2 && /^[a-z]{2}$/.test(clean)) {
    return clean;
  }

  const COUNTRY_MAP: Record<string, string> = {
    nigeria: 'ng',
    ghana: 'gh',
    kenya: 'ke',
    'south africa': 'za',
    rwanda: 'rw',
    uganda: 'ug',
    tanzania: 'tz',
    'united kingdom': 'gb',
    uk: 'gb',
    'great britain': 'gb',
    england: 'gb',
    'united states': 'us',
    usa: 'us',
    'united states of america': 'us',
    canada: 'ca',
    'united arab emirates': 'ae',
    uae: 'ae',
    germany: 'de',
    france: 'fr',
    australia: 'au',
    egypt: 'eg',
    morocco: 'ma',
    senegal: 'sn',
    'cote d\'ivoire': 'ci',
    'ivory coast': 'ci',
    cameroon: 'cm',
    zambia: 'zm',
    zimbabwe: 'zw',
    ethiopia: 'et',
    india: 'in',
    china: 'cn',
    japan: 'jp',
    brazil: 'br',
    mexico: 'mx',
    spain: 'es',
    italy: 'it',
    netherlands: 'nl',
    switzerland: 'ch',
    ireland: 'ie',
  };

  if (COUNTRY_MAP[clean]) {
    return COUNTRY_MAP[clean];
  }

  for (const [name, iso] of Object.entries(COUNTRY_MAP)) {
    if (clean.includes(name) || name.includes(clean)) {
      return iso;
    }
  }

  return 'ng';
};

interface VenueAutocompleteInputProps {
  onPlaceSelect: (details: SelectedPlaceDetails) => void;
  countryCode?: string;
  country?: string;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export const VenueAutocompleteInput: React.FC<VenueAutocompleteInputProps> = ({
  onPlaceSelect,
  countryCode,
  country,
  placeholder = 'Search venue, hall, hotel, or arena (powered by Google)...',
  initialValue = '',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isReady, setIsReady] = useState(false);

  const activeCountryIso = resolveCountryIso(countryCode || country);
  const countryIsoRef = useRef(activeCountryIso);
  countryIsoRef.current = activeCountryIso;

  // Sync external value changes (including reset to empty)
  useEffect(() => {
    setInputValue(initialValue);
    if (inputRef.current && initialValue === '') {
      inputRef.current.value = '';
    }
  }, [initialValue]);

  // When country changes, clear input text and update Google Places restriction
  useEffect(() => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (autocompleteRef.current) {
      autocompleteRef.current.setComponentRestrictions({
        country: [activeCountryIso],
      });
    }
  }, [activeCountryIso]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places?.Autocomplete) return false;

      const currentIso = countryIsoRef.current;
      const options: google.maps.places.AutocompleteOptions = {
        fields: ['name', 'formatted_address', 'address_components', 'geometry', 'types', 'place_id'],
        componentRestrictions: {
          country: [currentIso],
        },
      };

      // Create Google Autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);
      // Double enforce country restriction
      autocomplete.setComponentRestrictions({
        country: [currentIso],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry?.location) return;

        const lat = place.geometry.location.lat().toFixed(6);
        const lng = place.geometry.location.lng().toFixed(6);

        let streetNumber = '';
        let route = '';
        let locality = '';
        let sublocality = '';
        let adminArea = '';
        let postal = '';
        let countryName = '';

        if (place.address_components) {
          for (const comp of place.address_components) {
            if (comp.types.includes('street_number')) streetNumber = comp.long_name;
            if (comp.types.includes('route')) route = comp.long_name;
            if (comp.types.includes('locality')) locality = comp.long_name;
            if (comp.types.includes('sublocality')) sublocality = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) adminArea = comp.long_name;
            if (comp.types.includes('postal_code')) postal = comp.long_name;
            if (comp.types.includes('country')) countryName = comp.long_name;
          }
        }

        const venueName = place.name || '';
        let streetAddress = '';
        if (streetNumber && route) {
          streetAddress = `${streetNumber} ${route}`;
        } else if (route) {
          streetAddress = route;
        } else if (place.formatted_address) {
          const parts = place.formatted_address.split(', ');
          streetAddress = parts[0] !== venueName ? parts[0] : (parts[1] || parts[0]);
        }

        const city = locality || sublocality || '';

        setInputValue(venueName || streetAddress || place.formatted_address || '');

        onPlaceSelect({
          venue: venueName,
          streetAddress,
          city,
          state: adminArea,
          zipCode: postal,
          country: countryName,
          lat,
          lng,
          formattedAddress: place.formatted_address || '',
        });
      });

      autocompleteRef.current = autocomplete;
      setIsReady(true);
      return true;
    };

    if (!initAutocomplete()) {
      interval = setInterval(() => {
        if (initAutocomplete()) {
          clearInterval(interval);
        }
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Custom Google Places Autocomplete dropdown styles */}
      <style>{`
        .pac-container {
          background-color: #ffffff !important;
          border-radius: 1rem !important;
          border: 1px solid #e4e4e7 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          font-family: inherit !important;
          z-index: 9999 !important;
          margin-top: 6px !important;
          padding: 6px 0 !important;
        }
        .pac-item {
          padding: 10px 14px !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          cursor: pointer !important;
          border-top: 1px solid #f4f4f5 !important;
          transition: background-color 0.15s ease !important;
        }
        .pac-item:hover, .pac-item-selected {
          background-color: #fef2f2 !important;
        }
        .pac-item-query {
          font-size: 13px !important;
          font-weight: 800 !important;
          color: #09090b !important;
        }
        .pac-icon {
          margin-top: 3px !important;
        }
        .pac-matched {
          font-weight: 900 !important;
          color: #E31B23 !important;
        }
      `}</style>

      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-zinc-400">
          <Search className="w-4 h-4 text-[#E31B23]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3.5 bg-white border-2 border-zinc-200 hover:border-zinc-300 focus:border-[#E31B23] focus:ring-4 focus:ring-[#E31B23]/10 rounded-2xl text-xs sm:text-sm font-bold text-zinc-950 placeholder:text-zinc-400 outline-none transition-all shadow-xs"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 border border-zinc-200/80 text-[10px] font-black uppercase tracking-wider text-zinc-500 select-none">
            <span>Google</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueAutocompleteInput;
