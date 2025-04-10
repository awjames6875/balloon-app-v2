export interface BalloonClusterTemplate {
  id: string;
  name: string;
  svgContent: string;
  defaultColors: string[];
  width?: number;
  height?: number;
  category?: string;
  type?: string;
  smallBalloonCount?: number;
  largeBalloonCount?: number;
  thumbnail?: string;
  elements?: any[];
}
import { v4 as uuid } from 'uuid';

// Standard balloon cluster (13 balloons: 2 x 16-inch and 11 x 11-inch)
const standardClusterSvg = `
<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Large balloons (16-inch) -->
  <circle cx="100" cy="70" r="35" fill="var(--color-primary)" />
  <circle cx="65" cy="95" r="35" fill="var(--color-secondary)" />
  
  <!-- Small balloons (11-inch) -->
  <circle cx="135" cy="95" r="25" fill="var(--color-accent-1)" />
  <circle cx="80" cy="120" r="25" fill="var(--color-accent-2)" />
  <circle cx="120" cy="120" r="25" fill="var(--color-accent-3)" />
  <circle cx="45" cy="125" r="25" fill="var(--color-accent-4)" />
  <circle cx="155" cy="125" r="25" fill="var(--color-accent-5)" />
  <circle cx="65" cy="150" r="25" fill="var(--color-accent-6)" />
  <circle cx="100" cy="145" r="25" fill="var(--color-accent-7)" />
  <circle cx="135" cy="150" r="25" fill="var(--color-accent-8)" />
  <circle cx="85" cy="170" r="25" fill="var(--color-accent-9)" />
  <circle cx="115" cy="170" r="25" fill="var(--color-accent-10)" />
  <circle cx="75" cy="195" r="25" fill="var(--color-accent-11)" />
</svg>
`;

// Arch balloon cluster
const archClusterSvg = `
<svg width="100%" height="100%" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Large balloons (16-inch) -->
  <circle cx="50" cy="150" r="35" fill="var(--color-primary)" />
  <circle cx="250" cy="150" r="35" fill="var(--color-secondary)" />
  
  <!-- Small balloons (11-inch) - creating the arch -->
  <circle cx="25" cy="100" r="25" fill="var(--color-accent-1)" />
  <circle cx="75" cy="75" r="25" fill="var(--color-accent-2)" />
  <circle cx="125" cy="60" r="25" fill="var(--color-accent-3)" />
  <circle cx="175" cy="60" r="25" fill="var(--color-accent-4)" />
  <circle cx="225" cy="75" r="25" fill="var(--color-accent-5)" />
  <circle cx="275" cy="100" r="25" fill="var(--color-accent-6)" />
  <circle cx="100" cy="150" r="25" fill="var(--color-accent-7)" />
  <circle cx="150" cy="150" r="25" fill="var(--color-accent-8)" />
  <circle cx="200" cy="150" r="25" fill="var(--color-accent-9)" />
  <circle cx="150" cy="125" r="25" fill="var(--color-accent-10)" />
  <circle cx="150" cy="175" r="25" fill="var(--color-accent-11)" />
</svg>
`;

// Column balloon cluster
const columnClusterSvg = `
<svg width="100%" height="100%" viewBox="0 0 150 300" xmlns="http://www.w3.org/2000/svg">
  <!-- Large balloons (16-inch) at top -->
  <circle cx="75" cy="35" r="35" fill="var(--color-primary)" />
  <circle cx="75" cy="100" r="35" fill="var(--color-secondary)" />
  
  <!-- Small balloons (11-inch) creating the column -->
  <circle cx="50" cy="150" r="25" fill="var(--color-accent-1)" />
  <circle cx="100" cy="150" r="25" fill="var(--color-accent-2)" />
  <circle cx="75" cy="175" r="25" fill="var(--color-accent-3)" />
  <circle cx="50" cy="200" r="25" fill="var(--color-accent-4)" />
  <circle cx="100" cy="200" r="25" fill="var(--color-accent-5)" />
  <circle cx="75" cy="225" r="25" fill="var(--color-accent-6)" />
  <circle cx="50" cy="250" r="25" fill="var(--color-accent-7)" />
  <circle cx="100" cy="250" r="25" fill="var(--color-accent-8)" />
  <circle cx="75" cy="265" r="25" fill="var(--color-accent-9)" />
  <circle cx="50" cy="75" r="25" fill="var(--color-accent-10)" />
  <circle cx="100" cy="75" r="25" fill="var(--color-accent-11)" />
</svg>
`;

