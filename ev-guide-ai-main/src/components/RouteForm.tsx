import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useState, useEffect, useRef, useCallback } from 'react';
import { geocodeSearch, type GeocodeSuggestion } from '@/services/geocoding';

const evModelOptions = [
  { id: 'tata-nexon', name: 'Tata Nexon EV', manufacturer: 'Tata', batteryCapacity: 40.5, range: 437, efficiency: 0.093 },
  { id: 'mg-zs', name: 'MG ZS EV', manufacturer: 'MG', batteryCapacity: 50.3, range: 461, efficiency: 0.109 },
  { id: 'hyundai-kona', name: 'Hyundai Kona Electric', manufacturer: 'Hyundai', batteryCapacity: 39.2, range: 452, efficiency: 0.087 },
  { id: 'byd-atto3', name: 'BYD Atto 3', manufacturer: 'BYD', batteryCapacity: 60.48, range: 521, efficiency: 0.116 },
  { id: 'tesla-model3', name: 'Tesla Model 3', manufacturer: 'Tesla', batteryCapacity: 60, range: 491, efficiency: 0.122 },
  { id: 'mahindra-xuv400', name: 'Mahindra XUV400', manufacturer: 'Mahindra', batteryCapacity: 39.4, range: 456, efficiency: 0.086 },
];

interface RouteFormProps {
  onPredict: () => void;
}

const useGeocodeSuggestions = () => {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((query: string) => {
    clearTimeout(timerRef.current);
    if (query.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const results = await geocodeSearch(query);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);
  return { suggestions, loading, search, clear };
};

export const RouteForm = ({ onPredict }: RouteFormProps) => {
  const {
    source, destination, batteryPercentage, selectedEVModel,
    setSource, setDestination, setBatteryPercentage, setSelectedEVModel,
    isLoading,
  } = useAppStore();

  const [sourceInput, setSourceInput] = useState(source?.address || '');
  const [destInput, setDestInput] = useState(destination?.address || '');
  const [activeField, setActiveField] = useState<'source' | 'dest' | null>(null);

  const sourceSuggestions = useGeocodeSuggestions();
  const destSuggestions = useGeocodeSuggestions();

  const handleSourceChange = (value: string) => {
    setSourceInput(value);
    sourceSuggestions.search(value);
    setActiveField('source');
  };

  const handleDestChange = (value: string) => {
    setDestInput(value);
    destSuggestions.search(value);
    setActiveField('dest');
  };

  const selectSource = (s: GeocodeSuggestion) => {
    setSourceInput(s.displayName);
    setSource({ lat: s.lat, lng: s.lng, address: s.displayName });
    sourceSuggestions.clear();
    setActiveField(null);
  };

  const selectDest = (s: GeocodeSuggestion) => {
    setDestInput(s.displayName);
    setDestination({ lat: s.lat, lng: s.lng, address: s.displayName });
    destSuggestions.clear();
    setActiveField(null);
  };

  const handleModelSelect = (id: string) => {
    const model = evModelOptions.find((m) => m.id === id);
    if (model) setSelectedEVModel(model);
  };

  const canPredict = source && source.lat !== 0 && destination && destination.lat !== 0 && selectedEVModel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-elevated p-6 lg:p-8 space-y-6"
    >
      <div>
        <h2 className="font-display font-bold text-xl mb-1">Plan Your Trip</h2>
        <p className="text-muted-foreground text-sm">Enter your route details for AI-powered range prediction</p>
      </div>

      <div className="space-y-4">
        {/* Source */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1.5">Source Location</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
            <input
              type="text"
              value={sourceInput}
              onChange={(e) => handleSourceChange(e.target.value)}
              onFocus={() => setActiveField('source')}
              onBlur={() => setTimeout(() => setActiveField(null), 200)}
              placeholder="Search starting point..."
              className="input-field pl-9"
            />
            {sourceSuggestions.loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            )}
          </div>
          <AnimatePresence>
            {activeField === 'source' && sourceSuggestions.suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto"
              >
                {sourceSuggestions.suggestions.map((s) => (
                  <li key={s.placeId} onMouseDown={() => selectSource(s)}
                    className="px-4 py-2.5 text-sm hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-0 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{s.displayName}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Destination */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1.5">Destination</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-secondary" />
            <input
              type="text"
              value={destInput}
              onChange={(e) => handleDestChange(e.target.value)}
              onFocus={() => setActiveField('dest')}
              onBlur={() => setTimeout(() => setActiveField(null), 200)}
              placeholder="Search destination..."
              className="input-field pl-9"
            />
            {destSuggestions.loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            )}
          </div>
          <AnimatePresence>
            {activeField === 'dest' && destSuggestions.suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto"
              >
                {destSuggestions.suggestions.map((s) => (
                  <li key={s.placeId} onMouseDown={() => selectDest(s)}
                    className="px-4 py-2.5 text-sm hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-0 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{s.displayName}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* EV Model */}
        <div>
          <label className="block text-sm font-medium mb-1.5">EV Model</label>
          <select
            value={selectedEVModel?.id || ''}
            onChange={(e) => handleModelSelect(e.target.value)}
            className="input-field"
          >
            <option value="">Select your EV model</option>
            {evModelOptions.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Battery */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Battery Level</label>
            <span className="text-sm font-bold text-primary">{batteryPercentage}%</span>
          </div>
          <input
            type="range" min={5} max={100} value={batteryPercentage}
            onChange={(e) => setBatteryPercentage(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>5%</span><span>100%</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPredict}
          disabled={isLoading || !canPredict}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {isLoading ? 'Calculating Route...' : 'Predict Range'}
        </button>
      </div>

      {!canPredict && sourceInput.length > 0 && destInput.length > 0 && (
        <p className="text-xs text-amber-400 text-center">
          Please select locations from the dropdown suggestions
        </p>
      )}
    </motion.div>
  );
};
