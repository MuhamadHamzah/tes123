import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, Image, Users, Calendar, Settings, Mail, QrCode } from "lucide-react";
import SlidesManager from "../components/admin/SlidesManager";
import EventsManager from "../components/admin/EventsManager";
import MembersManager from "../components/admin/MembersManager";
import SettingsManager from "../components/admin/SettingsManager";
import MessagesManager from "../components/admin/MessagesManager";
import AttendanceManager from "../components/admin/AttendanceManager";

type Tab = "slides" | "members" | "events" | "attendance" | "messages" | "settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("slides");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  if (!user) {
    navigate("/admin");
    return null;
  }

  const tabs = [
    { id: "slides" as Tab, label: "Slide Homepage", icon: Image },
    { id: "members" as Tab, label: "Anggota", icon: Users },
    { id: "events" as Tab, label: "Event", icon: Calendar },
    { id: "attendance" as Tab, label: "Absensi", icon: QrCode },
    { id: "messages" as Tab, label: "Pesan", icon: Mail },
    { id: "settings" as Tab, label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-blue via-slate-900 to-space-blue p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/70 text-lg">
              Kelola konten website HMP-TI
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-red-500/25"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-8 shadow-2xl">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:scale-105"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          {activeTab === "slides" && <SlidesManager />}
          {activeTab === "members" && <MembersManager />}
          {activeTab === "events" && <EventsManager />}
          {activeTab === "attendance" && <AttendanceManager />}
          {activeTab === "messages" && <MessagesManager />}
          {activeTab === "settings" && <SettingsManager />}
        </div>
      </div>
    </div>
  );
}
