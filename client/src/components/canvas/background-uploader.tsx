import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackgroundUploaderProps {
  onBackgroundChange: (url: string | null) => void;
  currentBackground: string | null;
}

const BackgroundUploader = ({ onBackgroundChange, currentBackground }: BackgroundUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentBackground);
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
      onBackgroundChange(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveBackground = () => {
    setFile(null);
    setPreview(null);
    onBackgroundChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      {preview ? (
        <div className="mb-3">
          <div className="relative aspect-video w-full rounded-md overflow-hidden border border-[#e0e0e0]">
            <img 
              src={preview} 
              alt="Background preview" 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={handleRemoveBackground}
              className="absolute top-2 right-2 bg-white bg-opacity-70 p-1 rounded-full shadow-sm hover:bg-opacity-100"
            >
              <X className="h-4 w-4 text-[#333333]" />
            </button>
          </div>
          <button 
            onClick={handleFileUpload}
            className="mt-2 w-full flex items-center justify-center p-2 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333333] rounded-md text-sm font-medium"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Replace Background
          </button>
        </div>
      ) : (
        <button 
          onClick={handleFileUpload}
          className="w-full flex items-center justify-center p-2.5 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333333] rounded-md text-sm font-medium"
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Upload Background Image
        </button>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default BackgroundUploader;