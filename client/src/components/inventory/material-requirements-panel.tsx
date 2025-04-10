import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateRequiredMaterials } from '@/lib/design-utils';

export interface MaterialRequirementsPanelProps {
  design: {
    elements: Array<{
      id: string;
      type: string;
      height: number;
      width: number;
      x: number;
      y: number;
      rotation: number;
      svgContent: string;
      colors: string[];
    }>;
  };
}

export function MaterialRequirementsPanel({ design }: MaterialRequirementsPanelProps) {
  const materialCounts = useMemo(() => {
    if (!design?.elements || design.elements.length === 0) {
      return {};
    }
    
    return calculateRequiredMaterials(design.elements);
  }, [design]);
  
  // Count total balloon requirements
  const totalSmall = useMemo(() => {
    return Object.values(materialCounts).reduce((sum, count) => sum + (count.small || 0), 0);
  }, [materialCounts]);
  
  const totalLarge = useMemo(() => {
    return Object.values(materialCounts).reduce((sum, count) => sum + (count.large || 0), 0);
  }, [materialCounts]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Material Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(materialCounts).length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Balloons by color and size:</p>
              <div className="space-y-2">
                {Object.entries(materialCounts).map(([color, counts], index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-1 last:border-0">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: color.toLowerCase() }} 
                      />
                      <span className="capitalize">{color}</span>
                    </div>
                    <div className="flex space-x-3 text-sm">
                      {counts.small > 0 && (
                        <span>{counts.small} × 11"</span>
                      )}
                      {counts.large > 0 && (
                        <span>{counts.large} × 16"</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total balloons:</span>
                <span>{totalSmall + totalLarge}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                <span>11" balloons:</span>
                <span>{totalSmall}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>16" balloons:</span>
                <span>{totalLarge}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-3">
            <p>No balloon elements in design</p>
            <p className="text-sm mt-1">Add balloon templates to see material requirements</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}