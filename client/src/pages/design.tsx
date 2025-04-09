import { useState, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save, Share, Upload, PlusCircle, Image, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from '@/lib/queryClient';
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';
import { useToast } from '@/hooks/use-toast';
import { DesignElement } from '@/types';
import DesignUploader from '@/components/design/design-uploader';
import DesignAnalysis from '@/components/design/design-analysis';
import { InventoryComparisonDialog } from "@/components/inventory/inventory-comparison-dialog";
import { InventoryCheckDialog } from "@/components/inventory/inventory-check-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Color palette for the balloon clusters
const colorOptions = [
  { name: 'Red', value: '#FF5252' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Deep Purple', value: '#673AB7' },
  { name: 'Indigo', value: '#3F51B5' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Light Blue', value: '#00BCD4' },
  { name: 'Teal', value: '#009688' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Light Green', value: '#8BC34A' },
  { name: 'Lime', value: '#CDDC39' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Amber', value: '#FFC107' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Deep Orange', value: '#FF5722' },
  { name: 'Brown', value: '#795548' },
];

const Design = () => {
  const { activeDesign, setActiveDesign } = useDesign();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSavingToInventory, setIsSavingToInventory] = useState(false);
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  
  // For Design Uploader
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  // Fetch inventory for checking stock
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // State for the editor
  const [designName, setDesignName] = useState('New Balloon Design');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('');

  // Standard balloon cluster template with configurable color
  const [currentTemplate, setCurrentTemplate] = useState({
    id: 'standard-cluster',
    name: 'Standard Cluster',
    type: 'balloon-cluster',
    svgContent: `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="20" fill="${selectedColor.value}" opacity="0.9" />
      <circle cx="65" cy="40" r="15" fill="${selectedColor.value}" opacity="0.8" />
      <circle cx="35" cy="62" r="15" fill="${selectedColor.value}" opacity="0.8" />
      <circle cx="60" cy="68" r="12" fill="${selectedColor.value}" opacity="0.7" />
      <circle cx="30" cy="40" r="12" fill="${selectedColor.value}" opacity="0.7" />
      <circle cx="75" cy="55" r="10" fill="${selectedColor.value}" opacity="0.7" />
      <circle cx="45" cy="25" r="10" fill="${selectedColor.value}" opacity="0.7" />
      <circle cx="25" cy="68" r="8" fill="${selectedColor.value}" opacity="0.6" />
      <circle cx="65" cy="27" r="8" fill="${selectedColor.value}" opacity="0.6" />
      <circle cx="80" cy="38" r="8" fill="${selectedColor.value}" opacity="0.6" />
      <circle cx="50" cy="80" r="8" fill="${selectedColor.value}" opacity="0.6" />
      <circle cx="20" cy="45" r="8" fill="${selectedColor.value}" opacity="0.6" />
      <circle cx="78" cy="70" r="8" fill="${selectedColor.value}" opacity="0.6" />
    </svg>`,
    defaultColors: [selectedColor.value],
    smallBalloonCount: 11, 
    largeBalloonCount: 2,
    width: 150,
    height: 150,
    category: 'standard'
  });

  // Update template when color changes
  useEffect(() => {
    setCurrentTemplate(prev => ({
      ...prev,
      svgContent: `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="20" fill="${selectedColor.value}" opacity="0.9" />
        <circle cx="65" cy="40" r="15" fill="${selectedColor.value}" opacity="0.8" />
        <circle cx="35" cy="62" r="15" fill="${selectedColor.value}" opacity="0.8" />
        <circle cx="60" cy="68" r="12" fill="${selectedColor.value}" opacity="0.7" />
        <circle cx="30" cy="40" r="12" fill="${selectedColor.value}" opacity="0.7" />
        <circle cx="75" cy="55" r="10" fill="${selectedColor.value}" opacity="0.7" />
        <circle cx="45" cy="25" r="10" fill="${selectedColor.value}" opacity="0.7" />
        <circle cx="25" cy="68" r="8" fill="${selectedColor.value}" opacity="0.6" />
        <circle cx="65" cy="27" r="8" fill="${selectedColor.value}" opacity="0.6" />
        <circle cx="80" cy="38" r="8" fill="${selectedColor.value}" opacity="0.6" />
        <circle cx="50" cy="80" r="8" fill="${selectedColor.value}" opacity="0.6" />
        <circle cx="20" cy="45" r="8" fill="${selectedColor.value}" opacity="0.6" />
        <circle cx="78" cy="70" r="8" fill="${selectedColor.value}" opacity="0.6" />
      </svg>`,
      defaultColors: [selectedColor.value]
    }));
  }, [selectedColor]);

  const handleElementsChange = (newElements: DesignElement[]) => {
    setElements(newElements);
  };

  const addClusterToCanvas = () => {
    const newElement: DesignElement = {
      id: `element-${Date.now()}`,
      type: 'balloon-cluster',
      x: 100 + (Math.random() * 100),
      y: 100 + (Math.random() * 100),
      width: currentTemplate.width,
      height: currentTemplate.height,
      rotation: 0,
      svgContent: currentTemplate.svgContent,
      colors: [selectedColor.value],
    };
    
    setElements([...elements, newElement]);
  };

  const handleSaveDesign = async () => {
    try {
      setIsSaving(true);
      
      // Make sure elements is always an array
      const elementsCopy = Array.isArray(elements) ? [...elements] : [];
      
      const designData = {
        clientName: clientName || designName,
        eventDate: eventDate || null,
        elements: elementsCopy,
        backgroundUrl: backgroundImage,
        notes: eventType || null
      };
      
      console.log('Saving design with elements:', elementsCopy.length);
      
      // Create new design
      const response = await fetch('/api/designs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create design: ${errorText}`);
      }
      
      const design = await response.json();
      
      // Update active design
      setActiveDesign(design);
      
      // Refresh designs list
      queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
      
      toast({
        title: 'Success',
        description: 'Your design has been saved',
      });
      
      // Redirect to production page with the new design
      // navigate(`/production/${design.id}`);
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: 'There was an error saving your design',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to save balloon requirements to inventory
  
  // State for inventory check dialog
  const [showInventoryCheckDialog, setShowInventoryCheckDialog] = useState(false);
  const [inventoryCheckData, setInventoryCheckData] = useState<Record<string, { small: number, large: number }>>({});
  
  // Function to check inventory availability
  const handleCheckInventory = async () => {
    try {
      if (!activeDesign) {
        toast({
          title: 'No active design',
          description: 'Please save the design first before checking inventory',
          variant: 'destructive',
        });
        return;
      }
      
      setIsCheckingInventory(true);
      
      // Format data for API
      const materialCounts: Record<string, { small: number, large: number }> = {};
      
      Object.entries(balloonCounts.colorCounts).forEach(([colorName, counts]) => {
        materialCounts[colorName] = {
          small: counts.small,
          large: counts.large
        };
      });
      
      // Store material counts for the dialog
      setInventoryCheckData(materialCounts);
      
      // Show the inventory check dialog instead of API call
      setShowInventoryCheckDialog(true);
      
    } catch (error) {
      console.error('Inventory check error:', error);
      toast({
        title: 'Inventory check failed',
        description: 'There was an error checking the inventory status',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingInventory(false);
    }
  };
  
  const handleSaveToInventory = async () => {
    try {
      if (!activeDesign) {
        toast({
          title: 'No active design',
          description: 'Please save the design first before adding to inventory',
          variant: 'destructive',
        });
        return;
      }
      
      // Format data for API
      const materialCounts: Record<string, { small: number, large: number }> = {};
      
      Object.entries(balloonCounts.colorCounts).forEach(([colorName, counts]) => {
        materialCounts[colorName] = {
          small: counts.small,
          large: counts.large
        };
      });
      
      // Show the inventory comparison dialog instead of immediately saving
      setShowInventoryDialog(true);
    } catch (error) {
      console.error('Preparation error:', error);
      toast({
        title: 'Error',
        description: 'There was an error preparing inventory data',
        variant: 'destructive',
      });
    }
  };
  
  // This function is called from the dialog when the user confirms saving to inventory
  const processSaveToInventory = async () => {
    try {
      if (!activeDesign) return;
      
      setIsSavingToInventory(true);
      
      // Format data for API
      const materialCounts: Record<string, { small: number, large: number }> = {};
      
      Object.entries(balloonCounts.colorCounts).forEach(([colorName, counts]) => {
        materialCounts[colorName] = {
          small: counts.small,
          large: counts.large
        };
      });
      
      // Call the API to save to inventory
      const response = await apiRequest(
        'POST', 
        `/api/designs/${activeDesign.id}/save-to-inventory`,
        { materialCounts }
      );
      
      // Process response and get message
      const result = await response.json();
      
      // Refresh inventory data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      toast({
        title: 'Saved to inventory',
        description: result.message || 'The balloon requirements have been added to your inventory',
      });
      
      return result;
    } catch (error) {
      console.error('Save to inventory error:', error);
      toast({
        title: 'Save to inventory failed',
        description: 'There was an error updating the inventory',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSavingToInventory(false);
    }
  };

  // Calculate balloon counts based on elements
  const calculateBalloonCounts = () => {
    const colorCounts: {[color: string]: {small: number, large: number, total: number, clusters: number}} = {};
    let totalSmall = 0;
    let totalLarge = 0;
    let totalClusters = 0;

    elements.forEach(element => {
      const color = element.colors[0];
      const colorName = colorOptions.find(c => c.value === color)?.name || color;
      
      if (!colorCounts[colorName]) {
        colorCounts[colorName] = {small: 0, large: 0, total: 0, clusters: 0};
      }
      
      // Each standard cluster has 11 small balloons and 2 large balloons
      colorCounts[colorName].small += 11;
      colorCounts[colorName].large += 2;
      colorCounts[colorName].total += 13;
      colorCounts[colorName].clusters += 1;
      
      totalSmall += 11;
      totalLarge += 2;
      totalClusters += 1;
    });

    return {
      colorCounts,
      totalSmall,
      totalLarge,
      totalBalloons: totalSmall + totalLarge,
      totalClusters
    };
  };

  const balloonCounts = calculateBalloonCounts();
  
  // Handler for when analysis starts
  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };
  
  // Get material counts for the dialog
  const getMaterialCounts = () => {
    const materialCounts: Record<string, { small: number, large: number }> = {};
    
    Object.entries(balloonCounts.colorCounts).forEach(([colorName, counts]) => {
      materialCounts[colorName] = {
        small: counts.small,
        large: counts.large
      };
    });
    
    return materialCounts;
  };
  
  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      {/* Inventory Comparison Dialog */}
      {activeDesign && (
        <InventoryComparisonDialog
          open={showInventoryDialog}
          onOpenChange={setShowInventoryDialog}
          designId={activeDesign.id}
          materialCounts={getMaterialCounts()}
          onSaveToInventory={processSaveToInventory}
          onNavigateToInventory={() => {
            setShowInventoryDialog(false);
            navigate('/inventory');
          }}
        />
      )}
      
      {/* Inventory Check Dialog - Our new kid-friendly comparison dialog */}
      {activeDesign && (
        <InventoryCheckDialog
          open={showInventoryCheckDialog}
          onOpenChange={setShowInventoryCheckDialog}
          designId={activeDesign.id}
          materialCounts={inventoryCheckData}
          onNavigateToInventory={() => {
            setShowInventoryCheckDialog(false);
            navigate('/inventory');
          }}
        />
      )}
    
      {/* Header Bar */}
      <div className="bg-white border-b border-[#e0e0e0] px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#333333]">Balloon Designer</h1>
        <div className="flex gap-2">
          <button
            className="flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm disabled:opacity-50 z-10"
            onClick={handleSaveDesign}
            disabled={isSaving}
            style={{ position: 'relative' }}
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-1.5 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save
              </>
            )}
          </button>
          <button
            className="flex items-center px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium shadow-sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
              queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium shadow-sm">
            <Share className="h-4 w-4 mr-1.5" />
            Share
          </button>
        </div>
      </div>

      {/* Design Canvas */}
      <div className="bg-white border-b border-[#e0e0e0] px-6 py-2">
        <div className="w-full">
          {/* Canvas Design Content */}
          <DndProvider backend={HTML5Backend}>
            <div className="flex gap-6">
              <div className="w-4/5">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">Design Canvas</h2>
                      <p className="text-sm text-gray-500">
                        Drag and drop balloon clusters onto the canvas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">Balloon Color:</label>
                        <Select value={selectedColor.name} onValueChange={(value) => {
                          const newColor = colorOptions.find(c => c.name === value);
                          if (newColor) setSelectedColor(newColor);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(color => (
                              <SelectItem key={color.name} value={color.name}>
                                <div className="flex items-center">
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                                  <span className="ml-2">{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <button 
                        className="flex items-center px-3 py-1 bg-[#5568FE] text-white rounded-md text-sm"
                        onClick={addClusterToCanvas}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Cluster
                      </button>
                      <label 
                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-300 cursor-pointer"
                        onClick={() => {
                          const fileInput = document.getElementById('background-file-input');
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        <Image className="h-4 w-4 mr-1" />
                        Background
                        <input 
                          id="background-file-input" 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const url = URL.createObjectURL(file);
                              setBackgroundImage(url);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="relative bg-[#F8F9FA] border-2 border-dashed border-gray-300 rounded-lg h-[500px] overflow-hidden">
                    <DesignCanvas 
                      elements={elements}
                      onElementsChange={handleElementsChange}
                      backgroundImage={backgroundImage}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <BackgroundUploader
                    onUpload={(url) => setBackgroundImage(url)}
                    buttonText="Upload Background Image"
                  />
                </div>
              </div>
              <div className="w-1/5">
                <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Design Information</h3>
                  <div className="space-y-3 mb-6">
                    <div className="mb-3">
                      <label className="block text-sm text-[#777777] mb-1">Design Name</label>
                      <input 
                        type="text" 
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        className="w-full p-2 border border-[#e0e0e0] rounded-md"
                        placeholder="Enter design name"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm text-[#777777] mb-1">Client Name</label>
                      <input 
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-2 border border-[#e0e0e0] rounded-md"
                        placeholder="Client name"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm text-[#777777] mb-1">Event Date</label>
                      <input 
                        type="date" 
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full p-2 border border-[#e0e0e0] rounded-md"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm text-[#777777] mb-1">Event Type</label>
                      <input 
                        type="text" 
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full p-2 border border-[#e0e0e0] rounded-md"
                        placeholder="Birthday, Wedding, etc."
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      className="w-full flex justify-center items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                      onClick={handleCheckInventory}
                      disabled={isCheckingInventory}
                    >
                      {isCheckingInventory ? (
                        <>
                          <div className="animate-spin mr-1.5 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Checking...
                        </>
                      ) : (
                        'Check Inventory'
                      )}
                    </button>
                    <button
                      className="w-full flex justify-center items-center py-2 px-4 border border-[#5568FE] text-[#5568FE] hover:bg-blue-50 rounded-md text-sm font-medium"
                      onClick={handleSaveToInventory}
                      disabled={isSavingToInventory}
                    >
                      {isSavingToInventory ? (
                        <>
                          <div className="animate-spin mr-1.5 h-4 w-4 border-2 border-[#5568FE] border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        'Save to Inventory'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DndProvider>
        </div>
      </div>
      
      {/* Material Requirements Section */}
      <div className="px-6 py-4">
        <MaterialRequirementsPanel balloonCounts={balloonCounts} />
      </div>
    </div>
  );
};

export default Design;