import { useState, useRef, ChangeEvent } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image, X, Upload } from "lucide-react";
import { useDesign } from "@/context/design-context";
import { queryClient } from "@/lib/queryClient";

interface DesignUploaderProps {
  onAnalysisStart: () => void;
}

const DesignUploader = ({ onAnalysisStart }: DesignUploaderProps) => {
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
                <img 
                  className="object-cover w-full h-full" 
                  src={preview} 
                  alt="Design preview" 
                />
              </div>
              <div className="flex justify-between mt-2">
                <button 
                  className="text-sm text-error-600 hover:text-error-500 flex items-center"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </button>
                <span className="text-xs text-secondary-500">
                  {file?.name} ({(file?.size || 0) / 1024 > 1024 
                    ? `${((file?.size || 0) / 1024 / 1024).toFixed(2)}MB` 
                    : `${((file?.size || 0) / 1024).toFixed(2)}KB`})
                </span>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button 
            className="w-full mt-4 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleStartAnalysis}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start AI Analysis
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Project Specifications */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-secondary-200">
          <h2 className="font-semibold text-secondary-800">Project Specifications</h2>
          <p className="text-sm text-secondary-500 mt-1">Enter project details</p>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSaveSpecifications}>
            {/* Client Details */}
            <div className="mb-4">
              <label htmlFor="clientName" className="block text-sm font-medium text-secondary-700 mb-1">Client Name</label>
              <input 
                type="text" 
                id="clientName" 
                className="w-full rounded-md border border-secondary-300 px-3 py-2 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="eventDate" className="block text-sm font-medium text-secondary-700 mb-1">Event Date</label>
              <input 
                type="date" 
                id="eventDate" 
                className="w-full rounded-md border border-secondary-300 px-3 py-2 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="dimensions" className="block text-sm font-medium text-secondary-700 mb-1">Dimensions</label>
              <input 
                type="text" 
                id="dimensions" 
                className="w-full rounded-md border border-secondary-300 px-3 py-2 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="e.g. 6ft x 8ft"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-secondary-700 mb-1">Special Instructions</label>
              <textarea 
                id="notes" 
                rows={3} 
                className="w-full rounded-md border border-secondary-300 px-3 py-2 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Add any special instructions here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

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
