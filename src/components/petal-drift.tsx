'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function Petal() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute text-primary/70">
        <path d="M7 20C1.00001 15.1111 -0.4 8.6 1.19999 4.6C2.79999 0.6 7 0 7 0C7 0 11.2 0.6 12.8 4.6C14.4 8.6 13 15.1111 7 20Z" fill="currentColor"/>
        <path d="M7 20C7.8 17.2 8.5 12.4 7.8 9.2C7.1 6 7 0 7 0" stroke="hsl(var(--primary-foreground) / 0.3)" strokeWidth="0.5"/>
    </svg>
  );
}

type PetalStyle = {
  left: string;
  animationDelay: string;
  animationDuration: string;
  '--sway': number;
};


export function PetalDrift({
  className,
  quantity = 30,
}: {
  className?: string;
  quantity?: number;
}) {
  const [petals, setPetals] = useState<PetalStyle[]>([]);

  useEffect(() => {
    const generatedPetals = Array.from({ length: quantity }, () => ({
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
      '--sway': (Math.random() - 0.5) * 3,
    }));
    setPetals(generatedPetals);
  }, [quantity]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden',
        className
      )}
    >
      {petals.map((style, i) => (
        <div
          key={i}
          className="absolute top-0 animate-petal-drift"
          style={style as React.CSSProperties}
        >
          <Petal />
        </div>
      ))}
    </div>
  );
}
