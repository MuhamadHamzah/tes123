import React, { useEffect, useRef, useCallback } from "react";

interface ParticleType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  update: () => void;
  draw: () => void;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleType[]>([]);
  const animationFrameRef = useRef<number>();

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    resizeCanvas();

    // Balanced particle count
    const getParticleCount = () => {
      const area = canvas.width * canvas.height;
      return Math.min(80, Math.floor(area / 12000));
    };

    // Create particle factory function
    const createParticle = (): ParticleType => {
      const colors = ["#00D2FF", "#6C5CE7", "#FF006E"];
      const particle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.3,
        pulseSpeed: Math.random() * 0.015 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,

        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.pulsePhase += this.pulseSpeed;

          // Edge wrapping
          if (this.x < -20) this.x = canvas.width + 20;
          if (this.x > canvas.width + 20) this.x = -20;
          if (this.y < -20) this.y = canvas.height + 20;
          if (this.y > canvas.height + 20) this.y = -20;

          // Pulsing alpha
          this.alpha = 0.3 + Math.sin(this.pulsePhase) * 0.15;
        },

        draw() {
          if (!ctx) return;

          const pulseRadius = this.radius + Math.sin(this.pulsePhase) * 0.3;

          // Simple glow effect
          ctx.beginPath();
          ctx.arc(this.x, this.y, pulseRadius * 2, 0, Math.PI * 2);
          ctx.fillStyle = this.color + "20";
          ctx.fill();

          // Main particle
          ctx.beginPath();
          ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle =
            this.color +
            Math.floor(this.alpha * 255)
              .toString(16)
              .padStart(2, "0");
          ctx.fill();
        },
      };

      return particle;
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = getParticleCount();

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    initParticles();

    // Optimized animation loop with frame skipping
    let frameCount = 0;
    const animate = () => {
      if (!ctx || !canvas) return;

      frameCount++;

      // Trail effect with faster clearing
      ctx.fillStyle = "rgba(11, 13, 23, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections but skip frames for performance
      if (frameCount % 2 === 0) {
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              // Reduced connection distance
              const opacity = ((100 - distance) / 100) * 0.25;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle =
                particles[i].color +
                Math.floor(opacity * 255)
                  .toString(16)
                  .padStart(2, "0");
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [resizeCanvas]);

  // Moderate number of floating shapes
  const shapes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    type: i % 4,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 12 + Math.random() * 8,
    animClass: `float-anim-${(i % 3) + 1}`,
  }));

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float1 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(90deg); }
            50% { transform: translateY(-8px) rotate(180deg); }
            75% { transform: translateY(-12px) rotate(270deg); }
          }
          
          @keyframes float2 {
            0%, 100% { transform: translateX(0px) rotate(0deg); }
            33% { transform: translateX(12px) rotate(120deg); }
            66% { transform: translateX(-8px) rotate(240deg); }
          }
          
          @keyframes float3 {
            0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
            25% { transform: translate(8px, -12px) rotate(90deg); }
            50% { transform: translate(-4px, -15px) rotate(180deg); }
            75% { transform: translate(-12px, -4px) rotate(270deg); }
          }
          
          @keyframes pulseSlow {
            0%, 100% { opacity: 0.25; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.03); }
          }
          
          @keyframes pulseSlowDelayed {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          
          @keyframes rotateSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes gridPulse {
            0%, 100% { opacity: 0.08; }
            50% { opacity: 0.15; }
          }
          
          .float-anim-1 { animation: float1 12s ease-in-out infinite; }
          .float-anim-2 { animation: float2 15s ease-in-out infinite; }
          .float-anim-3 { animation: float3 18s ease-in-out infinite; }
          .pulse-slow-anim { animation: pulseSlow 6s ease-in-out infinite; }
          .pulse-slow-delayed-anim { animation: pulseSlowDelayed 8s ease-in-out infinite 2s; }
          .rotate-slow-anim { animation: rotateSlow 20s linear infinite; }
          .grid-pulse-anim { animation: gridPulse 12s ease-in-out infinite; }
        `,
        }}
      />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(135deg, #0B0D17 0%, #1a1d35 50%, #0B0D17 100%)",
        }}
      />

      {/* Floating geometric shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`absolute opacity-15 ${shape.animClass}`}
            style={{
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              animationDelay: `${shape.delay}s`,
              animationDuration: `${shape.duration}s`,
            }}
          >
            {shape.type === 0 && (
              <div
                className="w-7 h-7 border border-cyan-400 transform rotate-45"
                style={{
                  filter: "drop-shadow(0 0 8px #00D2FF60)",
                }}
              />
            )}
            {shape.type === 1 && (
              <div
                className="w-10 h-10 rounded-full border border-purple-400"
                style={{
                  filter: "drop-shadow(0 0 10px #6C5CE760)",
                }}
              />
            )}
            {shape.type === 2 && (
              <div
                className="w-5 h-7 transform rotate-12"
                style={{
                  background: "linear-gradient(to top, #FF006E80, transparent)",
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  filter: "drop-shadow(0 0 8px #FF006E60)",
                }}
              />
            )}
            {shape.type === 3 && (
              <div
                className="w-8 h-8 border border-cyan-400 rotate-slow-anim"
                style={{
                  clipPath:
                    "polygon(50% 0%, 0% 38%, 41% 100%, 59% 100%, 100% 38%)",
                  filter: "drop-shadow(0 0 6px #00D2FF60)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pulse-slow-anim"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 210, 255, 0.2) 0%, rgba(0, 210, 255, 0.08) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl pulse-slow-delayed-anim"
          style={{
            background:
              "radial-gradient(circle, rgba(108, 92, 231, 0.18) 0%, rgba(108, 92, 231, 0.06) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-2/3 left-1/2 w-56 h-56 rounded-full blur-3xl pulse-slow-anim"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 0, 110, 0.15) 0%, rgba(255, 0, 110, 0.04) 50%, transparent 100%)",
            animationDelay: "4s",
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 grid-pulse-anim">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 210, 255, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 210, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
    </>
  );
};

export default AnimatedBackground;
