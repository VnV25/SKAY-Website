import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { api } from "../api/api";

export function CustomerAuth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getCustomerName = (user: any, fallback?: string) =>
    user?.name || user?.full_name || fallback || user?.email || "Customer";

  const isStrongPassword = (password: string) =>
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.auth.login({ email: loginData.email, password: loginData.password });
      if (!data?.token) throw new Error(data?.message || "Login failed");
      const user = { id: data.user.id, email: data.user.email, name: getCustomerName(data.user) };
      localStorage.setItem("skay-token", data.token);
      localStorage.setItem("skay-user", JSON.stringify(user));
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!isStrongPassword(signupData.password)) {
      setError("Password must be strong (8+ chars, uppercase, lowercase, number, symbol)");
      setLoading(false);
      return;
    }
    try {
      const data = await api.auth.register({ name: signupData.name, email: signupData.email, password: signupData.password });
      if (!data?.token) throw new Error(data?.message || "Signup failed");
      const user = { id: data.user.id, email: data.user.email, name: getCustomerName(data.user, signupData.name) };
      localStorage.setItem("skay-token", data.token);
      localStorage.setItem("skay-user", JSON.stringify(user));
      setSubmitted(true);
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200";

  return (
    <div className="min-h-screen">
      <Header />

      <section className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-7 sm:p-9">

            {/* Title */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                SKAY Account
              </h1>
              <p className="text-white/50 text-sm mt-1">Login or create your account</p>
            </div>

            {/* Success */}
            {submitted && (
              <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm text-green-400">
                Account created successfully. Redirecting...
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Tab Toggle */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 border border-white/10 p-1">
              {(["login", "signup"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setError(""); }}
                  className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Login Form */}
            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-pink-500/25"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-pink-500/25"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/30">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 rounded-xl border border-white/20 bg-white/5 text-white/70 font-medium hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
