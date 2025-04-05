import { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Grid, ZoomIn, ZoomOut } from 'lucide-react';
import { DesignElement } from '@/types';
import CanvasElement from '../canvas/canvas-element';

interface DesignCanvasProps {
  backgroundImage: string | null;
  elements: DesignElement[];
  onElementsChange: (elements: DesignElement[]) => void;
}

const DesignCanvas = ({
  backgroundImage,
  elements,
  onElementsChange
}: DesignCanvasProps) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Handle drop of balloon templates
  const [, drop] = useDrop(() => ({
    accept: 'BALLOON_TEMPLATE',
    drop: (item: any, monitor) => {
      if (item.elements) {
        // Load saved template elements
        onElementsChange(item.elements.map((el: any) => ({
          ...el,
          id: `element-${Date.now()}-${Math.random()}`
        })));
        return;
      }
      
      const dropOffset = monitor.getClientOffset();
      if (!dropOffset || !canvasRef.current || !wrapperRef.current) return;
      
      // Get the canvas element's position relative to the viewport
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate the drop position within the canvas, accounting for zoom and scroll
      const x = (dropOffset.x - canvasRect.left) / zoom;
      const y = (dropOffset.y - canvasRect.top) / zoom;
      
      // Create a new element - generate unique ID for each new element
      const newElement: DesignElement = {
        id: uuidv4(),
        type: 'balloon-cluster',
        x,
        y,
        width: item.width || 150,
        height: item.height || 150,
        rotation: 0,
        svgContent: item.svgContent,
        colors: [...item.defaultColors]
      };
      
      // Add the new element to the canvas
      onElementsChange([...elements, newElement]);
      
      // Select the newly added element
      setSelectedElementId(newElement.id);
    }
  }));
  
  // Clear selection when clicking on empty canvas space
  const handleCanvasClick = () => {
    setSelectedElementId(null);
  };
  
  // Handle zoom changes
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If no element selected or focus in an input field, ignore
      if (!selectedElementId || e.target instanceof HTMLInputElement) return;
      
      // Delete and Backspace keys
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onElementsChange(elements.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
      }
      
      // Arrow keys for moving selected element
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement) {
        const moveAmount = e.shiftKey ? 10 : 1;
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleElementMove(selectedElementId, selectedElement.x, selectedElement.y - moveAmount);
        }
        else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleElementMove(selectedElementId, selectedElement.x, selectedElement.y + moveAmount);
        }
        else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleElementMove(selectedElementId, selectedElement.x - moveAmount, selectedElement.y);
        }
        else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleElementMove(selectedElementId, selectedElement.x + moveAmount, selectedElement.y);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId, elements, onElementsChange]);
  
  // Element event handlers
  const handleElementMove = (id: string, x: number, y: number) => {
    // Ensure coordinates stay within canvas bounds
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      // Normalize to actual canvas dimensions
      const maxX = canvasRect.width / zoom;
      const maxY = canvasRect.height / zoom;
      
      // Clamp the position to keep element at least partially visible
      const element = elements.find(el => el.id === id);
      if (element) {
        const clampedX = Math.max(-(element.width / 2), Math.min(x, maxX - element.width / 2));
        const clampedY = Math.max(-(element.height / 2), Math.min(y, maxY - element.height / 2));
        
        onElementsChange(
          elements.map(el => 
            el.id === id ? { ...el, x: clampedX, y: clampedY } : el
          )
        );
      } else {
        // Fallback if element not found
        onElementsChange(
          elements.map(el => 
            el.id === id ? { ...el, x, y } : el
          )
        );
      }
    } else {
      // Fallback if canvas not available
      onElementsChange(
        elements.map(el => 
          el.id === id ? { ...el, x, y } : el
        )
      );
    }
  };
  
  const handleElementResize = (id: string, width: number, height: number) => {
    onElementsChange(
      elements.map(el => 
        el.id === id ? { ...el, width, height } : el
      )
    );
  };
  
  const handleElementRotate = (id: string, rotation: number) => {
    onElementsChange(
      elements.map(el => 
        el.id === id ? { ...el, rotation } : el
      )
    );
  };
  
  const handleElementDelete = (id: string) => {
    onElementsChange(elements.filter(el => el.id !== id));
    setSelectedElementId(null);
  };
  
  const handleElementColorChange = (id: string, colorIndex: number, color: string) => {
    onElementsChange(
      elements.map(el => {
        if (el.id === id && el.colors) {
          const newColors = [...el.colors];
          newColors[colorIndex] = color;
          return { ...el, colors: newColors };
        }
        return el;
      })
    );
  };
  
  return (
    <div className="relative w-full h-full flex flex-col" ref={wrapperRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 px-4 border-b border-[#e0e0e0]">
        <div className="flex items-center space-x-2">
          <button
            className={`p-1.5 rounded-md ${showGrid ? 'bg-[#5568FE] bg-opacity-10 text-[#5568FE]' : 'text-[#333333] hover:bg-[#f0f0f0]'}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            className="p-1.5 rounded-md text-[#333333] hover:bg-[#f0f0f0]"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium px-2">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="p-1.5 rounded-md text-[#333333] hover:bg-[#f0f0f0]"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Canvas area */}
      <div 
        ref={drop}
        className="w-full h-full relative"
      >
        {elements.length === 0 && !backgroundImage && (
          <div className="absolute inset-0 flex items-center justify-center text-[#aaaaaa] pointer-events-none">
            Drag balloon clusters here
          </div>
        )}
        
        <div
          className="w-full h-full relative"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none z-0" 
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(200, 200, 200, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}
          
          {/* Actual canvas for design elements */}
          <div
            ref={canvasRef}
            className="absolute inset-0 overflow-hidden"
            onClick={handleCanvasClick}
          >
            {/* Render all design elements */}
            {elements.map(element => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                onSelect={() => setSelectedElementId(element.id)}
                onMove={(x, y) => handleElementMove(element.id, x, y)}
                onResize={(width, height) => handleElementResize(element.id, width, height)}
                onRotate={(rotation) => handleElementRotate(element.id, rotation)}
                onDelete={() => handleElementDelete(element.id)}
                onColorChange={(colorIndex, color) => handleElementColorChange(element.id, colorIndex, color)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;