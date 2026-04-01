"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function PasswordPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/verify/${shortCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (data.valid) {
      router.push(data.url);
    } else {
      setError("Incorrect password");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Protected Link</h1>
        <p className="text-gray-400 mb-6">This link is password protected</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white mb-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            {loading ? "Checking..." : "Access Link"}
            <ArrowRight size={18} />
          </button>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
}