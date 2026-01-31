
import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Pulse, UserProfile } from '../types';

interface NebulaProps {
  pulses: Pulse[];
  users: UserProfile[];
  onSelectPulse: (pulse: Pulse) => void;
  onSelectUser: (user: UserProfile) => void;
  activeView: string;
  onViewChange: (view: any) => void;
  currentUser: UserProfile | null;
}

const COLORS = [
  { core: '#00ffff', glow: 'rgba(0, 255, 255, 0.4)', trail: 'rgba(0, 255, 255, 0.1)' },
  { core: '#ff00ff', glow: 'rgba(255, 0, 255, 0.4)', trail: 'rgba(255, 0, 255, 0.1)' },
  { core: '#7000ff', glow: 'rgba(112, 0, 255, 0.4)', trail: 'rgba(112, 0, 255, 0.1)' },
  { core: '#0066ff', glow: 'rgba(0, 102, 255, 0.4)', trail: 'rgba(0, 102, 255, 0.1)' },
  { core: '#ffcc00', glow: 'rgba(255, 204, 0, 0.4)', trail: 'rgba(255, 204, 0, 0.1)' },
];


const Nebula: React.FC<NebulaProps> = ({ pulses, users, onSelectPulse, onSelectUser, activeView, onViewChange, currentUser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false });
  const [activePhrase, setActivePhrase] = useState<{ text: string, x: number, y: number, alpha: number, color: string } | null>(null);

  // Background Nebula Particles (Deep Layer)
  const cosmicDust = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 400 + 200,
      color: COLORS[Math.floor(Math.random() * COLORS.length)].glow,
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0005,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 500 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5,
      blink: Math.random() * 0.05 + 0.01,
      seed: Math.random() * 10,
    }));
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Creative Physics: Cluster Logic
    // Bots are attracted to "Gravity Centers" (Real Users)
    const nodes = users.map((u, i) => {
      const isBot = u.id.startsWith('bot-');
      const isMe = u.id === currentUser?.id;
      const resonance = (u as any).totalResonance || 0;

      // Determine galaxy center: Real users are seeds for clusters
      const realUsers = users.filter(usr => !usr.id.startsWith('bot-'));
      const seedUser = realUsers.length > 0 ? realUsers[i % realUsers.length] : null;

      return {
        ...u,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        radius: isMe ? 15 : (isBot ? (4 + Math.random() * 4) : (25 + resonance * 5)),
        color: u.color || COLORS[i % COLORS.length].core,
        isBot,
        isMe,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        // Gravity link to a real user "sun"
        sunId: seedUser?.id,
      };
    });

    const simulation = d3.forceSimulation(nodes as any)
      .alphaTarget(0.1)
      .velocityDecay(0.15) // Slightly higher decay for smoother motion
      // Charge force: subtle repulsion between all
      .force('charge', d3.forceManyBody().strength((d: any) => d.isBot ? -15 : -1500))
      // Gravity cluster: bots are pulled towards center or their "Sun"
      .force('cluster', (alpha: number) => {
        nodes.forEach((d: any) => {
          if (d.isBot && d.sunId) {
            const sun = nodes.find(n => n.id === d.sunId);
            if (sun) {
              d.vx += (sun.x - d.x) * 0.001 * alpha;
              d.vy += (sun.y - d.y) * 0.001 * alpha;
            }
          }
        });
      })
      .force('collide', d3.forceCollide().radius((d: any) => d.isMe ? 60 : (d.isBot ? 20 : 100)).strength(1))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.015));

    let frame = 0;
    const render = () => {
      frame++;

      // 1. CINEMATIC BACKGROUND
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, width, height);

      // Deep Atmospheric Glows
      const glows = [
        { x: width * 0.2, y: height * 0.3, r: width * 0.8, c: 'rgba(112, 0, 255, 0.12)' },
        { x: width * 0.8, y: height * 0.7, r: width * 0.8, c: 'rgba(0, 255, 255, 0.12)' },
        { x: width * 0.5, y: height * 0.5, r: width * 0.6, c: 'rgba(255, 255, 255, 0.03)' }
      ];

      glows.forEach(g => {
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
        grad.addColorStop(0, g.c);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // Deep Nebula Smoke (More organic)
      ctx.globalCompositeOperation = 'screen';
      cosmicDust.forEach(cloud => {
        cloud.x = (cloud.x + cloud.vx + 1) % 1;
        cloud.y = (cloud.y + cloud.vy + 1) % 1;
        const gx = cloud.x * width;
        const gy = cloud.y * height;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, cloud.size);
        g.addColorStop(0, cloud.color.replace('0.4', '0.05'));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      });

      // Sharp Stars with Parallax
      ctx.globalCompositeOperation = 'source-over';
      stars.forEach(s => {
        const alpha = Math.sin(frame * s.blink + s.seed) * 0.5 + 0.5;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        // Subtle Mouse parallax
        const px = (mouseRef.current.targetX - width / 2) * 0.01;
        const py = (mouseRef.current.targetY - height / 2) * 0.01;
        ctx.arc(s.x * width + px, s.y * height + py, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Vignette Overlay (THE KEY FOR PREMIUM LOOK)
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 2. COSMIC WEB (Neural Connections)
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 0.3;
      for (let i = 0; i < nodes.length; i += 5) { // Sub-sample for performance
        const a = nodes[i] as any;
        if (a.isBot) continue; // Only connections from real users to bots or among users

        for (let j = 0; j < nodes.length; j += 15) {
          const b = nodes[j] as any;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 250 * 250) {
            ctx.beginPath();
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = (1 - Math.sqrt(d2) / 250) * 0.15;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 3. ENTITIES (ORBS & ROCKETS)
      nodes.forEach((node: any) => {
        ctx.save();
        ctx.translate(node.x, node.y);

        if (node.isMe) {
          // --- INNOVATIVE: THE PRISMATIC VOYAGER ---
          const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          const angle = Math.atan2(node.vy, node.vx) + Math.PI / 2;
          ctx.rotate(angle);

          // 1. Orbital Rings (Consciousness Halo)
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            const r = 25 + i * 10 + Math.sin(frame * 0.05 + i) * 5;
            const rot = frame * (0.02 + i * 0.01);
            ctx.save();
            ctx.rotate(rot);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 - i * 0.1})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * 0.4, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // 2. The Prismatic Body (Double-Pointed Diamond)
          const bodyG = ctx.createLinearGradient(0, -25, 0, 25);
          bodyG.addColorStop(0, '#fff');
          bodyG.addColorStop(0.5, '#22d3ee');
          bodyG.addColorStop(1, '#7000ff');

          ctx.shadowBlur = 15;
          ctx.shadowColor = '#22d3ee';

          ctx.beginPath();
          ctx.moveTo(0, -25); // Top
          ctx.lineTo(12, 5);  // Right
          ctx.lineTo(0, 15);  // Bottom inner
          ctx.lineTo(-12, 5); // Left
          ctx.closePath();
          ctx.fillStyle = bodyG;
          ctx.fill();

          ctx.shadowBlur = 0;

          // 3. Singularity Drive (Instead of fire)
          const pulseEffect = Math.sin(frame * 0.2) * 0.5 + 0.5;
          const g = ctx.createRadialGradient(0, 18, 0, 0, 18, 15 + velocity * 10);
          g.addColorStop(0, '#fff');
          g.addColorStop(0.2, '#22d3ee');
          g.addColorStop(0.5, 'rgba(112, 0, 255, 0.4)');
          g.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 18, 15 + velocity * 10 * pulseEffect, 0, Math.PI * 2);
          ctx.fill();

          // 4. Inner Core (Nucleus)
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();

          // Label
          ctx.rotate(-angle);
          ctx.fillStyle = '#fff';
          ctx.font = '900 12px Syncopate';
          ctx.letterSpacing = '8px';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fff';
          ctx.fillText(node.name.toUpperCase(), 0, 60);
          ctx.shadowBlur = 0;
        } else {
          // RENDER ORB (BOTS OR OTHER USERS)
          const pulse = Math.sin(frame * node.pulseSpeed + node.phase) * 0.15 + 1;
          const currentR = node.radius * pulse;

          if (!node.isBot) {
            // REAL USER SYSTEM (Like ZION in the image)

            // 1. Orbiting Satellites
            // White Satellite (Close)
            const orbit1 = frame * 0.02 + node.phase;
            const sat1X = Math.cos(orbit1) * (currentR + 15);
            const sat1Y = Math.sin(orbit1) * (currentR + 15);

            ctx.beginPath();
            ctx.arc(sat1X, sat1Y, currentR * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#e0f7fa';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.shadowBlur = 0;

            // Teal Satellite (Farther)
            const orbit2 = frame * -0.01 + node.phase * 2;
            const sat2X = Math.cos(orbit2) * (currentR + 30);
            const sat2Y = Math.sin(orbit2) * (currentR + 30);

            ctx.beginPath();
            ctx.arc(sat2X, sat2Y, currentR * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = '#00838f';
            ctx.fill();

            // 2. Main Glowing Core
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, currentR * 1.5);
            g.addColorStop(0, node.color);
            g.addColorStop(0.8, node.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.beginPath();
            ctx.arc(0, 0, currentR * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.shadowBlur = 20;
            ctx.shadowColor = node.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Internal Highlight (The soft crescent look)
            ctx.beginPath();
            ctx.arc(0, 0, currentR * 1.2, 0, Math.PI * 2);
            const ringG = ctx.createLinearGradient(-currentR, -currentR, currentR, currentR);
            ringG.addColorStop(0, 'rgba(255,255,255,0.2)');
            ringG.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = ringG;
            ctx.fill();

          } else {
            // BOT ORB (Simpler)
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, currentR * 4);
            g.addColorStop(0, node.color);
            g.addColorStop(0.2, node.color.slice(0, 7) + '44');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(0, 0, currentR * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.arc(0, 0, currentR, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
          }

          // Label
          const dist = Math.sqrt(Math.pow(node.x - mouseRef.current.targetX, 2) + Math.pow(node.y - mouseRef.current.targetY, 2));
          if (!node.isBot || dist < 100) {
            ctx.fillStyle = node.isBot ? 'rgba(255,255,255,0.3)' : '#fff';
            ctx.font = '900 12px Syncopate';
            ctx.letterSpacing = '8px';
            ctx.textAlign = 'center';
            // Position it lower as in the image
            ctx.fillText(node.name.toUpperCase(), 0, currentR + 70);
          }
        }

        ctx.restore();
      });

      // 4. FLOATING WHISPERS
      if (activePhrase) {
        ctx.save();
        ctx.translate(activePhrase.x, activePhrase.y);
        ctx.globalAlpha = activePhrase.alpha;
        ctx.fillStyle = activePhrase.color;
        ctx.font = 'italic 500 18px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '1px';

        ctx.shadowBlur = 15;
        ctx.shadowColor = activePhrase.color;

        // Efeito de "subida ao céu"
        const offsetY = -60 - (1 - activePhrase.alpha) * 100;
        ctx.fillText(activePhrase.text.toUpperCase(), 0, offsetY);

        ctx.restore();
        setActivePhrase(prev => prev ? { ...prev, alpha: prev.alpha - 0.008 } : null);
        if (activePhrase.alpha <= 0) setActivePhrase(null);
      }

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      const mx = e.clientX; const my = e.clientY;
      const clicked = nodes.find((n: any) => {
        const dx = n.x - mx; const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 30;
      });
      if (clicked) {
        setActivePhrase({
          text: clicked.vibe,
          x: clicked.x,
          y: clicked.y,
          alpha: 1.0,
          color: clicked.isBot ? '#ffffff' : clicked.color
        });
        onSelectUser(clicked as any);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleClick);

    return () => {
      cancelAnimationFrame(animId);
      simulation.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleClick);
    };
  }, [users, pulses, activePhrase]);

  return (
    <div className="fixed inset-0 z-0 bg-[#010204]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Dock Area */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
        <div className="relative group">
          {/* Animated Glow Backdrop */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="relative flex items-center space-x-12 px-14 py-6 bg-black/60 backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            {['NEBULOSA', 'PULSAR', 'ESSÊNCIA'].map((item) => {
              const isActive = (item === 'NEBULOSA' && activeView === 'NEBULOSA') ||
                (item === 'PULSAR' && activeView === 'PULSAR') ||
                (item === 'ESSÊNCIA' && activeView === 'ESSÊNCIA');

              return (
                <button
                  key={item}
                  onClick={() => onViewChange(item)}
                  className="relative group/btn"
                >
                  <span className={`text-[10px] tracking-[0.6em] font-black transition-all duration-500 block ${isActive ? 'text-cyan-400' : 'text-white/30 group-hover/btn:text-white/60'}`}>
                    {item}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-2 left-1.5 right-1.5 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Atmospheric Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-150 mix-blend-overlay"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")' }} />
    </div>
  );
};

export default Nebula;
