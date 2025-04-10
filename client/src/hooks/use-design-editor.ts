import { useState, useCallback } from 'react';
import { DesignElement } from '@/types';

interface UseDesignEditorProps {
  initialElements?: DesignElement[];
  initialBackgroundImage?: string | null;
}

/**
 * Custom hook for managing design canvas state and operations
 */
export const useDesignEditor = ({ 
  initialElements = [], 
  initialBackgroundImage = null 
}: UseDesignEditorProps = {}) => {
  // Canvas state
  const [elements, setElements] = useState<DesignElement[]>(initialElements);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(initialBackgroundImage);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Design metadata
  const [designName, setDesignName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');

  // UI state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Get the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId) || null;
  
  /**
   * Update the position of an element
   */
  const moveElement = useCallback((
    elementId: string, 
    direction: 'up' | 'down' | 'left' | 'right', 
    amount: number
  ) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      
      let newX = el.x;
      let newY = el.y;
      
      switch (direction) {
        case 'up':
          newY -= amount;
          break;
        case 'down':
          newY += amount;
          break;
        case 'left':
          newX -= amount;
          break;
        case 'right':
          newX += amount;
          break;
      }
      
      return { ...el, x: newX, y: newY };
    }));
  }, []);
  
  /**
   * Rotate an element
   */
  const rotateElement = useCallback((elementId: string, rotationDegrees: number) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      const newRotation = (el.rotation || 0) + rotationDegrees;
      return { ...el, rotation: newRotation };
    }));
  }, []);
  
  /**
   * Delete an element
   */
  const deleteElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElementId(null);
  }, []);
  
  /**
   * Duplicate an element
   */
  const duplicateElement = useCallback((elementId: string) => {
    const elementToDuplicate = elements.find(el => el.id === elementId);
    if (!elementToDuplicate) return;
    
    const newElement: DesignElement = {
      ...elementToDuplicate,
      id: `element-${Date.now()}`,
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, [elements]);
  
  /**
   * Change an element's color
   */
  const changeElementColor = useCallback((
    elementId: string, 
    colorIndex: number, 
    newColor: string
  ) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      
      const updatedColors = [...(el.colors || [])];
      updatedColors[colorIndex] = newColor;
      
      return { ...el, colors: updatedColors };
    }));
  }, []);
  
  /**
   * Add a new element to the canvas
   */
  const addElement = useCallback((element: DesignElement) => {
    setElements(prev => [...prev, element]);
    setSelectedElementId(element.id);
  }, []);
  
  /**
   * Clear the canvas
   */
  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedElementId(null);
  }, []);
  
  return {
    // State
    elements,
    setElements,
    backgroundImage,
    setBackgroundImage,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    designName,
    setDesignName,
    clientName,
    setClientName,
    eventDate,
    setEventDate,
    eventType,
    setEventType,
    isEditing,
    setIsEditing,
    isSaving,
    setIsSaving,
    
    // Operations
    moveElement,
    rotateElement,
    deleteElement,
    duplicateElement,
    changeElementColor,
    addElement,
    clearCanvas,
  };
};