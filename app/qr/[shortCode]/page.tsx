import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

export default async function QRPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  const { data, error } = await supabase
    .from("links")
    .select("long_url")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://url-shortener-six-sepia.vercel.app";
  const shortUrl = `${baseUrl}/${shortCode}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
    width: 250,
    margin: 2,
    color: {
      dark: "#a855f7",
      light: "#1f2937",
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="mb-6">
        <a href="/dashboard" className="text-purple-400 hover:underline text-sm">
          ← Back to Dashboard
        </a>
      </div>
      
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
        QR Code
      </h1>
      <p className="text-gray-400 mb-8">Scan to visit your shortened link</p>

      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 inline-block mx-auto">
        <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto w-48 h-48" />
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-purple-400 font-mono text-sm break-all">
          {shortUrl}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href={`/${shortCode}`}
            target="_blank"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Open Link
          </a>
          <a
            href="/dashboard"
            className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}