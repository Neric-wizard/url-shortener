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

  if (error || !data) {
    redirect("/");
  }

  redirect(data.long_url);
}