import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackgroundUploaderProps {
  onBackgroundChange: (url: string | null) => void;
  currentBackground: string | null;
}

const BackgroundUploader = ({ onBackgroundChange, currentBackground }: BackgroundUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPEG, PNG, GIF, or WebP image.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setIsUploading(true);
      
      // Create a URL for the file
      const backgroundUrl = URL.createObjectURL(file);
      onBackgroundChange(backgroundUrl);
      
      setIsUploading(false);
    }
  };

  const handleRemoveBackground = () => {
    onBackgroundChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      {currentBackground ? (
        <div className="mt-2">
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
            <img 
              src={currentBackground} 
              alt="Background" 
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleUploadClick}
          className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors"
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Background
            </span>
          )}
        </button>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <p className="text-xs text-gray-500 mt-1">
        Recommended: 1280×720px, JPEG, PNG, or WebP
      </p>
    </div>
  );
};

export default BackgroundUploader;