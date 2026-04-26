import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { api } from "../api/api";

export function CustomerAuth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getCustomerName = (user: any, fallback?: string) => {
    return user?.name || user?.full_name || fallback || user?.email || "Customer";
  };

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
      const data = await api.auth.login({
        email: loginData.email,
        password: loginData.password,
      });

      if (!data?.token) {
        throw new Error(data?.message || "Login failed");
      }

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: getCustomerName(data.user),
      };

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
      const data = await api.auth.register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      });

      if (!data?.token) {
        throw new Error(data?.message || "Signup failed");
      }

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: getCustomerName(data.user, signupData.name),
      };

      localStorage.setItem("skay-token", data.token);
      localStorage.setItem("skay-user", JSON.stringify(user));

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
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
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-center text-gray-900">SKAY Account</h1>
            <p className="text-sm text-gray-500 text-center mt-1 mb-6">Login or create your account</p>

            {submitted && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                Account created successfully. Redirecting...
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                }}
                className={`rounded-md py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "login" ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setError("");
                }}
                className={`rounded-md py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "signup" ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Signup
              </button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-md bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
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
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-md bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Signup"}
                </button>
              </form>
            )}

            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-60"
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
