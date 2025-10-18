'use client';

import { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function SpiritParticles({
  className,
  quantity = 30,
}: {
  className?: string;
  quantity?: number;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    const particleArray = [];
    for (let i = 0; i < quantity; i++) {
      particleArray.push({
        size: `${Math.random() * 5 + 2}px`,
        left: `${Math.random() * 100}%`,
        // Start from the bottom
        top: `${Math.random() * 25 + 90}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${Math.random() * 15 + 10}s`,
      });
    }
    return particleArray;
  }, [quantity]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden',
        className
      )}
    >
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-primary/50 animate-spirit-float shadow-[0_0_10px_2px] shadow-primary/50"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
          }}
        />
      ))}
    </div>
  );
}
