import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Mail, Trash2, Eye, Clock } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Yakin ingin menghapus pesan ini?")) return;

    try {
      const { error } = await supabase.from("messages").delete().eq("id", id);

      if (error) throw error;
      alert("Pesan berhasil dihapus");
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Gagal menghapus pesan");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Memuat pesan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pesan Masuk</h2>
        <div className="text-white/60">
          {messages.filter((m) => !m.read).length} pesan belum dibaca
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
          <Mail className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">Belum ada pesan masuk</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.read) markAsRead(msg.id);
                }}
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border cursor-pointer transition-all hover:bg-white/10 ${
                  msg.read
                    ? "border-white/10"
                    : "border-electric-cyan/30 bg-electric-cyan/5"
                } ${
                  selectedMessage?.id === msg.id
                    ? "ring-2 ring-electric-cyan"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{msg.name}</h3>
                    <p className="text-white/60 text-sm">{msg.email}</p>
                  </div>
                  {!msg.read && (
                    <span className="px-2 py-1 bg-electric-cyan/20 text-electric-cyan text-xs rounded-full">
                      Baru
                    </span>
                  )}
                </div>
                <p className="text-electric-cyan text-sm mb-2">{msg.subject}</p>
                <p className="text-white/70 text-sm line-clamp-2">
                  {msg.message}
                </p>
                <div className="flex items-center gap-2 mt-3 text-white/40 text-xs">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 sticky top-0">
            {selectedMessage ? (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedMessage.name}
                    </h3>
                    <p className="text-white/60">{selectedMessage.email}</p>
                  </div>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Hapus pesan"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <span className="text-white/60 text-sm">Subjek:</span>
                  <p className="text-electric-cyan text-lg font-semibold">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="text-white/60 text-sm">Pesan:</span>
                  <p className="text-white/90 mt-2 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedMessage.created_at).toLocaleString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="mt-6 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Balas via Email
                </a>
              </div>
            ) : (
              <div className="text-center py-20">
                <Eye className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">
                  Pilih pesan untuk melihat detail
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
