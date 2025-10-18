'use client';

import { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function Petal() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute text-primary/70">
        <path d="M7 20C1.00001 15.1111 -0.4 8.6 1.19999 4.6C2.79999 0.6 7 0 7 0C7 0 11.2 0.6 12.8 4.6C14.4 8.6 13 15.1111 7 20Z" fill="currentColor"/>
        <path d="M7 20C7.8 17.2 8.5 12.4 7.8 9.2C7.1 6 7 0 7 0" stroke="hsl(var(--primary-foreground) / 0.3)" strokeWidth="0.5"/>
    </svg>
  );
}

export function PetalDrift({
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

  const petals = useMemo(() => {
    const petalArray = [];
    for (let i = 0; i < quantity; i++) {
      const sway = (Math.random() - 0.5) * 2; // -1 to 1 for side-to-side motion
      petalArray.push({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${Math.random() * 10 + 10}s`, // 10s to 20s duration
        '--sway': sway,
      });
    }
    return petalArray;
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
      {petals.map((petal, index) => (
        <div
          key={index}
          className="absolute animate-petal-drift"
          style={{
            left: petal.left,
            animationDelay: petal.animationDelay,
            animationDuration: petal.animationDuration,
            ...petal as any, // For the --sway variable
          }}
        >
          <Petal />
        </div>
      ))}
    </div>
  );
}
