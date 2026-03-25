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
  // Get the long URL from database
  const { data, error } = await supabase
    .from("links")
    .select("long_url")
    .eq("short_code", params.shortCode)
    .single();

  // If link doesn't exist, go to homepage
  if (error || !data?.long_url) {
    redirect("/");
    return null;
  }

  // Make sure the URL has http:// or https://
  let longUrl = data.long_url;
  if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
    longUrl = "https://" + longUrl;
  }

  // Redirect to the long URL
  redirect(longUrl);
}