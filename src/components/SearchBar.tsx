import React, { useState } from 'react';
import { Search } from 'lucide-react';

// Update the interface to include lat/lon
interface SearchBarProps {
  onLocationSelect: (location: string, date: string, lat: number, lon: number) => void;
}

// Define a type for suggestion items to include name and coordinates
interface Suggestion {
  name: string;
  lat: number;
  lon: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect }) => {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(getTomorrowDate());
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Fetch suggestions with coordinates from OpenCage API
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=5&no_annotations=1`
      );
      const data = await response.json();
      const locationSuggestions: Suggestion[] = data.results.map((result: any) => ({
        name: result.formatted,
        lat: result.geometry.lat,
        lon: result.geometry.lng,
      }));
      setSuggestions(locationSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchSuggestions(value);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setSearch(suggestion.name);
    setSuggestions([]);
    // Pass location name, date, and coordinates to parent component
    onLocationSelect(suggestion.name, date, suggestion.lat, suggestion.lon);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (search && suggestions.length > 0) {
      // Use the first suggestion's coordinates if available
      const selectedSuggestion = suggestions.find(s => s.name === search);
      if (selectedSuggestion) {
        onLocationSelect(selectedSuggestion.name, newDate, selectedSuggestion.lat, selectedSuggestion.lon);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search location..."
            className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-700 rounded-xl 
                     text-white placeholder-slate-400 backdrop-blur-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     transition-all duration-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        </div>
        <input
          type="date"
          value={date}
          min={getTomorrowDate()}
          max={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl 
                   text-white placeholder-slate-400 backdrop-blur-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   transition-all duration-300"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700 
                      rounded-xl overflow-hidden z-50">
          {isLoading ? (
            <div className="px-4 py-2 text-slate-400">Loading...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-slate-700/50 cursor-pointer text-slate-200
                         transition-colors duration-200"
              >
                {suggestion.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};