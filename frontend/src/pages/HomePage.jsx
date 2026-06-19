import { useEffect, useMemo, useState } from "react";
import { useNavigate as useNav, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import BackgroundVideo from "../components/BackgroundVideo.jsx";

const roleLabel = {
  admin: "Admin",
  hod: "Department",
  department: "Department",
  student: "Student",
  faculty: "Faculty"
};

const dashboardLinks = [
  { to: "/admin", label: "Admin Dashboard", allowed: ["admin"] },
  { to: "/hod", label: "Department Dashboard", allowed: ["hod"] },
  { to: "/faculty", label: "Faculty Panel", allowed: ["faculty", "hod"] },
  { to: "/student", label: "Student Dashboard", allowed: ["student"] }
];

const rotatingPhrases = [
  "Monitoring Students",
  "Monitoring Faculty",
  "Monitoring Departments",
  "Monitoring Accreditation",
  "Monitoring Reports",
  "Monitoring Risk Signals"
];

const Icons = {
  Risk: () => (
    <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Faculty: () => (
    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Department: () => (
    <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
};

function MiniLivePulsePanel() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_0_40px_rgba(6,182,212,0.12)] backdrop-blur-xl hover:border-white/15 transition duration-500 max-w-sm w-full mx-auto lg:mr-0">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Institutional Pulse</span>
          <h4 className="text-xs font-semibold text-white">IQAC Live Metrics</h4>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular Progress Ring */}
        <div className="relative h-20 w-20 flex items-center justify-center flex-shrink-0">
          <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#cyanGlowPulseHome)" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.78)}`} strokeLinecap="round" />
            <defs>
              <linearGradient id="cyanGlowPulseHome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <span className="text-lg font-bold text-white">78%</span>
            <span className="text-[8px] block text-slate-400 tracking-wide uppercase">NAAC</span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Academic Health:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Stable
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">At-Risk Learners:</span>
            <span className="font-semibold text-rose-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 42
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Evidence Pending:</span>
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 18
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Next Audit Window:</span>
            <span className="font-semibold text-cyan-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> 12 Days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RippleButton({ children, to, onClick, className }) {
  const [ripples, setRipples] = useState([]);
  const navigate = useNav();

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x, y, size }]);

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);

    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="homepage-ripple"
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
    </button>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNav();
  const normalizedRole = String(user?.role || "").toLowerCase() === "department" ? "hod" : String(user?.role || "").toLowerCase();
  const visibleLinks = dashboardLinks.filter((link) => link.allowed.includes(normalizedRole));
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const primaryLink = visibleLinks[0]?.to || "/home";
  const analyticsLink = visibleLinks.find((x) => x.to !== primaryLink)?.to || primaryLink;

  const navLinks = useMemo(
    () => [
      { label: "Home", to: "/home" },
      { label: "Admin Dashboard", to: "/admin", hidden: normalizedRole !== "admin" },
      { label: "Faculty Panel", to: "/faculty", hidden: !(normalizedRole === "faculty" || normalizedRole === "hod") }
    ].filter((x) => !x.hidden),
    [normalizedRole]
  );

  const onHeroMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;
    setHeroTilt({ x: (offsetY - 0.5) * -8, y: (offsetX - 0.5) * 8 });
  };

  const onHeroLeave = () => setHeroTilt({ x: 0, y: 0 });

  const onLogout = () => {
    logout();
    navigate("/auth");
  };

  // Welcome banner calculations
  const welcomeText = normalizedRole === "admin" ? "Welcome back, IQAC Coordinator" : `Welcome back, ${user?.name || "Member"}`;
  const subWelcomeText = normalizedRole === "admin" 
    ? "Your institution has 78% accreditation readiness, 42 high-risk learners, and 18 pending evidence items today."
    : "AI monitoring is actively tracking institutional academic performance and accreditation readiness signals.";
  const modeBadge = `${roleLabel[normalizedRole] || normalizedRole} Mode`;

  const roleStatus = {
    admin: "Institution-wide command access enabled.",
    hod: "Department intelligence workspace ready.",
    faculty: "Academic contribution and mentoring workspace ready.",
    student: "Personal academic health dashboard ready."
  };
  const statusLine = roleStatus[normalizedRole] || "Academic monitoring and intelligence active.";

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <BackgroundVideo />

      <main className="relative z-10 mx-auto max-w-[1200px] px-4 pb-16 pt-4 sm:px-6">
        {/* Navigation Bar */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/10 hover:border-purple-500/20 bg-slate-950/50 px-5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md relative z-20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 font-black text-white text-sm shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              IQ
            </div>
            <div>
              <p className="text-sm font-black tracking-wider text-white">IQAC Command Center</p>
              <p className="text-[9px] text-slate-400">AI-Powered Academic Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {navLinks.map((item) => (
              <RouterLink
                key={item.to}
                to={item.to}
                className="rounded-xl border border-transparent px-3 py-1.5 text-xs text-blue-100/80 transition-all duration-300 hover:border-blue-300/30 hover:bg-blue-400/10 hover:text-white"
              >
                {item.label}
              </RouterLink>
            ))}
            <button
              onClick={onLogout}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-1.5 text-xs font-semibold text-[#04111f] shadow-[0_0_15px_rgba(34,211,238,0.4)] transition hover:scale-[1.02]"
            >
              Logout
            </button>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center min-h-[58vh]">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-400">
              FUTURE READY UNIVERSITY INTELLIGENCE
            </span>
            <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              Welcome to the <span className="bg-gradient-to-r from-cyan-400 via-blue-100 to-purple-400 bg-clip-text text-transparent">IQAC Command Center</span>
            </h1>

            <div className="min-h-8 text-cyan-300 text-sm sm:text-base flex items-center gap-2 font-semibold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>{statusLine}</span>
            </div>

            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Monitor academic health, accreditation readiness, student risk, faculty contribution, and department intelligence from one secure academic portal.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <RippleButton
                to={primaryLink}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-2.5 text-xs font-bold text-[#04111f] shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
              >
                Open Portal
              </RippleButton>
              <a href="#timeline" className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10">
                View Academic Intelligence
              </a>
            </div>
          </motion.div>

          <motion.div
            onMouseMove={onHeroMove}
            onMouseLeave={onHeroLeave}
            animate={{ rotateX: heroTilt.x, rotateY: heroTilt.y }}
            transition={{ rotateX: { duration: 0.2 }, rotateY: { duration: 0.2 } }}
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            <MiniLivePulsePanel />
          </motion.div>
        </section>

        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mt-8 rounded-2xl border border-cyan-500/10 hover:border-purple-500/20 bg-slate-950/50 p-5 backdrop-blur-md shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Welcome Panel</p>
                <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[8px] font-bold uppercase text-cyan-300">
                  {modeBadge}
                </span>
              </div>
              <h3 className="mt-1.5 text-lg font-bold text-white">{welcomeText}</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-3xl font-medium">{subWelcomeText}</p>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-blue-100/80 font-bold uppercase tracking-wider">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1">Model Sync</span>
              <span className="rounded-full border border-violet-300/20 bg-violet-300/5 px-2.5 py-1">Risk Engine</span>
              <span className="rounded-full border border-blue-300/20 bg-blue-300/5 px-2.5 py-1">Compliance AI</span>
            </div>
          </div>
        </motion.section>

        {/* Section 1: Academic Health Pulse */}
        <section className="mt-8 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Academic Health Pulse</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Student Risk Analysis",
                value: "42",
                desc: "Track attendance, CGPA, backlogs, and intervention signals.",
                color: "border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.06)] hover:border-rose-500/35",
                valColor: "text-rose-400",
                icon: Icons.Risk
              },
              {
                title: "Faculty Contribution",
                value: "126",
                desc: "Monitor research, FDP, mentoring, and academic contribution.",
                color: "border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.06)] hover:border-cyan-500/35",
                valColor: "text-cyan-400",
                icon: Icons.Faculty
              },
              {
                title: "Department Intelligence",
                value: "7",
                desc: "Compare department KPIs, pass percentage, placement, and quality signals.",
                color: "border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.06)] hover:border-purple-500/35",
                valColor: "text-purple-400",
                icon: Icons.Department
              },
              {
                title: "Accreditation Monitoring",
                value: "78%",
                desc: "Review NAAC/NBA evidence, missing items, and readiness status.",
                color: "border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.06)] hover:border-emerald-500/35",
                valColor: "text-emerald-400",
                icon: Icons.Department
              }
            ].map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl border bg-slate-950/40 p-5 backdrop-blur-md transition duration-300 hover:scale-[1.01] ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{card.title}</span>
                  <card.icon />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${card.valColor}`}>{card.value}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Accreditation Readiness Timeline */}
        <section id="timeline" className="mt-8 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Accreditation Readiness Timeline</h3>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg relative overflow-hidden">
            {/* Horizontal line for desktop */}
            <div className="absolute top-12 left-8 right-8 hidden md:block h-0.5 bg-white/10" />

            <div className="grid gap-6 md:grid-cols-5 relative z-10">
              {[
                { name: "Evidence Collection", desc: "Syllabi, logs, and course outcomes collected.", status: "completed", color: "text-emerald-400", border: "border-emerald-500" },
                { name: "Department Verification", desc: "Data verified by HODs and departmental leads.", status: "completed", color: "text-emerald-400", border: "border-emerald-500" },
                { name: "NAAC/NBA Mapping", desc: "Criteria mapping and gap analysis by IQAC cell.", status: "current", color: "text-cyan-400", border: "border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" },
                { name: "IQAC Review", desc: "Final verification and approval by IQAC committee.", status: "pending", color: "text-amber-400", border: "border-amber-500" },
                { name: "Report Export", desc: "Generating formatted PDF & Excel audit files.", status: "pending", color: "text-slate-500", border: "border-slate-600" }
              ].map((step, idx) => (
                <div key={step.name} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-3 md:flex-col md:items-start">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-black text-xs bg-slate-950 border-2 ${step.border} mb-2`}>
                      {idx + 1}
                    </div>
                    <h4 className={`text-xs font-bold ${step.color}`}>{step.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 md:mt-2 px-2 md:px-0 leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Compliance AI Recommendations */}
        <section className="mt-8 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Compliance AI Recommendations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { text: "CSE needs 6 pending NBA evidence files before Friday.", severity: "Critical", color: "border-red-500/20 text-red-400 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.04)]" },
              { text: "42 students require mentor intervention due to low attendance.", severity: "Action", color: "border-amber-500/20 text-amber-400 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.04)]" },
              { text: "ECE placement trend dropped by 8% compared to last cycle.", severity: "Insight", color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.04)]" },
              { text: "Faculty publication contribution improved by 14% this semester.", severity: "Positive", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.04)]" }
            ].map((rec) => (
              <div key={rec.text} className={`rounded-2xl border p-4.5 backdrop-blur-xl flex flex-col justify-between hover:scale-[1.01] transition duration-300 ${rec.color}`}>
                <div className="mb-3">
                  <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {rec.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{rec.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Role-Based Command Centers */}
        <section className="mt-8 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Role-Based Command Centers</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { role: "Admin", desc: "Institutional analytics, multi-department reports, global settings, and NBA/NAAC accreditation dashboard control." },
              { role: "HOD", desc: "Department-scoped KPIs, section drift tracking, faculty load mapping, and student risk oversight." },
              { role: "Faculty", desc: "Student attendance and marks entry, personal research publications upload, and direct mentor-mentee actions." },
              { role: "Student", desc: "CGPA trend monitoring, subject-wise attendance logs, risk alert notifications, and extra-curricular achievements upload." }
            ].map((rc) => (
              <div key={rc.role} className="rounded-2xl border border-white/10 bg-slate-900/35 p-5 backdrop-blur-xl hover:border-white/15 transition duration-300">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 block mb-2">{rc.role} Workspace</span>
                <h4 className="text-sm font-bold text-white mb-2">{rc.role} Command</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{rc.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style>{`
        .homepage-ripple {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.25);
          transform: scale(0);
          animation: homepage-ripple 650ms ease-out;
          pointer-events: none;
        }

        @keyframes homepage-ripple {
          to {
            transform: scale(2.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
