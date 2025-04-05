import { useState, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronRight, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DesignUploader from "@/components/design/design-uploader";
import DesignAnalysis from "@/components/design/design-analysis";
import AccessoriesSection from "@/components/design/accessories-section";
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
              <span className="text-secondary-800 font-medium">Design Upload & Analysis</span>
            </li>
          </ol>
        </nav>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Design Upload & Analysis</h1>
            <p className="text-secondary-500 mt-1">Upload balloon design images for AI-powered analysis and production planning</p>
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
        <>
          {/* Design Upload and Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DesignUploader onAnalysisStart={handleAnalysisStart} />
            <DesignAnalysis loading={analyzing} />
          </div>
          
          {/* Accessories Section */}
          {activeDesign && <AccessoriesSection />}
          
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Projects</CardTitle>
                <Link href="/design?view=all">
                  <span className="text-sm text-primary-600 hover:text-primary-700 flex items-center cursor-pointer">
                    View all <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </Link>
              </div>
              <CardDescription>Your recently created designs</CardDescription>
            </CardHeader>
            <CardContent>
              {designsLoading ? (
                <div className="flex justify-center p-6">
                  <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : designs && Array.isArray(designs) && designs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designs.slice(0, 6).map((design: any) => (
                    <div
                      key={design.id}
                      onClick={() => {
                        setActiveDesign(design);
                        setDesignName(design.clientName || 'Untitled Design');
                        setElements(design.elements || []);
                        setBackgroundImage(design.backgroundUrl || null);
                        setShowEditor(true);
                      }}
                      className="border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition block cursor-pointer"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-secondary-100">
                        {design.imageUrl && (
                          <img 
                            src={design.imageUrl} 
                            alt={design.clientName} 
                            className="object-cover w-full h-full"
                          />
                        )}
                        {design.backgroundUrl && !design.imageUrl && (
                          <img 
                            src={design.backgroundUrl} 
                            alt={design.clientName} 
                            className="object-cover w-full h-full"
                          />
                        )}
                        {!design.imageUrl && !design.backgroundUrl && (
                          <div className="w-full h-full flex items-center justify-center bg-secondary-100">
                            <span className="text-secondary-400 text-sm">No Preview</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-secondary-800">{design.clientName}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-secondary-500">
                            {new Date(design.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1">
                            {design.elements && design.elements.length > 0 && (
                              <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded">
                                {design.elements.length} elements
                              </span>
                            )}
                            {design.totalBalloons > 0 && (
                              <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded">
                                {design.totalBalloons} balloons
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-secondary-500">You haven't created any designs yet</p>
                  <p className="text-sm text-secondary-400 mt-1">
                    Click "Create Balloon Design" to start designing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
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
