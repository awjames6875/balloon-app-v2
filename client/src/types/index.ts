import { colorEnum, balloonSizeEnum } from '@shared/schema';

export type ColorType = typeof colorEnum.enumValues[number];
export type BalloonSizeType = typeof balloonSizeEnum.enumValues[number];

// Balloon template type
export interface BalloonClusterTemplate {
  id: string;
  name: string;
  svgContent: string;
  defaultColors: string[];
  width: number;
  height: number;
  category: string;
  type?: string;
  smallBalloonCount?: number;
  largeBalloonCount?: number;
}

// Canvas design element type
export interface DesignElement {
  id: string;
  type: 'balloon-cluster';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  svgContent: string;
  colors: string[];
  scale?: number;
}

// API response types
export interface AnalysisResult {
  colorAnalysis: {
    colors: Array<{
      name: string;
      percentage: number;
    }>;
  };
  materialRequirements: {
    [color: string]: {
      total: number;
      small: number;
      large: number;
    };
  };
  totalBalloons: number;
  estimatedClusters: number;
  productionTime: string;
}

export interface DesignAnalysisResponse {
  id: number;
  userId: number;
  designId: number;
  colorAnalysis: {
    colors: Array<{
      name: string;
      percentage: number;
    }>;
  };
  materialRequirements: {
    [color: string]: {
      total: number;
      small: number;
      large: number;
    };
  };
  totalBalloons: number;
  estimatedClusters: number;
  productionTime: string;
  createdAt: string;
}