import { useState, useEffect, useCallback } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from "wouter";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DesignElement } from '@/types';

// Custom components
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';
import DesignUploader from '@/components/design/design-uploader';
import DesignAnalysis from '@/components/design/design-analysis';
import DesignToolbar from '@/components/design/DesignToolbar';
import DesignSettingsPanel from '@/components/design/DesignSettingsPanel';
import ElementEditingPanel from '@/components/design/ElementEditingPanel';
import BalloonRequirementsPanel from '@/components/design/BalloonRequirementsPanel';
import BalloonTemplateCreator from '@/components/design/BalloonTemplateCreator';
import DesignDialogs from '@/components/design/DesignDialogs';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

/**
 * Design page component for creating and editing balloon designs
 */
const Design = () => {
  const { activeDesign, setActiveDesign } = useDesign();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for inventory operations
  const [isSavingToInventory, setIsSavingToInventory] = useState(false);
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showInventoryCheckDialog, setShowInventoryCheckDialog] = useState(false);
  const [inventoryCheckData, setInventoryCheckData] = useState<Record<string, { small: number, large: number }>>({});
  
  // State for design uploader
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for my designs modal
  const [showMyDesignsModal, setShowMyDesignsModal] = useState(false);
  
  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  // Fetch inventory for checking stock
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Design state
  const [designName, setDesignName] = useState('New Balloon Design');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Get the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId) || null;
  
  // Change handler for the canvas elements
  const handleElementsChange = (newElements: DesignElement[]) => {
    setElements(newElements);
  };

  // Add a template to the canvas
  const addTemplateToCanvas = (element: DesignElement) => {
    setElements([...elements, element]);
  };
  
  // Save the design
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
  
  // Clear the canvas
  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas? This will remove all elements.')) {
      setElements([]);
      setSelectedElementId(null);
    }
  };
  
  // Function to check inventory availability
  const handleCheckInventory = () => {
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
      
      // Show the inventory check dialog
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
  
  // Handle share dialog
  const handleShareDesign = () => {
    // Implement sharing functionality
    toast({
      title: 'Share functionality',
      description: 'Sharing is not implemented yet',
    });
  };
  
  // Function to prepare and show inventory dialog
  const handleSaveToInventory = () => {
    try {
      if (!activeDesign) {
        toast({
          title: 'No active design',
          description: 'Please save the design first before adding to inventory',
          variant: 'destructive',
        });
        return;
      }
      
      // Show the inventory comparison dialog
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
  
  // Process the save to inventory action from the dialog
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
  const calculateBalloonCounts = useCallback(() => {
    const colorCounts: {[color: string]: {small: number, large: number, total: number, clusters: number}} = {};
    let totalSmall = 0;
    let totalLarge = 0;
    let totalClusters = 0;

    elements.forEach(element => {
      if (!element.colors?.[0]) return;
      
      const color = element.colors[0];
      // Try to get a friendly name for the color
      let colorName = color;
      try {
        // Test if color is a valid hex color
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          // Find a friendly name in our color options if available
          const colorOption = colorOptions.find(c => c.value === color);
          if (colorOption) {
            colorName = colorOption.name;
          }
        }
      } catch (error) {
        console.warn('Error processing color name:', error);
      }
      
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
  }, [elements]);

  const balloonCounts = calculateBalloonCounts();
  
  // Element editing functions
  const handleElementDuplicate = () => {
    if (!selectedElementId) return;
    
    const elementToDuplicate = elements.find(el => el.id === selectedElementId);
    if (!elementToDuplicate) return;
    
    const newElement: DesignElement = {
      ...elementToDuplicate,
      id: `element-${Date.now()}`,
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20
    };
    
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };
  
  const handleElementDelete = () => {
    if (!selectedElementId) return;
    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  };
  
  const handleElementRotate = (amount: number) => {
    if (!selectedElementId) return;
    
    setElements(prev => prev.map(el => {
      if (el.id !== selectedElementId) return el;
      const newRotation = (el.rotation || 0) + amount;
      return { ...el, rotation: newRotation };
    }));
  };
  
  const handleElementMove = (direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
    if (!selectedElementId) return;
    
    setElements(prev => prev.map(el => {
      if (el.id !== selectedElementId) return el;
      
      let newX = el.x;
      let newY = el.y;
      
      switch (direction) {
        case 'up':
          newY -= amount;
          break;
        case 'down':
          newY += amount;
          break;
        case 'left':
          newX -= amount;
          break;
        case 'right':
          newX += amount;
          break;
      }
      
      return { ...el, x: newX, y: newY };
    }));
  };
  
  const handleElementColorChange = (colorIndex: number, newColor: string) => {
    if (!selectedElementId) return;
    
    setElements(prev => prev.map(el => {
      if (el.id !== selectedElementId) return el;
      
      const updatedColors = [...(el.colors || [])];
      updatedColors[colorIndex] = newColor;
      
      return { ...el, colors: updatedColors };
    }));
  };
  
  // Get material counts for dialogs
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
      {/* Dialogs */}
      <DesignDialogs 
        activeDesignId={activeDesign?.id || null}
        showInventoryDialog={showInventoryDialog}
        setShowInventoryDialog={setShowInventoryDialog}
        materialCounts={getMaterialCounts()}
        onSaveToInventory={processSaveToInventory}
        onNavigateToInventory={() => {
          setShowInventoryDialog(false);
          navigate('/inventory');
        }}
        showInventoryCheckDialog={showInventoryCheckDialog}
        setShowInventoryCheckDialog={setShowInventoryCheckDialog}
        inventoryCheckData={inventoryCheckData}
        showMyDesignsModal={showMyDesignsModal}
        setShowMyDesignsModal={setShowMyDesignsModal}
        designs={designs || []}
        onSelectDesign={(design) => {
          setActiveDesign(design);
          if (design.elements && Array.isArray(design.elements)) {
            setElements(design.elements);
          }
          setBackgroundImage(design.backgroundUrl);
          setDesignName(design.clientName || 'Untitled Design');
          setClientName(design.clientName || '');
          setEventDate(design.eventDate || '');
          setEventType(design.notes || '');
        }}
      />
    
      {/* Toolbar */}
      <DesignToolbar 
        designName={designName}
        onSave={handleSaveDesign}
        onShare={handleShareDesign}
        onUpload={() => setShowMyDesignsModal(true)}
        onNewTemplate={() => {
          // Show template creator panel
          const tabsElement = document.getElementById('sidebar-tabs');
          if (tabsElement) {
            const tabsInstance = (tabsElement as any).__tabsInstance;
            if (tabsInstance) {
              tabsInstance.setSelectedTab('template');
            }
          }
        }}
        onBackgroundChange={() => {
          // Show background uploader
          const tabsElement = document.getElementById('sidebar-tabs');
          if (tabsElement) {
            const tabsInstance = (tabsElement as any).__tabsInstance;
            if (tabsInstance) {
              tabsInstance.setSelectedTab('settings');
            }
          }
        }}
        onInventoryCheck={handleCheckInventory}
        isSaving={isSaving}
      />
      
      {/* Main Content */}
      <div className="flex">
        {/* Design Canvas */}
        <div className="flex-1 p-4">
          <DndProvider backend={HTML5Backend}>
            <div className="relative">
              <DesignCanvas 
                elements={elements}
                onElementsChange={handleElementsChange}
                backgroundImage={backgroundImage}
                onSelectedElementChange={setSelectedElementId}
                selectedElementId={selectedElementId}
              />
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleClearCanvas}
                  className="bg-white"
                >
                  Clear Canvas
                </Button>
              </div>
            </div>
          </DndProvider>
        </div>
        
        {/* Sidebar */}
        <div className="w-[320px] bg-white p-4 border-l overflow-y-auto h-[calc(100vh-64px)]">
          <Tabs defaultValue="template" id="sidebar-tabs">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="element">Element</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="template" className="space-y-4">
              <BalloonTemplateCreator onAddTemplate={addTemplateToCanvas} />
              <BalloonRequirementsPanel balloonCounts={balloonCounts} />
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCheckInventory}
                  disabled={!activeDesign || isCheckingInventory}
                >
                  Check Inventory
                </Button>
                
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={handleSaveToInventory}
                  disabled={!activeDesign || isSavingToInventory}
                >
                  {isSavingToInventory ? 'Saving...' : 'Save to Inventory'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="element">
              <ElementEditingPanel 
                selectedElement={selectedElement}
                onDuplicate={handleElementDuplicate}
                onDelete={handleElementDelete}
                onRotate={handleElementRotate}
                onMove={handleElementMove}
                onColorChange={handleElementColorChange}
              />
              
              <MaterialRequirementsPanel design={{ elements }} />
            </TabsContent>
            
            <TabsContent value="settings">
              <DesignSettingsPanel 
                designName={designName}
                clientName={clientName}
                eventDate={eventDate}
                eventType={eventType}
                onDesignNameChange={setDesignName}
                onClientNameChange={setClientName}
                onEventDateChange={setEventDate}
                onEventTypeChange={setEventType}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
              
              <BackgroundUploader 
                onBackgroundChange={setBackgroundImage}
                currentBackground={backgroundImage}
              />
              
              <DesignUploader 
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={(result) => {
                  setIsAnalyzing(false);
                  // Handle analysis result if needed
                }}
              />
              
              {isAnalyzing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-600">
                    Analyzing design image... This may take a moment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// For ColorPalette component reference
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

export default Design;