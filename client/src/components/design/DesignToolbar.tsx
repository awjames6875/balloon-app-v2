import React from 'react';
import { Save, Share, Upload, PlusCircle, Image, RefreshCw, Edit, Grid, Palette, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from '@/hooks/use-toast';

interface DesignToolbarProps {
  designName: string;
  onSave: () => void;
  onShare: () => void;
  onUpload: () => void;
  onNewTemplate: () => void;
  onBackgroundChange: () => void;
  onInventoryCheck: () => void;
  isSaving: boolean;
}

/**
 * Toolbar component for the design page with action buttons
 */
const DesignToolbar: React.FC<DesignToolbarProps> = ({
  designName,
  onSave,
  onShare,
  onUpload,
  onNewTemplate,
  onBackgroundChange,
  onInventoryCheck,
  isSaving
}) => {
  const { toast } = useToast();
  
  return (
    <div className="flex justify-between items-center py-2 px-4 bg-white border-b">
      <div className="flex items-center space-x-2">
        <Link href="/design">
          <Button variant="ghost" size="sm">
            <Grid className="h-4 w-4 mr-1" />
            Designs
          </Button>
        </Link>
        <div className="flex-1 text-lg font-semibold">{designName || 'Untitled Design'}</div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onInventoryCheck}
        >
          <Clock className="h-4 w-4 mr-1" />
          Check Inventory
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBackgroundChange}
        >
          <Image className="h-4 w-4 mr-1" />
          Background
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUpload}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onNewTemplate}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          New Template
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShare}
        >
          <Share className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <Button 
          variant="primary" 
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin mr-1.5 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DesignToolbar;