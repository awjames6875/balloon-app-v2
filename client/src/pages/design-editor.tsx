import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useRoute, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDesign } from '@/context/design-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DesignElement } from '@/types';
import TemplatesSidebar from '@/components/balloon-templates/templates-sidebar';
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';

const DesignEditor = () => {
  const [, params] = useRoute('/design-editor/:id?');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { activeDesign, setActiveDesign } = useDesign();
  
  const [designName, setDesignName] = useState('Untitled Design');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load existing design if ID is provided
  useEffect(() => {
    const loadDesign = async () => {
      if (params?.id) {
        try {
          const response = await apiRequest('GET', `/api/designs/${params.id}`);
          if (!response.ok) {
            throw new Error('Failed to load design');
          }
          
          const design = await response.json();
          setActiveDesign(design);
          setDesignName(design.clientName || 'Untitled Design');
          setElements(design.elements || []);
          setBackgroundImage(design.backgroundUrl || null);
          
        } catch (error) {
          console.error('Failed to load design:', error);
          toast({
            title: 'Error',
            description: 'Failed to load the design',
            variant: 'destructive',
          });
        }
      }
    };
    
    loadDesign();
  }, [params?.id]);
  
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
            <Link href="/design">
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
                    <TemplatesSidebar />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
                onUpload={setBackgroundImage} 
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