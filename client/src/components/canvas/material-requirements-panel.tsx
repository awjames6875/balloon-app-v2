import { useState } from 'react';
import { Clipboard, Package, Check } from 'lucide-react';

interface BalloonCounts {
  colorCounts: {
    [colorName: string]: {
      small: number;
      large: number;
      total: number;
      clusters: number;
      color?: string;
    }
  };
  totalSmall: number;
  totalLarge: number;
  totalBalloons: number;
  totalClusters: number;
}

interface MaterialRequirementsPanelProps {
  balloonCounts: BalloonCounts;
}

const MaterialRequirementsPanel = ({ balloonCounts }: MaterialRequirementsPanelProps) => {
  const [copied, setCopied] = useState(false);
  
  // Add safeguards against undefined or null balloonCounts
  const safeballoonCounts = balloonCounts || {
    colorCounts: {},
    totalSmall: 0,
    totalLarge: 0,
    totalBalloons: 0,
    totalClusters: 0
  };
  
  const colorCounts = safeballoonCounts.colorCounts || {};
  const totalCounts = {
    totalSmall: safeballoonCounts.totalSmall || 0,
    totalLarge: safeballoonCounts.totalLarge || 0,
    totalBalloons: safeballoonCounts.totalBalloons || 0,
    totalClusters: safeballoonCounts.totalClusters || 0,
  };

  const handleCopyToClipboard = () => {
    let clipboardText = 'Material Requirements:\n\n';
    
    // Add each color's details
    Object.entries(colorCounts).forEach(([colorName, counts]) => {
      clipboardText += `${colorName} Balloons:\n`;
      clipboardText += `• Small (11"): ${counts.small}\n`;
      clipboardText += `• Large (16"): ${counts.large}\n`;
      clipboardText += `• Total: ${counts.total}\n`;
      clipboardText += `• Clusters: ${counts.clusters}\n\n`;
    });
    
    // Add totals
    clipboardText += 'TOTALS:\n';
    clipboardText += `• Total Small Balloons: ${totalCounts.totalSmall}\n`;
    clipboardText += `• Total Large Balloons: ${totalCounts.totalLarge}\n`;
    clipboardText += `• Total Balloons: ${totalCounts.totalBalloons}\n`;
    clipboardText += `• Total Clusters: ${totalCounts.totalClusters}\n`;
    
    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Material Requirements</h3>
        <button 
          className="text-xs flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          onClick={handleCopyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-3 w-3 mr-1" />
              Copy to clipboard
            </>
          )}
        </button>
      </div>
      
      {Object.keys(colorCounts).length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2">Add balloon clusters to see material requirements</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">Color</th>
                  <th className="py-2 px-3 text-center bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">11" Balloons</th>
                  <th className="py-2 px-3 text-center bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">16" Balloons</th>
                  <th className="py-2 px-3 text-center bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">Total</th>
                  <th className="py-2 px-3 text-center bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">Clusters</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(colorCounts).map(([colorName, counts], idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 border border-gray-200 text-xs flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: colorName === 'Red' ? '#FF5252' : 
                                                 colorName === 'Blue' ? '#2196F3' : 
                                                 colorName === 'Green' ? '#4CAF50' : 
                                                 colorName === 'Yellow' ? '#FFEB3B' : 
                                                 colorName === 'Purple' ? '#9C27B0' : 
                                                 colorName === 'Pink' ? '#E91E63' : 
                                                 colorName === 'Orange' ? '#FF9800' : 
                                                 colorName === 'White' ? '#FFFFFF' : 
                                                 colorName === 'Black' ? '#000000' : 
                                                 colorName === 'Silver' ? '#C0C0C0' : 
                                                 colorName === 'Gold' ? '#FFD700' : '#ccc' }}
                      ></div>
                      {colorName}
                    </td>
                    <td className="py-2 px-3 text-center border border-gray-200 text-xs">{counts.small}</td>
                    <td className="py-2 px-3 text-center border border-gray-200 text-xs">{counts.large}</td>
                    <td className="py-2 px-3 text-center border border-gray-200 text-xs">{counts.total}</td>
                    <td className="py-2 px-3 text-center border border-gray-200 text-xs">{counts.clusters}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-gray-50 font-medium">
                  <td className="py-2 px-3 border border-gray-200 text-xs">TOTAL</td>
                  <td className="py-2 px-3 text-center border border-gray-200 text-xs">{totalCounts.totalSmall}</td>
                  <td className="py-2 px-3 text-center border border-gray-200 text-xs">{totalCounts.totalLarge}</td>
                  <td className="py-2 px-3 text-center border border-gray-200 text-xs">{totalCounts.totalBalloons}</td>
                  <td className="py-2 px-3 text-center border border-gray-200 text-xs">{totalCounts.totalClusters}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[120px] bg-gray-50 p-2 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Estimated Production Time</p>
                <p className="text-sm font-semibold mt-1">{Math.ceil(totalCounts.totalClusters * 0.3)} hours</p>
              </div>
              <div className="flex-1 min-w-[120px] bg-gray-50 p-2 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Estimated Cost</p>
                <p className="text-sm font-semibold mt-1">${Math.ceil(totalCounts.totalBalloons * 0.3 + totalCounts.totalClusters * 5)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaterialRequirementsPanel;