// User types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'designer' | 'inventory_manager';
  createdAt: string;
}

// Design types
export interface Design {
  id: number;
  userId: number;
  clientName: string;
  eventDate?: string;
  dimensions?: string;
  notes?: string;
  imageUrl?: string;
  colorAnalysis?: {
    colors: Array<{
      name: string;
      percentage: number;
    }>;
  };
  materialRequirements?: {
    [color: string]: {
      total: number;
      small: number;
      large: number;
    };
  };
  totalBalloons?: number;
  estimatedClusters?: number;
  productionTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory types
export interface Inventory {
  id: number;
  color: string;
  size: string;
  quantity: number;
  threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
}

// Accessory types
export interface Accessory {
  id: number;
  name: string;
  quantity: number;
  threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
}

// Production types
export interface Production {
  id: number;
  designId: number;
  status: 'pending' | 'in-progress' | 'completed';
  startDate: string | null;
  completionDate: string | null;
  actualTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Design analysis types
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

export interface DesignAnalysis {
  colorAnalysis: ColorAnalysis;
  materialRequirements: MaterialRequirements;
  totalBalloons: number;
  estimatedClusters: number;
  productionTime: string;
}
