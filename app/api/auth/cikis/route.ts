import { NextResponse } from "next/server";
import { oturumSil } from "@/lib/session";

export async function POST() {
  await oturumSil();
  return NextResponse.json({ ok: true });
}
