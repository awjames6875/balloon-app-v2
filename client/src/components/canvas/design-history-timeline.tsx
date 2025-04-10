import React, { useEffect, useRef } from 'react';
import { useDesignHistory } from '@/context/design-history-context';
import { Button } from '@/components/ui/button';
import { RotateCcw, Undo2, Redo2, History } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DesignHistoryTimelineProps {
  isOpen: boolean;
}

const DesignHistoryTimeline: React.FC<DesignHistoryTimelineProps> = ({ isOpen }) => {
  const { 
    history, 
    currentIndex,
    canUndo, 
    canRedo, 
    undo, 
    redo 
  } = useDesignHistory();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the current item in the timeline when it changes
  useEffect(() => {
    if (timelineRef.current && isOpen) {
      const timelineElement = timelineRef.current;
      const currentItem = timelineElement.querySelector(`[data-index="${currentIndex}"]`);
      
      if (currentItem) {
        // Scroll the current item into view with smooth animation
        currentItem.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex, isOpen]);
  
  if (!isOpen) return null;
  
  // Format the timestamp for display
  const formatTimestamp = (index: number): string => {
    const now = new Date();
    // Create a relative timestamp (e.g., "2 min ago")
    const minutes = history.length - index - 1;
    
    if (minutes === 0) return 'Current';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <History className="h-4 w-4 mr-2 text-gray-500" />
          <h3 className="text-sm font-semibold">Design History</h3>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={undo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div 
        className="overflow-x-auto pb-2" 
        ref={timelineRef}
      >
        <div className="flex space-x-2 min-w-max">
          {history.map((state, index) => {
            const isCurrent = index === currentIndex;
            const stateLabel = `Version ${index + 1}`;
            const timeLabel = formatTimestamp(index);
            const elementCount = state.elements.length;
            
            return (
              <div 
                key={index}
                data-index={index}
                className={`flex-shrink-0 cursor-pointer transition-all duration-150 border rounded-md p-2 ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{ 
                  width: '80px',
                  opacity: isCurrent ? 1 : 0.8
                }}
                onClick={() => {
                  // Jump directly to this state
                  const diff = index - currentIndex;
                  if (diff < 0) {
                    // Need to undo multiple times
                    for (let i = 0; i < Math.abs(diff); i++) {
                      undo();
                    }
                  } else if (diff > 0) {
                    // Need to redo multiple times
                    for (let i = 0; i < diff; i++) {
                      redo();
                    }
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="text-xs font-semibold text-center truncate w-full">
                    {stateLabel}
                  </div>
                  <div className="text-[10px] text-gray-500 text-center">
                    {timeLabel}
                  </div>
                  <div 
                    className="mt-1 w-full h-10 border rounded overflow-hidden bg-white flex items-center justify-center"
                    style={{ 
                      fontSize: '9px',
                      color: elementCount ? 'inherit' : '#999'
                    }}
                  >
                    {elementCount ? (
                      <div className="text-[10px]">{elementCount} elements</div>
                    ) : (
                      <div className="text-[10px] text-gray-400">Empty</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DesignHistoryTimeline;