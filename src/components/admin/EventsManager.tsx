import { useState, useEffect } from "react";
import { supabase, Event } from "../../lib/supabase";
import { Upload, Trash2, Save, X, Edit2 } from "lucide-react";

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    event_date: "",
    event_time: "00:00",
    location: "",
    is_published: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload gambar");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert("Mohon upload gambar terlebih dahulu");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("events")
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq("id", editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("events").insert([formData]);

      if (!error) {
        resetForm();
        fetchEvents();
      }
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      image_url: event.image_url,
      event_date: event.event_date.split("T")[0],
      event_time: event.event_time || "00:00",
      location: event.location,
      is_published: event.is_published,
    });
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (confirm("Yakin ingin menghapus event ini?")) {
      try {
        if (imageUrl) {
          const fileName = imageUrl.split("/").pop();
          if (fileName) {
            await supabase.storage.from("events").remove([fileName]);
          }
        }

        const { error } = await supabase.from("events").delete().eq("id", id);

        if (!error) {
          fetchEvents();
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Gagal menghapus event");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      event_date: "",
      event_time: "00:00",
      location: "",
      is_published: true,
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {editingId ? "Edit Event" : "Tambah Event Baru"}
        </h2>
        <p className="text-white/60 text-sm">
          Tambahkan event dan kegiatan HMP-TI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">
            Gambar Event
          </label>
          <div className="flex gap-4 items-start">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors">
                <Upload className="w-5 h-5" />
                <span>{uploading ? "Mengupload..." : "Upload Gambar"}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleFileUpload(file);
                    if (url) {
                      setFormData({ ...formData, image_url: url });
                    }
                  }
                }}
                disabled={uploading}
              />
            </label>
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-32 h-20 object-cover rounded-lg border-2 border-cyan-400"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">
            Judul Event
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
            required
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Tanggal Event
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) =>
                setFormData({ ...formData, event_date: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">
              Jam Event
            </label>
            <input
              type="time"
              value={formData.event_time}
              onChange={(e) =>
                setFormData({ ...formData, event_time: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Lokasi</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">
            Status Publikasi
          </label>
          <select
            value={formData.is_published ? "true" : "false"}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_published: e.target.value === "true",
              })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="true" className="bg-space-blue">
              Dipublikasikan
            </option>
            <option value="false" className="bg-space-blue">
              Draft
            </option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Save className="w-4 h-4" />
            {editingId ? "Update" : "Tambah"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="pt-6 border-t border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Daftar Event</h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex gap-4">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg">
                    {event.title}
                  </h4>
                  <p className="text-white/60 text-sm mt-1">
                    {event.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {new Date(event.event_date).toLocaleDateString("id-ID")}
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {event.event_time || "00:00"}
                    </span>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {event.location}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        event.is_published
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {event.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id, event.image_url)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-white/60 text-center py-8">Belum ada event</p>
          )}
        </div>
      </div>
    </div>
  );
}
