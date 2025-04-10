import { colorEnum, balloonSizeEnum, userRoleEnum } from '@shared/schema';

export type ColorType = typeof colorEnum.enumValues[number];
export type BalloonSizeType = typeof balloonSizeEnum.enumValues[number];
export type UserRoleType = typeof userRoleEnum.enumValues[number];

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRoleType;
  createdAt: string;
}

export interface Design {
  id: number;
  userId: number;
  clientName: string;
  eventDate?: string | null;
  dimensions?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  backgroundUrl?: string | null;
  elements: DesignElement[];
  colorAnalysis?: {
    colors: Array<{
      name: string;
      percentage: number;
    }>;
  } | null;
  materialRequirements?: {
    [color: string]: {
      total: number;
      small: number;
      large: number;
      clusters?: number;
    };
  } | null;
  totalBalloons?: number | null;
  estimatedClusters?: number | null;
  productionTime?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

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