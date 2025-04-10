import { useState, useEffect, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { DesignElement } from '@/types';
import { RotateCw, Maximize2, Move } from 'lucide-react';

interface DesignCanvasProps {
  backgroundImage: string | null;
  elements: DesignElement[];
  onElementsChange: (elements: DesignElement[]) => void;
  snapToGrid?: boolean;
  gridSize?: number;
}

const DesignCanvas = ({ 
  backgroundImage, 
  elements, 
  onElementsChange,
  snapToGrid = true,
  gridSize = 20
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<{ 
    id: string, 
    startX: number, 
    startY: number, 
    offsetX: number, 
    offsetY: number,
    originalPosition: { x: number, y: number }
  } | null>(null);
  
  // For resize operations
  const [resizingElement, setResizingElement] = useState<{
    id: string,
    startWidth: number,
    startHeight: number,
    startX: number,
    startY: number,
    startMouseX: number,
    startMouseY: number,
    originalSize: { width: number, height: number }
  } | null>(null);
  
  // For rotation operations
  const [rotatingElement, setRotatingElement] = useState<{
    id: string,
    centerX: number,
    centerY: number,
    startRotation: number,
    startAngle: number,
    originalRotation: number
  } | null>(null);
  
  // Canvas boundaries - will be set on canvas mount
  const [canvasBounds, setCanvasBounds] = useState({ 
    left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 
  });
  
  // Set canvas boundaries on mount
  useEffect(() => {
    const updateCanvasBounds = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasBounds({
          left: 0,
          top: 0,
          right: rect.width,
          bottom: rect.height,
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateCanvasBounds();
    window.addEventListener('resize', updateCanvasBounds);
    
    return () => {
      window.removeEventListener('resize', updateCanvasBounds);
    };
  }, []);
  
  // Find the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  // Helper function to snap coordinates to grid
  const snapToGridFunc = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    // Use Math.floor for more consistent grid snapping
    return {
      x: Math.floor(x / gridSize) * gridSize,
      y: Math.floor(y / gridSize) * gridSize
    };
  };
  
  // Helper function to keep elements within canvas bounds
  const keepWithinBounds = (x: number, y: number, width: number, height: number) => {
    return {
      x: Math.max(0, Math.min(x, canvasBounds.width - width)),
      y: Math.max(0, Math.min(y, canvasBounds.height - height))
    };
  };
  
  // Set up drop target for templates
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BALLOON_TEMPLATE',
    drop: (item: any, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const dropPosition = monitor.getClientOffset();
      
      if (dropPosition) {
        let x = dropPosition.x - canvasRect.left;
        let y = dropPosition.y - canvasRect.top;
        
        // Snap to grid
        if (snapToGrid) {
          const snapped = snapToGridFunc(x, y);
          x = snapped.x;
          y = snapped.y;
        }
        
        // Keep within bounds
        const width = item.width || 150;
        const height = item.height || 150;
        const bounded = keepWithinBounds(x, y, width, height);
        x = bounded.x;
        y = bounded.y;
        
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
        
        // Add animation class for smoother appearance
        const newElement: DesignElement = {
          id: `element-${Date.now()}`,
          type: 'balloon-cluster',
          x: x,
          y: y,
          width: width,
          height: height,
          rotation: 0,
          svgContent: svgContent,
          colors: item.defaultColors || ['#FF5757']
        };
        
        onElementsChange([...elements, newElement]);
        
        // Select the newly added element
        setSelectedElementId(newElement.id);
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
    
    // Add original position to allow for cancellation
    setDraggedElement({
      id,
      startX: element.x,
      startY: element.y,
      offsetX: e.clientX - element.x,
      offsetY: e.clientY - element.y,
      originalPosition: { x: element.x, y: element.y }
    });
    
    // Bring element to front by selecting it
    setSelectedElementId(id);
  };
  
  // Handle canvas click to deselect elements
  const handleCanvasClick = () => {
    setSelectedElementId(null);
  };
  
  // Handle element drag
  useEffect(() => {
    if (!draggedElement) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new position
      let newX = e.clientX - draggedElement.offsetX;
      let newY = e.clientY - draggedElement.offsetY;
      
      // Get the element being dragged
      const element = elements.find(el => el.id === draggedElement.id);
      if (!element) return;
      
      // Snap to grid if enabled
      if (snapToGrid) {
        const snapped = snapToGridFunc(newX, newY);
        newX = snapped.x;
        newY = snapped.y;
      }
      
      // Keep within canvas bounds
      const bounded = keepWithinBounds(newX, newY, element.width, element.height);
      newX = bounded.x;
      newY = bounded.y;
      
      // Update element position
      const updatedElements = elements.map(el => {
        if (el.id === draggedElement.id) {
          return {
            ...el,
            x: newX,
            y: newY
          };
        }
        return el;
      });
      
      onElementsChange(updatedElements);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // Final position adjust with snap
      if (snapToGrid && draggedElement) {
        const element = elements.find(el => el.id === draggedElement.id);
        if (element) {
          const snapped = snapToGridFunc(element.x, element.y);
          
          // Only update if position would change
          if (snapped.x !== element.x || snapped.y !== element.y) {
            const updatedElements = elements.map(el => {
              if (el.id === draggedElement.id) {
                return {
                  ...el,
                  x: snapped.x,
                  y: snapped.y
                };
              }
              return el;
            });
            
            onElementsChange(updatedElements);
          }
        }
      }
      
      setDraggedElement(null);
    };
    
    // Handle escape key to cancel drag
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draggedElement) {
        const updatedElements = elements.map(el => {
          if (el.id === draggedElement.id) {
            return {
              ...el,
              x: draggedElement.originalPosition.x,
              y: draggedElement.originalPosition.y
            };
          }
          return el;
        });
        
        onElementsChange(updatedElements);
        setDraggedElement(null);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [draggedElement, elements, onElementsChange, snapToGrid, gridSize, canvasBounds]);
  
  return (
    <div 
      ref={(node) => {
        // Combine the drop and canvasRef refs
        drop(node);
        canvasRef.current = node;
      }}
      className={`relative w-full h-full bg-white overflow-hidden transition-colors duration-150 ${isOver ? 'bg-blue-50' : ''}`}
      onClick={handleCanvasClick}
      style={{ 
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Grid overlay */}
      {snapToGrid && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Primary grid lines (every gridSize pixels) */}
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(81, 92, 230, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(81, 92, 230, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`
          }} />
          
          {/* Emphasized major grid lines (every 5 grid cells) */}
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize * 5}px ${gridSize * 5}px`
          }} />
        </div>
      )}
      
      {/* Draggable elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-move transition-transform duration-150 ease-in-out 
                     ${selectedElementId === element.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-blue-300'}
                     ${draggedElement && draggedElement.id === element.id ? 'opacity-90' : 'opacity-100'}`}
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            transform: `rotate(${element.rotation}deg)`,
            zIndex: selectedElementId === element.id ? 10 : 1,
            willChange: draggedElement && draggedElement.id === element.id ? 'transform, left, top' : 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleElementSelect(element.id);
          }}
          onMouseDown={(e) => handleDragStart(e, element.id)}
        >
          <div 
            className="w-full h-full relative"
            dangerouslySetInnerHTML={{ __html: element.svgContent }}
          />
          
          {/* Resize and rotation controls - only shown when element is selected */}
          {selectedElementId === element.id && (
            <>
              {/* Resize handle - bottom right corner */}
              <div 
                className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-blue-400 shadow-md flex items-center justify-center cursor-se-resize"
                style={{ 
                  transform: 'translate(30%, 30%)',
                  zIndex: 20
                }}
                onMouseDown={(e) => {
                  e.stopPropagation(); // Prevent element movement
                  
                  const element = elements.find(el => el.id === selectedElementId);
                  if (!element) return;
                  
                  // Initialize resize operation
                  setResizingElement({
                    id: element.id,
                    startWidth: element.width,
                    startHeight: element.height,
                    startX: element.x,
                    startY: element.y,
                    startMouseX: e.clientX,
                    startMouseY: e.clientY,
                    originalSize: { width: element.width, height: element.height }
                  });
                }}
              >
                <Maximize2 className="w-3 h-3 text-blue-600" />
              </div>
              
              {/* Rotation handle - top right corner */}
              <div 
                className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-blue-400 shadow-md flex items-center justify-center cursor-crosshair"
                style={{ 
                  transform: 'translate(30%, -30%)',
                  zIndex: 20
                }}
                onMouseDown={(e) => {
                  e.stopPropagation(); // Prevent element movement
                  // Rotation logic will be implemented here
                }}
              >
                <RotateCw className="w-3 h-3 text-blue-600" />
              </div>
              
              {/* Move handle - center */}
              <div 
                className="absolute top-0 left-0 w-6 h-6 bg-white rounded-full border-2 border-blue-400 shadow-md flex items-center justify-center cursor-move"
                style={{ 
                  transform: 'translate(-30%, -30%)',
                  zIndex: 20
                }}
                onMouseDown={(e) => {
                  // Use the existing drag logic
                  handleDragStart(e, element.id);
                }}
              >
                <Move className="w-3 h-3 text-blue-600" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default DesignCanvas;