import { useState, useEffect } from 'react';
import { supabase, TeamMember } from '../../lib/supabase';
import { CreditCard as Edit2, Trash2, Save, X } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    photo_url: '',
    bio: '',
    order_index: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('team_members')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        fetchMembers();
      }
    } else {
      const { error } = await supabase
        .from('team_members')
        .insert([formData]);

      if (!error) {
        resetForm();
        fetchMembers();
      }
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      position: member.position,
      photo_url: member.photo_url,
      bio: member.bio,
      order_index: member.order_index,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus anggota tim ini?')) {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchMembers();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      photo_url: '',
      bio: '',
      order_index: 0,
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">
          {editingId ? 'Edit Anggota Tim' : 'Tambah Anggota Tim'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nama
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Jabatan
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL Foto
            </label>
            <input
              type="url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Urutan
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Tambah'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">Daftar Tim</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-start gap-4">
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-16 h-16 object-cover rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{member.name}</h3>
                  <p className="text-blue-400 text-sm">{member.position}</p>
                  <p className="text-slate-400 text-sm mt-1">{member.bio}</p>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded inline-block mt-2">
                    Urutan: {member.order_index}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-slate-400 text-center py-8 col-span-2">Belum ada anggota tim</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
