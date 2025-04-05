import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Search, Grid, List, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

// Template data
const BALLOON_TEMPLATES: BalloonTemplate[] = [
  {
    id: 'template-1',
    name: 'Classic Arch',
    type: 'balloon-cluster',
    category: 'arch',
    estimatedBalloons: 24,
    defaultColors: ['#FF5A5F', '#FFC0CB', '#FFFFFF'],
    svgContent: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,60 Q50,20 90,60" stroke="#333" stroke-width="2" fill="none" />
      <circle cx="10" cy="60" r="8" fill="#FF5A5F" />
      <circle cx="20" cy="52" r="8" fill="#FFC0CB" />
      <circle cx="30" cy="44" r="8" fill="#FFFFFF" />
      <circle cx="40" cy="36" r="8" fill="#FF5A5F" />
      <circle cx="50" cy="32" r="8" fill="#FFC0CB" />
      <circle cx="60" cy="36" r="8" fill="#FFFFFF" />
      <circle cx="70" cy="44" r="8" fill="#FF5A5F" />
      <circle cx="80" cy="52" r="8" fill="#FFC0CB" />
      <circle cx="90" cy="60" r="8" fill="#FFFFFF" />
    </svg>`
  },
  {
    id: 'template-2',
    name: 'Spiral Column',
    type: 'balloon-cluster',
    category: 'column',
    estimatedBalloons: 16,
    defaultColors: ['#5B9BD5', '#70AD47', '#FFFFFF'],
    svgContent: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="10" x2="50" y2="70" stroke="#333" stroke-width="2" />
      <circle cx="50" cy="12" r="8" fill="#5B9BD5" />
      <circle cx="42" cy="20" r="8" fill="#70AD47" />
      <circle cx="50" cy="28" r="8" fill="#FFFFFF" />
      <circle cx="58" cy="36" r="8" fill="#5B9BD5" />
      <circle cx="50" cy="44" r="8" fill="#70AD47" />
      <circle cx="42" cy="52" r="8" fill="#FFFFFF" />
      <circle cx="50" cy="60" r="8" fill="#5B9BD5" />
      <circle cx="58" cy="68" r="8" fill="#70AD47" />
    </svg>`
  },
  {
    id: 'template-3',
    name: 'Organic Garland',
    type: 'balloon-cluster',
    category: 'garland',
    estimatedBalloons: 20,
    defaultColors: ['#FFC000', '#7030A0', '#4472C4'],
    svgContent: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,40 C30,20 40,60 60,40 C80,20 90,50 95,30" stroke="#333" stroke-width="1" fill="none" />
      <circle cx="10" cy="40" r="7" fill="#FFC000" />
      <circle cx="20" cy="30" r="6" fill="#7030A0" />
      <circle cx="30" cy="35" r="7" fill="#4472C4" />
      <circle cx="40" cy="45" r="5" fill="#FFC000" />
      <circle cx="50" cy="40" r="7" fill="#7030A0" />
      <circle cx="60" cy="35" r="6" fill="#4472C4" />
      <circle cx="70" cy="30" r="7" fill="#FFC000" />
      <circle cx="80" cy="35" r="5" fill="#7030A0" />
      <circle cx="90" cy="40" r="6" fill="#4472C4" />
      <circle cx="95" cy="30" r="5" fill="#FFC000" />
    </svg>`
  },
  {
    id: 'template-4',
    name: 'Balloon Bouquet',
    type: 'balloon-cluster',
    category: 'accent',
    estimatedBalloons: 9,
    defaultColors: ['#ED7D31', '#4472C4', '#A5A5A5'],
    svgContent: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="50" x2="50" y2="75" stroke="#333" stroke-width="2" />
      <circle cx="40" cy="35" r="10" fill="#ED7D31" />
      <circle cx="55" cy="30" r="12" fill="#4472C4" />
      <circle cx="60" cy="45" r="9" fill="#A5A5A5" />
      <circle cx="45" cy="45" r="11" fill="#ED7D31" />
      <circle cx="35" cy="25" r="8" fill="#4472C4" />
    </svg>`
  },
  {
    id: 'template-5',
    name: 'Double Arch',
    type: 'balloon-cluster',
    category: 'arch',
    estimatedBalloons: 30,
    defaultColors: ['#C00000', '#002060', '#FFFFFF'],
    svgContent: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,65 Q50,25 90,65" stroke="#333" stroke-width="1.5" fill="none" />
      <path d="M10,55 Q50,15 90,55" stroke="#333" stroke-width="1.5" fill="none" />
      <circle cx="10" cy="65" r="6" fill="#C00000" />
      <circle cx="20" cy="59" r="6" fill="#002060" />
      <circle cx="30" cy="54" r="6" fill="#FFFFFF" />
      <circle cx="40" cy="48" r="6" fill="#C00000" />
      <circle cx="50" cy="45" r="6" fill="#002060" />
      <circle cx="60" cy="48" r="6" fill="#FFFFFF" />
      <circle cx="70" cy="54" r="6" fill="#C00000" />
      <circle cx="80" cy="59" r="6" fill="#002060" />
      <circle cx="90" cy="65" r="6" fill="#FFFFFF" />
      <circle cx="10" cy="55" r="5" fill="#002060" />
      <circle cx="20" cy="49" r="5" fill="#FFFFFF" />
      <circle cx="30" cy="43" r="5" fill="#C00000" />
      <circle cx="40" cy="37" r="5" fill="#002060" />
      <circle cx="50" cy="34" r="5" fill="#FFFFFF" />
      <circle cx="60" cy="37" r="5" fill="#C00000" />
      <circle cx="70" cy="43" r="5" fill="#002060" />
      <circle cx="80" cy="49" r="5" fill="#FFFFFF" />
      <circle cx="90" cy="55" r="5" fill="#C00000" />
    </svg>`
  },
  {
    id: 'template-6',
    name: 'Balloon Wall',
    type: 'balloon-cluster',
    category: 'accent',
    estimatedBalloons: 40,
    defaultColors: ['#7030A0', '#C00000', '#548235', '#FFFFFF'],
    svgContent: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="80" height="60" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="2" />
      <circle cx="15" cy="15" r="5" fill="#7030A0" />
      <circle cx="25" cy="15" r="5" fill="#C00000" />
      <circle cx="35" cy="15" r="5" fill="#548235" />
      <circle cx="45" cy="15" r="5" fill="#FFFFFF" />
      <circle cx="55" cy="15" r="5" fill="#7030A0" />
      <circle cx="65" cy="15" r="5" fill="#C00000" />
      <circle cx="75" cy="15" r="5" fill="#548235" />
      <circle cx="85" cy="15" r="5" fill="#FFFFFF" />
      
      <circle cx="15" cy="35" r="5" fill="#C00000" />
      <circle cx="25" cy="35" r="5" fill="#548235" />
      <circle cx="35" cy="35" r="5" fill="#FFFFFF" />
      <circle cx="45" cy="35" r="5" fill="#7030A0" />
      <circle cx="55" cy="35" r="5" fill="#C00000" />
      <circle cx="65" cy="35" r="5" fill="#548235" />
      <circle cx="75" cy="35" r="5" fill="#FFFFFF" />
      <circle cx="85" cy="35" r="5" fill="#7030A0" />
      
      <circle cx="15" cy="55" r="5" fill="#548235" />
      <circle cx="25" cy="55" r="5" fill="#FFFFFF" />
      <circle cx="35" cy="55" r="5" fill="#7030A0" />
      <circle cx="45" cy="55" r="5" fill="#C00000" />
      <circle cx="55" cy="55" r="5" fill="#548235" />
      <circle cx="65" cy="55" r="5" fill="#FFFFFF" />
      <circle cx="75" cy="55" r="5" fill="#7030A0" />
      <circle cx="85" cy="55" r="5" fill="#C00000" />
    </svg>`
  }
];

