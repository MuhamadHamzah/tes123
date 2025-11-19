import React, { ReactNode, useRef, useState } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover3D?: boolean;
  gradient?: boolean;
  interactive?: boolean;
  glowColor?: 'cyan' | 'purple' | 'pink';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover3D = false, 
  gradient = false,
  interactive = false,
  glowColor = 'cyan'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const glowColors = {
    cyan: 'rgba(0, 210, 255, 0.2)',
    purple: 'rgba(108, 92, 231, 0.2)',
    pink: 'rgba(255, 0, 110, 0.2)'
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hover3D || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 8;
    const rotateY = (centerX - x) / 8;

    card.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      translateZ(20px)
      scale3d(1.02, 1.02, 1.02)
    `;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!hover3D || !cardRef.current) return;
    cardRef.current.style.transform = `
      perspective(1000px) 
      rotateX(0deg) 
      rotateY(0deg) 
      translateZ(0px)
      scale3d(1, 1, 1)
    `;
  };

  return (
    <div
      ref={cardRef}
      className={`
        ${gradient 
          ? 'bg-gradient-to-br from-glass-white via-white/5 to-glass-white/20' 
          : 'bg-glass-white'
        }
        backdrop-blur-xl border border-glass-border rounded-3xl
        shadow-xl shadow-black/20
        transition-all duration-500 ease-out
        ${isHovered ? 'border-white/40' : 'border-glass-border'}
        ${hover3D ? 'transform-gpu' : ''}
        ${interactive ? 'interactive cursor-pointer' : ''}
        ${className}
      `}
      style={{
        filter: isHovered 
          ? `drop-shadow(0 20px 40px ${glowColors[glowColor]}) drop-shadow(0 0 20px ${glowColors[glowColor]})` 
          : 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.2))'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`
        ${isHovered ? 'bg-gradient-to-r from-white/5 to-transparent' : ''}
        transition-all duration-300 rounded-3xl h-full w-full
      `}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;