import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Users, Calendar, Image, Phone, Info } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Beranda", icon: Image },
    { path: "/about", label: "Tentang", icon: Info },
    { path: "/events", label: "Event", icon: Calendar },
    { path: "/anggota", label: "Anggota", icon: Users },
    { path: "/contact", label: "Kontak", icon: Phone },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-glass-white backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo dengan Gambar */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-electric-cyan to-neon-purple p-0.5 hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-space-blue rounded-xl overflow-hidden">
                <img
                  src="../../img/logo_hmpti.jpg"
                  alt="HMP-TI Logo"
                  className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    // Fallback jika gambar tidak bisa dimuat
                    const target = e.target as HTMLImageElement;
                    const nextElement =
                      target.nextElementSibling as HTMLElement;
                    target.style.display = "none";
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
                {/* Fallback icon jika gambar gagal dimuat */}
                <div className="w-full h-full hidden items-center justify-center">
                  <Users className="w-5 h-5 text-electric-cyan group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-electric-cyan to-neon-purple bg-clip-text text-transparent">
              HMP-TI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-electric-cyan/20 to-neon-purple/20 text-electric-cyan"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-glass-white backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden bg-glass-white backdrop-blur-xl border-t border-white/10`}
      >
        <div className="px-4 py-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-electric-cyan/20 to-neon-purple/20 text-electric-cyan"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
