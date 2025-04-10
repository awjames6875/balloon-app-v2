import React from 'react';

// Color palette for the balloon clusters
export const colorOptions = [
  { name: 'Red', value: '#FF5252' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Deep Purple', value: '#673AB7' },
  { name: 'Indigo', value: '#3F51B5' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Light Blue', value: '#00BCD4' },
  { name: 'Teal', value: '#009688' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Light Green', value: '#8BC34A' },
  { name: 'Lime', value: '#CDDC39' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Amber', value: '#FFC107' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Deep Orange', value: '#FF5722' },
  { name: 'Brown', value: '#795548' },
];

interface ColorPaletteProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

/**
 * Color palette component for selecting balloon colors
 */
const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 max-w-md">
      {colorOptions.map((color) => (
        <button
          key={color.value}
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColor === color.value ? 'border-black shadow-md' : 'border-gray-200'
          }`}
          style={{ backgroundColor: color.value }}
          onClick={() => onChange(color.value)}
          title={color.name}
        />
      ))}
    </div>
  );
};

export default ColorPalette;