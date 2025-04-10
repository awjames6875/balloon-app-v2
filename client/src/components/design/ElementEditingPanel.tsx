import React from 'react';
import { Copy, Trash2, RotateCw, RotateCcw, MoveVertical, MoveHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DesignElement } from '@/types';
import ColorPalette from './ColorPalette';

interface ElementEditingPanelProps {
  selectedElement: DesignElement | null;
  onDuplicate: () => void;
  onDelete: () => void;
  onRotate: (amount: number) => void;
  onMove: (direction: 'up' | 'down' | 'left' | 'right', amount: number) => void;
  onColorChange: (colorIndex: number, newColor: string) => void;
}

/**
 * Panel for editing the properties of a selected design element
 */
const ElementEditingPanel: React.FC<ElementEditingPanelProps> = ({
  selectedElement,
  onDuplicate,
  onDelete,
  onRotate,
  onMove,
  onColorChange
}) => {
  if (!selectedElement) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center py-8 text-gray-500">
            Select an element to edit its properties
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get the number of colors in the selected element
  const colorCount = selectedElement.colors?.length || 0;
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Element Properties</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => onRotate(-15)}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Rotate Left
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => onRotate(15)}>
            <RotateCw className="h-4 w-4 mr-1" />
            Rotate Right
          </Button>
          
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Position</h4>
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <Button variant="outline" size="sm" onClick={() => onMove('up', 10)}>
              <MoveVertical className="h-4 w-4" />
            </Button>
            <div></div>
            
            <Button variant="outline" size="sm" onClick={() => onMove('left', 10)}>
              <MoveHorizontal className="h-4 w-4" />
            </Button>
            <div></div>
            <Button variant="outline" size="sm" onClick={() => onMove('right', 10)}>
              <MoveHorizontal className="h-4 w-4" />
            </Button>
            
            <div></div>
            <Button variant="outline" size="sm" onClick={() => onMove('down', 10)}>
              <MoveVertical className="h-4 w-4" />
            </Button>
            <div></div>
          </div>
        </div>
        
        {colorCount > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Colors</h4>
            {selectedElement.colors.map((color, index) => (
              <div key={index} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Color {index + 1}</span>
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
                <ColorPalette 
                  selectedColor={color}
                  onChange={(newColor) => onColorChange(index, newColor)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ElementEditingPanel;