// Template item component with drag functionality
const TemplateItem = ({ template, viewMode }: { template: BalloonTemplate; viewMode: 'grid' | 'list' }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BALLOON_TEMPLATE',
    item: {
      ...template,
      // Generate a unique ID for the element to be created on drop
      elementId: uuidv4()
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`${
        viewMode === 'grid' 
          ? 'w-full p-2'
          : 'flex items-center gap-3 p-2 w-full'
      } bg-white border border-secondary-200 rounded-md cursor-grab transition-all ${
        isDragging ? 'opacity-50' : 'hover:border-primary-300 hover:shadow-sm'
      }`}
    >
      <div 
        className={`${
          viewMode === 'grid' ? 'aspect-square mb-2' : 'h-16 w-16 min-w-16'
        } bg-secondary-50 rounded flex items-center justify-center overflow-hidden`}
        dangerouslySetInnerHTML={{ __html: template.svgContent }} 
      />
      
      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
        <h4 className="text-sm font-medium text-secondary-800">{template.name}</h4>
        <div className="flex items-center mt-1">
          <div className="flex -space-x-1">
            {template.defaultColors.slice(0, 3).map((color, i) => (
              <div 
                key={i} 
                className="w-3 h-3 rounded-full border border-white" 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
          <span className="text-xs text-secondary-500 ml-2">
            {template.estimatedBalloons} balloons
          </span>
        </div>
      </div>
    </div>
  );
};

// Category accordion
const CategoryAccordion = ({ 
  category, 
  templates,
  viewMode 
}: { 
  category: string;
  templates: BalloonTemplate[];
  viewMode: 'grid' | 'list';
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const categoryLabels: Record<string, string> = {
    'arch': 'Balloon Arches',
    'column': 'Balloon Columns',
    'garland': 'Balloon Garlands',
    'accent': 'Accent Pieces'
  };

  return (
    <div className="mb-3">
      <button 
        className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{categoryLabels[category] || category}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`mt-2 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
          {templates.map(template => (
            <TemplateItem 
              key={template.id} 
              template={template} 
              viewMode={viewMode} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
const TemplatesSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter templates based on search query
  const filteredTemplates = BALLOON_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group templates by category
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, BalloonTemplate[]>);
  
  return (
    <div className="h-full flex flex-col">
      {/* Search and view mode toggle */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-secondary-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="mt-2 flex justify-end">
          <div className="flex items-center bg-secondary-100 rounded-md p-0.5">
            <button
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid className="h-4 w-4 text-secondary-700" />
            </button>
            <button
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="h-4 w-4 text-secondary-700" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Templates by category */}
      <div className="overflow-y-auto flex-1">
        {Object.keys(templatesByCategory).length > 0 ? (
          Object.entries(templatesByCategory).map(([category, templates]) => (
            <CategoryAccordion 
              key={category} 
              category={category} 
              templates={templates}
              viewMode={viewMode}
            />
          ))
        ) : (
          <div className="text-center py-4 text-sm text-secondary-500">
            No templates found matching "{searchQuery}"
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-secondary-200 text-xs text-secondary-500 text-center">
        Drag elements to the canvas
      </div>
    </div>
  );
};

export default TemplatesSidebar;