import { useState, useEffect } from "react";
import { Plus, Upload, Trash2, Edit2, Save, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Member {
  id: string;
  name: string;
  position: string;
  generation: number;
  photo_url: string;
  order_index: number;
}

const MembersManager = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    generation: 1,
    photo_url: "",
    order_index: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("generation", { ascending: true })
      .order("order_index", { ascending: true });

    if (data) {
      setMembers(data);
    }
  };

  const handleFileUpload = async (
    file: File,
    memberId?: string
  ): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("member-photos").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.position || !newMember.photo_url) {
      alert("Mohon lengkapi semua field");
      return;
    }

    const { error } = await supabase.from("members").insert([newMember]);

    if (error) {
      console.error("Error adding member:", error);
      alert("Gagal menambahkan anggota");
    } else {
      setIsAdding(false);
      setNewMember({
        name: "",
        position: "",
        generation: 1,
        photo_url: "",
        order_index: 0,
      });
      fetchMembers();
    }
  };

  const handleUpdateMember = async (member: Member) => {
    const { error } = await supabase
      .from("members")
      .update({
        name: member.name,
        position: member.position,
        generation: member.generation,
        photo_url: member.photo_url,
        order_index: member.order_index,
      })
      .eq("id", member.id);

    if (error) {
      console.error("Error updating member:", error);
      alert("Gagal mengupdate anggota");
    } else {
      setEditingId(null);
      fetchMembers();
    }
  };

  const handleDeleteMember = async (id: string, photoUrl: string) => {
    if (!confirm("Yakin ingin menghapus anggota ini?")) return;

    try {
      if (photoUrl) {
        const fileName = photoUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("member-photos").remove([fileName]);
        }
      }

      const { error } = await supabase.from("members").delete().eq("id", id);

      if (error) throw error;
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Gagal menghapus anggota");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Kelola Anggota</h2>
          <p className="text-white/60 text-sm mt-1">
            Tambah, edit, atau hapus anggota HMP-TI
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Tambah Anggota
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Anggota Baru</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Nama</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">
                Jabatan
              </label>
              <input
                type="text"
                value={newMember.position}
                onChange={(e) =>
                  setNewMember({ ...newMember, position: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="Jabatan"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">
                Angkatan
              </label>
              <input
                type="number"
                min="1"
                value={newMember.generation}
                onChange={(e) =>
                  setNewMember({
                    ...newMember,
                    generation: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="Nomor angkatan"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Urutan</label>
              <input
                type="number"
                value={newMember.order_index}
                onChange={(e) =>
                  setNewMember({
                    ...newMember,
                    order_index: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/70 text-sm mb-2">Foto</label>
              <div className="flex gap-4 items-start">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors">
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? "Mengupload..." : "Upload Foto"}</span>
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
                          setNewMember({ ...newMember, photo_url: url });
                        }
                      }
                    }}
                    disabled={uploading}
                  />
                </label>
                {newMember.photo_url && (
                  <img
                    src={newMember.photo_url}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-cyan-400"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddMember}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewMember({
                  name: "",
                  position: "",
                  generation: 1,
                  photo_url: "",
                  order_index: 0,
                });
              }}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
          >
            {editingId === member.id ? (
              <div className="space-y-3">
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) =>
                    setMembers(
                      members.map((m) =>
                        m.id === member.id ? { ...m, name: e.target.value } : m
                      )
                    )
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                <input
                  type="text"
                  value={member.position}
                  onChange={(e) =>
                    setMembers(
                      members.map((m) =>
                        m.id === member.id
                          ? { ...m, position: e.target.value }
                          : m
                      )
                    )
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                <input
                  type="number"
                  min="1"
                  value={member.generation}
                  onChange={(e) =>
                    setMembers(
                      members.map((m) =>
                        m.id === member.id
                          ? { ...m, generation: parseInt(e.target.value) }
                          : m
                      )
                    )
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  placeholder="Nomor angkatan"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateMember(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:scale-105 transition-transform"
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-bold text-lg mb-1">
                  {member.name}
                </h3>
                <p className="text-cyan-400 text-sm mb-1">{member.position}</p>
                <p className="text-white/60 text-xs mb-3">
                  Angkatan {member.generation}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(member.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteMember(member.id, member.photo_url)
                    }
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <p className="text-white/60">
            Belum ada anggota. Tambahkan yang pertama!
          </p>
        </div>
      )}
    </div>
  );
};

export default MembersManager;
