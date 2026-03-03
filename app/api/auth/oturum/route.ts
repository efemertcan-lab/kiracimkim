import { NextResponse } from "next/server";
import { oturumGetir } from "@/lib/session";

export async function GET() {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json(null);
  return NextResponse.json(oturum);
}
