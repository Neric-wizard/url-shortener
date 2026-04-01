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
    .select("*")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    redirect("/");
    return;
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

  // Increment click count
  await supabase.rpc("increment", { row_id: data.id });

  redirect(data.long_url);
}