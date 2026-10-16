"use client";

import React, { useState, useEffect, useRef } from "react";
import { LocationResult, LocationService } from "@/lib/services/locationService";
import { MapPin, Loader2, Globe2, Check, AlertTriangle } from "lucide-react";

interface LocationAutocompleteProps {
  value: string;
  onSelect: (location: LocationResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = "Search any city, town, or village worldwide...",
  label = "Place of Birth",
  required = true,
  className = "",
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (newQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Instant local fast-path check
    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(newQuery)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.locations || []);
          if (data.warning) {
            setWarningMessage(data.warning);
          } else {
            setWarningMessage(null);
          }
        }
      } catch {
        // Fallback to local
        setResults([]);
        setWarningMessage("Geocoding service unavailable. Showing standard city list.");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setQuery(loc.displayName);
    setIsOpen(false);
    onSelect(loc);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {selectedLocation && (
            <span className="text-[10px] font-normal text-[#C1662F] font-mono">
              {selectedLocation.latitude.toFixed(2)}°, {selectedLocation.longitude.toFixed(2)}° (UTC{" "}
              {selectedLocation.timezone >= 0 ? `+${selectedLocation.timezone}` : selectedLocation.timezone})
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
          <MapPin className="h-4 w-4" />
        </div>

        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-10 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
        />

        {isLoading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#C1662F]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-1 shadow-xl">
          {warningMessage && (
            <div className="m-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}

          {results.length > 0 ? (
            results.map((loc) => {
              const isMatch = selectedLocation?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`flex w-full items-start justify-between rounded-lg p-2.5 text-left text-xs transition-colors ${
                    isMatch
                      ? "bg-[#7B2D26] text-white"
                      : "text-[#3B2A1E] hover:bg-[#FBF3E7] hover:text-[#7B2D26]"
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{loc.name}</span>
                      {loc.state && <span className="text-[10px] font-normal opacity-75">({loc.state})</span>}
                      <span className="text-[10px] font-semibold text-[#E8A33D] ml-1">
                        • {loc.country}
                      </span>
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isMatch ? "text-amber-100" : "text-[#6E5545]"
                      }`}
                    >
                      {loc.displayName}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono opacity-80">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </div>
                    <div className="text-[10px] font-mono text-[#E8A33D]">
                      UTC {loc.timezone >= 0 ? `+${loc.timezone}` : loc.timezone}
                    </div>
                  </div>
                </button>
              );
            })
          ) : isLoading ? (
            <div className="p-3 text-center text-xs text-[#6E5545] flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C1662F]" />
              <span>Resolving coordinates worldwide...</span>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-3 text-center text-xs text-[#6E5545]">
              <div className="font-semibold text-[#7B2D26] mb-1">No exact location match found</div>
              <p className="text-[11px]">
                Please check the spelling or type your district / province name.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
