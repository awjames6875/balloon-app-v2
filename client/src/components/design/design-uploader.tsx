import { useState, useRef, ChangeEvent } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image, X, Upload } from "lucide-react";
import { useDesign } from "@/context/design-context";
import { queryClient } from "@/lib/queryClient";

interface DesignUploaderProps {
  onAnalysisStart: () => void;
  onAnalysisComplete?: (result: any) => void;
}

const DesignUploader = ({ onAnalysisStart, onAnalysisComplete }: DesignUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [notes, setNotes] = useState("");
  const { setActiveDesign } = useDesign();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload JPEG, PNG, GIF, or WebP files only.",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 5MB.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) {
      toast({
        title: "No image selected",
        description: "Please upload a design image first.",
        variant: "destructive",
      });
      return;
    }

    if (!clientName) {
      toast({
        title: "Client name required",
        description: "Please enter a client name for this design.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      onAnalysisStart();

      const formData = new FormData();
      formData.append("image", file);
      formData.append("clientName", clientName);
      formData.append("eventDate", eventDate);
      formData.append("dimensions", dimensions);
      formData.append("notes", notes);

      const response = await fetch("/api/designs", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload design");
      }

      const design = await response.json();
      setActiveDesign(design);
      
      // Analyze the uploaded design
      const analysisResponse = await apiRequest(
        "POST", 
        `/api/designs/${design.id}/analyze`
      );
      
      const analyzedDesign = await analysisResponse.json();
      setActiveDesign(analyzedDesign);
      
      // Call onAnalysisComplete if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(analyzedDesign);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });

      toast({
        title: "Design uploaded successfully",
        description: "Your design has been analyzed.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSpecifications = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName) {
      toast({
        title: "Client name required",
        description: "Please enter a client name for this design.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Specifications saved",
      description: "Your project specifications have been saved.",
    });
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="p-4 border-b border-secondary-200">
          <h2 className="font-semibold text-secondary-800">Upload Design</h2>
          <p className="text-sm text-secondary-500 mt-1">Supported formats: JPEG, PNG, GIF, WebP</p>
        </div>
        
        <div className="p-4">
          {/* Upload Area */}
          {!preview ? (
            <div 
              className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center bg-secondary-50 hover:bg-secondary-100 transition cursor-pointer"
              onClick={handleFileUpload}
            >
              <Image className="mx-auto h-12 w-12 text-secondary-400" />
              <p className="mt-2 text-sm font-medium text-secondary-700">Drag and drop your design image here</p>
              <p className="mt-1 text-xs text-secondary-500">or click to browse files</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm font-medium text-secondary-800 mb-2">Preview:</p>
              <div className="aspect-w-4 aspect-h-3 bg-secondary-100 rounded-lg overflow-hidden relative">
                <img src={preview} alt="Design preview" className="object-contain w-full h-full" />
                <button 
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-secondary-100"
                >
                  <X className="h-4 w-4 text-secondary-600" />
                </button>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form className="mt-4 space-y-4" onSubmit={handleSaveSpecifications}>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Client Name</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2 border border-secondary-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Event Date</label>
              <input 
                type="date" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2 border border-secondary-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Dimensions</label>
              <input 
                type="text" 
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full p-2 border border-secondary-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. 10ft x 8ft"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-secondary-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Additional information about this design"
                rows={3}
              />
            </div>
            
            <button 
              type="button" 
              className={`w-full py-2 px-4 ${preview ? 'bg-primary-600 hover:bg-primary-700' : 'bg-secondary-300 cursor-not-allowed'} text-white font-medium rounded-md transition mt-4`}
              onClick={handleStartAnalysis}
              disabled={!preview || uploading}
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Analyze Design
                </div>
              )}
            </button>
            
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition"
            >
              Save Specifications
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesignUploader;