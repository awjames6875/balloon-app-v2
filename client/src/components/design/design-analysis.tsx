import { useState, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { Zap, FileText, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DesignAssistant from "./design-assistant";

interface DesignAnalysisProps {
  loading: boolean;
}

const DesignAnalysis = ({ loading }: DesignAnalysisProps) => {
  const { activeDesign, setActiveDesign } = useDesign();
  const { toast } = useToast();
  const [generatingForm, setGeneratingForm] = useState(false);
  const [checkingInventory, setCheckingInventory] = useState(false);
  const [inventoryStatus, setInventoryStatus] = useState<'available' | 'low' | 'unavailable'>('available');
  
  // Set inventory status based on inventory check
  useEffect(() => {
    if (activeDesign) {
      // This would normally be determined by an API call
      // For now, we'll simulate it by using a random value
      const statuses = ['available', 'low', 'unavailable'];
      const randomStatus = statuses[Math.floor(Math.random() * 3)] as 'available' | 'low' | 'unavailable';
      setInventoryStatus(randomStatus);
    }
  }, [activeDesign]);

  const handleGenerateProductionForm = async () => {
    if (!activeDesign) return;

    try {
      setGeneratingForm(true);
      
      // Make a real API call to create a production record
      const response = await apiRequest('POST', '/api/production', {
        designId: activeDesign.id,
        status: 'pending',
        startDate: new Date().toISOString(),
        notes: `Production for ${activeDesign.clientName || 'Untitled Design'}`
      });
      
      if (!response.ok) {
        throw new Error('Failed to create production record');
      }
      
      toast({
        title: "Production Form Generated",
        description: "The production form has been created successfully.",
      });
    } catch (error) {
      console.error("Error generating production form:", error);
      toast({
        title: "Form Generation Failed",
        description: "There was an error generating the production form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingForm(false);
    }
  };

  const handleCheckInventory = async () => {
    if (!activeDesign) return;

    try {
      setCheckingInventory(true);
      
      // Make real API call to check inventory availability based on material requirements
      const response = await apiRequest('GET', `/api/inventory/check?designId=${activeDesign.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to check inventory');
      }
      
      const inventoryCheckResult = await response.json();
      const status = inventoryCheckResult.status || 'unavailable';
      
      const statusMessages: Record<string, string> = {
        available: "All materials are in stock and ready for production.",
        low: "Some materials are running low. Please check the inventory manager.",
        unavailable: "Some required materials are out of stock. Please restock before production."
      };
      
      setInventoryStatus(status as 'available' | 'low' | 'unavailable');
      
      toast({
        title: "Inventory Check Complete",
        description: statusMessages[status] || "Inventory status unknown.",
        variant: (status === 'available' ? 'default' : 
                 status === 'low' ? 'destructive' : 'destructive') as "default" | "destructive"
      });
    } catch (error) {
      console.error("Error checking inventory:", error);
      toast({
        title: "Inventory Check Failed",
        description: "There was an error checking the inventory status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingInventory(false);
    }
  };

  // Show initial state when no design is active
  if (!activeDesign && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-secondary-800">Design Analysis</h2>
            <p className="text-sm text-secondary-500 mt-1">AI-powered insights and material calculations</p>
          </div>
          <span className="px-2 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded">
            AI-Powered
          </span>
        </div>
        
        <div className="p-4">
          <div className="py-12 text-center">
            <Zap className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-lg font-medium text-secondary-800">Upload a design to analyze</h3>
            <p className="mt-1 text-sm text-secondary-500">The AI will analyze your design image and calculate material requirements</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while analyzing
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-secondary-800">Design Analysis</h2>
            <p className="text-sm text-secondary-500 mt-1">AI-powered insights and material calculations</p>
          </div>
          <span className="px-2 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded">
            AI-Powered
          </span>
        </div>
        
        <div className="p-4">
          <div className="py-12 text-center">
            <svg className="animate-spin mx-auto h-12 w-12 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-secondary-800">Analyzing your design</h3>
            <p className="mt-1 text-sm text-secondary-500">This may take a few moments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract color data from activeDesign
  const colors = activeDesign?.colorAnalysis?.colors || [];
  const materials = activeDesign?.materialRequirements || {};
  const totalBalloons = activeDesign?.totalBalloons || 0;
  const estimatedClusters = activeDesign?.estimatedClusters || 0;
  const productionTime = activeDesign?.productionTime || '0 hrs';

  // Show results state with the analysis data
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-secondary-800">Design Analysis</h2>
            <p className="text-sm text-secondary-500 mt-1">AI-powered insights and material calculations</p>
          </div>
          <span className="px-2 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded">
            AI-Powered
          </span>
        </div>
        
        <div className="p-4">
          {/* Color Analysis */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-secondary-800 mb-3">Color Analysis</h3>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color: { name: string; percentage: number }, index: number) => (
                <div key={index} className="bg-white border border-secondary-200 rounded p-3 text-center">
                  <div 
                    className="w-full h-12 rounded mb-2" 
                    style={{ backgroundColor: color.name.toLowerCase() }}
                  ></div>
                  <p className="text-sm font-medium text-secondary-700">{color.name}</p>
                  <p className="text-xs text-secondary-500">{color.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Material Requirements */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-secondary-800 mb-3">Material Requirements</h3>
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(materials).map(([color, data], index: number) => {
                  const materialData = data as { total: number; small: number; large: number };
                  return (
                    <div key={index} className="bg-white p-3 rounded shadow-sm">
                      <p className="text-xs text-secondary-500">{color} Balloons</p>
                      <div className="flex justify-between items-end mt-1">
                        <div>
                          <p className="text-2xl font-semibold text-secondary-900">{materialData.total}</p>
                          <div className="flex space-x-1 text-xs">
                            <span className="text-secondary-500">11":</span>
                            <span className="font-medium text-secondary-700">{materialData.small}</span>
                            <span className="text-secondary-500">16":</span>
                            <span className="font-medium text-secondary-700">{materialData.large}</span>
                          </div>
                        </div>
                        <div 
                          className="h-8 w-8 rounded" 
                          style={{ backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : color.toLowerCase() }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Summary */}
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <div className="flex flex-wrap gap-4 justify-between">
                  <div>
                    <p className="text-sm text-secondary-500">Total Balloons</p>
                    <p className="text-xl font-semibold text-secondary-900">{totalBalloons}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Estimated Clusters</p>
                    <p className="text-xl font-semibold text-secondary-900">{estimatedClusters}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Production Time</p>
                    <p className="text-xl font-semibold text-secondary-900">{productionTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Inventory Status</p>
                    <p className={`text-xl font-semibold ${
                      inventoryStatus === 'available' ? 'text-success-600' : 
                      inventoryStatus === 'low' ? 'text-warning-600' : 
                      'text-error-600'
                    }`}>
                      {inventoryStatus === 'available' ? 'Available' : 
                       inventoryStatus === 'low' ? 'Low Stock' : 
                       'Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive Design Assistant */}
          <DesignAssistant designId={activeDesign?.id} />
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button 
              className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerateProductionForm}
              disabled={generatingForm}
            >
              {generatingForm ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-1.5" />
                  Generate Production Form
                </>
              )}
            </button>
            <button 
              className="flex-1 py-2 px-4 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium rounded-md transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckInventory}
              disabled={checkingInventory}
            >
              {checkingInventory ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (
                <>
                  <Package className="h-5 w-5 mr-1.5" />
                  Check Inventory
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignAnalysis;
