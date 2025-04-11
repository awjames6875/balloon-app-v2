import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignElement } from '@/types';
import { Droplet, Maximize, Minimize, Layers, Palette } from 'lucide-react';

interface BalloonCustomizerProps {
  selectedElement: DesignElement;
  onUpdate: (updatedElement: DesignElement) => void;
  colorOptions: Array<{ name: string; value: string }>;
}

const BalloonCustomizer: React.FC<BalloonCustomizerProps> = ({
  selectedElement,
  onUpdate,
  colorOptions,
}) => {
  const [primaryColor, setPrimaryColor] = useState<string>(selectedElement.colors[0] || '#FF5757');
  const [secondaryColor, setSecondaryColor] = useState<string>(selectedElement.colors[1] || '#5271FF');
  const [accentColors, setAccentColors] = useState<string[]>(
    selectedElement.colors.slice(2) || Array(11).fill('#FFD166')
  );
  const [density, setDensity] = useState<number>(100);
  const [size, setSize] = useState<number>(100);
  const [colorMode, setColorMode] = useState<'uniform' | 'multi'>('uniform');
  
  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setPrimaryColor(selectedElement.colors[0] || '#FF5757');
      setSecondaryColor(selectedElement.colors[1] || '#5271FF');
      
      // Ensure we have enough accent colors
      const currentAccents = selectedElement.colors.slice(2) || [];
      setAccentColors(
        Array(11)
          .fill('')
          .map((_, i) => currentAccents[i] || '#FFD166')
      );
    }
  }, [selectedElement.id]); // Only re-run when element ID changes
  
  // Update the SVG content with new colors
  const updateElementColors = () => {
    // Get the original SVG content
    let updatedSvg = selectedElement.svgContent;
    
    // Replace color variables with actual colors
    updatedSvg = updatedSvg.replace(/var\(--color-primary\)/g, primaryColor);
    updatedSvg = updatedSvg.replace(/var\(--color-secondary\)/g, secondaryColor);
    
    // Update accent colors
    for (let i = 0; i < accentColors.length && i < 11; i++) {
      updatedSvg = updatedSvg.replace(
        new RegExp(`var\\(--color-accent-${i+1}\\)`, 'g'), 
        accentColors[i]
      );
    }
    
    // Apply density by adjusting the opacity and spacing
    if (density !== 100) {
      // This is a simplistic approach - in a real implementation you would
      // adjust the positions of the balloons or show/hide some based on density
      const opacityFactor = Math.max(0.4, density / 100); // Min opacity 0.4
      updatedSvg = updatedSvg.replace(/opacity="([0-9.]+)"/g, (match, opacityValue) => {
        const newOpacity = Math.min(1, parseFloat(opacityValue) * opacityFactor);
        return `opacity="${newOpacity.toFixed(2)}"`;
      });
    }
    
    // Create updated element with new colors and SVG
    const updatedElement: DesignElement = {
      ...selectedElement,
      svgContent: updatedSvg,
      colors: colorMode === 'uniform' 
        ? [primaryColor] 
        : [primaryColor, secondaryColor, ...accentColors],
    };
    
    // Update scale if size changed
    if (size !== 100) {
      const scaleFactor = size / 100;
      updatedElement.width = Math.round(selectedElement.width * scaleFactor);
      updatedElement.height = Math.round(selectedElement.height * scaleFactor);
    }
    
    onUpdate(updatedElement);
  };
  
  // Set all colors to the primary color in uniform mode
  const applyUniformColor = () => {
    // In uniform color mode, we set all balloons to the primary color
    let updatedSvg = selectedElement.svgContent;
    
    // Replace all color variables with the primary color
    updatedSvg = updatedSvg.replace(/var\(--color-primary\)/g, primaryColor);
    updatedSvg = updatedSvg.replace(/var\(--color-secondary\)/g, primaryColor);
    
    for (let i = 0; i < 11; i++) {
      updatedSvg = updatedSvg.replace(
        new RegExp(`var\\(--color-accent-${i+1}\\)`, 'g'), 
        primaryColor
      );
    }
    
    const updatedElement: DesignElement = {
      ...selectedElement,
      svgContent: updatedSvg,
      colors: [primaryColor],
    };
    
    onUpdate(updatedElement);
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Customize Balloon Cluster</h3>
        
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="size">
              <Maximize className="h-4 w-4 mr-2" />
              Size
            </TabsTrigger>
            <TabsTrigger value="density">
              <Layers className="h-4 w-4 mr-2" />
              Density
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="flex justify-between mb-4">
              <Button 
                variant={colorMode === 'uniform' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setColorMode('uniform')}
              >
                Uniform Color
              </Button>
              <Button 
                variant={colorMode === 'multi' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setColorMode('multi')}
              >
                Multi Color
              </Button>
            </div>
            
            {colorMode === 'uniform' ? (
              <div>
                <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                <div className="flex flex-wrap gap-2 max-w-md mb-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        primaryColor === color.value ? 'border-black shadow-md' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setPrimaryColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full mt-2"
                  onClick={applyUniformColor}
                >
                  Apply Color
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">Primary Color (Large Balloons)</Label>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-full border-2 ${
                          primaryColor === color.value ? 'border-black shadow-md' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setPrimaryColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">Secondary Color (Large Balloons)</Label>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-full border-2 ${
                          secondaryColor === color.value ? 'border-black shadow-md' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSecondaryColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">Accent Colors (Small Balloons)</Label>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {colorOptions.slice(0, 8).map((color) => (
                      <button
                        key={color.value}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: color.value }}
                        onClick={() => {
                          // Set all accent colors to this color
                          setAccentColors(Array(11).fill(color.value));
                        }}
                        title={`Set all accents to ${color.name}`}
                      />
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full mt-2"
                  onClick={updateElementColors}
                >
                  Apply Colors
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="size" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm font-medium">Size</Label>
                <span className="text-sm">{size}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Minimize className="h-4 w-4 text-gray-500" />
                <Slider
                  value={[size]}
                  min={50}
                  max={200}
                  step={5}
                  onValueChange={(vals) => setSize(vals[0])}
                  className="flex-1"
                />
                <Maximize className="h-4 w-4 text-gray-500" />
              </div>
              <Button 
                variant="default" 
                size="sm"
                className="w-full mt-4"
                onClick={updateElementColors}
              >
                Apply Size
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="density" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm font-medium">Balloon Density</Label>
                <span className="text-sm">{density}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-gray-500" />
                <Slider
                  value={[density]}
                  min={60}
                  max={120}
                  step={5}
                  onValueChange={(vals) => setDensity(vals[0])}
                  className="flex-1"
                />
                <Droplet className="h-4 w-4 text-gray-500 fill-current" />
              </div>
              <Button 
                variant="default" 
                size="sm"
                className="w-full mt-4"
                onClick={updateElementColors}
              >
                Apply Density
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Reset to original values
              setPrimaryColor(selectedElement.colors[0] || '#FF5757');
              setSecondaryColor(selectedElement.colors[1] || '#5271FF');
              
              const currentAccents = selectedElement.colors.slice(2) || [];
              setAccentColors(
                Array(11)
                  .fill('')
                  .map((_, i) => currentAccents[i] || '#FFD166')
              );
              
              setDensity(100);
              setSize(100);
            }}
          >
            Reset Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalloonCustomizer;