import { useEffect, useState } from "react";

export default function CinematicBackground() {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Respect user prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setUseFallback(true);
    }
  }, []);

  if (useFallback) {
    return (
      <div className="fixed inset-0 z-0 bg-[#040814] overflow-hidden">
        {/* Animated fallback gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.08),transparent_50%)] opacity-70 animate-pulse duration-[8000ms]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute min-w-full min-h-full object-cover opacity-20 transition-opacity duration-1000"
        poster="/videos/iqac-command-poster.jpg"
        onError={() => setUseFallback(true)}
      >
        <source src="/videos/iqac-command-bg.webm" type="video/webm" />
        <source src="/videos/iqac-command-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay with navy, black and subtle purple/cyan gradients for readable text */}
      <div className="absolute inset-0 bg-[#040814]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent_40%)]" />
    </div>
  );
}
