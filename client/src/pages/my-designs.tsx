import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Palette, 
  PlusCircle, 
  Search,
  Loader2,
  ListFilter
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDesign } from "@/context/design-context";
import DesignGallery from "@/components/gallery/design-gallery";

const MyDesignsPage = () => {
  const [, navigate] = useLocation();
  const { setActiveDesign } = useDesign();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  // Create a safe array to avoid undefined/null errors
  const safeDesigns = Array.isArray(designs) ? designs : [];
  
  // Filter designs based on search query and event type
  const filteredDesigns = safeDesigns.filter(design => {
    const matchesSearch = (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
      (design.projectName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
      (design.eventType?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
      (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase());
    
    const matchesEventType = eventTypeFilter === "all" || 
      (design.eventType?.toLowerCase() === eventTypeFilter.toLowerCase());
    
    return matchesSearch && matchesEventType;
  });

  // State for current tab
  const [currentTab, setCurrentTab] = useState("all");

  // Get designs for the current month
  const currentDate = new Date();
  const currentMonthDesigns = safeDesigns.filter(design => {
    if (!design.eventDate) return false;
    const eventDate = new Date(String(design.eventDate));
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Get designs with upcoming events
  const upcomingDesigns = safeDesigns.filter(design => {
    if (!design.eventDate) return false;
    const eventDate = new Date(String(design.eventDate));
    return eventDate > currentDate;
  });

  // Get designs with no event date
  const noDateDesigns = safeDesigns.filter(design => !design.eventDate);

  // Designs to display based on current tab and search query
  const getFilteredDesignsByTab = () => {
    let designs = filteredDesigns;
    
    if (currentTab === "this-month") {
      designs = currentMonthDesigns.filter(design => 
        (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
        (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
      );
    } else if (currentTab === "upcoming") {
      designs = upcomingDesigns.filter(design => 
        (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
        (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
      );
    } else if (currentTab === "no-date") {
      designs = noDateDesigns.filter(design => 
        (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
        (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
      );
    }
    
    return designs;
  };

  const displayedDesigns = getFilteredDesignsByTab();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">My Balloon Designs</h1>
          <p className="text-gray-600">View and manage all your saved balloon designs</p>
        </div>
        
        <div className="flex mt-4 md:mt-0 gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search designs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="baby shower">Baby Shower</SelectItem>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="graduation">Graduation</SelectItem>
              <SelectItem value="holiday party">Holiday Party</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => navigate('/design-editor')}
            className="bg-purple-600 hover:bg-purple-700 flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            New Design
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {designsLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
        </div>
      )}
      
      {/* Tab Navigation */}
      {!designsLoading && safeDesigns.length > 0 && (
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <div className="flex items-center mb-4">
            <ListFilter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-500">Filter by:</span>
          </div>
          <TabsList className="grid grid-cols-4 w-full max-w-lg mb-1">
            <TabsTrigger value="all" className="text-sm">All Designs</TabsTrigger>
            <TabsTrigger value="this-month" className="text-sm">This Month</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
            <TabsTrigger value="no-date" className="text-sm">No Date Set</TabsTrigger>
          </TabsList>
          
          {/* Tab Contents */}
          <TabsContent value="all" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
          <TabsContent value="this-month" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
          <TabsContent value="no-date" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
        </Tabs>
      )}
      
      {/* Empty state */}
      {!designsLoading && displayedDesigns.length === 0 && (
        <div className="text-center py-12 bg-secondary-50 rounded-lg border border-secondary-100">
          <Palette className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-secondary-900 mb-2">No Designs Found</h3>
          <p className="text-secondary-500 mb-6">
            {searchQuery 
              ? "No designs match your search criteria. Try a different search term."
              : currentTab !== "all" 
                ? `No designs in the "${currentTab === 'this-month' ? 'This Month' : currentTab === 'upcoming' ? 'Upcoming' : 'No Date Set'}" category.`
                : "You haven't created any balloon designs yet."
            }
          </p>
          <Button 
            onClick={() => navigate('/design-editor')}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create Your First Design
          </Button>
        </div>
      )}
    </div>
  );

  // Use our new DesignGallery component for rendering designs
  function renderDesignsGrid(designs: any[]) {
    if (designs.length === 0) return null;
    
    return (
      <div className="mt-2">
        <DesignGallery />
      </div>
    );
  }
};

export default MyDesignsPage;