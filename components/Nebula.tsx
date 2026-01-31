
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
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const stars = useMemo(() => {
    return Array.from({ length: 800 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 3 + 0.5,
      size: Math.random() * 1.5 + 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.04 + 0.01
    }));
  }, []);

  const nebulae = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 0.6 + 0.3,
      color: COLORS[i % COLORS.length].glow,
      vx: (Math.random() - 0.5) * 0.00008,
      vy: (Math.random() - 0.5) * 0.00008
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

    const nodes = users.map((u, i) => {
      const resonanceLevel = (u as any).totalResonance || 0;
      const userColor = u.color || COLORS[i % COLORS.length].core;
      const colorSet = {
        core: userColor,
        glow: u.color ? `${u.color}33` : COLORS[i % COLORS.length].glow.replace('0.4', '0.15'),
        trail: u.color ? `${u.color}11` : COLORS[i % COLORS.length].trail
      };

      return {
        ...u,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: (u.lastPulseAt ? 32 : 18) * (1 + resonanceLevel * 0.15),
        totalResonance: resonanceLevel,
        color: colorSet,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        orbiters: Array.from({ length: 3 + Math.min(resonanceLevel, 15) }).map((_, oi) => ({
          dist: 50 + (oi * 20) * (1 + resonanceLevel * 0.1),
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() - 0.5) * (0.07 / (oi + 1)),
          size: Math.random() * 5 + 1,
          isPlanet: oi % 3 === 0
        }))
      };
    });

    // Custom Resonance Attraction Force
    const resonanceForce = (alpha: number) => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i] as any;
          const nodeB = nodes[j] as any;

          // Calculate similarity based on totalResonance or color (simplified)
          const similarity = 1 - Math.abs(nodeA.totalResonance - nodeB.totalResonance) / 20;
          if (similarity > 0.8) {
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 600) {
              const strength = (similarity * 0.0001) * alpha;
              nodeA.vx += dx * strength;
              nodeA.vy += dy * strength;
              nodeB.vx -= dx * strength;
              nodeB.vy -= dy * strength;
            }
          }
        }
      }
    };

    const simulation = d3.forceSimulation(nodes as any)
      .force('charge', d3.forceManyBody().strength((d: any) => -1000 * (1 + d.totalResonance * 0.3)))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => (d.radius + (d.orbiters.length * 25)) + 50))
      .force('resonance', resonanceForce)
      .alphaDecay(0.01);

    let frame = 0;
    const render = () => {
      frame++;
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      const mx = (mouseRef.current.x - width / 2) * 0.02;
      const my = (mouseRef.current.y - height / 2) * 0.02;

      // CRITICAL FIX: Reset composite operation to clear background correctly
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#010205';
      ctx.fillRect(0, 0, width, height);

      // 1. Nebulae
      ctx.globalCompositeOperation = 'screen';
      nebulae.forEach(neb => {
        neb.x += neb.vx; neb.y += neb.vy;
        const gx = (neb.x * width + mx * 0.5) % width;
        const gy = (neb.y * height + my * 0.5) % height;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, width * neb.size);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // 2. Parallax Stars
      ctx.globalCompositeOperation = 'source-over';
      stars.forEach(star => {
        const sx = (star.x * width + mx * star.z) % width;
        const sy = (star.y * height + my * star.z) % height;
        ctx.globalAlpha = star.opacity * (Math.sin(frame * star.speed) * 0.4 + 0.6);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        const rx = sx < 0 ? sx + width : sx;
        const ry = sy < 0 ? sy + height : sy;
        ctx.arc(rx, ry, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Resonance Filaments (Proximity Connections)
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i] as any;
          const b = nodes[j] as any;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400) {
            const opacity = (1 - dist / 400) * 0.2;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `${a.color.core}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            grad.addColorStop(1, `${b.color.core}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 4. User Systems
      nodes.forEach((node: any) => {
        ctx.save();
        ctx.translate(node.x, node.y);
        node.angle += node.rotationSpeed;

        // Atmosphere Glow
        const aura = ctx.createRadialGradient(0, 0, node.radius * 0.8, 0, 0, node.radius * 6);
        aura.addColorStop(0, node.color.glow);
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, node.radius * 6, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Entities
        node.orbiters.forEach((orb: any) => {
          orb.angle += orb.speed;
          const ox = Math.cos(orb.angle) * orb.dist;
          const oy = Math.sin(orb.angle) * orb.dist;
          ctx.fillStyle = orb.isPlanet ? '#fff' : node.color.core;
          ctx.globalAlpha = orb.isPlanet ? 0.9 : 0.3;
          ctx.beginPath();
          ctx.arc(ox, oy, orb.isPlanet ? orb.size * 2 : orb.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Core Image/Aura
        ctx.globalAlpha = 1.0;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        ctx.clip();
        if (node.portraitUrl) {
          const img = new Image();
          img.src = node.portraitUrl;
          if (img.complete) ctx.drawImage(img, -node.radius, -node.radius, node.radius * 2, node.radius * 2);
        }
        const innerGlow = ctx.createRadialGradient(0, 0, node.radius * 0.4, 0, 0, node.radius);
        innerGlow.addColorStop(0, 'rgba(0,0,0,0)');
        innerGlow.addColorStop(1, node.color.core);
        ctx.fillStyle = innerGlow;
        ctx.fill();
        ctx.restore();

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `900 ${Math.max(12, 11 + node.totalResonance * 1.5)}px Syncopate`;
        ctx.letterSpacing = '6px';
        ctx.textAlign = 'center';
        ctx.fillText(node.name.toUpperCase(), 0, node.radius + 70);

        // Activity Pulse
        if (node.lastPulseAt) {
          const p = (frame % 240) / 240;
          ctx.beginPath();
          ctx.strokeStyle = node.color.core;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1 - p;
          ctx.arc(0, 0, node.radius + (p * 150), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(1).restart();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      const mx = e.clientX; const my = e.clientY;
      const clickedNode = nodes.find((n: any) => {
        const dx = n.x - mx; const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 60;
      });
      if (clickedNode) onSelectUser(clickedNode as any);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animId);
      simulation.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [users, pulses]);

  return (
    <div className="fixed inset-0 z-0 bg-[#010205]">
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};

export default Nebula;
