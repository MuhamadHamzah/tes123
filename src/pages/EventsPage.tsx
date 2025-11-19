import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, ArrowRight, Search } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { supabase, Event } from "../lib/supabase";

// Definisikan tipe untuk event
interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  description: string;
  image: string;
  status: string;
  tags: string[];
}

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);
  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [registrationUrl, setRegistrationUrl] = useState(
    "https://forms.google.com/event-registration"
  );

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          entry.target.classList.add("animate-slide-up");
          setHasAnimated(true);
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    const fetchData = async () => {
      const [eventsRes, settingsRes] = await Promise.all([
        supabase
          .from("events")
          .select("*")
          .eq("is_published", true)
          .order("event_date", { ascending: false }),
        supabase
          .from("site_settings")
          .select("*")
          .in("key", ["event_registration_url"]),
      ]);

      if (eventsRes.data && eventsRes.data.length > 0) {
        setDbEvents(eventsRes.data);
      }

      if (settingsRes.data) {
        const settings = settingsRes.data.reduce((acc: any, item: any) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        if (settings.event_registration_url) {
          setRegistrationUrl(settings.event_registration_url);
        }
      }
    };

    fetchData();
  }, []);

  const defaultEvents: EventItem[] = [
    {
      id: 1,
      title: "Workshop Pengembangan Web3",
      date: "2025-02-15",
      time: "14:00",
      location: "Tech Hub, Ruang 301",
      category: "workshop",
      attendees: 45,
      maxAttendees: 60,
      description:
        "Pelajari dasar-dasar pengembangan Web3 termasuk smart contract, protokol DeFi, dan pembuatan dApp.",
      image:
        "https://images.pexels.com/photos/3183198/pexels-photo-3183198.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "upcoming",
      tags: ["Blockchain", "Smart Contracts", "DeFi"],
    },
    {
      id: 2,
      title: "Bootcamp AI & Machine Learning",
      date: "2025-02-20",
      time: "09:00",
      location: "Pusat Inovasi",
      category: "bootcamp",
      attendees: 78,
      maxAttendees: 100,
      description:
        "Bootcamp intensif 2 hari yang mencakup teknik AI modern, jaringan neural, dan aplikasi ML praktis.",
      image:
        "https://images.pexels.com/photos/8439093/pexels-photo-8439093.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "upcoming",
      tags: ["AI", "Machine Learning", "Python"],
    },
    {
      id: 3,
      title: "Malam Presentasi Startup",
      date: "2025-02-25",
      time: "18:00",
      location: "Auditorium Utama",
      category: "networking",
      attendees: 120,
      maxAttendees: 150,
      description:
        "Presentasikan ide startup Anda kepada pakar industri, investor, dan sesama pengusaha.",
      image:
        "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "upcoming",
      tags: ["Kewirausahaan", "Presentasi", "Jaringan"],
    },
    {
      id: 4,
      title: "Konferensi Keamanan Siber 2025",
      date: "2025-03-05",
      time: "10:00",
      location: "Ruang Konferensi A",
      category: "conference",
      attendees: 200,
      maxAttendees: 300,
      description:
        "Konferensi keamanan siber tahunan featuring pemimpin industri membahas ancaman terbaru dan strategi pertahanan.",
      image:
        "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "upcoming",
      tags: ["Keamanan Siber", "Privasi", "Pertahanan"],
    },
  ];

  const events: EventItem[] =
    dbEvents.length > 0
      ? dbEvents.map((event, index) => ({
          id: index + 1,
          title: event.title,
          date: event.event_date.split("T")[0],
          time: event.event_time || "00:00",
          location: event.location,
          category: event.category || "workshop",
          attendees: 0,
          maxAttendees: 100,
          description: event.description,
          image: event.image_url,
          status: "upcoming",
          tags: [],
        }))
      : defaultEvents;

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen pt-20 px-4 relative">
      {/* Header Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`scroll-animate opacity-0 translate-y-10 ${
              hasAnimated ? "animate-slide-up" : ""
            }`}
          >
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-electric-cyan via-neon-purple to-hot-pink bg-clip-text text-transparent">
                Acara
              </span>
              <br />
              <span className="text-white">Mendatang</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mt-6">
              Ikuti acara, workshop, dan konferensi menarik kami yang dirancang
              untuk memperluas pengetahuan Anda dan terhubung dengan para
              penggemar teknologi lainnya.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto">
          <GlassCard
            className={`p-8 scroll-animate opacity-0 translate-y-10 ${
              hasAnimated ? "animate-slide-up" : ""
            }`}
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Cari acara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-electric-cyan focus:outline-none transition-colors backdrop-blur-sm"
              />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <GlassCard
                key={event.id}
                className={`group overflow-hidden scroll-animate opacity-0 translate-y-10 ${
                  hasAnimated ? "animate-slide-up" : ""
                }`}
              >
                <div className="relative h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-blue/80 via-space-blue/20 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Calendar className="w-4 h-4 text-electric-cyan" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Clock className="w-4 h-4 text-neon-purple" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="w-4 h-4 text-hot-pink" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full group/btn relative px-4 py-3 bg-gradient-to-r from-electric-cyan to-neon-purple rounded-xl font-semibold text-white shadow-lg hover:shadow-electric-cyan/25 transition-all duration-300 hover:scale-105"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Daftar Sekarang
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-electric-cyan to-neon-purple rounded-full flex items-center justify-center opacity-50">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Tidak ada acara ditemukan
              </h3>
              <p className="text-white/60">
                Coba sesuaikan pencarian atau filter kriteria Anda
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
