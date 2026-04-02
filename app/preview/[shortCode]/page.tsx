import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import * as cheerio from "cheerio";
import { ExternalLink, Calendar, Eye } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

async function fetchMetadata(url: string) {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('title').text() || 
                  "Shared Link";
    
    const description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="description"]').attr('content') || 
                        "Check out this link";
    
    const image = $('meta[property="og:image"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content') || 
                  null;
    
    return { title, description, image };
  } catch {
    return {
      title: "Shared Link",
      description: "Click to view this link",
      image: null
    };
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    notFound();
  }

  const metadata = await fetchMetadata(data.long_url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://url-shortener-six-sepia.vercel.app";
  const shortUrl = `${baseUrl}/${shortCode}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
        
        {/* Preview Card */}
        <div className="p-6">
          {metadata.image && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img 
                src={metadata.image} 
                alt={metadata.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mb-2">{metadata.title}</h1>
          <p className="text-gray-400 mb-4">{metadata.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Eye size={14} />
            <span>{data.clicks || 0} clicks</span>
            {data.expires_at && (
              <>
                <span>•</span>
                <Calendar size={14} />
                <span>Expires {new Date(data.expires_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <a
              href={data.long_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <ExternalLink size={16} />
              Visit Link
            </a>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Short URL Info */}
        <div className="border-t border-gray-800 p-4 bg-gray-900/50">
          <p className="text-xs text-gray-500 mb-1">Short URL</p>
          <code className="text-purple-400 text-sm break-all">{shortUrl}</code>
        </div>
      </div>
    </div>
  );
}