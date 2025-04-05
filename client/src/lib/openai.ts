import { apiRequest } from "./queryClient";

// Design analysis types
export type ColorAnalysis = {
  colors: Array<{
    name: string;
    percentage: number;
  }>;
};

export type MaterialRequirements = {
  [color: string]: {
    total: number;
    small: number;
    large: number;
  };
};

export type DesignAnalysis = {
  colorAnalysis: ColorAnalysis;
  materialRequirements: MaterialRequirements;
  totalBalloons: number;
  estimatedClusters: number;
  productionTime: string;
};

// Function to analyze a design using the server API
export async function analyzeDesign(designId: number): Promise<DesignAnalysis> {
  try {
    const response = await apiRequest("POST", `/api/designs/${designId}/analyze`);
    return await response.json();
  } catch (error) {
    console.error("Error analyzing design:", error);
    throw new Error("Failed to analyze design");
  }
}

// Function to process design modification command 
export async function modifyDesign(designId: number, command: string): Promise<DesignAnalysis> {
  try {
    const response = await apiRequest(
      "POST", 
      `/api/designs/${designId}/modify`, 
      { command }
    );
    return await response.json();
  } catch (error) {
    console.error("Error modifying design:", error);
    throw new Error("Failed to modify design");
  }
}

// Function to generate product recommendation based on design
export async function getProductRecommendations(designId: number): Promise<any> {
  try {
    const response = await apiRequest("GET", `/api/designs/${designId}/recommendations`);
    return await response.json();
  } catch (error) {
    console.error("Error getting product recommendations:", error);
    throw new Error("Failed to get product recommendations");
  }
}
