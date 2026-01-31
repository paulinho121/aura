
import React, { useEffect, useState, useRef } from 'react';

const CustomCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [isPointer, setIsPointer] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;

            // Only update rotation if there's significant movement
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                setRotation(angle + 90); // Add 90 because the rocket points up by default
            }

            setPosition({ x: e.clientX, y: e.clientY });
            lastPos.current = { x: e.clientX, y: e.clientY };

            // Check if hovering over a clickable element
            const target = e.target as HTMLElement;
            const clickable = window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'BUTTON' ||
                target.closest('button');
            setIsPointer(!!clickable);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ overflow: 'hidden' }}
        >
            <div
                className="absolute transition-transform duration-75 ease-out"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${isPointer ? 1.5 : 1})`,
                }}
            >
                {/* Rocket Body */}
                <div className="relative w-6 h-8 flex flex-col items-center">
                    {/* Nose Cone */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-cyan-400" />

                    {/* Main Body */}
                    <div className="w-3 h-4 bg-white rounded-t-sm relative">
                        {/* Window */}
                        <div className="absolute top-1 left-1.5 -translate-x-1/2 w-1 h-1 bg-cyan-900 rounded-full border-[0.5px] border-cyan-400/50" />
                    </div>

                    {/* Fins */}
                    <div className="absolute bottom-1 -left-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-cyan-500/80 rotate-[30deg]" />
                    <div className="absolute bottom-1 -right-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-cyan-500/80 rotate-[-30deg]" />

                    {/* Exhaust/Engine */}
                    <div className="w-2 h-1 bg-gray-600 rounded-b-sm" />

                    {/* Fire/Engine Glow */}
                    <div className="absolute -bottom-4 w-1.5 h-4 bg-gradient-to-t from-orange-500/0 via-orange-400/80 to-yellow-300 rounded-full blur-[2px] animate-pulse origin-top" />

                    {/* Particle Trail (Subtle blur) */}
                    <div className="absolute -bottom-8 w-8 h-8 bg-cyan-400/10 rounded-full blur-2xl -z-10 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default CustomCursor;
