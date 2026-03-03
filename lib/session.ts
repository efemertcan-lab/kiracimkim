import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET ortam değişkeni production ortamında zorunludur!");
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "kiracimkim-dev-secret-32-chars-xx"
);

const COOKIE = "kcm_session";

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
    .sign(SECRET);

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
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function oturumSil() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
