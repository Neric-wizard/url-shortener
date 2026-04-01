import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  const { password } = await req.json();

  const { data } = await supabase
    .from("links")
    .select("long_url, password")
    .eq("short_code", shortCode)
    .single();

  if (!data || data.password !== password) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, url: data.long_url });
}