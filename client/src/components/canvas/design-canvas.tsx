import { useState, useEffect, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { DesignElement } from '@/types';

interface DesignCanvasProps {
  backgroundImage: string | null;
  elements: DesignElement[];
  onElementsChange: (elements: DesignElement[]) => void;
}

const DesignCanvas = ({ backgroundImage, elements, onElementsChange }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<{ id: string, startX: number, startY: number, offsetX: number, offsetY: number } | null>(null);
  
  // Find the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  // Set up drop target for templates
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BALLOON_TEMPLATE',
    drop: (item: any, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const dropPosition = monitor.getClientOffset();
      
      if (dropPosition) {
        const x = dropPosition.x - canvasRect.left;
        const y = dropPosition.y - canvasRect.top;
        
        // Get the SVG content and apply the correct colors
        let svgContent = item.svgContent;
        
        // Replace color placeholders with actual colors from the template
        if (item.defaultColors && item.defaultColors.length > 0) {
          // Apply primary color
          svgContent = svgContent.replace(/var\(--color-primary\)/g, item.defaultColors[0]);
          
          // Apply secondary color
          if (item.defaultColors.length > 1) {
            svgContent = svgContent.replace(/var\(--color-secondary\)/g, item.defaultColors[1]);
          }
          
          // Apply accent colors
          for (let i = 2; i < item.defaultColors.length && i < 13; i++) {
            svgContent = svgContent.replace(
              new RegExp(`var\\(--color-accent-${i-1}\\)`, 'g'), 
              item.defaultColors[i]
            );
          }
        }
        
        const newElement: DesignElement = {
          id: `element-${Date.now()}`,
          type: 'balloon-cluster',
          x: x,
          y: y,
          width: 150,
          height: 150,
          rotation: 0,
          svgContent: svgContent,
          colors: item.defaultColors || ['#FF5757']
        };
        
        onElementsChange([...elements, newElement]);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  
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
      ref={drop}
      className={`relative w-full h-full bg-white overflow-hidden ${isOver ? 'bg-blue-50' : ''}`}
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