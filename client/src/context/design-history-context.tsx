import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { DesignElement } from '@/types';

// Maximum number of states to store in history
const MAX_HISTORY_LENGTH = 30;

interface DesignState {
  elements: DesignElement[];
  backgroundImage: string | null;
}

interface DesignHistoryContextType {
  // Current state
  currentState: DesignState;
  setCurrentState: (state: DesignState) => void;
  
  // History management
  canUndo: boolean;
  canRedo: boolean;
  history: DesignState[];
  currentIndex: number;
  
  // Actions
  undo: () => void;
  redo: () => void;
  saveState: (state: DesignState) => void;
  clearHistory: () => void;
}

const DesignHistoryContext = createContext<DesignHistoryContextType | null>(null);

export const useDesignHistory = () => {
  const context = useContext(DesignHistoryContext);
  if (!context) {
    throw new Error('useDesignHistory must be used within a DesignHistoryProvider');
  }
  return context;
};

export const DesignHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial empty state
  const initialState: DesignState = {
    elements: [],
    backgroundImage: null
  };
  
  // Current design state
  const [currentState, setCurrentState] = useState<DesignState>(initialState);
  
  // History state
  const [history, setHistory] = useState<DesignState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Computed values
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Save throttling
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Save current state to history
  const saveState = useCallback((state: DesignState) => {
    // Skip if the state is the same as the current one
    if (
      JSON.stringify(state.elements) === JSON.stringify(currentState.elements) && 
      state.backgroundImage === currentState.backgroundImage
    ) {
      return;
    }
    
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Throttle saving to prevent too many states being saved during rapid changes
    saveTimeoutRef.current = setTimeout(() => {
      setHistory(prevHistory => {
        // If we've undone some changes and are now making a new change,
        // we need to remove the "future" states
        const newHistory = prevHistory.slice(0, currentIndex + 1);
        
        // Add the new state
        const updatedHistory = [...newHistory, state];
        
        // Limit history length to prevent memory issues
        if (updatedHistory.length > MAX_HISTORY_LENGTH) {
          updatedHistory.shift();
        }
        
        // Update current index
        setCurrentIndex(updatedHistory.length - 1);
        
        return updatedHistory;
      });
      
      // Update current state
      setCurrentState(state);
    }, 300); // 300ms throttle
  }, [currentIndex, currentState]);
  
  // Undo to previous state
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const previousState = history[newIndex];
      setCurrentState(previousState);
    }
  }, [canUndo, currentIndex, history]);
  
  // Redo to next state
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const nextState = history[newIndex];
      setCurrentState(nextState);
    }
  }, [canRedo, currentIndex, history]);
  
  // Clear all history
  const clearHistory = useCallback(() => {
    const emptyState: DesignState = {
      elements: [],
      backgroundImage: null
    };
    
    setHistory([emptyState]);
    setCurrentIndex(0);
    setCurrentState(emptyState);
  }, []);
  
  const value = {
    currentState,
    setCurrentState,
    canUndo,
    canRedo,
    history,
    currentIndex,
    undo,
    redo,
    saveState,
    clearHistory
  };
  
  return (
    <DesignHistoryContext.Provider value={value}>
      {children}
    </DesignHistoryContext.Provider>
  );
};