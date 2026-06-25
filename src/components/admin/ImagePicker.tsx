import { useState, useEffect, useRef } from "react";
import { Link as LinkIcon, Image, Upload, X, Search, Check, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

type Tab = "url" | "library" | "upload";

export default function ImagePicker({ value, onChange, label = "Image" }: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>("url");
  const [libraryFiles, setLibraryFiles] = useState<MediaFile[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLibrary = async () => {
    setLibraryLoading(true);
    const { data } = await supabase
      .from("media_files")
      .select("id, file_name, file_url, file_type")
      .eq("file_type", "image")
      .order("created_at", { ascending: false });
    setLibraryFiles(data ?? []);
    setLibraryLoading(false);
  };

  useEffect(() => {
    if (tab === "library") loadLibrary();
  }, [tab]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data: storageData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setUploadError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(storageData.path);

    await supabase.from("media_files").insert({
      file_name: file.name,
      file_url: publicUrl,
      file_type: "image",
      mime_type: file.type,
      file_size: file.size,
      folder: "general",
    });

    onChange(publicUrl);
    setTab("url");
    setUploading(false);
  };

  const filteredFiles = libraryFiles.filter((f) =>
    f.file_name.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "url", label: "URL", icon: LinkIcon },
    { key: "library", label: "Media Library", icon: Image },
    { key: "upload", label: "Upload", icon: Upload },
  ];

  return (
    <div className="space-y-2">
      <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">{label}</label>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                tab === t.key
                  ? "bg-[rgba(212,175,55,0.15)] text-[#F5D76E] border border-[rgba(212,175,55,0.25)]"
                  : "text-white/35 hover:text-white/60"
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* URL Tab */}
      {tab === "url" && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all pr-9"
            />
            {value && (
              <button type="button" onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {value && (
            <img
              src={value}
              alt="preview"
              className="h-24 w-full object-cover rounded-lg border border-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      )}

      {/* Library Tab */}
      {tab === "library" && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white/80 placeholder-white/25 outline-none focus:border-[#D4AF37]/30 transition-all"
            />
          </div>
          {libraryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-[#D4AF37] animate-spin" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <p className="text-center text-white/30 text-xs py-6">
              {search ? "No images match your search" : "No images in library yet. Upload some first."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => { onChange(file.file_url); setTab("url"); }}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-[#D4AF37]/60 group",
                    value === file.file_url ? "border-[#D4AF37]" : "border-transparent"
                  )}
                >
                  <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                  {value === file.file_url && (
                    <div className="absolute inset-0 bg-[#D4AF37]/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[9px] truncate">{file.file_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {tab === "upload" && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith("image/")) handleUpload(file);
            }}
            className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-[#D4AF37]/35 hover:bg-[rgba(212,175,55,0.03)] transition-all"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="w-6 h-6 text-[#D4AF37] animate-spin" />
                <p className="text-white/50 text-sm">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-white/25" />
                <p className="text-white/50 text-sm font-medium">Click or drag to upload</p>
                <p className="text-white/25 text-xs">PNG, JPG, GIF, WebP up to 10MB</p>
              </div>
            )}
          </div>
          {uploadError && (
            <p className="text-red-400 text-xs">{uploadError}</p>
          )}
          {value && (
            <img src={value} alt="preview" className="h-24 w-full object-cover rounded-lg border border-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
        </div>
      )}
    </div>
  );
}
