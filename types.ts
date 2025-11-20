export interface RawPlotInput {
  id: string;
  address: string;
  price: number;
  sqft: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface InvestmentMetrics {
  investmentScore: number; // 0-100
  connectivityScore: number; // 0-100
  zoningPotential: string; // Low, Medium, High
  predictedAppreciation: string; // e.g. "5-7% annually"
}

export interface AnalyzedPlot extends RawPlotInput {
  coordinates: Coordinates;
  pricePerSqFt: number;
  metrics: InvestmentMetrics;
  analysis: {
    summary: string;
    pros: string[];
    cons: string[];
    nearbyAmenities: string[];
  };
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export enum MapViewMode {
  DEFAULT = 'DEFAULT',
  HEATMAP_PRICE = 'HEATMAP_PRICE',
  HEATMAP_SCORE = 'HEATMAP_SCORE',
}