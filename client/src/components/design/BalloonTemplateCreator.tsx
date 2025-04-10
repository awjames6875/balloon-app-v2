import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DesignElement } from '@/types';
import ColorPalette, { colorOptions } from './ColorPalette';

interface BalloonTemplateCreatorProps {
  onAddTemplate: (element: DesignElement) => void;
}

/**
 * Component for creating new balloon templates with customized colors
 */
const BalloonTemplateCreator: React.FC<BalloonTemplateCreatorProps> = ({ 
  onAddTemplate 
}) => {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  
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
    
    onAddTemplate(newElement);
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Create New Balloon Cluster</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div 
            className="flex items-center justify-center p-4 border rounded-md"
            style={{ height: '150px' }}
            dangerouslySetInnerHTML={{ __html: currentTemplate.svgContent }}
          />
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Select Color</h4>
          <ColorPalette 
            selectedColor={selectedColor.value}
            onChange={(color) => {
              const colorObj = colorOptions.find(c => c.value === color) || colorOptions[0];
              setSelectedColor(colorObj);
            }}
          />
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
  );
};

export default BalloonTemplateCreator;