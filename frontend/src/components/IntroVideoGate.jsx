import { useEffect, useState, useRef } from "react";

const introMessages = [
  { start: 0.4, end: 1.8, main: "INITIALIZING" },
  { start: 2.0, end: 3.4, main: "CAMPUS DATA STREAMS" },
  { start: 3.6, end: 5.0, main: "ACADEMIC HEALTH SIGNALS" },
  { start: 5.2, end: 6.6, main: "ACCREDITATION INTELLIGENCE" },
  { start: 6.8, end: 8.0, main: "RISK ENGINE ONLINE" },
  { start: 8.1, end: Infinity, main: "IQAC COMMAND CENTER READY" }
];

export default function IntroVideoGate({ children }) {
  const [hasPlayed, setHasPlayed] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  
  const [displayMessage, setDisplayMessage] = useState(null);
  const [animClass, setAnimClass] = useState("opacity-0 scale-[0.96] translate-y-2 blur-md");
  
  const videoRef = useRef(null);
  const targetMessageRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const animTimeoutRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const played = sessionStorage.getItem("iqacIntroPlayed") === "true";

    if (played || prefersReducedMotion) {
      setHasPlayed(true);
      setIsMounted(false);
    } else {
      setHasPlayed(false);
      setIsMounted(true);
    }
  }, []);

  // Keyboard shortcut Shift + R to replay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && (e.key === "R" || e.key === "r")) {
        sessionStorage.removeItem("iqacIntroPlayed");
        window.location.reload();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, []);

  const handleSkip = () => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    setIsFadingOut(true);
    sessionStorage.setItem("iqacIntroPlayed", "true");
    setTimeout(() => {
      setHasPlayed(true);
      setIsMounted(false);
    }, 600); // 600ms fade-out duration
  };

  const handleEnded = () => {
    handleSkip();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const progress = (video.currentTime / video.duration) * 100;
      setProgressWidth(progress || 0);

      const time = video.currentTime;
      const duration = video.duration;
      
      let msg = null;
      // Keep last message active during the final 1.5 seconds before ending
      if (duration && time >= duration - 1.5) {
        msg = introMessages[introMessages.length - 1];
      } else {
        for (const item of introMessages) {
          if (time >= item.start && time <= item.end) {
            msg = item;
            break;
          }
        }
      }

      // Check if target message has changed compared to our tracked ref
      if (msg?.main !== targetMessageRef.current?.main) {
        targetMessageRef.current = msg; // Update ref immediately to prevent re-entry

        if (!displayMessage && msg) {
          // Transition from nothing to first message immediately
          setDisplayMessage(msg);
          setAnimClass("opacity-0 scale-[0.96] translate-y-2 blur-md");
          
          if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
          animTimeoutRef.current = setTimeout(() => {
            setAnimClass("opacity-100 scale-100 translate-y-0 blur-0");
          }, 30);
        } else {
          // Fade out current message first (scale-up, fade out, translation)
          setAnimClass("opacity-0 scale-[1.04] -translate-y-4 blur-md");
          
          if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
          fadeTimeoutRef.current = setTimeout(() => {
            setDisplayMessage(msg);
            if (msg) {
              setAnimClass("opacity-0 scale-[0.96] translate-y-2 blur-md");
              if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
              animTimeoutRef.current = setTimeout(() => {
                setAnimClass("opacity-100 scale-100 translate-y-0 blur-0");
              }, 30);
            } else {
              setAnimClass("opacity-0 scale-[0.96] translate-y-2 blur-md");
            }
          }, 300); // 300ms fade-out transition duration
        }
      }
    }
  };

  const handleError = () => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    setDisplayMessage({ main: "LOADING COMMAND CENTER" });
    setAnimClass("opacity-100 scale-100 translate-y-0 blur-0");
    setTimeout(() => {
      handleSkip();
    }, 2000);
  };

  if (hasPlayed && !isMounted) {
    return <>{children}</>;
  }

  return (
    <>
      {isMounted && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col justify-between bg-[#040814] transition-opacity ease-in-out ${
            isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ transitionDuration: "600ms" }}
        >
          {/* Background Video */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleEnded}
              onTimeUpdate={handleTimeUpdate}
              onError={handleError}
              className="absolute min-w-full min-h-full object-cover opacity-85"
            >
              <source src="/videos/AI_Command_Center_Campus_Video_202606192244.mp4" type="video/mp4" />
            </video>
            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-transparent to-[#040814]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(4,8,20,0.95)_100%)]" />
          </div>

          {/* Top Header Controls (Micro Status Row & Skip Button) */}
          <div className="relative z-10 flex w-full items-center justify-between p-6">
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500/80 select-none">
              <span>IQAC AI CORE</span>
              <span className="text-white/10">•</span>
              <span>LIVE BOOT SEQUENCE</span>
              <span className="text-white/10">•</span>
              <span className="text-cyan-500/60">SECURE LAYER</span>
            </div>
            
            <button
              onClick={handleSkip}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-400 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              aria-label="Skip intro video"
            >
              Skip Intro
            </button>
          </div>

          {/* Large Centered Cinematic Text Overlay */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-6">
            {/* Soft Focus lighting radial gradient behind text */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,8,20,0.65)_0%,transparent_60%)] pointer-events-none" />

            {displayMessage && (
              <div
                className={`transition-all duration-[300ms] ease-out transform text-center select-none ${animClass}`}
              >
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.14em] md:tracking-[0.18em] leading-tight bg-gradient-to-b from-white via-slate-100 to-cyan-100 bg-clip-text text-transparent px-4"
                  style={{
                    textShadow: "0 0 20px rgba(6, 182, 212, 0.35), 0 0 45px rgba(168, 85, 247, 0.2)"
                  }}
                >
                  {displayMessage.main}
                </h1>
              </div>
            )}
          </div>

          {/* Bottom space padding to balance the layout */}
          <div className="relative z-10 w-full p-4 text-center select-none" />

          {/* Subtle Thin Progress Bar (2px, cyan-to-purple gradient with soft glow) */}
          <div className="relative z-10 h-[2px] w-full bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-100 ease-out"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Background layer for children to fade in behind */}
      <div className={`transition-opacity duration-700 ${isMounted && !isFadingOut ? "opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </>
  );
}
