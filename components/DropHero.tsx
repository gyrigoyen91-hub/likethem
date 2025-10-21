"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNowStrict, intervalToDuration } from 'date-fns';

interface DropHeroProps {
  drop: {
    id: string;
    title: string;
    description?: string | null;
    startsAt: string;
    endsAt: string;
    heroImage?: string | null;
  };
}

export default function DropHero({ drop }: DropHeroProps) {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const starts = new Date(drop.startsAt);
      const ends = new Date(drop.endsAt);

      if (now < starts) {
        setIsDropActive(false);
        setTimeLeft(intervalToDuration({ start: now, end: starts }));
      } else if (now >= starts && now <= ends) {
        setIsDropActive(true);
        setTimeLeft(intervalToDuration({ start: now, end: ends }));
      } else {
        setIsDropActive(false);
        setTimeLeft(null); // Drop has ended
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer);
  }, [drop.startsAt, drop.endsAt]);

  const formatDuration = (duration: Duration | null) => {
    if (!duration) return null;
    const parts = [];
    if (duration.days && duration.days > 0) parts.push(`${duration.days}d`);
    if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`);
    if (duration.seconds && duration.seconds > 0) parts.push(`${duration.seconds}s`);
    return parts.join(' ');
  };

  const timeDisplay = formatDuration(timeLeft);

  return (
    <div className="relative w-full h-64 md:h-96 bg-gray-100 overflow-hidden rounded-lg mb-8">
      {drop.heroImage && (
        <Image
          src={drop.heroImage}
          alt={drop.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
        <h2 className="font-serif text-4xl text-white mb-2">{drop.title}</h2>
        {drop.description && <p className="text-white/80 text-lg mb-4 max-w-2xl">{drop.description}</p>}
        {timeDisplay && (
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            {isDropActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Ends in {timeDisplay}
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                Starts in {timeDisplay}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}