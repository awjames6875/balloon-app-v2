import { z } from "zod";

// Define design element schema directly since we can't import from shared directory in this example
export const designElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  svgContent: z.string(),
  colors: z.array(z.string())
});

// Export DesignElement type from the schema
export type DesignElement = z.infer<typeof designElementSchema>;

// Define additional UI related types
export interface CanvasOptions {
  width: number;
  height: number;
  showGrid: boolean;
  gridSize: number;
  backgroundColor: string;
}

// Define the balloon analysis response types
export interface ColorAnalysis {
  colors: Array<{
    name: string;
    percentage: number;
  }>;
}

export interface MaterialRequirements {
  [color: string]: {
    total: number;
    small: number;
    large: number;
  };
}

export interface DesignAnalysisResult {
  colorAnalysis: ColorAnalysis;
  materialRequirements: MaterialRequirements;
  totalBalloons: number;
  estimatedClusters: number;
  productionTime: string;
}