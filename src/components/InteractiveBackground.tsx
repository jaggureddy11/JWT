import React, { useEffect, useRef } from 'react';

export function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      containerRef.current.style.setProperty('--x', `${clientX}px`);
      containerRef.current.style.setProperty('--y', `${clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-1] overflow-hidden bg-black"
    >
      {/* Default static background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.15] via-black to-black"></div>
      
      {/* Interactive Grid Pattern */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), black 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
