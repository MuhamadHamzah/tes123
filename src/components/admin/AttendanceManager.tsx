import { useState, useEffect } from 'react';
import { Plus, QrCode, Trash2, Edit2, Save, X, Download, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AttendanceEvent, generateQRCode, generateAttendanceUrl } from '../../lib/attendance';

export default function AttendanceManager() {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    event_type: 'general',
    spreadsheet_url_senior: '',
    spreadsheet_url_umum: '',
    spreadsheet_url_panitia: '',
    is_active: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('attendance_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneratingQR(true);

    try {
      const newEvent = {
        ...formData,
        qr_code_senior: '',
        qr_code_umum: '',
        qr_code_panitia: '',
      };

      if (editingId) {
        const { error } = await supabase
          .from('attendance_events')
          .update(newEvent)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from('attendance_events')
          .insert([newEvent])
          .select()
          .single();

        if (error) throw error;

        if (inserted) {
          const seniorUrl = generateAttendanceUrl(inserted.id, 'senior');
          const umumUrl = generateAttendanceUrl(inserted.id, 'umum');
          const panitiaUrl = generateAttendanceUrl(inserted.id, 'panitia');

          const [qrSenior, qrUmum, qrPanitia] = await Promise.all([
            generateQRCode(seniorUrl),
            generateQRCode(umumUrl),
            generateQRCode(panitiaUrl),
          ]);

          const { error: updateError } = await supabase
            .from('attendance_events')
            .update({
              qr_code_senior: qrSenior,
              qr_code_umum: qrUmum,
              qr_code_panitia: qrPanitia,
            })
            .eq('id', inserted.id);

          if (updateError) throw updateError;
        }
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({
        event_name: '',
        event_date: '',
        event_type: 'general',
        spreadsheet_url_senior: '',
        spreadsheet_url_umum: '',
        spreadsheet_url_panitia: '',
        is_active: true,
      });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Gagal menyimpan event');
    } finally {
      setGeneratingQR(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus event ini?')) return;

    try {
      const { error } = await supabase
        .from('attendance_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Gagal menghapus event');
    }
  }

  function handleEdit(event: AttendanceEvent) {
    setEditingId(event.id);
    setIsAdding(true);
    setFormData({
      event_name: event.event_name,
      event_date: event.event_date,
      event_type: event.event_type,
      spreadsheet_url_senior: event.spreadsheet_url_senior || '',
      spreadsheet_url_umum: event.spreadsheet_url_umum || '',
      spreadsheet_url_panitia: event.spreadsheet_url_panitia || '',
      is_active: event.is_active,
    });
  }

  function downloadQR(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Kelola Absensi</h2>
          <p className="text-white/60 text-sm mt-1">
            Buat event dan generate QR Code untuk absensi
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Tambah Event
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Edit Event' : 'Event Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Nama Event</label>
                <input
                  type="text"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Tanggal Event</label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Link Google Sheets - Senior</label>
              <input
                type="url"
                value={formData.spreadsheet_url_senior}
                onChange={(e) => setFormData({ ...formData, spreadsheet_url_senior: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Link Google Sheets - Peserta Umum</label>
              <input
                type="url"
                value={formData.spreadsheet_url_umum}
                onChange={(e) => setFormData({ ...formData, spreadsheet_url_umum: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Link Google Sheets - Panitia</label>
              <input
                type="url"
                value={formData.spreadsheet_url_panitia}
                onChange={(e) => setFormData({ ...formData, spreadsheet_url_panitia: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Event Aktif
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={generatingQR}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {generatingQR ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({
                    event_name: '',
                    event_date: '',
                    event_type: 'general',
                    spreadsheet_url_senior: '',
                    spreadsheet_url_umum: '',
                    spreadsheet_url_panitia: '',
                    is_active: true,
                  });
                }}
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{event.event_name}</h3>
                <p className="text-white/60 text-sm">
                  {new Date(event.event_date).toLocaleDateString('id-ID')}
                </p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                    event.is_active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {event.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">QR Senior</h4>
                </div>
                {event.qr_code_senior ? (
                  <>
                    <img
                      src={event.qr_code_senior}
                      alt="QR Senior"
                      className="w-full aspect-square rounded-lg mb-3"
                    />
                    <button
                      onClick={() => downloadQR(event.qr_code_senior, `qr-senior-${event.event_name}.png`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                    {event.spreadsheet_url_senior && (
                      <a
                        href={event.spreadsheet_url_senior}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka Sheets
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-white/60 text-sm">QR belum di-generate</p>
                )}
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">QR Peserta Umum</h4>
                </div>
                {event.qr_code_umum ? (
                  <>
                    <img
                      src={event.qr_code_umum}
                      alt="QR Umum"
                      className="w-full aspect-square rounded-lg mb-3"
                    />
                    <button
                      onClick={() => downloadQR(event.qr_code_umum, `qr-umum-${event.event_name}.png`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                    {event.spreadsheet_url_umum && (
                      <a
                        href={event.spreadsheet_url_umum}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka Sheets
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-white/60 text-sm">QR belum di-generate</p>
                )}
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-semibold text-white">QR Panitia</h4>
                </div>
                {event.qr_code_panitia ? (
                  <>
                    <img
                      src={event.qr_code_panitia}
                      alt="QR Panitia"
                      className="w-full aspect-square rounded-lg mb-3"
                    />
                    <button
                      onClick={() => downloadQR(event.qr_code_panitia, `qr-panitia-${event.event_name}.png`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                    {event.spreadsheet_url_panitia && (
                      <a
                        href={event.spreadsheet_url_panitia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka Sheets
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-white/60 text-sm">QR belum di-generate</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <QrCode className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Belum ada event absensi</p>
          </div>
        )}
      </div>
    </div>
  );
}
