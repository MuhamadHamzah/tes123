import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, AlertCircle } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { supabase } from "../lib/supabase";
import { AttendanceEvent, submitToGoogleSheets } from "../lib/attendance";

export default function AttendancePanitiaPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<AttendanceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    npm: "",
    angkatan: 1,
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  async function fetchEvent() {
    try {
      const { data, error } = await supabase
        .from("attendance_events")
        .select("*")
        .eq("id", eventId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError("Event tidak ditemukan atau sudah tidak aktif");
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Gagal memuat data event");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !event.spreadsheet_url_panitia) {
      setError("Link Google Sheets belum dikonfigurasi");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const attendanceData = {
        ...formData,
        waktu_checkin: new Date().toISOString(),
        event_name: event.event_name,
        type: "panitia",
      };

      const submitted = await submitToGoogleSheets(
        event.spreadsheet_url_panitia,
        attendanceData
      );

      if (submitted) {
        setSuccess(true);
        setFormData({ nama: "", npm: "", angkatan: 1 });
      } else {
        setError("Gagal mengirim data ke Google Sheets");
      }
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setError("Terjadi kesalahan saat submit absensi");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Memuat...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <GlassCard className="p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Error
          </h2>
          <p className="text-white/70 text-center">{error}</p>
        </GlassCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <GlassCard className="p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Absensi Berhasil!
          </h2>
          <p className="text-white/70 mb-6">
            Terima kasih telah mengisi absensi untuk {event?.event_name}
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({ nama: "", npm: "", angkatan: 1 });
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Isi Lagi
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/img/logo_hmpti.jpg"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Absensi Panitia</h1>
              <p className="text-white/60">{event?.event_name}</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-cyan-300 text-sm">
              Tanggal Event:{" "}
              {new Date(event?.event_date || "").toLocaleDateString("id-ID")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                NPM
              </label>
              <input
                type="text"
                value={formData.npm}
                onChange={(e) =>
                  setFormData({ ...formData, npm: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
                placeholder="Contoh: 2110010123"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Angkatan
              </label>
              <input
                type="number"
                min="1"
                value={formData.angkatan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    angkatan: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
                placeholder="Contoh: 1"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Mengirim..." : "Submit Absensi"}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
