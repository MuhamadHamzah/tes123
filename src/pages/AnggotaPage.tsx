import { useEffect, useState } from "react";
import { Users, Search, ArrowRight } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { supabase } from "../lib/supabase";

interface Member {
  id: string;
  name: string;
  position: string;
  generation: number;
  photo_url: string;
  order_index: number;
}

const positionOrder: Record<string, number> = {
  "ketua umum": 1,
  "wakil ketua umum": 2,
  "sekretaris umum": 3,
  "bendahara umum": 4,
  "ketua divisi": 5,
};

const getPositionPriority = (position: string): number => {
  const lowerPos = position.toLowerCase();
  for (const [key, value] of Object.entries(positionOrder)) {
    if (lowerPos.includes(key)) {
      return value;
    }
  }
  return 999;
};

const AnggotaPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState(
    "https://forms.google.com/member-registration"
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
      const [membersRes, settingsRes] = await Promise.all([
        supabase
          .from("members")
          .select("*")
          .order("generation", { ascending: true })
          .order("order_index", { ascending: true }),
        supabase
          .from("site_settings")
          .select("value")
          .eq("key", "member_registration_url")
          .maybeSingle(),
      ]);

      if (membersRes.data) {
        const sortedData = membersRes.data.sort((a, b) => {
          if (a.generation !== b.generation) {
            return a.generation - b.generation;
          }
          const priorityA = getPositionPriority(a.position);
          const priorityB = getPositionPriority(b.position);
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          return a.order_index - b.order_index;
        });
        setMembers(sortedData);
      }

      if (settingsRes.data) {
        setRegistrationUrl(settingsRes.data.value);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const generationGroups: Record<number, Member[]> = {};
  filteredMembers.forEach((member) => {
    if (!generationGroups[member.generation]) {
      generationGroups[member.generation] = [];
    }
    generationGroups[member.generation].push(member);
  });

  const sortedGenerations = Object.keys(generationGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen pt-20 px-4 relative">
      <section className="py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`scroll-animate opacity-0 translate-y-10 ${
              hasAnimated ? "animate-slide-up" : ""
            }`}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Anggota
              </span>
              <br />
              <span className="text-white">HMP-TI</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Kenali anggota Himpunan Mahasiswa Prodi Teknik Informatika
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <GlassCard
            className={`p-6 scroll-animate opacity-0 translate-y-10 ${
              hasAnimated ? "animate-slide-up" : ""
            }`}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Cari anggota berdasarkan nama atau jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto space-y-16">
          {sortedGenerations.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">
                Tidak ada anggota ditemukan
              </p>
            </GlassCard>
          ) : (
            sortedGenerations.map((generation) => (
              <div key={generation} className="space-y-6">
                <div
                  className={`scroll-animate opacity-0 translate-y-10 ${
                    hasAnimated ? "animate-slide-up" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 blur-xl"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 rounded-2xl shadow-2xl">
                      <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                        Angkatan {generation}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {generationGroups[generation].map((member) => (
                    <div
                      key={member.id}
                      className={`group scroll-animate opacity-0 translate-y-10 ${
                        hasAnimated ? "animate-slide-up" : ""
                      }`}
                    >
                      <GlassCard className="h-full overflow-hidden hover:scale-105 transition-transform duration-300">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-space-blue via-transparent to-transparent opacity-60" />
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                            {member.name}
                          </h3>
                          <p className="text-sm text-cyan-400 font-medium">
                            {member.position}
                          </p>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto text-center">
          <GlassCard
            className={`p-16 scroll-animate opacity-0 translate-y-10 ${
              hasAnimated ? "animate-slide-up" : ""
            }`}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Bergabung dengan{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                HMP-TI
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Jadilah bagian dari keluarga besar HMP-TI dan kembangkan potensi
              Anda bersama kami
            </p>
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full font-semibold text-white shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              Daftar Sekarang
              <ArrowRight className="w-5 h-5" />
            </a>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default AnggotaPage;
