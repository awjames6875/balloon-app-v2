import { useState } from 'react';
import { balloonClusterTemplates, BalloonClusterTemplate } from './balloon-templates-data';
import BalloonTemplate from './balloon-template';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface TemplatesSidebarProps {
  onTemplateSelect?: (template: BalloonClusterTemplate) => void;
}

const TemplatesSidebar = ({ onTemplateSelect }: TemplatesSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const savedTemplates = JSON.parse(localStorage.getItem('savedTemplates') || '[]');
  const allTemplates = [...balloonClusterTemplates, ...savedTemplates];
  
  const filteredTemplates = allTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateClick = (template: BalloonClusterTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-secondary-500" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <BalloonTemplate 
            key={template.id} 
            template={template} 
            onTemplateClick={handleTemplateClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplatesSidebar;

// Define template types
interface BalloonTemplate {
  id: string;
  name: string;
  type: 'balloon-cluster';
  svgContent: string;
  defaultColors: string[];
  estimatedBalloons: number;
  category: 'arch' | 'column' | 'garland' | 'accent';
}