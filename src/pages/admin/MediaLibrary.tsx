import { useEffect, useRef, useState, useCallback } from "react";
import { Upload, Image, FileText, Film, Trash2, Copy, Check, Search, FolderOpen, X, Link } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  mime_type: string | null;
  file_size: number;
  alt_text: string | null;
  folder: string;
  created_at: string;
}

const FILE_TYPES = ["all", "image", "document", "video", "other"];

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type === "image") return Image;
  if (type === "video") return Film;
  return FileText;
}

export default function MediaLibrary() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("media_files")
      .select("*")
      .order("created_at", { ascending: false });
    setFiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const mimeType = file.type;
    const fileType = mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : "document";

    // Upload to Supabase Storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file, { contentType: mimeType, upsert: false });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(storageData.path);

    // Save metadata
    const { data: inserted, error: dbError } = await supabase.from("media_files").insert({
      file_name: file.name,
      file_url: publicUrl,
      file_type: fileType,
      mime_type: mimeType,
      file_size: file.size,
      folder: "general",
    }).select().maybeSingle();

    if (dbError) {
      toast({ title: "Metadata save failed", description: dbError.message, variant: "destructive" });
      return;
    }

    if (inserted) {
      await logActivity("created", "media_file", inserted.id, file.name);
    }
    toast({ title: "Uploaded", description: file.name });
    load();
  };

  const handleFiles = async (fileList: FileList) => {
    setUploading(true);
    for (const file of Array.from(fileList)) {
      await uploadFile(file);
    }
    setUploading(false);
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.file_name}"?`)) return;

    // Extract storage path from URL
    const urlParts = file.file_url.split("/storage/v1/object/public/media/");
    if (urlParts[1]) {
      await supabase.storage.from("media").remove([urlParts[1]]);
    }
    await supabase.from("media_files").delete().eq("id", file.id);
    await logActivity("deleted", "media_file", file.id, file.file_name);
    toast({ title: "Deleted", description: file.file_name });
    if (selected?.id === file.id) setSelected(null);
    load();
  };

  const copyUrl = (url: string) => {
    try {
      // Modern API (may be blocked in iframes)
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    } catch {
      fallbackCopy(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try { document.execCommand("copy"); } catch { /* silent */ }
    document.body.removeChild(el);
  };

  const filtered = files.filter((f) => {
    const matchType = filterType === "all" || f.file_type === filterType;
    const matchSearch = !search || f.file_name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Media Library</h1>
            <p className="text-white/40 text-sm mt-0.5">{files.length} files · Click to upload or drag & drop</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-[#D4AF37] bg-[rgba(212,175,55,0.08)]" : "border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.04)]"}`}
        >
          <Upload className="w-8 h-8 text-[#D4AF37]/50 mx-auto mb-2" />
          <p className="text-white/50 text-sm">Drag & drop files here, or click to browse</p>
          <p className="text-white/25 text-xs mt-1">Images, videos, PDFs, documents</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div className="flex gap-2">
            {FILE_TYPES.map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full transition-all ${filterType === t ? "gradient-brand text-[#0A0A0A]" : "border border-white/15 text-white/40 hover:border-[#D4AF37]/40 hover:text-white/70"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-16 text-white/30">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="w-12 h-12 text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No files found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((file) => {
                  const Icon = getFileIcon(file.file_type);
                  const isSelected = selected?.id === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelected(isSelected ? null : file)}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 ${isSelected ? "border-[#D4AF37] ring-2 ring-[rgba(212,175,55,0.3)]" : "border-white/8 hover:border-[rgba(212,175,55,0.3)]"} bg-[#1A1A1A]`}
                    >
                      {file.file_type === "image" ? (
                        <img src={file.file_url} alt={file.alt_text || file.file_name}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-[rgba(212,175,55,0.05)]">
                          <Icon className="w-10 h-10 text-[#D4AF37]/40" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-white/70 text-xs truncate">{file.file_name}</p>
                        <p className="text-white/30 text-[10px]">{formatBytes(file.file_size)}</p>
                      </div>
                      {/* Delete on hover */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-72 flex-shrink-0">
              <div className="glass-card rounded-2xl p-5 sticky top-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">File Details</span>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selected.file_type === "image" ? (
                  <img src={selected.file_url} alt={selected.file_name} className="w-full rounded-xl aspect-video object-cover" />
                ) : (
                  <div className="w-full rounded-xl aspect-video bg-[rgba(212,175,55,0.05)] flex items-center justify-center">
                    {(() => { const Icon = getFileIcon(selected.file_type); return <Icon className="w-16 h-16 text-[#D4AF37]/30" />; })()}
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div><span className="text-white/30 text-xs">Name</span><p className="text-white/80 break-all">{selected.file_name}</p></div>
                  <div><span className="text-white/30 text-xs">Type</span><p className="text-white/80 capitalize">{selected.file_type}</p></div>
                  <div><span className="text-white/30 text-xs">Size</span><p className="text-white/80">{formatBytes(selected.file_size)}</p></div>
                  <div><span className="text-white/30 text-xs">Uploaded</span><p className="text-white/80">{new Date(selected.created_at).toLocaleDateString()}</p></div>
                </div>
                <div className="space-y-2">
                  <button onClick={() => copyUrl(selected.file_url)}
                    className="w-full flex items-center justify-center gap-2 gradient-brand text-[#0A0A0A] font-bold py-2.5 rounded-xl text-sm btn-glow">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy URL</>}
                  </button>
                  <a href={selected.file_url} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/60 font-medium py-2.5 rounded-xl text-sm hover:border-white/30 hover:text-white transition-all">
                    <Link className="w-4 h-4" /> Open File
                  </a>
                  <button onClick={() => handleDelete(selected)}
                    className="w-full flex items-center justify-center gap-2 border border-red-500/20 text-red-400 font-medium py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
