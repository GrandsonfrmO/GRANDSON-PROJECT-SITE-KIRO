'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function TabBarParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 100; // Height of tab bar area
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle colors
    const colors = ['#ff6b35', '#10b981', '#ffffff', '#fbbf24'];

    // Create particle
    const createParticle = (x: number, y: number): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife: Math.random() * 60 + 30,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    // Add particles periodically
    const addParticles = () => {
      if (particlesRef.current.length < 20) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particlesRef.current.push(createParticle(x, y));
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (Math.random() < 0.1) {
        addParticles();
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life++;
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Fade out
        const alpha = 1 - (particle.life / particle.maxLife);
        
        if (alpha <= 0) return false;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}