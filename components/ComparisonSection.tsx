import React from 'react';
import { AnalyzedPlot } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Trophy, Zap, DollarSign, ArrowUpRight } from 'lucide-react';

interface ComparisonSectionProps {
  plots: AnalyzedPlot[];
  selectedPlotId: string | null;
  onSelectPlot: (id: string) => void;
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$', 'INR': '₹'
};

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ plots, selectedPlotId, onSelectPlot, currency }) => {
  if (plots.length === 0) return null;

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Sort plots by investment score desc
  const sortedPlots = [...plots].sort((a, b) => b.metrics.investmentScore - a.metrics.investmentScore);
  const topPick = sortedPlots[0];

  const chartData = plots.map(p => ({
    name: p.address.split(',')[0], // Short address
    score: p.metrics.investmentScore,
    connectivity: p.metrics.connectivityScore,
    priceSqFt: p.pricePerSqFt,
    id: p.id
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Investment Analysis
      </h2>

      {/* Top Pick Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-8 flex items-start gap-4">
        <div className="p-3 bg-white rounded-full shadow-sm border border-blue-100">
            <ArrowUpRight className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <h3 className="font-bold text-blue-900">Top Investment Pick</h3>
            <p className="text-sm text-blue-700 mt-1">
                <span className="font-semibold">{topPick.address}</span> stands out with an Investment Score of <span className="font-bold">{topPick.metrics.investmentScore}</span>.
                {topPick.analysis.summary.split('.')[0]}.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Chart */}
        <div className="h-64 w-full">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Score Comparison</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="score" name="Investment Score" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.id === selectedPlotId ? '#3b82f6' : '#94a3b8'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>

         {/* Price Chart */}
         <div className="h-64 w-full">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Price / SqFt ({symbol})</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        formatter={(value: number) => [`${symbol}${value}`, 'Price/SqFt']}
                    />
                    <Bar dataKey="priceSqFt" name="Price / SqFt" radius={[0, 4, 4, 0]} barSize={20}>
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.id === selectedPlotId ? '#22c55e' : '#cbd5e1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Cards List */}
      <div className="space-y-4">
        {plots.map(plot => (
            <div 
                key={plot.id}
                onClick={() => onSelectPlot(plot.id)}
                className={`
                    cursor-pointer rounded-lg border p-4 transition-all duration-200
                    ${selectedPlotId === plot.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-100 hover:border-slate-300'}
                `}
            >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className={`font-bold text-sm ${selectedPlotId === plot.id ? 'text-blue-800' : 'text-slate-800'}`}>
                            {plot.address}
                        </h4>
                        <div className="flex gap-3 mt-1 text-xs text-slate-500">
                             <span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/> {symbol}{plot.price.toLocaleString()}</span>
                             <span>{symbol}{plot.pricePerSqFt}/sqft</span>
                        </div>
                    </div>
                    <div className={`
                        text-lg font-bold px-3 py-1 rounded-lg
                        ${plot.metrics.investmentScore > 80 ? 'bg-green-100 text-green-700' : 
                          plot.metrics.investmentScore > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                    `}>
                        {plot.metrics.investmentScore}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div className="bg-slate-50 p-2 rounded">
                         <span className="text-slate-500 block mb-1">Zoning Potential</span>
                         <span className="font-semibold text-slate-700">{plot.metrics.zoningPotential}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                         <span className="text-slate-500 block mb-1">Connectivity</span>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{width: `${plot.metrics.connectivityScore}%`}}></div>
                            </div>
                            <span className="font-semibold text-slate-700">{plot.metrics.connectivityScore}</span>
                         </div>
                    </div>
                </div>

                {selectedPlotId === plot.id && (
                    <div className="mt-3 pt-3 border-t border-blue-100/50 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-300">
                        <p className="mb-2 font-medium text-slate-700">Analysis Summary:</p>
                        <p className="mb-3">{plot.analysis.summary}</p>
                        <div className="flex flex-wrap gap-2">
                            {plot.analysis.nearbyAmenities.slice(0,3).map((amenity, i) => (
                                <span key={i} className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-[10px]">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};