import { useState, useRef, useEffect } from 'react';
import { Trash2, Move, RotateCw, Maximize, X, Edit, MousePointer } from 'lucide-react';
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
  const [actionMode, setActionMode] = useState<'move' | 'resize' | 'rotate' | 'edit' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Close edit mode when clicking outside
  useEffect(() => {
    if (editingColorIndex !== null) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('.color-editor') === null &&
          !target.classList.contains('edit-color-btn')
        ) {
          setEditingColorIndex(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingColorIndex]);

  const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize' | 'rotate') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!elementRef.current) return;
    
    setActionMode(mode);
    
    const rect = elementRef.current.getBoundingClientRect();
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ width: rect.width, height: rect.height });
    setStartRotation(element.rotation || 0);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!actionMode || !elementRef.current) return;
    
    // Calculate delta from start position
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    switch (actionMode) {
      case 'move':
        // Important: We use the current mouse position directly to set the new position
        // This ensures smooth dragging even when the element is initially positioned
        const newX = element.x + deltaX;
        const newY = element.y + deltaY;
        
        // Update the start position for the next move event
        setStartPos({ x: e.clientX, y: e.clientY });
        
        // Call the onMove callback with the new position
        onMove(newX, newY);
        break;
        
      case 'resize': {
        // Maintain aspect ratio
        const aspectRatio = startDimensions.width / startDimensions.height;
        const newWidth = Math.max(50, startDimensions.width + deltaX);
        const newHeight = Math.max(50, newWidth / aspectRatio);
        onResize(newWidth, newHeight);
        break;
      }
        
      case 'rotate': {
        // Calculate angle based on mouse position relative to element center
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const startAngle = Math.atan2(
          startPos.y - centerY,
          startPos.x - centerX
        );
        
        const currentAngle = Math.atan2(
          e.clientY - centerY,
          e.clientX - centerX
        );
        
        // Convert radians to degrees and add to original rotation
        const angleDelta = (currentAngle - startAngle) * (180 / Math.PI);
        const newRotation = (startRotation + angleDelta) % 360;
        
        onRotate(newRotation);
        break;
      }
    }
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setActionMode(null);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColorIndex !== null) {
      onColorChange(editingColorIndex, e.target.value);
    }
  };

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
      className={`absolute cursor-move ${isSelected ? 'z-10' : 'z-0'}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center',
        outline: isSelected ? '2px solid #4299e1' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        // Enable direct dragging by default when clicking on the element
        if (!isSelected) {
          onSelect();
        }
        handleMouseDown(e, 'move');
      }}
    >
      {/* Element content */}
      <div
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgWithReplacedColors }}
      />
      
      {/* Control handles when selected */}
      {isSelected && (
        <>
          {/* Top controls */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-white border border-secondary-200 rounded-md shadow-sm px-1 py-0.5">
            <button
              className={`p-1 rounded-sm ${actionMode === 'move' ? 'bg-primary-100 text-primary-800' : 'hover:bg-secondary-100'}`}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              title="Move"
            >
              <Move className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-sm ${actionMode === 'resize' ? 'bg-primary-100 text-primary-800' : 'hover:bg-secondary-100'}`}
              onMouseDown={(e) => handleMouseDown(e, 'resize')}
              title="Resize"
            >
              <Maximize className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-sm ${actionMode === 'rotate' ? 'bg-primary-100 text-primary-800' : 'hover:bg-secondary-100'}`}
              onMouseDown={(e) => handleMouseDown(e, 'rotate')}
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-sm ${actionMode === 'edit' ? 'bg-primary-100 text-primary-800' : 'hover:bg-secondary-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                setActionMode(actionMode === 'edit' ? null : 'edit');
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
          {actionMode === 'edit' && (
            <div className="absolute -left-2 -right-2 top-full mt-2 bg-white border border-secondary-200 rounded-md shadow-sm p-2 color-editor z-20">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Edit Colors</h4>
                <button
                  className="text-secondary-500 hover:text-secondary-700"
                  onClick={() => setActionMode(null)}
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
            className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-primary-500 rounded-full cursor-se-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          />
        </>
      )}
    </div>
  );
};

export default CanvasElement;