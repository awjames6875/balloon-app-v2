import { useState, useEffect, useRef } from 'react';
import { DesignElement } from '@/types';

interface DesignCanvasProps {
  backgroundImage: string | null;
  elements: DesignElement[];
  onElementsChange: (elements: DesignElement[]) => void;
}

const DesignCanvas = ({ backgroundImage, elements, onElementsChange }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<{ id: string, startX: number, startY: number, offsetX: number, offsetY: number } | null>(null);
  
  // Find the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  // Handle element selection
  const handleElementSelect = (id: string) => {
    setSelectedElementId(id);
  };
  
  // Handle element drag start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    setDraggedElement({
      id,
      startX: element.x,
      startY: element.y,
      offsetX: e.clientX - element.x,
      offsetY: e.clientY - element.y
    });
    
    setSelectedElementId(id);
  };
  
  // Handle element drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggedElement) return;
    
    const updatedElements = elements.map(el => {
      if (el.id === draggedElement.id) {
        return {
          ...el,
          x: e.clientX - draggedElement.offsetX,
          y: e.clientY - draggedElement.offsetY
        };
      }
      return el;
    });
    
    onElementsChange(updatedElements);
  };
  
  // Handle element drag end
  const handleDragEnd = () => {
    setDraggedElement(null);
  };
  
  // Handle canvas click to deselect elements
  const handleCanvasClick = () => {
    setSelectedElementId(null);
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    if (!draggedElement) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const updatedElements = elements.map(el => {
        if (el.id === draggedElement.id) {
          return {
            ...el,
            x: e.clientX - draggedElement.offsetX,
            y: e.clientY - draggedElement.offsetY
          };
        }
        return el;
      });
      
      onElementsChange(updatedElements);
    };
    
    const handleMouseUp = () => {
      setDraggedElement(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedElement, elements, onElementsChange]);
  
  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-white overflow-hidden"
      onClick={handleCanvasClick}
      style={{ 
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-move ${selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            transform: `rotate(${element.rotation}deg)`,
            zIndex: selectedElementId === element.id ? 10 : 1
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleElementSelect(element.id);
          }}
          onMouseDown={(e) => handleDragStart(e, element.id)}
          dangerouslySetInnerHTML={{ __html: element.svgContent }}
        />
      ))}
    </div>
  );
};

export default DesignCanvas;