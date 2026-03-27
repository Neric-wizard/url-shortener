"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link, Copy, Check, ArrowRight, Sparkles } from "lucide-react";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

export default function CreateLink() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");

    const shortCode = generateShortCode();

    const { error: dbError } = await supabase
      .from("links")
      .insert([{ short_code: shortCode, long_url: url }]);

    if (dbError) {
      setError(dbError.message);
    } else {
      setShortUrl(`${window.location.origin}/${shortCode}`);
      setUrl("");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
          <Sparkles size={14} />
          Free & Open Source
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Shorten Your Links
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Create short, memorable links that are easy to share and track.
        </p>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Paste your long URL
            </label>
            <div className="relative">
              <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/your-very-long-link"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white placeholder-gray-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? "Creating..." : (
              <>
                Shorten URL
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </>
            )}
          </button>
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>
      </div>

      {shortUrl && (
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <p className="text-sm text-purple-300 mb-2">Your shortened URL:</p>
          <div className="flex items-center gap-3">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 font-mono text-sm break-all flex-1 hover:underline"
            >
              {shortUrl}
            </a>
            <button
              onClick={copyToClipboard}
              className="p-2 bg-gray-800 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-purple-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}