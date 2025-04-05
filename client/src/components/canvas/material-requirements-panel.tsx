import { useState, useEffect } from 'react';
import { DesignElement } from '@/types';
import { BarChart2, Package, Clock } from 'lucide-react';

interface MaterialRequirementsPanelProps {
  elements: DesignElement[];
}

interface MaterialBreakdown {
  [color: string]: {
    count: number;
    sizes: {
      [size: string]: number;
    };
  };
}

const MaterialRequirementsPanel = ({ elements }: MaterialRequirementsPanelProps) => {
  const [materialBreakdown, setMaterialBreakdown] = useState<MaterialBreakdown>({});
  const [totalBalloons, setTotalBalloons] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  
  useEffect(() => {
    // Calculate material requirements based on elements
    const breakdown: MaterialBreakdown = {};
    let total = 0;
    
    elements.forEach(element => {
      if (element.type === 'balloon-cluster') {
        // Count each color in the element
        element.colors.forEach((color, index) => {
          if (!color) return; // Skip empty colors
          
          if (!breakdown[color]) {
            breakdown[color] = {
              count: 0,
              sizes: {
                '11inch': 0,
                '16inch': 0
              }
            };
          }
          
          // Determine count based on size (simplified model)
          // For a real app, this would be based on the actual template data
          const size = index % 2 === 0 ? '11inch' : '16inch';
          const count = element.scale ? Math.max(1, Math.floor(element.scale * (index % 3 + 1))) : 1;
          
          breakdown[color].count += count;
          breakdown[color].sizes[size] += count;
          total += count;
        });
      }
    });
    
    setMaterialBreakdown(breakdown);
    setTotalBalloons(total);
    
    // Calculate estimated production time (simplified model)
    let minutes = Math.ceil(total * 2); // 2 minutes per balloon as a rough estimate
    let timeString = '';
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      timeString = `${hours} hr ${remainingMinutes > 0 ? remainingMinutes + ' min' : ''}`;
    } else {
      timeString = `${minutes} min`;
    }
    
    setEstimatedTime(timeString);
  }, [elements]);

  return (
    <div className="bg-white border border-secondary-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-secondary-200">
        <h2 className="font-semibold text-secondary-800">Material Requirements</h2>
        <p className="text-sm text-secondary-500 mt-1">Estimated resources needed</p>
      </div>
      
      <div className="p-4">
        {/* Summary */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-secondary-50 rounded-lg">
            <Package className="h-5 w-5 text-primary-500 mb-1" />
            <span className="text-lg font-semibold">{totalBalloons}</span>
            <span className="text-xs text-secondary-500">Total Balloons</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-secondary-50 rounded-lg">
            <BarChart2 className="h-5 w-5 text-primary-500 mb-1" />
            <span className="text-lg font-semibold">{Object.keys(materialBreakdown).length}</span>
            <span className="text-xs text-secondary-500">Colors Used</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-secondary-50 rounded-lg">
            <Clock className="h-5 w-5 text-primary-500 mb-1" />
            <span className="text-lg font-semibold">{estimatedTime}</span>
            <span className="text-xs text-secondary-500">Est. Time</span>
          </div>
        </div>
        
        {/* Color breakdown */}
        <div className="overflow-hidden rounded-lg border border-secondary-200">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Color
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  11" Balloons
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  16" Balloons
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {Object.entries(materialBreakdown).length > 0 ? (
                Object.entries(materialBreakdown).map(([color, data]) => (
                  <tr key={color}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded mr-2" style={{ backgroundColor: color }}></div>
                        {color}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {data.sizes['11inch']}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {data.sizes['16inch']}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {data.count}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-secondary-500">
                    No materials required yet. Add balloon elements to your design.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequirementsPanel;