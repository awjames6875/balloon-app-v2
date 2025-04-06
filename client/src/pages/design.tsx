import { useState, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save, Share, Upload, PlusCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from '@/lib/queryClient';
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';
import { useToast } from '@/hooks/use-toast';
import { DesignElement } from '@/types';

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
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);
  
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
      
      // Refresh inventory data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      toast({
        title: 'Saved to inventory',
        description: 'The balloon requirements have been added to your inventory',
      });
    } catch (error) {
      console.error('Save to inventory error:', error);
      toast({
        title: 'Save to inventory failed',
        description: 'There was an error updating the inventory',
        variant: 'destructive',
      });
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
  
  return (
    <div className="bg-[#f5f5f7] min-h-screen">
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
          <button className="flex items-center px-4 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium shadow-sm">
            <Share className="h-4 w-4 mr-1.5" />
            Share
          </button>
        </div>
      </div>

      {/* Main Content */}
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-[calc(100vh-57px)]">
          {/* Left Sidebar - Templates */}
          <div className="w-[300px] bg-white border-r border-[#e0e0e0] flex flex-col h-full">
            <div className="p-4 border-b border-[#e0e0e0]">
              <h3 className="font-bold text-[#333333]">Balloon Clusters</h3>
              <p className="text-xs text-[#777777] mt-1">Standard: 11 balloons (11"×11"), 2 balloons (16")</p>
            </div>
            
            <div className="p-4">
              <h4 className="font-bold text-[#333333] mb-3">Select Color</h4>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {colorOptions.slice(0, 16).map((color, idx) => (
                  <div 
                    key={idx} 
                    className={`w-12 h-12 rounded-full cursor-pointer ${selectedColor.value === color.value ? 'ring-2 ring-offset-2 ring-[#5568FE]' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                  />
                ))}
              </div>
              
              <button 
                onClick={addClusterToCanvas}
                className="w-full py-2.5 mt-2 bg-[#5568FE] hover:bg-opacity-90 text-white rounded-md text-sm font-medium"
              >
                <div className="flex items-center justify-center">
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add Cluster to Canvas
                </div>
              </button>
            </div>
            
            <div className="border-t border-[#e0e0e0] mt-4 p-4">
              <h4 className="font-bold text-[#333333] mb-3">Background</h4>
              <BackgroundUploader 
                onBackgroundChange={setBackgroundImage} 
                currentBackground={backgroundImage}
              />
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-white p-4 rounded-md border border-[#e0e0e0] h-[440px] overflow-auto">
                <DesignCanvas 
                  backgroundImage={backgroundImage} 
                  elements={elements} 
                  onElementsChange={handleElementsChange} 
                />
              </div>
              
              {/* Material Requirements Table */}
              <div className="bg-white mt-4 p-4 rounded-md border border-[#e0e0e0]">
                <h3 className="font-bold text-[#333333] mb-3">Balloon Count</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-left bg-[#f5f5f7] border border-[#e0e0e0]">Color</th>
                        <th className="p-2 text-center bg-[#f5f5f7] border border-[#e0e0e0]">11-inch</th>
                        <th className="p-2 text-center bg-[#f5f5f7] border border-[#e0e0e0]">16-inch</th>
                        <th className="p-2 text-center bg-[#f5f5f7] border border-[#e0e0e0]">Total</th>
                        <th className="p-2 text-center bg-[#f5f5f7] border border-[#e0e0e0]">Clusters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(balloonCounts.colorCounts).map(([colorName, counts], idx) => (
                        <tr key={idx}>
                          <td className="p-2 border border-[#e0e0e0] flex items-center">
                            <div className="w-5 h-5 rounded-full mr-2" style={{ backgroundColor: colorOptions.find(c => c.name === colorName)?.value || '#ccc' }}></div>
                            {colorName}
                          </td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{counts.small}</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{counts.large}</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{counts.total}</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{counts.clusters}</td>
                        </tr>
                      ))}
                      {elements.length > 0 && (
                        <tr className="bg-[#f5f5f7] font-bold">
                          <td className="p-2 border border-[#e0e0e0]">TOTAL</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{balloonCounts.totalSmall}</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{balloonCounts.totalLarge}</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{balloonCounts.totalBalloons}</td>
                          <td className="p-2 text-center border border-[#e0e0e0]">{balloonCounts.totalClusters}</td>
                        </tr>
                      )}
                      {elements.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-500">
                            No balloon clusters added yet. Use the panel on the left to add clusters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Project Information */}
                <h3 className="font-bold text-[#333333] mt-6 mb-3">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm text-[#777777] mb-1">Client Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full p-2 border border-[#e0e0e0] rounded-md"
                      placeholder="Enter client name"
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
                <div className="flex justify-center gap-4 mt-4">
                  <button 
                    className="px-6 py-2.5 bg-[#5568FE] hover:bg-opacity-90 text-white rounded-md font-medium"
                  >
                    Generate Production Form
                  </button>
                  <button 
                    className="px-6 py-2.5 border border-[#5568FE] text-[#5568FE] hover:bg-[#5568FE] hover:bg-opacity-10 rounded-md font-medium flex items-center justify-center"
                    onClick={handleSaveToInventory}
                    disabled={isSavingToInventory || !activeDesign}
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
        </div>
      </DndProvider>
    </div>
  );
};

export default Design;
