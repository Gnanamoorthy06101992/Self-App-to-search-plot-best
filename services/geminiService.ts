import { GoogleGenAI, Type } from "@google/genai";
import { AnalyzedPlot, RawPlotInput } from "../types";

// Initialize Gemini Client
// API Key must be provided in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProperties = async (plots: RawPlotInput[], currency: string): Promise<AnalyzedPlot[]> => {
  if (!plots || plots.length === 0) return [];

  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert real estate investment analyst and geocoder.
    I will provide a list of property plot entries with addresses, prices, and square footage.
    The currency for these prices is ${currency}.
    
    For each property:
    1. Estimate the latitude and longitude coordinates for the address (Geocode). If exact is not found, approximate based on the city/street.
    2. Calculate Price per Square Foot (using ${currency}).
    3. Generate an 'Investment Score' (0-100) based on value, location desirability (implied by address), and potential.
    4. Generate a 'Connectivity Score' (0-100) based on estimated proximity to transit/hubs.
    5. Assess 'Zoning Potential' (Low, Medium, High) and predict appreciation.
    6. List nearby amenities and provide a brief analysis summary, mentioning values in ${currency} where appropriate.

    Here are the properties:
    ${JSON.stringify(plots, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ["lat", "lng"],
              },
              pricePerSqFt: { type: Type.NUMBER },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  investmentScore: { type: Type.NUMBER },
                  connectivityScore: { type: Type.NUMBER },
                  zoningPotential: { type: Type.STRING },
                  predictedAppreciation: { type: Type.STRING },
                },
                required: ["investmentScore", "connectivityScore", "zoningPotential", "predictedAppreciation"],
              },
              analysis: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  nearbyAmenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["summary", "pros", "cons", "nearbyAmenities"],
              },
            },
            required: ["id", "coordinates", "pricePerSqFt", "metrics", "analysis"],
          },
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from Gemini");
    }

    // Merge original data (address, price, sqft) with analyzed data to ensure completeness
    // The model returns ID, so we match by ID.
    const analyzedData = JSON.parse(responseText) as Partial<AnalyzedPlot>[];
    
    const mergedResults: AnalyzedPlot[] = analyzedData.map((analyzed) => {
      const original = plots.find(p => p.id === analyzed.id);
      if (!original) throw new Error(`Mismatch in ID: ${analyzed.id}`);
      
      return {
        ...original,
        coordinates: analyzed.coordinates!,
        pricePerSqFt: analyzed.pricePerSqFt!,
        metrics: analyzed.metrics!,
        analysis: analyzed.analysis!,
      };
    });

    return mergedResults;

  } catch (error) {
    console.error("Error analyzing properties:", error);
    throw error;
  }
};