export const balloonClusterTemplates: BalloonClusterTemplate[] = [
  {
    id: uuid(),
    name: 'Classic Cluster',
    type: 'classic',
    thumbnail: '/thumbnails/classic-cluster.svg',
    smallBalloonCount: 11,
    largeBalloonCount: 2,
    defaultColors: ['#FF5757', '#5271FF', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#FF8A5B', '#B5FF7D', '#AF8BFF', '#FFB8DE', '#FFFD82', '#E63946', '#457B9D'],
    svgContent: standardClusterSvg
  },
  {
    id: uuid(),
    name: 'Balloon Arch',
    type: 'arch',
    thumbnail: '/thumbnails/balloon-arch.svg',
    smallBalloonCount: 11,
    largeBalloonCount: 2,
    defaultColors: ['#FF5757', '#5271FF', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#FF8A5B', '#B5FF7D', '#AF8BFF', '#FFB8DE', '#FFFD82', '#E63946', '#457B9D'],
    svgContent: archClusterSvg
  },
  {
    id: uuid(),
    name: 'Balloon Column',
    type: 'column',
    thumbnail: '/thumbnails/balloon-column.svg',
    smallBalloonCount: 11,
    largeBalloonCount: 2,
    defaultColors: ['#FF5757', '#5271FF', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#FF8A5B', '#B5FF7D', '#AF8BFF', '#FFB8DE', '#FFFD82', '#E63946', '#457B9D'],
    svgContent: columnClusterSvg
  }
];

// Helper function to get a template by ID
export const getTemplateById = (id: string): BalloonClusterTemplate | undefined => {
  return balloonClusterTemplates.find(template => template.id === id);
};

// Helper function to calculate balloons needed based on templates and counts
export const calculateMaterialRequirements = (elements: Array<{templateId: string, colors: string[]}>) => {
  const colorCounts: Record<string, {small: number, large: number, total: number}> = {};
  let totalBalloons = 0;
  
  elements.forEach(element => {
    const template = getTemplateById(element.templateId);
    if (!template) return;
    
    totalBalloons += template.smallBalloonCount + template.largeBalloonCount;
    
    // Count by color (assuming colors array matches the order in SVG)
    const primaryColor = element.colors[0] || template.defaultColors[0];
    const secondaryColor = element.colors[1] || template.defaultColors[1];
    
    // Add primary color large balloons
    if (!colorCounts[primaryColor]) {
      colorCounts[primaryColor] = {small: 0, large: 0, total: 0};
    }
    colorCounts[primaryColor].large += 1;
    colorCounts[primaryColor].total += 1;
    
    // Add secondary color large balloons
    if (!colorCounts[secondaryColor]) {
      colorCounts[secondaryColor] = {small: 0, large: 0, total: 0};
    }
    colorCounts[secondaryColor].large += 1;
    colorCounts[secondaryColor].total += 1;
    
    // Add accent colors (small balloons)
    for (let i = 0; i < template.smallBalloonCount; i++) {
      const color = element.colors[i+2] || template.defaultColors[i+2];
      if (!colorCounts[color]) {
        colorCounts[color] = {small: 0, large: 0, total: 0};
      }
      colorCounts[color].small += 1;
      colorCounts[color].total += 1;
    }
  });
  
  return {
    colorCounts,
    totalBalloons,
    clusterCount: elements.length
  };
};