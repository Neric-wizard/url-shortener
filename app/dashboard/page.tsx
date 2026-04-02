"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link, Copy, Check, Eye, Trash2, QrCode, ExternalLink, TrendingUp, Eye as PreviewIcon } from "lucide-react";
import LinkAnalytics from "../components/LinkAnalytics";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const deleteLink = async (id: number) => {
    await supabase.from("links").delete().eq("id", id);
    fetchLinks();
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Your Links Dashboard
        </h1>
        <p className="text-gray-400">All your shortened links in one place</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No links yet. Create your first short link!</p>
          <a href="/" className="mt-4 inline-block text-purple-400 hover:underline">
            Go to homepage →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-5 hover:border-purple-500/30 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-purple-400 font-mono text-sm break-all">
                    {`${window.location.origin}/${link.short_code}`}
                  </p>
                  <p className="text-gray-500 text-sm truncate mt-1">
                    {link.long_url}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/${link.short_code}`, String(link.id))}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                    title="Copy URL"
                  >
                    {copied === String(link.id) ? (
                      <Check size={18} className="text-green-400" />
                    ) : (
                      <Copy size={18} className="text-gray-400" />
                    )}
                  </button>
                  <a
                    href={`/${link.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                    title="Open Link"
                  >
                    <ExternalLink size={18} className="text-gray-400" />
                  </a>
                  <a
                    href={`/preview/${link.short_code}`}
                    target="_blank"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-purple-500/20 transition"
                    title="Preview Card"
                  >
                    <PreviewIcon size={18} className="text-gray-400" />
                  </a>
                  <a
                    href={`/qr/${link.short_code}`}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                    title="QR Code"
                  >
                    <QrCode size={18} className="text-gray-400" />
                  </a>
                  <button
                    onClick={() => setSelectedLink(link.short_code)}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-purple-500/20 transition"
                    title="View Analytics"
                  >
                    <TrendingUp size={18} className="text-purple-400" />
                  </button>
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-800 rounded-lg">
                    <Eye size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-400">{link.clicks || 0}</span>
                  </div>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-red-500/20 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLink && (
        <LinkAnalytics
          shortCode={selectedLink}
          onClose={() => setSelectedLink(null)}
        />
      )}
    </div>
  );
}