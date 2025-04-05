import { useState, useEffect, useMemo } from 'react';
import { DesignElement } from '@/types';
import { BarChart2, Package, Clock } from 'lucide-react';

interface MaterialRequirementsPanelProps {
  elements: DesignElement[];
}

interface MaterialBreakdown {
  [color: string]: {
    count: number;
    sizes: Record<string, number>;
  };
}

const BALLOON_SIZES = {
  '11inch': '11"',
  '16inch': '16"'
} as const;

const MaterialRequirementsPanel = ({ elements }: MaterialRequirementsPanelProps) => {
  const [estimatedTime, setEstimatedTime] = useState('');

  const { materialBreakdown, totalBalloons } = useMemo(() => {
    const breakdown: MaterialBreakdown = {};
    let total = 0;

    elements.forEach(element => {
      if (element.type === 'balloon-cluster') {
        element.colors.forEach((color, index) => {
          if (!color) return;

          if (!breakdown[color]) {
            breakdown[color] = {
              count: 0,
              sizes: Object.keys(BALLOON_SIZES).reduce((acc, size) => ({
                ...acc,
                [size]: 0
              }), {})
            };
          }

          const size = index % 2 === 0 ? '11inch' : '16inch';
          const count = element.scale ? Math.max(1, Math.floor(element.scale * (index % 3 + 1))) : 1;

          breakdown[color].count += count;
          breakdown[color].sizes[size] += count;
          total += count;
        });
      }
    });

    return { materialBreakdown: breakdown, totalBalloons: total };
  }, [elements]);

  useEffect(() => {
    const minutes = Math.ceil(totalBalloons * 2);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    setEstimatedTime(
      hours > 0 
        ? `${hours} hr ${remainingMinutes > 0 ? remainingMinutes + ' min' : ''}`
        : `${minutes} min`
    );
  }, [totalBalloons]);

  const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string | number, label: string }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-secondary-50 rounded-lg">
      <Icon className="h-5 w-5 text-primary-500 mb-1" />
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-xs text-secondary-500">{label}</span>
    </div>
  );

  return (
    <div className="bg-white border border-secondary-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-secondary-200">
        <h2 className="font-semibold text-secondary-800">Material Requirements</h2>
        <p className="text-sm text-secondary-500 mt-1">Estimated resources needed</p>
      </div>

      <div className="p-4">
        <div className="mb-4 grid grid-cols-3 gap-4">
          <StatCard icon={Package} value={totalBalloons} label="Total Balloons" />
          <StatCard icon={BarChart2} value={Object.keys(materialBreakdown).length} label="Colors Used" />
          <StatCard icon={Clock} value={estimatedTime} label="Est. Time" />
        </div>

        <div className="overflow-hidden rounded-lg border border-secondary-200">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Color</th>
                {Object.values(BALLOON_SIZES).map(size => (
                  <th key={size} scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {size} Balloons
                  </th>
                ))}
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
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
                    {Object.keys(BALLOON_SIZES).map(size => (
                      <td key={size} className="px-4 py-2 whitespace-nowrap text-sm">
                        {data.sizes[size]}
                      </td>
                    ))}
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