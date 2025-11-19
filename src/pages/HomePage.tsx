import React, { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Users,
  Calendar,
  Trophy,
  ChevronDown,
  Lightbulb,
  Users as UsersIcon,
  Target,
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import { supabase, Slide } from "../lib/supabase";

const HomePage = () => {
  const [logoHovered, setLogoHovered] = useState(false);
  const [mobileLogoTransform, setMobileLogoTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const [slides, setSlides] = useState<Slide[]>([]);
  const [ctaButtonUrl, setCtaButtonUrl] = useState("https://forms.gle/example");
  const [desktopLogoTransform, setDesktopLogoTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const mobileLogoRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  // Refs untuk slider
  const topSliderRef = useRef<HTMLDivElement>(null);
  const bottomSliderRef = useRef<HTMLDivElement>(null);
  const sliderSectionRef = useRef<HTMLDivElement>(null);
  const [isSliderVisible, setIsSliderVisible] = useState(false);

  // Handle mouse move untuk desktop logo 3D
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!logoHovered) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / 15;
    const deltaY = (e.clientY - centerY) / 15;

    // Batasi rotasi
    const clampedRotateX = Math.max(-15, Math.min(15, -deltaY));
    const clampedRotateY = Math.max(-15, Math.min(15, deltaX));

    setDesktopLogoTransform({
      rotateX: clampedRotateX,
      rotateY: clampedRotateY,
      scale: 1.1,
    });
  };

  const handleMouseEnter = () => {
    setLogoHovered(true);
    setDesktopLogoTransform((prev) => ({
      ...prev,
      scale: 1.1,
    }));
  };

  const handleMouseLeave = () => {
    setLogoHovered(false);
    setDesktopLogoTransform({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "member_registration_url")
        .maybeSingle();

      if (data) {
        setCtaButtonUrl(data.value);
      }
    };

    fetchSettings();

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-slide-up");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    // Observer untuk slider section
    const sliderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSliderVisible(entry.isIntersecting);

          // Add or remove animation classes based on visibility
          if (entry.isIntersecting) {
            if (topSliderRef.current) {
              topSliderRef.current.classList.add("animate-marquee-right");
            }
            if (bottomSliderRef.current) {
              bottomSliderRef.current.classList.add("animate-marquee-left");
            }
          } else {
            if (topSliderRef.current) {
              topSliderRef.current.classList.remove("animate-marquee-right");
            }
            if (bottomSliderRef.current) {
              bottomSliderRef.current.classList.remove("animate-marquee-left");
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sliderSectionRef.current) {
      sliderObserver.observe(sliderSectionRef.current);
    }

    // Tambahkan CSS untuk animasi
    const style = document.createElement("style");
    style.textContent = `
      @keyframes marquee-right {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      @keyframes marquee-left {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
      
      .animate-marquee-right {
        animation: marquee-right 30s linear infinite;
      }
      
      .animate-marquee-left {
        animation: marquee-left 30s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      observer.disconnect();
      if (sliderSectionRef.current) {
        sliderObserver.unobserve(sliderSectionRef.current);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Touch handlers untuk logo mobile 3D
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    const touch = e.touches[0];
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    setMobileLogoTransform((prev) => ({
      ...prev,
      scale: 1.1,
    }));

    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;

    // Konversi gerakan touch ke rotasi 3D
    const rotateY = currentRotation.current.y + deltaX * 0.5;
    const rotateX = currentRotation.current.x - deltaY * 0.5;

    // Batasi rotasi
    const clampedRotateX = Math.max(-45, Math.min(45, rotateX));
    const clampedRotateY = Math.max(-45, Math.min(45, rotateY));

    setMobileLogoTransform({
      rotateX: clampedRotateX,
      rotateY: clampedRotateY,
      scale: 1.1,
    });

    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    isDragging.current = false;

    // Simpan posisi rotasi saat ini
    currentRotation.current = {
      x: mobileLogoTransform.rotateX,
      y: mobileLogoTransform.rotateY,
    };

    // Kembalikan scale ke normal
    setMobileLogoTransform((prev) => ({
      ...prev,
      scale: 1,
    }));

    e.preventDefault();
  };

  // Reset logo ke posisi awal dengan double tap
  const handleDoubleTouch = () => {
    currentRotation.current = { x: 0, y: 0 };
    setMobileLogoTransform({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
  };

  const stats = [
    { number: "50+", label: "Anggota Aktif", icon: Users },
    { number: "20+", label: "Event yang di adakan tahun ini", icon: Calendar },
    { number: "10+", label: "Prestasi Juara", icon: Trophy },
  ];

  // Data untuk bagian Inovasi
  const innovationFeatures = [
    {
      icon: Lightbulb,
      title: "Mengutamakan Inovasi",
      description:
        "Tetap unggul lewat proyek-proyek terbaru dan inisiatif teknologi yang menciptakan masa depan.",
      color: "from-electric-cyan to-blue-400",
      bgColor: "bg-electric-cyan/10",
      borderColor: "border-electric-cyan/30",
    },
    {
      icon: UsersIcon,
      title: "Berkembang Bersama",
      description:
        "Bangun dampak nyata lewat kolaborasi dengan teman yang sevisi pada proyek-proyek penting.",
      color: "from-neon-purple to-purple-400",
      bgColor: "bg-neon-purple/10",
      borderColor: "border-neon-purple/30",
    },
    {
      icon: Target,
      title: "Pengembangan Jiwa Kepemimpinan",
      description:
        "Kembangkan keterampilan kepemimpinan, melalui pengalaman langsung.",
      color: "from-hot-pink to-red-400",
      bgColor: "bg-hot-pink/10",
      borderColor: "border-hot-pink/30",
    },
  ];

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from("slides")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (data && data.length > 0) {
        setSlides(data);
      }
    };

    fetchSlides();
  }, []);

  const sliderImages =
    slides.length > 0
      ? slides.map((slide) => slide.image_url)
      : ["", "", "", "", "", ""];

  return (
    <div className="relative pt-16 overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-6">
            {/* Logo untuk Mobile - tampil di atas text dengan 3D Touch */}
            <div className="block lg:hidden mb-8">
              <div className="flex items-center justify-center">
                <div
                  ref={mobileLogoRef}
                  className="relative perspective-1000 cursor-grab active:cursor-grabbing"
                  style={{ perspective: "1000px" }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onDoubleClick={handleDoubleTouch}
                >
                  {/* Background particles untuk mobile */}
                  <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pointer-events-none">
                    <div className="absolute top-4 left-4 w-2 h-2 bg-electric-cyan rounded-full animate-pulse"></div>
                    <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-neon-purple rounded-full animate-ping"></div>
                    <div className="absolute bottom-6 left-6 w-2 h-2 bg-electric-cyan rounded-full animate-bounce"></div>
                    <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-hot-pink rounded-full animate-pulse"></div>
                    <div className="absolute top-1/3 left-2 w-1 h-1 bg-neon-purple rounded-full animate-ping"></div>
                    <div className="absolute top-2/3 right-2 w-1.5 h-1.5 bg-electric-cyan rounded-full animate-bounce"></div>
                  </div>

                  {/* 3D Transform Container */}
                  <div
                    className="relative transition-all duration-300 ease-out"
                    style={{
                      transform: `
                        perspective(1000px)
                        rotateX(${mobileLogoTransform.rotateX}deg)
                        rotateY(${mobileLogoTransform.rotateY}deg)
                        scale(${mobileLogoTransform.scale})
                      `,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Outer glow ring for mobile */}
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-electric-cyan/40 to-neon-purple/40 scale-110 blur-xl transition-all duration-300"
                      style={{
                        transform: `translateZ(-20px)`,
                      }}
                    ></div>

                    {/* Shadow plane */}
                    <div
                      className="absolute inset-0 bg-black/20 rounded-full blur-sm"
                      style={{
                        transform: `translateZ(-40px) scale(0.9)`,
                      }}
                    ></div>

                    {/* Logo utama dengan efek 3D */}
                    <div
                      className="relative z-10"
                      style={{
                        transform: `translateZ(20px)`,
                        filter: `
                          brightness(1.2)
                          saturate(1.1)
                          drop-shadow(0 10px 30px rgba(0,210,255,0.3))
                        `,
                      }}
                    >
                      <img
                        src="/img/logo_hmpti.jpg"
                        alt="HMP-TI Logo"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-contain transition-all duration-300 ease-out rounded-full"
                        draggable={false}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                      {/* Fallback icon untuk mobile */}
                      <div className="hidden w-24 h-24 sm:w-32 sm:h-32 items-center justify-center bg-gradient-to-r from-electric-cyan to-neon-purple rounded-full">
                        <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                      </div>
                    </div>

                    {/* Highlight layer */}
                    <div
                      className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-full opacity-50"
                      style={{
                        transform: `translateZ(30px)`,
                      }}
                    ></div>
                  </div>

                  {/* Touch instruction hint */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/40 text-center">
                    Geser untuk rotasi 3D
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-electric-cyan via-neon-purple to-hot-pink bg-clip-text text-transparent">
                  Himpunan
                </span>
                <br />
                <span className="bg-gradient-to-r from-electric-cyan via-neon-purple to-hot-pink bg-clip-text text-transparent">
                  Mahasiswa
                </span>
                <br />
                <span className="text-white">Prodi</span>
                <br />
                <span className="text-white">Teknik</span>
                <br />
                <span className="text-white/80">Informatika</span>
              </h1>
              <p className="text-base sm:text-lg text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Bergabunglah dengan organisasi mahasiswa paling inovatif di mana
                teknologi bertemu dengan kepemimpinan, dan impian menjadi
                kenyataan melalui kolaborasi dan inovasi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <a
                href={ctaButtonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-electric-cyan to-neon-purple rounded-full font-semibold text-white shadow-lg shadow-electric-cyan/25 hover:shadow-electric-cyan/40 transition-all duration-300 hover:scale-105 inline-block"
              >
                <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  Bergabung Sekarang
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>
          </div>

          {/* Logo untuk Desktop - 3D hover effect */}
          <div className="relative hidden lg:block">
            <div
              className="flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ perspective: "1000px" }}
            >
              {/* 3D Transform Container */}
              <div
                className="relative transition-all duration-300 ease-out"
                style={{
                  transform: `
                    perspective(1000px)
                    rotateX(${desktopLogoTransform.rotateX}deg)
                    rotateY(${desktopLogoTransform.rotateY}deg)
                    scale(${desktopLogoTransform.scale})
                  `,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,210,255,0.3) 0%, rgba(147,51,234,0.3) 100%)",
                    transform: `translateZ(-20px)`,
                    filter: "blur(20px)",
                    opacity: desktopLogoTransform.scale > 1 ? 0.8 : 0.5,
                  }}
                ></div>

                {/* Shadow plane */}
                <div
                  className="absolute inset-0 bg-black/20 rounded-full blur-sm"
                  style={{
                    transform: `translateZ(-40px) scale(0.9)`,
                  }}
                ></div>

                {/* Logo utama dengan efek 3D */}
                <div
                  className="relative z-10"
                  style={{
                    transform: `translateZ(20px)`,
                    filter: `
                      brightness(${1 + (desktopLogoTransform.scale - 1) * 0.5})
                      saturate(${1 + (desktopLogoTransform.scale - 1) * 0.5})
                      drop-shadow(0 ${10 * desktopLogoTransform.scale}px ${
                      30 * desktopLogoTransform.scale
                    }px rgba(0,210,255,${0.3 * desktopLogoTransform.scale}))
                    `,
                  }}
                >
                  <img
                    src="/img/logo_hmpti.jpg"
                    alt="HMP-TI Logo"
                    className="w-64 h-64 object-contain transition-all duration-300 ease-out rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                  {/* Fallback icon */}
                  <div className="hidden w-64 h-64 items-center justify-center">
                    <Users className="w-32 h-32 text-electric-cyan" />
                  </div>
                </div>

                {/* Highlight layer */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-full opacity-50"
                  style={{
                    transform: `translateZ(30px)`,
                  }}
                ></div>
              </div>

              {/* Hover instruction hint */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/40 text-center"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/40" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 scroll-animate opacity-0 translate-y-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-electric-cyan to-neon-purple bg-clip-text text-transparent">
                Inovasi
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              HMP-TI akan terus berkembang dan meraih pencapaian luar biasa
              bersama-sama.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="scroll-animate opacity-0 translate-y-10 w-full sm:w-auto"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <GlassCard className="p-4 sm:p-8 text-center group h-full w-full sm:w-64 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-electric-cyan to-neon-purple rounded-full mb-3 sm:mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white transform transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-electric-cyan to-neon-purple bg-clip-text text-transparent transform transition-all duration-300 group-hover:scale-110">
                      {stat.number}
                    </div>
                    <div className="text-sm sm:text-base text-white/60 font-medium transform transition-all duration-300 group-hover:text-white/80">
                      {stat.label}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <section
        ref={sliderSectionRef}
        className="py-12 sm:py-16 px-4 sm:px-6 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center scroll-animate opacity-0 translate-y-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-electric-cyan to-neon-purple bg-clip-text text-transparent">
                Dokumentasi
              </span>{" "}
              Kegiatan
            </h3>
            <p className="text-white/60">
              Dokumentasi kegiatan dan prestasi HMP-TI
            </p>
            <p className="text-sm text-white/40 mt-2">
              {isSliderVisible
                ? ""
                : "Scroll ke sini untuk mengaktifkan slider"}
            </p>
          </div>

          {/* Slider Container dengan masking efek */}
          <div className="relative">
            {/* Masking efek untuk sisi kiri */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>

            {/* Masking efek untuk sisi kanan */}
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>

            {/* Top Row - Moving Right */}
            <div className="flex mb-4 overflow-hidden">
              <div
                ref={topSliderRef}
                className="flex space-x-4 will-change-transform"
              >
                {sliderImages.map((img, index) => (
                  <div
                    key={`top-${index}`}
                    className="flex-shrink-0 w-64 h-40 sm:w-80 sm:h-52 rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* Duplicate images for seamless loop */}
                {sliderImages.map((img, index) => (
                  <div
                    key={`top-dup-${index}`}
                    className="flex-shrink-0 w-64 h-40 sm:w-80 sm:h-52 rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row - Moving Left */}
            <div className="flex overflow-hidden">
              <div
                ref={bottomSliderRef}
                className="flex space-x-4 will-change-transform"
              >
                {sliderImages.map((img, index) => (
                  <div
                    key={`bottom-${index}`}
                    className="flex-shrink-0 w-64 h-40 sm:w-80 sm:h-52 rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* Duplicate images for seamless loop */}
                {sliderImages.map((img, index) => (
                  <div
                    key={`bottom-dup-${index}`}
                    className="flex-shrink-0 w-64 h-40 sm:w-80 sm:h-52 rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Inovasi */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 scroll-animate opacity-0 translate-y-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Kenapa Harus Memilih{" "}
              <span className="bg-gradient-to-r from-electric-cyan to-neon-purple bg-clip-text text-transparent">
                HMP-TI?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Kami menawarkan lingkungan yang mendukung pengembangan diri dan
              inovasi teknologi
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {innovationFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="scroll-animate opacity-0 translate-y-10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <GlassCard className="p-6 sm:p-8 group h-full overflow-hidden transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:rotate-1">
                    {/* Background decoration */}
                    <div
                      className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${feature.bgColor} blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-125`}
                    ></div>

                    {/* Icon with animated background */}
                    <div className="relative mb-6 sm:mb-8">
                      <div
                        className={`absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${feature.bgColor} ${feature.borderColor} border-2 blur-lg opacity-50 group-hover:opacity-70 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                      ></div>
                      <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg z-10`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white transform transition-transform duration-300 group-hover:scale-110 group-hover:translate-z-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 transform transition-all duration-300 group-hover:text-electric-cyan group-hover:translate-x-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed transform transition-all duration-300 group-hover:text-white/80 group-hover:translate-x-1">
                      {feature.description}
                    </p>

                    {/* Decorative line */}
                    <div
                      className={`mt-6 h-1 w-16 bg-gradient-to-r ${feature.color} rounded-full transform transition-all duration-300 group-hover:w-20 group-hover:scale-y-125`}
                    ></div>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* Additional CTA for Inovasi Section */}
          <div className="mt-16 text-center">
            <div className="scroll-animate opacity-0 translate-y-10">
              <GlassCard className="p-8 max-w-3xl mx-auto transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-white mb-4 transform transition-all duration-300 group-hover:text-electric-cyan">
                  Siap Menjadi Bagian dari{" "}
                  <span className="bg-gradient-to-r from-electric-cyan to-neon-purple bg-clip-text text-transparent">
                    Inovasi?
                  </span>
                </h3>
                <p className="text-white/70 mb-6 transform transition-all duration-300 group-hover:text-white/90">
                  Bergabunglah dengan komunitas kami dan mulailah perjalanan
                  inovasi Anda bersama HMP-TI
                </p>
                <a
                  href={ctaButtonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-electric-cyan to-neon-purple rounded-full font-semibold text-white shadow-lg hover:shadow-electric-cyan/40 transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-2">
                    Bergabung Sekarang
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </a>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
