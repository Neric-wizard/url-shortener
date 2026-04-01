"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Copy, Check, ArrowRight, Sparkles, Eye, LayoutDashboard, Edit2, Calendar, Lock, LayoutGrid, List } from "lucide-react";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

export default function CreateLink() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [clicks, setClicks] = useState<number | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  
  // Bulk mode states
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkResults, setBulkResults] = useState<{ original: string; short: string }[]>([]);

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

    let shortCode = customCode.trim();
    
    if (!shortCode) {
      shortCode = generateShortCode();
    } else {
      const { data: existing } = await supabase
        .from("links")
        .select("short_code")
        .eq("short_code", shortCode)
        .single();
      
      if (existing) {
        setError("This custom alias is already taken. Please choose another.");
        setLoading(false);
        return;
      }
    }

    const insertData: any = { short_code: shortCode, long_url: url };
    if (expiresAt) insertData.expires_at = new Date(expiresAt).toISOString();
    if (password) insertData.password = password;

    const { error: dbError } = await supabase
      .from("links")
      .insert(insertData);

    if (dbError) {
      setError(dbError.message);
    } else {
      const newShortUrl = `${window.location.origin}/${shortCode}`;
      setShortUrl(newShortUrl);
      await fetchClicks(shortCode);
      setUrl("");
      setCustomCode("");
      setShowCustom(false);
      setExpiresAt("");
      setShowExpiry(false);
      setPassword("");
      setShowPassword(false);
    }
    setLoading(false);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBulkResults([]);

    const urls = bulkUrls.split("\n").filter(u => u.trim());
    const results: { original: string; short: string }[] = [];

    for (const url of urls) {
      const shortCode = generateShortCode();
      const { error } = await supabase
        .from("links")
        .insert([{ short_code: shortCode, long_url: url.trim() }]);
      
      if (!error) {
        results.push({
          original: url.trim(),
          short: `${window.location.origin}/${shortCode}`
        });
      } else {
        results.push({
          original: url.trim(),
          short: "Error: " + error.message
        });
      }
    }

    setBulkResults(results);
    setBulkUrls("");
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      
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
        
        <div className="mt-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition"
          >
            <LayoutDashboard size={14} />
            View all your links →
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 shadow-xl"
      >
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setBulkMode(!bulkMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${!bulkMode ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}
          >
            <List size={14} />
            Single
          </button>
          <button
            type="button"
            onClick={() => setBulkMode(!bulkMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${bulkMode ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}
          >
            <LayoutGrid size={14} />
            Bulk
          </button>
        </div>

        <form onSubmit={bulkMode ? handleBulkSubmit : handleSubmit} className="space-y-5">
          
          {!bulkMode ? (
            <>
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
              
              {/* Custom Alias Toggle */}
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition"
              >
                <Edit2 size={14} />
                {showCustom ? "Hide custom alias" : "Use custom alias (optional)"}
              </button>

              {showCustom && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom alias
                  </label>
                  <div className="flex items-stretch">
                    <div className="flex items-center px-4 bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl text-gray-400 text-sm whitespace-nowrap">
                      {window.location.origin}/
                    </div>
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="my-custom-link"
                      className="flex-1 px-4 py-4 bg-gray-800 border border-gray-700 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white placeholder-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Letters and numbers only, no spaces or special characters
                  </p>
                </div>
              )}

              {/* Expiration Toggle */}
              <button
                type="button"
                onClick={() => setShowExpiry(!showExpiry)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition"
              >
                <Calendar size={14} />
                {showExpiry ? "Hide expiration" : "Set expiration date (optional)"}
              </button>

              {showExpiry && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link expires on
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    After this date, the link will no longer work
                  </p>
                </div>
              )}

              {/* Password Protection Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition"
              >
                <Lock size={14} />
                {showPassword ? "Hide password protection" : "Add password protection (optional)"}
              </button>

              {showPassword && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                    className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Users will need this password to access the link
                  </p>
                </div>
              )}
            </>
          ) : (
            // Bulk Mode
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste multiple URLs (one per line)
              </label>
              <textarea
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                placeholder="https://github.com/Neric-wizard
https://twitter.com/n3_neric
https://portfolio-template-psi-weld.vercel.app"
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Up to 50 URLs at once. One per line.
              </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {bulkMode ? "Processing..." : "Creating..."}
              </span>
            ) : (
              <>
                {bulkMode ? "Shorten All URLs" : "Shorten URL"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </>
            )}
          </button>
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>
      </motion.div>

      {/* Single Result */}
      {!bulkMode && shortUrl && (
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
              onClick={() => copyToClipboard(shortUrl)}
              className="p-2 bg-gray-800 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition group"
            >
              {copied ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Copy size={18} className="text-purple-400 group-hover:scale-110 transition" />
              )}
            </button>
          </div>
          
          {clicks !== null && (
            <div className="mt-4 pt-4 border-t border-purple-500/20 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 rounded-full">
                <Eye size={14} className="text-purple-400" />
                <span className="text-purple-300 font-medium">
                  {clicks} click{clicks !== 1 ? 's' : ''}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
                <span className="text-xs text-gray-500">live</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Bulk Results */}
      {bulkResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6"
        >
          <p className="text-sm text-purple-300 mb-3 flex items-center gap-2">
            <LayoutGrid size={14} />
            Bulk results ({bulkResults.length} links):
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bulkResults.map((result, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 hover:bg-purple-500/5 rounded-lg transition">
                <span className="text-gray-400 truncate flex-1 max-w-[200px]">{result.original}</span>
                <span className="text-purple-400">→</span>
                {result.short.startsWith("Error") ? (
                  <span className="text-red-400 text-xs">{result.short}</span>
                ) : (
                  <>
                    <a href={result.short} target="_blank" className="text-purple-400 hover:underline truncate max-w-[150px]">
                      {result.short}
                    </a>
                    <button
                      onClick={() => copyToClipboard(result.short)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      <Copy size={14} className="text-gray-500" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}