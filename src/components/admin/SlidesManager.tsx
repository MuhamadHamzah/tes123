import { useState, useEffect } from 'react';
import { supabase, Slide } from '../../lib/supabase';
import { Plus, Upload, Trash2, Save, X, Edit2 } from 'lucide-react';

export default function SlidesManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setSlides(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slides')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengupload gambar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert('Mohon upload gambar terlebih dahulu');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('slides')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        fetchSlides();
      }
    } else {
      const { error } = await supabase
        .from('slides')
        .insert([formData]);

      if (!error) {
        resetForm();
        fetchSlides();
      }
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingId(slide.id);
    setFormData({
      image_url: slide.image_url,
      title: slide.title,
      description: slide.description,
      order_index: slide.order_index,
      is_active: slide.is_active,
    });
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (confirm('Yakin ingin menghapus slide ini?')) {
      try {
        if (imageUrl) {
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await supabase.storage.from('slides').remove([fileName]);
          }
        }

        const { error } = await supabase
          .from('slides')
          .delete()
          .eq('id', id);

        if (!error) {
          fetchSlides();
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
        alert('Gagal menghapus slide');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      description: '',
      order_index: 0,
      is_active: true,
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
          {editingId ? 'Edit Slide' : 'Tambah Slide Baru'}
        </h2>
        <p className="text-white/60 text-sm">
          Upload gambar slide untuk halaman homepage
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">
            Gambar Slide
          </label>
          <div className="flex gap-4 items-start">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors">
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'Mengupload...' : 'Upload Gambar'}</span>
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
            Judul
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
            required
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">
            Deskripsi
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Urutan
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">
              Status
            </label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="true" className="bg-space-blue">Aktif</option>
              <option value="false" className="bg-space-blue">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Save className="w-4 h-4" />
            {editingId ? 'Update' : 'Tambah'}
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
        <h3 className="text-xl font-bold text-white mb-4">Daftar Slide</h3>
        <div className="space-y-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-white font-semibold">{slide.title}</h4>
                <p className="text-white/60 text-sm">{slide.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    Urutan: {slide.order_index}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    slide.is_active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {slide.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id, slide.image_url)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <p className="text-white/60 text-center py-8">Belum ada slide</p>
          )}
        </div>
      </div>
    </div>
  );
}
