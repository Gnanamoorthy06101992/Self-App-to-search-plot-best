import React, { useState } from 'react';
import { InputSection } from './InputSection';
import { MapSection } from './MapSection';
import { ComparisonSection } from './ComparisonSection';
import { AnalyzedPlot, RawPlotInput, AnalysisStatus, MapViewMode } from '../types';
import { analyzeProperties } from '../services/geminiService';
import { Layers, Map as MapIcon, BarChart3 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [rawPlots, setRawPlots] = useState<RawPlotInput[]>([]);
  const [analyzedPlots, setAnalyzedPlots] = useState<AnalyzedPlot[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>(MapViewMode.DEFAULT);
  const [currency, setCurrency] = useState<string>('USD');

  const handleAnalyze = async () => {
    setStatus(AnalysisStatus.LOADING);
    try {
      const results = await analyzeProperties(rawPlots, currency);
      setAnalyzedPlots(results);
      setStatus(AnalysisStatus.COMPLETE);
      if (results.length > 0) setSelectedPlotId(results[0].id);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      alert('Failed to analyze properties. Please check your API Key and try again.');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <MapIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">PlotScout AI</h1>
        </div>
        
        {/* View Controls (Only visible when we have data) */}
        {status === AnalysisStatus.COMPLETE && (
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                    onClick={() => setMapViewMode(MapViewMode.DEFAULT)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mapViewMode === MapViewMode.DEFAULT ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Standard
                </button>
                <button 
                    onClick={() => setMapViewMode(MapViewMode.HEATMAP_SCORE)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${mapViewMode === MapViewMode.HEATMAP_SCORE ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Layers className="w-3 h-3" />
                    Inv. Heatmap
                </button>
                <button 
                    onClick={() => setMapViewMode(MapViewMode.HEATMAP_PRICE)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${mapViewMode === MapViewMode.HEATMAP_PRICE ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BarChart3 className="w-3 h-3" />
                    Price Heatmap
                </button>
            </div>
        )}
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden relative">
        
        {/* Left Sidebar: Input */}
        <div className={`col-span-12 lg:col-span-3 transition-all duration-500 ${status === AnalysisStatus.COMPLETE ? 'hidden lg:flex flex-col' : 'flex flex-col'}`}>
            <InputSection 
                plots={rawPlots} 
                setPlots={setRawPlots} 
                onAnalyze={handleAnalyze} 
                status={status}
                currency={currency}
                setCurrency={setCurrency}
            />
        </div>

        {/* Center: Map */}
        <div className={`col-span-12 ${status === AnalysisStatus.COMPLETE ? 'lg:col-span-5' : 'lg:col-span-9'} transition-all duration-500 h-[50vh] lg:h-auto`}>
            {status === AnalysisStatus.COMPLETE ? (
                 <MapSection 
                    plots={analyzedPlots} 
                    selectedPlotId={selectedPlotId}
                    onSelectPlot={setSelectedPlotId}
                    viewMode={mapViewMode}
                    currency={currency}
                 />
            ) : (
                <div className="h-full w-full bg-slate-100 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <MapIcon className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold text-slate-500">Map View</h3>
                    <p className="text-sm max-w-md mt-2">Add properties and run analysis to visualize plots on the interactive map.</p>
                </div>
            )}
        </div>

        {/* Right: Analysis (Only visible when complete) */}
        {status === AnalysisStatus.COMPLETE && (
            <div className="col-span-12 lg:col-span-4 h-[40vh] lg:h-auto overflow-hidden">
                <ComparisonSection 
                    plots={analyzedPlots}
                    selectedPlotId={selectedPlotId}
                    onSelectPlot={setSelectedPlotId}
                    currency={currency}
                />
            </div>
        )}
      </main>
    </div>
  );
};