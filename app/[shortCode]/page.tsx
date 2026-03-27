import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

export default async function RedirectPage({
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

  if (error || !data?.long_url) {
    redirect("/");
    return;
  }

  redirect(data.long_url);
}