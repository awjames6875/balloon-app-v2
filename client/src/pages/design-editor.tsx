import { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save, ArrowLeft, ChevronLeft, ChevronRight, Undo2, Redo2 } from 'lucide-react';
import { Link, useRoute, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDesign } from '@/context/design-context';
// Direct implementation of design history functionality instead of using context
// import { useDesignHistory, DesignHistoryProvider } from '@/context/design-history-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DesignElement } from '@/types';
import TemplatesSidebar from '@/components/balloon-templates/templates-sidebar';
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';
// Removed import of DesignHistoryTimeline as we have inline implementation now
import { BalloonClusterTemplate } from '@/components/balloon-templates/balloon-templates-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Maximum number of states to store in history
const MAX_HISTORY_LENGTH = 30;

// The design editor component with integrated history functionality
const DesignEditor = () => {
  const [, params] = useRoute('/design-editor/:id?');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { activeDesign, setActiveDesign } = useDesign();
  
  // Internal history state management
  const [historyStates, setHistoryStates] = useState<{ elements: DesignElement[], backgroundImage: string | null }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Computed history state flags
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < historyStates.length - 1;
  
  // Current design state (derived from history when navigating through history)
  const currentState = historyStates[currentHistoryIndex];
  
  // History actions
  const saveState = useCallback((state: { elements: DesignElement[], backgroundImage: string | null }) => {
    // Skip if state is the same as current state
    if (currentHistoryIndex >= 0 && 
        JSON.stringify(state.elements) === JSON.stringify(historyStates[currentHistoryIndex].elements) &&
        state.backgroundImage === historyStates[currentHistoryIndex].backgroundImage) {
      return;
    }
    
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Throttle saving
    saveTimeoutRef.current = setTimeout(() => {
      setHistoryStates(prevStates => {
        // If we've undone changes and now making a new one, remove future states
        const newStates = prevStates.slice(0, currentHistoryIndex + 1);
        
        // Add the new state
        const updatedStates = [...newStates, state];
        
        // Limit history length
        if (updatedStates.length > MAX_HISTORY_LENGTH) {
          updatedStates.shift();
        }
        
        // Update current index
        setCurrentHistoryIndex(updatedStates.length - 1);
        
        return updatedStates;
      });
    }, 300);
  }, [currentHistoryIndex, historyStates]);
  
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  }, [canUndo, currentHistoryIndex]);
  
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  }, [canRedo, currentHistoryIndex]);
  
  const setCurrentState = useCallback((state: { elements: DesignElement[], backgroundImage: string | null }) => {
    // Initialize history with the given state
    setHistoryStates([state]);
    setCurrentHistoryIndex(0);
  }, []);
  
  const [designName, setDesignName] = useState('Untitled Design');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistoryTimeline, setShowHistoryTimeline] = useState(false);
  
  // Sync with design history state when elements or background changes
  useEffect(() => {
    const currentDesignState = {
      elements,
      backgroundImage
    };
    
    // Save the current state to history
    if (elements.length > 0 || backgroundImage) {
      saveState(currentDesignState);
    }
  }, [elements, backgroundImage, saveState]);
  
  // Load from history state when history changes
  useEffect(() => {
    if (currentState) {
      setElements(currentState.elements);
      setBackgroundImage(currentState.backgroundImage);
    }
  }, [currentState]);

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if ctrl/cmd key is pressed
      const ctrlPressed = e.ctrlKey || e.metaKey;
      
      if (ctrlPressed) {
        if (e.key === 'z') {
          e.preventDefault();
          if (canUndo) undo();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          if (canRedo) redo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);
  
  // Load existing design if ID is provided
  useEffect(() => {
    const loadDesign = async () => {
      console.log("Design-editor params:", params);
      if (params?.id) {
        try {
          // Log the API request for debugging
          console.log(`Loading design with ID: ${params.id}`);
          
          const response = await apiRequest('GET', `/api/designs/${params.id}`);
          if (!response.ok) {
            throw new Error('Failed to load design');
          }
          
          const design = await response.json();
          console.log("Design loaded successfully:", design);
          
          // Update state with the loaded design data
          setActiveDesign(design);
          setDesignName(design.clientName || 'Untitled Design');
          
          // Make sure we have valid elements array
          const designElements = Array.isArray(design.elements) && design.elements.length > 0 
            ? design.elements 
            : [];
            
          setElements(designElements);
          setBackgroundImage(design.backgroundUrl || null);
          
          // Initialize history with the loaded design
          const initialState = {
            elements: designElements,
            backgroundImage: design.backgroundUrl || null
          };
          setCurrentState(initialState);
          
        } catch (error) {
          console.error('Failed to load design:', error);
          toast({
            title: 'Error',
            description: 'Failed to load the design. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        // Reset states for a new design
        setDesignName('Untitled Design');
        setElements([]);
        setBackgroundImage(null);
      }
    };
    
    loadDesign();
  }, [params?.id, setCurrentState]);
  
  const handleSaveDesign = async () => {
    try {
      setIsSaving(true);
      
      const designData = {
        clientName: designName,
        elements,
        backgroundUrl: backgroundImage,
      };
      
      let response;
      let design;
      
      if (activeDesign?.id) {
        // Update existing design
        response = await apiRequest(
          'PATCH',
          `/api/designs/${activeDesign.id}`,
          designData
        );
        
        if (!response.ok) {
          throw new Error('Failed to update design');
        }
        
        design = await response.json();
        setActiveDesign(design);
        
      } else {
        // Create new design
        response = await apiRequest('POST', '/api/designs/create', designData);
        
        if (!response.ok) {
          throw new Error('Failed to create design');
        }
        
        design = await response.json();
        setActiveDesign(design);
        
        // Update URL with new design ID without reloading page
        navigate(`/design-editor/${design.id}`, { replace: true });
      }
      
      // Create production record
      const productionResponse = await apiRequest('POST', '/api/production', {
        designId: design.id,
        status: 'pending',
        startDate: new Date().toISOString(),
        notes: `Production for ${designName}`,
        materialRequirements: design.materialRequirements,
        totalBalloons: design.totalBalloons,
        estimatedClusters: design.estimatedClusters
      });

      if (!productionResponse.ok) {
        throw new Error('Failed to create production record');
      }
      
      // Refresh both designs and production lists
      queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/production'] });
      
      toast({
        title: 'Success',
        description: 'Design saved and sent to production',
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
  
  const handleElementsChange = (newElements: DesignElement[]) => {
    setElements(newElements);
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-secondary-50">
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-2 bg-white border-b border-secondary-200">
          <div className="flex items-center">
            <Link href="/my-designs">
              <a className="mr-4 text-secondary-600 hover:text-secondary-800">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Link>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-lg font-medium bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded px-1"
              placeholder="Untitled Design"
            />
            
            {/* Undo/Redo Controls */}
            <div className="flex items-center ml-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={undo}
                      disabled={!canUndo}
                      className="p-1.5 rounded-md text-secondary-600 hover:bg-secondary-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Undo"
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Undo (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={redo}
                      disabled={!canRedo}
                      className="p-1.5 rounded-md text-secondary-600 hover:bg-secondary-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Redo"
                    >
                      <Redo2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Redo (Ctrl+Y)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <button
                onClick={() => setShowHistoryTimeline(!showHistoryTimeline)}
                className="text-xs text-secondary-500 hover:text-secondary-700 underline ml-2"
              >
                {showHistoryTimeline ? 'Hide History' : 'Show History'}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              onClick={handleSaveDesign}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin mr-1.5 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Design
                </>
              )}
            </button>
            <button
              className="flex items-center px-3 py-1.5 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-md text-sm font-medium"
              onClick={() => {
                const template = {
                  id: `template-${Date.now()}`,
                  name: designName,
                  svgContent: elements[0]?.svgContent || '',
                  defaultColors: elements.map(el => el.colors).flat(),
                  width: elements[0]?.width || 150,
                  height: elements[0]?.height || 150,
                  category: 'custom',
                  elements: elements
                };
                
                // Save template to localStorage
                const savedTemplates = JSON.parse(localStorage.getItem('savedTemplates') || '[]');
                savedTemplates.push(template);
                localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates));
                
                toast({
                  title: 'Success',
                  description: 'Template saved successfully',
                });
              }}
            >
              Save as Template
            </button>
            <button
              className="flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
              onClick={() => {
                // Clear all elements from the canvas
                setElements([]);
                toast({
                  title: 'Canvas Cleared',
                  description: 'All elements have been removed from the canvas',
                });
              }}
            >
              Clear Canvas
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div
            className={`${
              isSidebarCollapsed ? 'w-10' : 'w-64'
            } transition-all duration-300 bg-white border-r border-secondary-200 flex flex-col h-full`}
          >
            <div className="flex-1 overflow-y-auto">
              {isSidebarCollapsed ? (
                <button
                  className="p-2 w-full text-secondary-400 hover:text-secondary-600"
                  onClick={() => setSidebarCollapsed(false)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <>
                  <div className="p-2 flex justify-between items-center border-b border-secondary-200">
                    <h3 className="font-medium text-secondary-800">Elements</h3>
                    <button
                      className="text-secondary-400 hover:text-secondary-600"
                      onClick={() => setSidebarCollapsed(true)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <TemplatesSidebar 
                      onTemplateSelect={(template) => {
                        // Add template to canvas at center position
                        const canvasWidth = 500; // Approximate canvas width
                        const canvasHeight = 400; // Approximate canvas height
                        
                        // Get the SVG content and apply the correct colors
                        let svgContent = template.svgContent;
                        
                        // Replace color placeholders with actual colors from the template
                        if (template.defaultColors && template.defaultColors.length > 0) {
                          // Apply primary color
                          svgContent = svgContent.replace(/var\(--color-primary\)/g, template.defaultColors[0]);
                          
                          // Apply secondary color
                          if (template.defaultColors.length > 1) {
                            svgContent = svgContent.replace(/var\(--color-secondary\)/g, template.defaultColors[1]);
                          }
                          
                          // Apply accent colors
                          for (let i = 2; i < template.defaultColors.length && i < 13; i++) {
                            svgContent = svgContent.replace(
                              new RegExp(`var\\(--color-accent-${i-1}\\)`, 'g'), 
                              template.defaultColors[i]
                            );
                          }
                        }
                        
                        const newElement: DesignElement = {
                          id: `element-${Date.now()}`,
                          type: 'balloon-cluster',
                          x: canvasWidth / 2 - 75, // Center x (template width is ~150)
                          y: canvasHeight / 2 - 75, // Center y (template height is ~150)
                          width: 150,
                          height: 150,
                          rotation: 0,
                          svgContent: svgContent,
                          colors: template.defaultColors || ['#FF5757'],
                        };
                        
                        setElements([...elements, newElement]);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showHistoryTimeline && (
              <div className="p-4 border-b border-secondary-200 bg-white">
                <h3 className="font-medium text-secondary-800 mb-2">History Timeline</h3>
                <div className="flex items-center gap-2">
                  {historyStates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentHistoryIndex(index)}
                      className={`w-4 h-4 rounded-full ${
                        index === currentHistoryIndex
                          ? 'bg-primary-600 border-2 border-primary-300'
                          : 'bg-secondary-300 hover:bg-secondary-400'
                      }`}
                      title={`State ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              <DesignCanvas 
                backgroundImage={backgroundImage} 
                elements={elements} 
                onElementsChange={handleElementsChange} 
              />
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="w-80 bg-white border-l border-secondary-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              <BackgroundUploader 
                onBackgroundChange={(url) => setBackgroundImage(url)} 
                currentBackground={backgroundImage} 
              />
              
              <MaterialRequirementsPanel balloonCounts={{
                colorCounts: {},
                totalSmall: 0,
                totalLarge: 0,
                totalBalloons: 0,
                totalClusters: 0
              }} />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default DesignEditor;