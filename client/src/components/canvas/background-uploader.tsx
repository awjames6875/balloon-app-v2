
import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackgroundUploaderProps {
  onBackgroundChange: (url: string | null) => void;
  currentBackground: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const BackgroundUploader = ({ onBackgroundChange, currentBackground }: BackgroundUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(currentBackground);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      return "Please upload JPEG, PNG, GIF, or WebP files only.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Please upload an image under 5MB.";
    }
    return null;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onBackgroundChange(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleRemoveBackground = () => {
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
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 w-full flex items-center justify-center p-2 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333333] rounded-md text-sm font-medium"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Replace Background
          </button>
        </div>
      ) : (
        <button 
          onClick={() => fileInputRef.current?.click()}
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
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default BackgroundUploader;
