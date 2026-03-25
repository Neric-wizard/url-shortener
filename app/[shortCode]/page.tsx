import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function RedirectPage({
  params,
}: {
  params: { shortCode: string };
}) {
  const { data, error } = await supabase
    .from("links")
    .select("long_url")
    .eq("short_code", params.shortCode)
    .single();

  // If no link found, go to homepage
  if (error || !data?.long_url) {
    redirect("/");
    return null;
  }

  let longUrl = data.long_url;
  
  // Add https:// if missing
  if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
    longUrl = "https://" + longUrl;
  }

  // Prevent redirect loop - don't redirect to itself
  if (longUrl.includes("url-shortener-six-sepia.vercel.app") || 
      longUrl.includes("localhost")) {
    redirect("/");
    return null;
  }

  redirect(longUrl);
}