import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, MapPin, DollarSign, Maximize, Play, Search, ChevronDown } from 'lucide-react';
import { RawPlotInput, AnalysisStatus } from '../types';

interface InputSectionProps {
  plots: RawPlotInput[];
  setPlots: React.Dispatch<React.SetStateAction<RawPlotInput[]>>;
  onAnalyze: () => void;
  status: AnalysisStatus;
  currency: string;
  setCurrency: (c: string) => void;
}

const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
    { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
];

export const InputSection: React.FC<InputSectionProps> = ({ plots, setPlots, onAnalyze, status, currency, setCurrency }) => {
  const [newAddress, setNewAddress] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSqft, setNewSqft] = useState('');
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
      const timer = setTimeout(async () => {
          if (newAddress.length > 2 && showSuggestions) {
              setLoadingSuggestions(true);
              try {
                  // Using OpenStreetMap Nominatim for geocoding suggestions
                  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newAddress)}&limit=5`);
                  const data = await response.json();
                  setSuggestions(data);
              } catch (err) {
                  console.error("Error fetching suggestions", err);
              } finally {
                  setLoadingSuggestions(false);
              }
          } else if (newAddress.length <= 2) {
              setSuggestions([]);
          }
      }, 500);

      return () => clearTimeout(timer);
  }, [newAddress, showSuggestions]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAddress(e.target.value);
      setShowSuggestions(true);
  };

  const selectSuggestion = (address: string) => {
      setNewAddress(address);
      setShowSuggestions(false);
      setSuggestions([]);
  };

  const handleAdd = () => {
    if (!newAddress || !newPrice || !newSqft) return;
    const newPlot: RawPlotInput = {
      id: Date.now().toString(),
      address: newAddress,
      price: Number(newPrice),
      sqft: Number(newSqft),
    };
    setPlots([...plots, newPlot]);
    setNewAddress('');
    setNewPrice('');
    setNewSqft('');
    setShowSuggestions(false);
  };

  const handleRemove = (id: string) => {
    setPlots(plots.filter(p => p.id !== id));
  };

  const handleLoadExample = () => {
    const examples: RawPlotInput[] = [
      { id: '1', address: '101 Market St, San Francisco, CA', price: 1200000, sqft: 850 },
      { id: '2', address: '2500 Mission St, San Francisco, CA', price: 950000, sqft: 1100 },
      { id: '3', address: '500 Terry A Francois Blvd, San Francisco, CA', price: 1500000, sqft: 900 },
      { id: '4', address: '1500 Haight St, San Francisco, CA', price: 1800000, sqft: 1400 },
      { id: '5', address: '3000 24th St, San Francisco, CA', price: 1100000, sqft: 1050 },
    ];
    setPlots(examples);
  };

  const isAnalyzing = status === AnalysisStatus.LOADING;
  const currentSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Plot Entries</h2>
          <p className="text-xs text-slate-500 mt-1">Add properties to compare.</p>
        </div>
        
        <div className="relative">
            <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100"
            >
                {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        {/* Address Input with Autocomplete */}
        <div className="md:col-span-12 relative" ref={wrapperRef}>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search Address or Location..."
                    value={newAddress}
                    onChange={handleAddressChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                {loadingSuggestions && (
                    <div className="absolute right-3 top-3 w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => selectSuggestion(item.display_name)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-700 border-b border-slate-50 last:border-none transition-colors flex items-start gap-2"
                        >
                            <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2">{item.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="md:col-span-6 relative">
             <div className="absolute left-3 top-3 text-slate-400 text-sm font-semibold">{currentSymbol}</div>
            <input
            type="number"
            placeholder="Price"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
        </div>
        <div className="md:col-span-4 relative">
            <Maximize className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
            type="number"
            placeholder="Sq Ft"
            value={newSqft}
            onChange={(e) => setNewSqft(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
        </div>
        <button
            onClick={handleAdd}
            className="md:col-span-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center justify-center transition-colors"
        >
            <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-6">
        {plots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                 <div className="bg-slate-100 p-3 rounded-full mb-2">
                    <Search className="w-5 h-5 text-slate-400" />
                 </div>
                <div className="text-sm font-medium text-slate-600">No plots added</div>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Enter an address above or load example data to get started.
                </p>
                <button
                    onClick={handleLoadExample}
                    className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                    Load Demo Data
                </button>
            </div>
        )}
        {plots.map((plot) => (
          <div key={plot.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-all">
            <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-slate-800 text-sm truncate" title={plot.address}>{plot.address}</p>
                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    <span>{currentSymbol}{plot.price.toLocaleString()}</span>
                    <span>•</span>
                    <span>{plot.sqft.toLocaleString()} sqft</span>
                </div>
            </div>
            <button
              onClick={() => handleRemove(plot.id)}
              className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAnalyze}
        disabled={plots.length === 0 || isAnalyzing}
        className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md
            ${plots.length === 0 || isAnalyzing ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}
        `}
      >
        {isAnalyzing ? (
            <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analyzing...
            </>
        ) : (
            <>
                <Play className="w-4 h-4 fill-current" />
                Run Analysis
            </>
        )}
      </button>
    </div>
  );
};