import React from 'react';
import { Clock, Calendar, User, Tag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface DesignSettingsProps {
  designName: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  onDesignNameChange: (value: string) => void;
  onClientNameChange: (value: string) => void;
  onEventDateChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

/**
 * Settings panel for editing design metadata
 */
const DesignSettingsPanel: React.FC<DesignSettingsProps> = ({
  designName,
  clientName,
  eventDate,
  eventType,
  onDesignNameChange,
  onClientNameChange,
  onEventDateChange,
  onEventTypeChange,
  isEditing,
  setIsEditing
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Design Settings</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Design Name</label>
              <input 
                type="text" 
                value={designName} 
                onChange={(e) => onDesignNameChange(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Client Name</label>
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => onClientNameChange(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Event Date</label>
              <input 
                type="date" 
                value={eventDate} 
                onChange={(e) => onEventDateChange(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Select 
                value={eventType} 
                onValueChange={onEventTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-2" />
              <span className="font-medium mr-2">Design:</span>
              <span>{designName || 'Untitled'}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium mr-2">Client:</span>
              <span>{clientName || 'None'}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium mr-2">Event Date:</span>
              <span>{eventDate || 'Not set'}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium mr-2">Event Type:</span>
              <span className="capitalize">{eventType || 'None'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DesignSettingsPanel;