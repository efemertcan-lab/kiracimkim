import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "kcm_session";

function getSecret(): Uint8Array {
  const jwt = process.env.JWT_SECRET;
  if (!jwt && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET ortam değişkeni production ortamında zorunludur!");
  }
  return new TextEncoder().encode(jwt ?? "kiracimkim-dev-secret-32-chars-xx");
}

export interface SessionPayload {
  id: string;
  adSoyad: string;
  email: string;
  rol: "kiraci" | "evsahibi";
}

export async function oturumOlustur(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function oturumGetir(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function oturumSil() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
