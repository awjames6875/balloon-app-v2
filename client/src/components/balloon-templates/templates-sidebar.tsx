import { useState } from 'react';
import { balloonClusterTemplates } from './balloon-templates-data';
import BalloonTemplate from './balloon-template';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

const TemplatesSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = balloonClusterTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <BalloonTemplate key={template.id} template={template} />
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