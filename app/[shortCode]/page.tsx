import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import * as cheerio from "cheerio";

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

export default async function RedirectPage({
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

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    redirect("/expired");
    return;
  }

  // Check if password protected
  if (data.password) {
    redirect(`/${shortCode}/password`);
    return;
  }

  // Fetch metadata for preview
  const metadata = await fetchMetadata(data.long_url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://url-shortener-six-sepia.vercel.app";
  const shortUrl = `${baseUrl}/${shortCode}`;

  // Return HTML page with meta tags for social preview
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:url" content={shortUrl} />
        {metadata.image && <meta property="og:image" content={metadata.image} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        {metadata.image && <meta name="twitter:image" content={metadata.image} />}
        <meta http-equiv="refresh" content={`0;url=${data.long_url}`} />
      </head>
      <body style={{ margin: 0, padding: 20, fontFamily: "system-ui" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <p>Redirecting to <a href={data.long_url}>{data.long_url}</a>...</p>
        </div>
      </body>
    </html>
  );
}