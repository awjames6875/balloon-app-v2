import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { BalloonClusterTemplate } from './balloon-templates-data';
import { useToast } from '@/hooks/use-toast';

interface BalloonTemplateProps {
  template: BalloonClusterTemplate;
  onTemplateClick?: (template: BalloonClusterTemplate) => void;
}

const BalloonTemplate = ({ template, onTemplateClick }: BalloonTemplateProps) => {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BALLOON_TEMPLATE',
    item: { 
      templateId: template.id,
      type: 'balloon-cluster',
      svgContent: template.svgContent,
      defaultColors: template.defaultColors,
      elements: template.elements || undefined
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleTemplateClick = (e: React.MouseEvent) => {
    // Only capture the double-click
    if (e.detail === 2 && onTemplateClick) {
      e.stopPropagation();
      onTemplateClick(template);
      toast({
        title: "Template Added",
        description: `${template.name} has been added to your canvas`,
      });
    } else {
      // Single click expands
      setExpanded(!expanded);
    }
  };

  return (
    <div
      ref={drag}
      className={`balloon-template p-2 mb-2 border rounded-md cursor-pointer transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${expanded ? 'h-auto' : 'h-24'} overflow-hidden hover:bg-primary-50`}
      onClick={handleTemplateClick}
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-center mb-2">
        <div className="template-thumbnail w-16 h-16 mr-3 border rounded overflow-hidden bg-white flex-shrink-0">
          <div dangerouslySetInnerHTML={{ __html: template.svgContent }} />
        </div>
        <div>
          <h3 className="font-medium text-sm">{template.name}</h3>
          <p className="text-xs text-secondary-500">
            {template.largeBalloonCount} large, {template.smallBalloonCount} small
          </p>
          <p className="text-xs font-medium text-primary-700 mt-1">Double-click to add</p>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium mb-1">Default Colors:</div>
          <div className="flex flex-wrap">
            {template.defaultColors.slice(0, 6).map((color, index) => (
              <div
                key={index}
                className="w-5 h-5 rounded-full mr-1 mb-1"
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
            {template.defaultColors.length > 6 && (
              <div className="w-5 h-5 rounded-full border border-dashed flex items-center justify-center text-xs mr-1 mb-1">
                +{template.defaultColors.length - 6}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalloonTemplate;