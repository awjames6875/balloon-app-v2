import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Palette, Eye, Edit, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDesign } from '@/context/design-context';
import { useLocation } from 'wouter';

// Using inline Design type to avoid import issues
interface Design {
  id: number;
  userId: number;
  clientName: string;
  eventDate?: string | null;
  dimensions?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  backgroundUrl?: string | null;
  elements: any[];
  colorAnalysis?: {
    colors: Array<{
      name: string;
      percentage: number;
    }>;
  } | null;
  materialRequirements?: any;
  totalBalloons?: number | null;
  estimatedClusters?: number | null;
  productionTime?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface DesignGalleryProps {
  onSelectDesign?: (design: Design) => void;
  onEditDesign?: (designId: number) => void;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({ onSelectDesign, onEditDesign }) => {
  const [, navigate] = useLocation();
  const { setActiveDesign } = useDesign();
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Fetch designs
  const { data: designs, isLoading } = useQuery<Design[]>({
    queryKey: ['/api/designs'],
  });

  const safeDesigns = designs || [];

  const handlePreviewDesign = (design: Design, index: number) => {
    setPreviewDesign(design);
    setCurrentPreviewIndex(index);
    setPreviewOpen(true);
  };

  const navigatePreview = (direction: 'next' | 'prev') => {
    if (!safeDesigns.length) return;
    
    let newIndex = currentPreviewIndex;
    if (direction === 'next') {
      newIndex = (currentPreviewIndex + 1) % safeDesigns.length;
    } else {
      newIndex = (currentPreviewIndex - 1 + safeDesigns.length) % safeDesigns.length;
    }
    
    setCurrentPreviewIndex(newIndex);
    setPreviewDesign(safeDesigns[newIndex]);
  };

  const handleSelectDesign = (design: Design) => {
    if (onSelectDesign) {
      onSelectDesign(design);
    } else {
      setActiveDesign(design);
      navigate(`/design-editor/${design.id}`);
    }
    setPreviewOpen(false);
  };

  const handleEditDesign = (designId: number) => {
    if (onEditDesign) {
      onEditDesign(designId);
    } else {
      navigate(`/design-editor/${designId}`);
    }
    setPreviewOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!safeDesigns.length) {
    return (
      <div className="text-center py-8">
        <Palette className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-700">No designs found</h3>
        <p className="text-gray-500">Create your first design to see it here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {safeDesigns.map((design, index) => (
          <div 
            key={design.id} 
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePreviewDesign(design, index)}
          >
            <div className="aspect-video bg-gray-100 relative">
              {design.imageUrl ? (
                <img 
                  src={design.imageUrl} 
                  alt={design.clientName || 'Design preview'} 
                  className="w-full h-full object-cover"
                />
              ) : design.backgroundUrl ? (
                <img 
                  src={design.backgroundUrl} 
                  alt={design.clientName || 'Design preview'} 
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Palette className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800 truncate">
                {design.projectName || design.clientName || 'Untitled Design'}
              </h3>
              <p className="text-xs text-gray-600 truncate">{design.clientName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                  {design.eventType || 'Birthday'}
                </span>
                <div className="text-xs text-gray-500">
                  {design.eventDate ? new Date(String(design.eventDate)).toLocaleDateString() : 'No date'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <div>
                <span>{previewDesign?.projectName || previewDesign?.clientName || 'Design Preview'}</span>
                <div className="text-sm font-normal text-gray-600 mt-1">
                  {previewDesign?.clientName} • {previewDesign?.eventType || 'Birthday'}
                </div>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            {/* Navigation buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow-md"
              onClick={() => navigatePreview('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow-md"
              onClick={() => navigatePreview('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Preview content */}
            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
              {previewDesign?.imageUrl ? (
                <img 
                  src={previewDesign.imageUrl} 
                  alt={previewDesign.clientName || 'Design preview'} 
                  className="w-full h-full object-contain"
                />
              ) : previewDesign?.backgroundUrl ? (
                <div className="relative w-full h-full">
                  <img 
                    src={previewDesign.backgroundUrl} 
                    alt={previewDesign.clientName || 'Design background'} 
                    className="w-full h-full object-contain opacity-50"
                  />
                  {/* Render balloon elements if available */}
                  {previewDesign.elements && previewDesign.elements.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* This is a simplified representation - ideally we'd render actual elements */}
                      <div className="text-center p-4 bg-white/80 rounded-md">
                        <p className="text-sm font-medium">
                          {previewDesign.elements.length} balloon elements
                        </p>
                        {previewDesign.totalBalloons && (
                          <p className="text-xs text-gray-600">
                            {previewDesign.totalBalloons} total balloons
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Palette className="h-16 w-16 text-gray-300" />
                  <p className="ml-2 text-gray-500">No preview available</p>
                </div>
              )}
            </div>
          </div>

          {/* Design details */}
          {previewDesign && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Client</h4>
                  <p className="text-gray-600">{previewDesign.clientName || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Event Date</h4>
                  <p className="text-gray-600">
                    {previewDesign.eventDate 
                      ? new Date(String(previewDesign.eventDate)).toLocaleDateString() 
                      : 'No date set'}
                  </p>
                </div>
              </div>
              
              {previewDesign.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                  <p className="text-gray-600">{previewDesign.notes}</p>
                </div>
              )}
              
              {previewDesign.totalBalloons && (
                <div className="flex gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Total Balloons</h4>
                    <p className="text-gray-600">{previewDesign.totalBalloons}</p>
                  </div>
                  {previewDesign.estimatedClusters && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Estimated Clusters</h4>
                      <p className="text-gray-600">{previewDesign.estimatedClusters}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => previewDesign && handleSelectDesign(previewDesign)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View & Use
            </Button>
            <Button 
              onClick={() => previewDesign && handleEditDesign(previewDesign.id)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Design
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DesignGallery;