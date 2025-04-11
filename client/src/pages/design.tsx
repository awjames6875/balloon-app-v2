import React, { useState, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save, Share, Upload, PlusCircle, Image, RefreshCw, Edit, Grid, Palette, Clock, Eye, Tag, User, Calendar, Copy, RotateCcw, RotateCw, Trash2, AlignCenter, Layers, Droplet, Maximize } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from '@/lib/queryClient';
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';
import BalloonCustomizer from '@/components/canvas/balloon-customizer';
import { useToast } from '@/hooks/use-toast';
import { DesignElement } from '@/types';
// DesignUploader removed as it's not being used
// AI design analysis removed
import { InventoryComparisonDialog } from "@/components/inventory/inventory-comparison-dialog";
import { InventoryCheckDialog } from "@/components/inventory/inventory-check-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery<any[]>({
    queryKey: ["/api/designs"],
  });

  // Fetch inventory for checking stock
  const { data: inventory, isLoading: inventoryLoading } = useQuery<any[]>({
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
  
  // Canvas settings
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);

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
  
  // State for inventory check dialog
  const [showInventoryCheckDialog, setShowInventoryCheckDialog] = useState(false);
  const [inventoryCheckData, setInventoryCheckData] = useState<Record<string, { small: number, large: number }>>({});
  
  // State for the designs modal
  const [showMyDesignsModal, setShowMyDesignsModal] = useState(false);
  
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
      
      // Each standard cluster has 11 balloons of 11inch and 2 balloons of 16inch
      colorCounts[colorName].small += 11; // 11inch balloons
      colorCounts[colorName].large += 2;  // 16inch balloons
      colorCounts[colorName].total += 13;
      colorCounts[colorName].clusters += 1;
      
      totalSmall += 11; // 11inch balloons
      totalLarge += 2;  // 16inch balloons
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
  
  // Handler for when upload starts
  const handleUploadStart = () => {
    setIsUploading(true);
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
  
  // UI state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  // Element editing functions
  const handleElementDuplicate = () => {
    if (!selectedElementId) return;
    
    const elementToDuplicate = elements.find(el => el.id === selectedElementId);
    if (!elementToDuplicate) return;
    
    const newElement = {
      ...elementToDuplicate,
      id: `element-${Date.now()}`,
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20
    };
    
    setElements([...elements, newElement]);
  };
  
  const handleElementDelete = () => {
    if (!selectedElementId) return;
    setElements(elements.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  };
  
  const handleElementRotate = (amount: number) => {
    if (!selectedElementId) return;
    
    setElements(elements.map(el => {
      if (el.id !== selectedElementId) return el;
      
      return {
        ...el,
        rotation: (el.rotation || 0) + amount
      };
    }));
  };
  
  const handleElementColorChange = (colorIndex: number, newColor: string) => {
    if (!selectedElementId) return;
    
    setElements(elements.map(el => {
      if (el.id !== selectedElementId) return el;
      
      const updatedColors = [...(el.colors || [])];
      updatedColors[colorIndex] = newColor;
      
      return {
        ...el,
        colors: updatedColors
      };
    }));
  };
  
  // Handle element update from the customizer
  const handleElementUpdate = (updatedElement: DesignElement) => {
    setElements(
      elements.map(el => (el.id === updatedElement.id ? updatedElement : el))
    );
  };
  
  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas? This will remove all elements.')) {
      setElements([]);
      setSelectedElementId(null);
    }
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
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Design Canvas */}
        <div className="flex-1 p-4">
          <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden relative">
            <DndProvider backend={HTML5Backend}>
              <DesignCanvas
                elements={elements}
                onElementsChange={handleElementsChange}
                backgroundImage={backgroundImage}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                selectedElementId={selectedElementId}
                onElementSelect={setSelectedElementId}
              />
            </DndProvider>
            
            {/* Canvas Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              {/* Snap to Grid Toggle */}
              <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-md flex items-center space-x-2">
                <Grid className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="snap-to-grid" className="text-sm font-medium text-gray-800">
                    Snap to Grid
                  </Label>
                </div>
                <Switch
                  id="snap-to-grid"
                  checked={snapToGrid}
                  onCheckedChange={setSnapToGrid}
                  className={snapToGrid ? "data-[state=checked]:bg-blue-600" : ""}
                />
              </div>
              
              <Button 
                className="bg-white/90 text-black hover:bg-white/100 border border-gray-300 shadow"
                onClick={handleClearCanvas}
              >
                Clear Canvas
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-[350px] bg-white border-l-2 border-[#f0f0f0] overflow-y-auto">
          {/* Upload Customer Image - Always Visible */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Upload Customer Image</h3>
            <BackgroundUploader 
              onBackgroundChange={setBackgroundImage}
              currentBackground={backgroundImage}
              buttonText="Upload Customer Photo"
            />

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <input 
                  type="text" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Event Date</label>
                <input 
                  type="date" 
                  value={eventDate} 
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
            </div>
          </div>

          {/* Balloon Templates */}
          <div className="p-4 space-y-4">
            <Tabs defaultValue="create">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create
                </TabsTrigger>
              </TabsList>
            
              <TabsContent value="create">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Create New Balloon Cluster</h3>
                    
                    {/* Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Preview</h4>
                      <div 
                        className="flex items-center justify-center p-4 border rounded-md"
                        style={{ height: '150px' }}
                        dangerouslySetInnerHTML={{ __html: currentTemplate.svgContent }}
                      />
                    </div>
                    
                    {/* Color Selection */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Select Color</h4>
                      <div className="flex flex-wrap gap-2 max-w-md">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            className={`w-8 h-8 rounded-full border-2 ${
                              selectedColor.value === color.value ? 'border-black shadow-md' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setSelectedColor(color)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={addClusterToCanvas}
                    >
                      Add Cluster to Canvas
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Balloon Requirements */}
            <Card>
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
                    <span className="text-gray-500">11inch Balloons:</span>
                    <span className="font-semibold">{balloonCounts.totalSmall}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">16inch Balloons:</span>
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
                          <div className="text-gray-500">11inch</div>
                          <div className="font-semibold">{counts.small}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">16inch</div>
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
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCheckInventory}
                disabled={!activeDesign || isCheckingInventory}
              >
                <Clock className="h-4 w-4 mr-1" />
                Check Inventory
              </Button>
              
              <Button 
                variant="default" 
                className="flex-1"
                onClick={handleSaveToInventory}
                disabled={!activeDesign || isSavingToInventory}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Save to Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Designs Dialog */}
      <Dialog open={showMyDesignsModal} onOpenChange={setShowMyDesignsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Designs</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto p-1">
            {designs && designs.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {designs.map((design: any) => (
                  <div 
                    key={design.id} 
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setActiveDesign(design);
                      if (design.elements && Array.isArray(design.elements)) {
                        setElements(design.elements);
                      }
                      setBackgroundImage(design.backgroundUrl);
                      setDesignName(design.clientName || 'Untitled Design');
                      setClientName(design.clientName || '');
                      setEventDate(design.eventDate || '');
                      setEventType(design.notes || '');
                      setShowMyDesignsModal(false);
                    }}
                  >
                    <div className="text-sm font-medium mb-1">{design.clientName || 'Unnamed Design'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No saved designs found
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMyDesignsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Design;