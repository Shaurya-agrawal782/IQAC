import { useEffect, useState } from "react";

export default function BackgroundVideo() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Respect user preferences for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setVideoError(true);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]">
      {/* Layer 1: Video Element or Static Fallback */}
      {videoError ? (
        <div className="absolute inset-0 z-0 bg-[#020617]">
          {/* Subtle static gradient fallback */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(6,182,212,0.06),transparent_50%),radial-gradient(circle_at_85%_70%,rgba(168,85,247,0.06),transparent_50%)] opacity-70" />
        </div>
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => {
            setVideoLoaded(true);
            console.log("Landing background video loaded");
          }}
          onError={(e) => {
            setVideoError(true);
            console.warn("Landing background video failed", e);
          }}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-[0.58]" : "opacity-0"
          }`}
          poster="/videos/iqac-command-poster.jpg"
          style={{ zIndex: 0 }}
        >
          <source src="/videos/AI_campus_background_video_202606192246.mp4" type="video/mp4" />
        </video>
      )}
      
      {/* Layer 2: Readability Overlay (z-index: 1) */}
      <div 
        className="absolute inset-0" 
        style={{
          zIndex: 1,
          background: "linear-gradient(90deg, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.68) 42%, rgba(15,23,42,0.45) 100%)"
        }}
      />
      
      {/* Layer 2: Subtle top/bottom vignette (z-index: 1) */}
      <div 
        className="absolute inset-0" 
        style={{
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(2,6,23,0.3) 0%, transparent 20%, transparent 80%, rgba(2,6,23,0.45) 100%)"
        }}
      />

      {/* Layer 2: Subtle radial glows on right side (z-index: 1) */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(6,182,212,0.05),transparent_45%),radial-gradient(circle_at_85%_70%,rgba(168,85,247,0.05),transparent_45%)]" 
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
