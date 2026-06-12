import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  views: number;
  created_at: string;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  status: string;
  featured_image: string;
}

const defaultForm: FormData = { title: "", slug: "", excerpt: "", body: "", category: "General", status: "draft", featured_image: "" };
const categories = ["General", "Digital Marketing", "Branding", "Technology", "Business", "Africa", "Events"];

export default function BlogAdmin() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("id, title, slug, category, status, views, created_at").order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") };
    const { error } = editingId
      ? await supabase.from("blog_posts").update(payload).eq("id", editingId)
      : await supabase.from("blog_posts").insert([payload]);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logActivity(editingId ? "updated" : "created", "blog_post", editingId || "new", form.title);
    toast({ title: editingId ? "Post updated" : "Post created" });
    setShowForm(false); setEditingId(null); setForm(defaultForm); load();
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({ title: post.title, slug: post.slug, excerpt: "", body: "", category: post.category, status: post.status, featured_image: "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    await logActivity("deleted", "blog_post", id, "Blog Post");
    toast({ title: "Post deleted" });
    load();
  };

  const statusColor = (s: string) => s === "published" ? "text-green-400 border-green-400/30 bg-green-400/10" : s === "draft" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" : "text-white/40 border-white/20 bg-white/5";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-black text-2xl">Blog Posts</h1>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
            className="flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1A1A] border border-white/15 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-white font-bold text-xl mb-6">{editingId ? "Edit Post" : "New Blog Post"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Title *</label>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" placeholder="Post title..." />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all">
                      <option>draft</option><option>published</option><option>archived</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Featured Image URL</label>
                    <input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" placeholder="https://..." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Excerpt</label>
                    <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all resize-none" placeholder="Short description..." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Body Content</label>
                    <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all resize-none font-mono text-xs" placeholder="Write your article content here..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 gradient-brand text-white font-semibold py-2.5 rounded-full btn-glow disabled:opacity-60 transition-all">
                    {saving ? "Saving..." : editingId ? "Update Post" : "Publish Post"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/40">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-white/40">No blog posts yet. Create your first post!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8 bg-black/20">
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Views</th>
                  <th className="text-right px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr key={post.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === posts.length - 1 ? "border-0" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium line-clamp-1">{post.title}</p>
                      <p className="text-white/35 text-xs">{post.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-white/55 text-sm hidden md:table-cell">{post.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColor(post.status)}`}>{post.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-white/50 text-sm"><Eye className="w-3.5 h-3.5" />{post.views}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => handleEdit(post)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37] hover:bg-[rgba(212,175,55,0.15)] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => handleDelete(post.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-[rgba(255,77,106,0.15)] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
