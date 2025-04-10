import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ColorCount {
  small: number;
  large: number;
  total: number;
  clusters: number;
}

interface BalloonCounts {
  colorCounts: Record<string, ColorCount>;
  totalSmall: number;
  totalLarge: number;
  totalBalloons: number;
  totalClusters: number;
}

interface BalloonRequirementsPanelProps {
  balloonCounts: BalloonCounts;
}

/**
 * Panel displaying balloon requirements and counts by color
 */
const BalloonRequirementsPanel: React.FC<BalloonRequirementsPanelProps> = ({ 
  balloonCounts 
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Balloon Requirements</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="px-3 py-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-500 font-medium">Total Clusters</p>
            <p className="text-2xl font-bold text-blue-700">{balloonCounts.totalClusters}</p>
          </div>
          
          <div className="px-3 py-2 bg-purple-50 rounded-md">
            <p className="text-xs text-purple-500 font-medium">Total Balloons</p>
            <p className="text-2xl font-bold text-purple-700">{balloonCounts.totalBalloons}</p>
          </div>
        </div>
        
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Small Balloons:</span>
            <span className="font-semibold">{balloonCounts.totalSmall}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Large Balloons:</span>
            <span className="font-semibold">{balloonCounts.totalLarge}</span>
          </div>
        </div>
        
        <h4 className="text-sm font-semibold mb-2 border-b pb-1">Balloons by Color</h4>
        
        <div className="space-y-3">
          {Object.entries(balloonCounts.colorCounts).map(([colorName, counts]) => (
            <div key={colorName} className="border-b pb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{colorName}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {counts.clusters} cluster{counts.clusters !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-3 text-xs">
                <div>
                  <div className="text-gray-500">Small</div>
                  <div className="font-semibold">{counts.small}</div>
                </div>
                <div>
                  <div className="text-gray-500">Large</div>
                  <div className="font-semibold">{counts.large}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total</div>
                  <div className="font-semibold">{counts.total}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalloonRequirementsPanel;