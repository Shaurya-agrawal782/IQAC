import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import client from "../api/client";

const demoUsers = [
  { role: "Admin", email: "admin@iqac.edu", password: "Admin@123" },
  { role: "HOD", email: "hod.cse@iqac.edu", password: "Admin@123" },
  { role: "Faculty", email: "faculty.cse@iqac.edu", password: "Admin@123" },
  { role: "Student", email: "ravi@student.iqac.edu", password: "Admin@123" }
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  
  const [loginForm, setLoginForm] = useState({
    email: "admin@iqac.edu",
    password: "Admin@123"
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    registrationNumber: "",
    email: "",
    password: "",
    role: "student"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState("Admin");

  const onLoginChange = (e) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSelectedDemo(null);
  };

  const onSignupChange = (e) => {
    setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDemoClick = (demo) => {
    setLoginForm((prev) => ({
      ...prev,
      email: demo.email,
      password: demo.password
    }));
    setSelectedDemo(demo.role);
  };

  const handleTabChange = (targetMode) => {
    setMode(targetMode);
    setError("");
    setSuccess("");
    if (targetMode === "signup") {
      setSignupForm((prev) => {
        const isEmailDemo = demoUsers.some((d) => d.email === prev.email);
        const isPasswordDemo = demoUsers.some((d) => d.password === prev.password);
        return {
          ...prev,
          email: isEmailDemo ? "" : prev.email,
          password: isPasswordDemo ? "" : prev.password,
          role: "student"
        };
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await client.post("/auth/public-signup", {
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          role: "student",
          registrationNumber: signupForm.registrationNumber
        });
        setSuccess("Signup successful. Please login with your new account.");
        setSignupForm({
          name: "",
          registrationNumber: "",
          email: "",
          password: "",
          role: "student"
        });
        setMode("login");
      } else {
        await login(loginForm.email, loginForm.password);
        navigate("/home");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid credentials. Check email/ID and password, then try again.");
      } else {
        setError(err.response?.data?.message || "Login/Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern grid place-items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-white/50 bg-white/75 p-6 shadow-lg backdrop-blur"
      >
        <div className="mb-4 inline-flex rounded-xl border border-brand-ink/15 bg-white p-1">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`rounded-lg px-4 py-2 text-sm ${mode === "login" ? "bg-brand-ink text-white" : "text-brand-ink"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("signup")}
            className={`rounded-lg px-4 py-2 text-sm ${mode === "signup" ? "bg-brand-ink text-white" : "text-brand-ink"}`}
          >
            Signup
          </button>
        </div>

        <h2 className="font-heading text-3xl text-brand-ink">
          {mode === "login" ? "Welcome Back" : "Student Signup"}
        </h2>
        <p className="mt-1 text-sm text-brand-ink/70">
          {mode === "login"
            ? "Login to IQAC Monitoring Platform"
            : "Create your student account to access academic performance, attendance, risk insights, and achievements."}
        </p>

        <div className="mt-6 space-y-4">
          {mode === "signup" && (
            <input
              name="name"
              value={signupForm.name}
              onChange={onSignupChange}
              placeholder="Full Name"
              className="w-full rounded-xl border border-brand-ink/20 bg-white px-4 py-3 outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-mint/40 transition-all"
            />
          )}

          {mode === "signup" && (
            <input
              name="registrationNumber"
              value={signupForm.registrationNumber}
              onChange={onSignupChange}
              placeholder="Student Registration Number"
              className="w-full rounded-xl border border-brand-ink/20 bg-white px-4 py-3 outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-mint/40 transition-all"
            />
          )}

          {mode === "signup" && (
            <div className="space-y-2">
              <div className="w-full rounded-xl border border-brand-ink/10 bg-brand-sand/50 px-4 py-3 text-sm text-brand-ink/80 font-medium">
                Role: <span className="font-semibold text-brand-ink">Student</span>
              </div>
              <p className="text-[11px] text-brand-ink/60 px-1 leading-relaxed">
                Only student accounts can be created from public signup. Faculty and HOD accounts are issued by authorized IQAC administrators.
              </p>
            </div>
          )}

          <input
            name="email"
            value={mode === "login" ? loginForm.email : signupForm.email}
            onChange={mode === "login" ? onLoginChange : onSignupChange}
            placeholder={mode === "login" ? "Email / Registration Number / Faculty ID" : "Email Address"}
            className="w-full rounded-xl border border-brand-ink/20 bg-white px-4 py-3 outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-mint/40 transition-all"
          />
          <input
            name="password"
            type="password"
            value={mode === "login" ? loginForm.password : signupForm.password}
            onChange={mode === "login" ? onLoginChange : onSignupChange}
            placeholder="Password"
            className="w-full rounded-xl border border-brand-ink/20 bg-white px-4 py-3 outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-mint/40 transition-all"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-700">{success}</p>}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-brand-ink px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
        </button>

        {mode === "login" && (
          <div className="mt-6 border-t border-brand-ink/10 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-ink/60 mb-2">
              Quick Demo Access
            </h3>
            <div className="flex flex-wrap gap-2">
              {demoUsers.map((demo) => {
                const isActive = selectedDemo === demo.role;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoClick(demo)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border backdrop-blur-sm cursor-pointer shadow-sm hover:-translate-y-0.5 active:translate-y-0 ${
                      isActive
                        ? "bg-brand-ink text-brand-mint border-brand-mint/40 shadow-[0_0_10px_rgba(102,209,193,0.25)] scale-105"
                        : "bg-white/40 hover:bg-white/80 text-brand-ink/80 border-brand-ink/10 hover:border-brand-ink/30 hover:shadow-[0_0_8px_rgba(102,209,193,0.15)]"
                    }`}
                    aria-label={`Fill ${demo.role} demo credentials`}
                  >
                    {demo.role}
                  </button>
                );
              })}
            </div>
            {selectedDemo && (
              <p className="mt-2 text-[10px] text-brand-ink/50 transition-all duration-300">
                {selectedDemo} demo credentials filled.
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
