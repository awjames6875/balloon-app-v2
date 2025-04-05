import { useState, useRef, ChangeEvent } from 'react';
import { Image, X, Upload } from 'lucide-react';
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
    <div className="bg-white border border-secondary-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-secondary-200">
        <h2 className="font-semibold text-secondary-800">Background Image</h2>
        <p className="text-sm text-secondary-500 mt-1">Upload an image as design background</p>
      </div>
      
      <div className="p-4">
        {!preview ? (
          <div 
            className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center bg-secondary-50 hover:bg-secondary-100 transition cursor-pointer"
            onClick={handleFileUpload}
          >
            <Image className="mx-auto h-12 w-12 text-secondary-400" />
            <p className="mt-2 text-sm font-medium text-secondary-700">Click to upload background image</p>
            <p className="mt-1 text-xs text-secondary-500">JPEG, PNG, GIF, WebP up to 5MB</p>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div>
            <div className="aspect-w-16 aspect-h-9 bg-secondary-100 rounded-lg overflow-hidden">
              <img 
                src={preview} 
                alt="Background preview" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex justify-between mt-2">
              <button 
                className="text-sm text-error-600 hover:text-error-500 flex items-center"
                onClick={handleRemoveBackground}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </button>
              <button 
                className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                onClick={handleFileUpload}
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundUploader;