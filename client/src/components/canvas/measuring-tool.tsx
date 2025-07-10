import { useState } from 'react';
import { Ruler, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { MeasurementLine } from '@shared/schema';

interface MeasuringToolProps {
  measurements: MeasurementLine[];
  onMeasurementsChange: (measurements: MeasurementLine[]) => void;
  isDrawingMode: boolean;
  onDrawingModeChange: (isDrawing: boolean) => void;
  canvasScale?: number;
}

interface DrawingState {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
}

const MeasuringTool = ({ 
  measurements, 
  onMeasurementsChange, 
  isDrawingMode, 
  onDrawingModeChange,
  canvasScale = 1 
}: MeasuringToolProps) => {
  const [editingMeasurement, setEditingMeasurement] = useState<MeasurementLine | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editLength, setEditLength] = useState('');
  const [editUnit, setEditUnit] = useState<'feet' | 'meters' | 'inches'>('feet');

  const getPixelLength = (measurement: MeasurementLine) => {
    return Math.sqrt(
      Math.pow(measurement.x2 - measurement.x1, 2) + 
      Math.pow(measurement.y2 - measurement.y1, 2)
    );
  };

  const getScaleFromMeasurement = (measurement: MeasurementLine) => {
    const pixelLength = getPixelLength(measurement);
    return pixelLength / measurement.realWorldLength; // pixels per unit
  };

  const calculateTotalFootage = () => {
    if (measurements.length === 0) return 0;
    
    // Use the first measurement to establish scale
    const referenceMeasurement = measurements[0];
    if (!referenceMeasurement) return 0;
    
    const scale = getScaleFromMeasurement(referenceMeasurement);
    
    // Calculate total pixel length of all balloon clusters
    // This is a placeholder - in a real implementation, you'd calculate
    // the total length of all balloon elements on the canvas
    return 0; // TODO: Implement total garland length calculation
  };

  const deleteMeasurement = (id: string) => {
    const updatedMeasurements = measurements.filter(m => m.id !== id);
    onMeasurementsChange(updatedMeasurements);
  };

  const editMeasurement = (measurement: MeasurementLine) => {
    setEditingMeasurement(measurement);
    setEditLabel(measurement.label);
    setEditLength(measurement.realWorldLength.toString());
    setEditUnit(measurement.unit);
  };

  const saveEditedMeasurement = () => {
    if (!editingMeasurement) return;
    
    const updatedMeasurement = {
      ...editingMeasurement,
      label: editLabel,
      realWorldLength: parseFloat(editLength),
      unit: editUnit
    };
    
    const updatedMeasurements = measurements.map(m => 
      m.id === editingMeasurement.id ? updatedMeasurement : m
    );
    
    onMeasurementsChange(updatedMeasurements);
    setEditingMeasurement(null);
  };

  const totalFootage = calculateTotalFootage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Measuring Tool
        </h4>
        <Button
          size="sm"
          variant={isDrawingMode ? "default" : "outline"}
          onClick={() => onDrawingModeChange(!isDrawingMode)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          {isDrawingMode ? 'Cancel' : 'Add Line'}
        </Button>
      </div>

      {isDrawingMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <p className="text-blue-800 font-medium mb-1">Drawing Mode Active</p>
          <p className="text-blue-700">Click and drag on the canvas to draw a measurement line.</p>
        </div>
      )}

      {/* Total Footage Display */}
      {measurements.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800">Total Garland Length</p>
          <p className="text-lg font-bold text-green-900">{totalFootage.toFixed(1)} feet</p>
          <p className="text-xs text-green-700">Based on measurement scale</p>
        </div>
      )}

      {/* Measurements List */}
      <div className="space-y-2">
        {measurements.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No measurements yet. Click "Add Line" to start.</p>
        ) : (
          measurements.map((measurement) => (
            <div key={measurement.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
              <div className="flex-1">
                <p className="text-sm font-medium">{measurement.label}</p>
                <p className="text-xs text-gray-600">
                  {measurement.realWorldLength} {measurement.unit}
                  <span className="ml-2">({getPixelLength(measurement).toFixed(0)}px)</span>
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editMeasurement(measurement)}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMeasurement(measurement.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Measurement Dialog */}
      <Dialog open={!!editingMeasurement} onOpenChange={(open) => !open && setEditingMeasurement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Measurement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="e.g., Window width"
              />
            </div>
            <div>
              <Label htmlFor="edit-length">Real-world Length</Label>
              <Input
                id="edit-length"
                type="number"
                step="0.1"
                value={editLength}
                onChange={(e) => setEditLength(e.target.value)}
                placeholder="e.g., 3.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-unit">Unit</Label>
              <Select value={editUnit} onValueChange={(value: 'feet' | 'meters' | 'inches') => setEditUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feet">Feet</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="inches">Inches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingMeasurement(null)}>
                Cancel
              </Button>
              <Button onClick={saveEditedMeasurement}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeasuringTool;