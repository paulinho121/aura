
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Pulse, UserProfile } from '../types';

interface NebulaProps {
  pulses: Pulse[];
  users: UserProfile[];
  onSelectPulse: (pulse: Pulse) => void;
  onSelectUser: (user: UserProfile) => void;
}

const COLORS = [
  { core: '#00ffff', glow: 'rgba(0, 255, 255, 0.4)', trail: 'rgba(0, 255, 255, 0.1)' },
  { core: '#ff00ff', glow: 'rgba(255, 0, 255, 0.4)', trail: 'rgba(255, 0, 255, 0.1)' },
  { core: '#7000ff', glow: 'rgba(112, 0, 255, 0.4)', trail: 'rgba(112, 0, 255, 0.1)' },
  { core: '#0066ff', glow: 'rgba(0, 102, 255, 0.4)', trail: 'rgba(0, 102, 255, 0.1)' },
  { core: '#ffcc00', glow: 'rgba(255, 204, 0, 0.4)', trail: 'rgba(255, 204, 0, 0.1)' },
];

const Nebula: React.FC<NebulaProps> = ({ pulses, users, onSelectPulse, onSelectUser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Generate stars once
  const stars = useMemo(() => {
    return Array.from({ length: 400 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.05 + 0.02
    }));
  }, []);

  // Generate nebulae once
  const nebulae = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 0.4 + 0.3,
      color: COLORS[i % COLORS.length].glow,
      vx: (Math.random() - 0.5) * 0.0001,
      vy: (Math.random() - 0.5) * 0.0001
    }));
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes = users.map((u, i) => {
      const colorSet = COLORS[i % COLORS.length];
      const resonanceLevel = (u as any).totalResonance || 0;
      const communities = (u as any).communityCount || 0;

      // Scale system based on resonance
      const baseRadius = u.lastPulseAt ? 24 : 16;
      const systemScale = 1 + (resonanceLevel * 0.1);

      return {
        ...u,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: baseRadius * systemScale,
        totalResonance: resonanceLevel,
        communityCount: communities,
        color: colorSet,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        // More orbiters based on resonance
        orbiters: Array.from({ length: 3 + Math.min(resonanceLevel, 10) }).map((_, oi) => ({
          dist: 30 + (oi * 12) * systemScale,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() - 0.5) * (0.04 / (oi + 1)),
          size: Math.random() * 3 + 1,
          isPlanet: oi % 3 === 0 // Every 3rd orbiter is a larger "planet"
        }))
      };
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force('charge', d3.forceManyBody().strength((d: any) => -300 * (1 + d.totalResonance * 0.2)))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => (d.radius + (d.orbiters.length * 15)) + 20))
      .force('bound', () => {
        nodes.forEach((node: any) => {
          node.x = Math.max(100, Math.min(width - 100, node.x));
          node.y = Math.max(100, Math.min(height - 100, node.y));
        });
      });

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Background
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Nebulae
      nebulae.forEach(neb => {
        neb.x += neb.vx;
        neb.y += neb.vy;
        if (neb.x < 0 || neb.x > 1) neb.vx *= -1;
        if (neb.y < 0 || neb.y > 1) neb.vy *= -1;

        const gx = neb.x * width;
        const gy = neb.y * height;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, width * neb.size);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, width, height);
      });
      ctx.globalCompositeOperation = 'source-over';

      // 3. Draw Stars
      ctx.fillStyle = '#fff';
      stars.forEach(star => {
        const flicker = Math.sin(frame * star.speed) * 0.3 + 0.7;
        ctx.globalAlpha = star.opacity * flicker;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 4. Draw Resonance lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400) {
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
          }
        }
      }
      ctx.stroke();

      // 5. Draw Users (Planets/Systems)
      nodes.forEach((node: any) => {
        ctx.save();
        ctx.translate(node.x, node.y);

        // Community Rings (Halo effect)
        if (node.communityCount > 0) {
          for (let c = 0; c < node.communityCount; c++) {
            ctx.beginPath();
            ctx.strokeStyle = node.color.glow;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([5, 15]);
            ctx.arc(0, 0, node.radius + 50 + (c * 20), frame * 0.01, frame * 0.01 + Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Rotating Atmosphere
        node.angle += node.rotationSpeed;

        // Atmosphere Glow
        const atmosphere = ctx.createRadialGradient(0, 0, node.radius * 0.5, 0, 0, node.radius * 4);
        atmosphere.addColorStop(0, node.color.glow);
        atmosphere.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = atmosphere;
        ctx.beginPath();
        ctx.arc(0, 0, node.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Orbiteers (Moons/Planets)
        node.orbiters.forEach((orb: any) => {
          orb.angle += orb.speed;
          const ox = Math.cos(orb.angle) * orb.dist;
          const oy = Math.sin(orb.angle) * orb.dist;

          ctx.fillStyle = orb.isPlanet ? '#fff' : node.color.core;
          ctx.globalAlpha = orb.isPlanet ? 0.8 : 0.4;
          ctx.beginPath();
          ctx.arc(ox, oy, orb.isPlanet ? orb.size * 1.5 : orb.size, 0, Math.PI * 2);
          ctx.fill();

          // Small trail
          ctx.beginPath();
          ctx.strokeStyle = node.color.trail;
          ctx.lineWidth = 0.5;
          ctx.arc(0, 0, orb.dist, orb.angle - 0.8, orb.angle);
          ctx.stroke();

          if (orb.isPlanet) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = node.color.core;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });

        // Core
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 30;
        ctx.shadowColor = node.color.core;
        ctx.fill();

        // Inner Glow
        const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, node.radius);
        innerGlow.addColorStop(0, '#fff');
        innerGlow.addColorStop(0.4, node.color.core);
        innerGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = innerGlow;
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `700 ${Math.max(10, 8 + node.totalResonance)}px Inter`;
        ctx.letterSpacing = '3px';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(node.name.toUpperCase(), 0, node.radius + 40 + (node.totalResonance * 2));

        // Activity Ring (Pulsing)
        if (node.lastPulseAt) {
          const pulseScale = 1 + Math.sin(frame * 0.05) * 0.1;
          ctx.beginPath();
          ctx.strokeStyle = node.color.core;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 8]);
          ctx.arc(0, 0, (node.radius + 12) * pulseScale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(1).restart();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const clickedNode = nodes.find((n: any) => {
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 20;
      });

      if (clickedNode) {
        onSelectUser(clickedNode as any);
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animId);
      simulation.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [users, pulses, onSelectUser, stars, nebulae]);

  return (
    <div className="fixed inset-0 z-0 bg-[#020408]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Overlay noise for texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};

export default Nebula;
