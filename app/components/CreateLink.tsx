"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Copy, Check, ArrowRight, Sparkles, Eye } from "lucide-react";

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
  const [clicks, setClicks] = useState<number | null>(null);
  const [shortCode, setShortCode] = useState("");

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const fetchClicks = async (code: string) => {
    const { data } = await supabase
      .from("links")
      .select("clicks")
      .eq("short_code", code)
      .single();
    if (data) setClicks(data.clicks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    setClicks(null);

    const code = generateShortCode();

    const { error: dbError } = await supabase
      .from("links")
      .insert([{ short_code: code, long_url: url }]);

    if (dbError) {
      setError(dbError.message);
    } else {
      const newShortUrl = `${window.location.origin}/${code}`;
      setShortUrl(newShortUrl);
      setShortCode(code);
      await fetchClicks(code);
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
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
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
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 shadow-xl"
      >
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
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
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
      </motion.div>

      {/* Result with Click Counter Animation */}
      <AnimatePresence>
        {shortUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6"
          >
            <p className="text-sm text-purple-300 mb-2 flex items-center gap-2">
              <Sparkles size={12} />
              Your shortened URL:
            </p>
            <div className="flex items-center gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 font-mono text-sm break-all flex-1 hover:underline group"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-gray-800 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition group"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-purple-400 group-hover:scale-110 transition" />
                )}
              </button>
            </div>
            
            {/* Live Click Counter */}
            {clicks !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mt-4 pt-4 border-t border-purple-500/20 flex items-center gap-2 text-sm"
              >
                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 rounded-full">
                  <Eye size={14} className="text-purple-400" />
                  <span className="text-purple-300 font-medium">
                    {clicks} click{clicks !== 1 ? 's' : ''}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
                  <span className="text-xs text-gray-500">live</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}