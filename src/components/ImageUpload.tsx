import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "../uikit/Button";

interface ImageUploadProps {
  label: string;
  subLabel?: string;
  color?: "blue" | "purple";
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  subLabel = "Upload photo (High Quality)",
  color = "blue",
  onFileSelect,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const theme = {
    blue: {
      border: "hover:border-blue-500",
      bg: "hover:bg-blue-50",
      iconBg: "bg-blue-50 group-hover:bg-blue-100",
      iconText: "text-blue-600",
      ring: "focus-within:ring-blue-500",
    },
    purple: {
      border: "hover:border-purple-500",
      bg: "hover:bg-purple-50",
      iconBg: "bg-purple-50 group-hover:bg-purple-100",
      iconText: "text-purple-600",
      ring: "focus-within:ring-purple-500",
    },
  }[color];

  const handleFile = (file: File) => {
    if (disabled) return;
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload an image (PNG, JPG, WEBP, SVG)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 outline-none aspect-square flex flex-col items-center justify-center
        ${
          disabled
            ? "cursor-not-allowed opacity-50 border-gray-200 bg-gray-50"
            : `cursor-pointer ${
                isDragging
                  ? "border-green-500 bg-green-50 scale-[1.02]"
                  : `border-gray-300 bg-white ${theme.border} ${theme.bg}`
              } ${theme.ring}`
        }
        ${preview ? "border-solid border-gray-200 p-0 overflow-hidden" : "p-6"}
      `}
      onClick={handleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onChange}
        disabled={disabled}
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-full min-h-[220px]">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover absolute inset-0 rounded-2xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-medium flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Change Photo
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={removeImage}
            disabled={disabled}
            className="absolute top-3 right-3 p-0 rounded-full! shadow-sm bg-white/90! hover:bg-white! text-gray-600 hover:text-red-500 z-10 w-10 h-10 min-w-0 flex items-center justify-center border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className={`rounded-full p-4 transition-colors ${theme.iconBg}`}>
            <Upload className={`h-8 w-8 ${theme.iconText}`} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{subLabel}</p>
            {error && (
              <p className="text-xs text-red-500 font-medium flex items-center justify-center gap-1 mt-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" /> {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
