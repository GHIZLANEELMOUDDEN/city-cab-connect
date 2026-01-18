import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Loader2, X, Upload } from "lucide-react";

interface ImageUploadProps {
  bucket: "taxi-images" | "profile-images" | "lost-found-images";
  userId: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  label?: string;
  shape?: "circle" | "rectangle";
  size?: "sm" | "md" | "lg";
}

const ImageUpload = ({
  bucket,
  userId,
  currentUrl,
  onUpload,
  label = "رفع صورة",
  shape = "rectangle",
  size = "md",
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const sizeClasses = {
    sm: shape === "circle" ? "w-16 h-16" : "w-24 h-16",
    md: shape === "circle" ? "w-24 h-24" : "w-full h-32",
    lg: shape === "circle" ? "w-32 h-32" : "w-full h-48",
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("حدث خطأ في رفع الصورة");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div className={`relative ${sizeClasses[size]} ${shape === "circle" ? "rounded-full" : "rounded-xl"} overflow-hidden border-2 border-dashed border-muted bg-muted/50`}>
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 w-6 h-6 bg-destructive/90 rounded-full flex items-center justify-center hover:bg-destructive transition-colors"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/80 transition-colors">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                {shape === "circle" ? (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">اضغط للرفع</span>
                  </>
                )}
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
