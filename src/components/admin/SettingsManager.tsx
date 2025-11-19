import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  address: string;
}

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    id: "",
    phone: "",
    email: "",
    address: "",
  });
  const [eventBannerText, setEventBannerText] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [eventRegistrationUrl, setEventRegistrationUrl] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const [contactRes, settingsRes] = await Promise.all([
        supabase.from("contact_info").select("*").maybeSingle(),
        supabase.from("site_settings").select("*"),
      ]);

      if (contactRes.data) {
        setContactInfo(contactRes.data);
      }

      if (settingsRes.data) {
        const settings = settingsRes.data.reduce((acc: any, item: any) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        setEventBannerText(settings.events_page_heading || "");
        setRegistrationLink(settings.member_registration_url || "");
        setEventRegistrationUrl(settings.event_registration_url || "");
        setAdminEmail(settings.admin_notification_email || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveContactInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!contactInfo.id) {
      alert("ID kontak tidak valid");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("contact_info")
        .update({
          phone: contactInfo.phone,
          email: contactInfo.email,
          address: contactInfo.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contactInfo.id);

      if (error) throw error;
      alert("Informasi kontak berhasil disimpan!");
    } catch (error) {
      console.error("Error saving contact info:", error);
      alert("Gagal menyimpan informasi kontak");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = [
        { key: "events_page_heading", value: eventBannerText },
        { key: "member_registration_url", value: registrationLink },
        { key: "event_registration_url", value: eventRegistrationUrl },
        { key: "admin_notification_email", value: adminEmail },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq("key", update.key);

        if (error) throw error;
      }

      alert("Pengaturan berhasil disimpan!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Memuat pengaturan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">
          Informasi Kontak
        </h3>
        <form onSubmit={handleSaveContactInfo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Nomor Telepon
            </label>
            <input
              type="text"
              value={contactInfo.phone}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, phone: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, email: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Alamat Kunjungan
            </label>
            <textarea
              value={contactInfo.address}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, address: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Informasi Kontak"}
          </button>
        </form>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">
          Pengaturan Lainnya
        </h3>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Link Daftar Event
            </label>
            <input
              type="url"
              value={eventRegistrationUrl}
              onChange={(e) => setEventRegistrationUrl(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://forms.google.com/event-registration"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Link Pendaftaran Anggota Baru
            </label>
            <input
              type="url"
              value={registrationLink}
              onChange={(e) => setRegistrationLink(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://forms.google.com/member-registration"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </form>
      </div>
    </div>
  );
}
