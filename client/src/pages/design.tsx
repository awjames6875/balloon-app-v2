import { useState } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from '@/lib/queryClient';
import TemplatesSidebar from '@/components/balloon-templates/templates-sidebar';
import DesignCanvas from '@/components/canvas/design-canvas';
import MaterialRequirementsPanel from '@/components/canvas/material-requirements-panel';
import BackgroundUploader from '@/components/canvas/background-uploader';
import { useToast } from '@/hooks/use-toast';
import { DesignElement } from '@/types';

const Design = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const { activeDesign, setActiveDesign } = useDesign();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  // New state for drag-and-drop editor
  const [showEditor, setShowEditor] = useState(false);
  const [designName, setDesignName] = useState('New Balloon Design');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalysisStart = () => {
    setAnalyzing(true);
  };

  const handleElementsChange = (newElements: DesignElement[]) => {
    setElements(newElements);
  };

  const toggleEditor = () => {
    setShowEditor(!showEditor);
  };

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
      }
      
      // Refresh designs list
      queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
      
      toast({
        title: 'Success',
        description: 'Your design has been saved',
      });
      
      // Hide editor after saving
      setShowEditor(false);
      
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
  
  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Page Header */}
      <div>
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/dashboard">
                <span className="text-secondary-500 hover:text-secondary-700 cursor-pointer">Dashboard</span>
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <span className="text-secondary-500">/</span>
              <span className="text-secondary-800 font-medium">Balloon Design Creator</span>
            </li>
          </ol>
        </nav>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Balloon Design Creator</h1>
            <p className="text-secondary-500 mt-1">Create custom balloon designs using our drag-and-drop editor</p>
          </div>
          {!showEditor ? (
            <button 
              onClick={toggleEditor} 
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm cursor-pointer inline-block"
            >
              Create Balloon Design
            </button>
          ) : (
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
          )}
        </div>
      </div>

      {!showEditor ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Your Balloon Design</h2>
            <p className="text-secondary-500 mb-6">
              Use our drag-and-drop balloon design editor to create beautiful balloon arrangements
            </p>
            <button 
              onClick={toggleEditor} 
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm cursor-pointer inline-block"
            >
              Create Balloon Design
            </button>
          </div>
        </div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-col bg-secondary-50 border border-secondary-200 rounded-lg h-[80vh] overflow-hidden">
            <header className="flex justify-between items-center px-4 py-2 bg-white border-b border-secondary-200">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="text-lg font-medium bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded px-1"
                placeholder="New Balloon Design"
              />
              <button 
                onClick={toggleEditor}
                className="ml-2 px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </header>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Templates */}
              <div className="w-64 bg-white border-r border-secondary-200 flex flex-col h-full">
                <div className="p-2 border-b border-secondary-200">
                  <h3 className="font-medium text-secondary-800">Balloon Elements</h3>
                  <p className="text-xs text-secondary-500">Drag and drop onto canvas</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <TemplatesSidebar />
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
                    onBackgroundChange={setBackgroundImage} 
                    currentBackground={backgroundImage} 
                  />
                  
                  <MaterialRequirementsPanel elements={elements} />
                </div>
              </div>
            </div>
          </div>
        </DndProvider>
      )}
    </div>
  );
};

export default Design;
