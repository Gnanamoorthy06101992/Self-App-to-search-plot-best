import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AnalyzedPlot, MapViewMode } from '../types';
import { Building2, TrendingUp, Wifi } from 'lucide-react';

// Fix Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapSectionProps {
  plots: AnalyzedPlot[];
  selectedPlotId: string | null;
  onSelectPlot: (id: string) => void;
  viewMode: MapViewMode;
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$', 'INR': '₹'
};

// Helper component to handle map bounds
const MapUpdater: React.FC<{ plots: AnalyzedPlot[] }> = ({ plots }) => {
  const map = useMap();

  useEffect(() => {
    if (plots.length > 0) {
      const bounds = L.latLngBounds(plots.map(p => [p.coordinates.lat, p.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [plots, map]);

  return null;
};

const createCustomIcon = (color: string, isSelected: boolean) => {
    const size = isSelected ? 40 : 30;
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" width="${size/1.8}" height="${size/1.8}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

const getColor = (plot: AnalyzedPlot, mode: MapViewMode) => {
    if (mode === MapViewMode.HEATMAP_SCORE) {
        const score = plot.metrics.investmentScore;
        if (score >= 85) return '#22c55e'; // green
        if (score >= 70) return '#eab308'; // yellow
        return '#ef4444'; // red
    }
    if (mode === MapViewMode.HEATMAP_PRICE) {
        // Simple relative coloring for price
        return plot.pricePerSqFt > 1200 ? '#ef4444' : plot.pricePerSqFt > 800 ? '#eab308' : '#22c55e';
    }
    return '#3b82f6'; // default blue
}

export const MapSection: React.FC<MapSectionProps> = ({ plots, selectedPlotId, onSelectPlot, viewMode, currency }) => {
  
  const defaultCenter: L.LatLngExpression = [37.7749, -122.4194]; // SF default
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
        <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater plots={plots} />
            
            {plots.map((plot) => (
                <Marker
                    key={plot.id}
                    position={[plot.coordinates.lat, plot.coordinates.lng]}
                    icon={createCustomIcon(getColor(plot, viewMode), plot.id === selectedPlotId)}
                    eventHandlers={{
                        click: () => onSelectPlot(plot.id),
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="p-1 min-w-[200px]">
                            <h3 className="font-bold text-slate-800 mb-1">{plot.address}</h3>
                            <div className="flex justify-between text-xs text-slate-600 mb-2">
                                <span className="font-medium text-blue-600">{symbol}{plot.price.toLocaleString()}</span>
                                <span>{plot.sqft} sqft</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-semibold text-slate-700">Inv: {plot.metrics.investmentScore}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Wifi className="w-3 h-3 text-purple-600" />
                                    <span className="text-xs font-semibold text-slate-700">Con: {plot.metrics.connectivityScore}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>

        {/* Floating Legend for Heatmap Modes */}
        {viewMode !== MapViewMode.DEFAULT && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 z-[400]">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    {viewMode === MapViewMode.HEATMAP_SCORE ? 'Investment Score' : 'Price Intensity'}
                </h4>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-slate-700">Excellent / Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-slate-700">Average / Fair</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-slate-700">Poor / Expensive</span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};