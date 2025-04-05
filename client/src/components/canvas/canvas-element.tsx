import { useState, useRef, useEffect } from 'react';
import { Trash2, Move, RotateCw, Maximize, X, Edit } from 'lucide-react';
import { DesignElement } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CanvasElementProps {
  element: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onRotate: (rotation: number) => void;
  onDelete: () => void;
  onColorChange: (colorIndex: number, color: string) => void;
}

const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onRotate,
  onDelete,
  onColorChange
}: CanvasElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'rotate' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });
  const [isEditingColors, setIsEditingColors] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Only add listeners if we're dragging
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      
      // Touch events
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, dragMode, dragStart, elementStart]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, mode: 'move' | 'resize' | 'rotate') => {
    e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    
    let clientX = 0, clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({ x: clientX, y: clientY });
    setElementStart({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation || 0
    });
    
    if (!isSelected) {
      onSelect();
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
    
    if (e.touches.length === 0) return;
    
    const touch = e.touches[0];
    handleDragMove({
      clientX: touch.clientX,
      clientY: touch.clientY
    } as unknown as MouseEvent);
  };
  
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !dragMode) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    switch (dragMode) {
      case 'move':
        onMove(elementStart.x + deltaX, elementStart.y + deltaY);
        break;
        
      case 'resize': {
        // Maintain aspect ratio
        const aspectRatio = elementStart.width / elementStart.height;
        const newWidth = Math.max(50, elementStart.width + deltaX);
        const newHeight = Math.max(50, newWidth / aspectRatio);
        onResize(newWidth, newHeight);
        break;
      }
        
      case 'rotate': {
        if (!elementRef.current) return;
        
        // Calculate the center of the element
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate initial angle
        const startAngle = Math.atan2(
          dragStart.y - centerY,
          dragStart.x - centerX
        );
        
        // Calculate current angle
        const currentAngle = Math.atan2(
          e.clientY - centerY,
          e.clientX - centerX
        );
        
        // Calculate rotation in degrees
        const angleDelta = (currentAngle - startAngle) * (180 / Math.PI);
        const newRotation = (elementStart.rotation + angleDelta) % 360;
        
        onRotate(newRotation);
        break;
      }
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragMode(null);
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColorIndex !== null) {
      onColorChange(editingColorIndex, e.target.value);
    }
  };
  
  // Close edit mode when clicking outside
  useEffect(() => {
    if (isEditingColors) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          elementRef.current && 
          !elementRef.current.contains(target) && 
          !target.closest('.color-editor')
        ) {
          setIsEditingColors(false);
        }
      };
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditingColors]);

  // Update element position for SVG display
  const svgWithReplacedColors = element.svgContent.replace(
    /fill="(#[A-Fa-f0-9]{6})"/g,
    (match, originalColor, index, fullString) => {
      // Find the correct index for this color in the string
      const colorIndex = fullString.substring(0, index).match(/fill="(#[A-Fa-f0-9]{6})"/g)?.length || 0;
      
      // Use the color at the correct index from the element's colors array
      if (element.colors && element.colors[colorIndex]) {
        return `fill="${element.colors[colorIndex]}"`;
      }
      return match;
    }
  );

  return (
    <div
      ref={elementRef}
      className={`absolute ${isSelected ? 'z-10' : 'z-0'} touch-none`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center',
        outline: isSelected ? '2px solid #4299e1' : 'none',
        cursor: isDragging ? (dragMode === 'move' ? 'grabbing' : dragMode === 'resize' ? 'nwse-resize' : 'grab') : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={(e) => handleDragStart(e, 'move')}
      onTouchStart={(e) => handleDragStart(e, 'move')}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onSelect();
        }
      }}
    >
      {/* Element content */}
      <div
        className="w-full h-full pointer-events-none"
        dangerouslySetInnerHTML={{ __html: svgWithReplacedColors }}
      />
      
      {/* Control handles when selected */}
      {isSelected && (
        <>
          {/* Top controls */}
          <div 
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-white border border-secondary-200 rounded-md shadow-sm px-1 py-0.5 z-20"
            onClick={e => e.stopPropagation()}
          >
            <button
              className={`p-1 rounded-sm hover:bg-secondary-100`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDragStart(e, 'move');
              }}
              title="Move"
            >
              <Move className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-sm hover:bg-secondary-100`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDragStart(e, 'resize');
              }}
              title="Resize"
            >
              <Maximize className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-sm hover:bg-secondary-100`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDragStart(e, 'rotate');
              }}
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-sm ${isEditingColors ? 'bg-primary-100 text-primary-800' : 'hover:bg-secondary-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingColors(!isEditingColors);
              }}
              title="Edit Colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              className="p-1 rounded-sm text-error-600 hover:bg-error-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Color editor */}
          {isEditingColors && (
            <div 
              className="absolute -left-2 -right-2 top-full mt-2 bg-white border border-secondary-200 rounded-md shadow-sm p-2 color-editor z-20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Edit Colors</h4>
                <button
                  className="text-secondary-500 hover:text-secondary-700"
                  onClick={() => setIsEditingColors(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                {element.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-secondary-300 cursor-pointer relative"
                      style={{ backgroundColor: color || '#CCCCCC' }}
                      onClick={() => setEditingColorIndex(index)}
                    >
                      {editingColorIndex === index && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <input
                            type="color"
                            value={color || '#CCCCCC'}
                            onChange={handleColorChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-secondary-700">Color {index + 1}</span>
                    <button
                      className="edit-color-btn ml-auto p-1 text-primary-600 hover:text-primary-800"
                      onClick={() => setEditingColorIndex(index)}
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-primary-500 rounded-full cursor-se-resize z-10"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleDragStart(e, 'resize');
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleDragStart(e, 'resize');
            }}
          />
        </>
      )}
    </div>
  );
};

export default CanvasElement;