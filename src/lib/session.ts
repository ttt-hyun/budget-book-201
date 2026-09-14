import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { isMember, type Member } from "./members";

export const SESSION_COOKIE = "bb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1주일 (초)

export type Session = { name: Member; exp: number };

function secret() {
  const s = process.env.SESSION_SECRET || process.env.ACCESS_CODE;
  if (!s) throw new Error("SESSION_SECRET 또는 ACCESS_CODE 환경변수가 필요합니다.");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkAccessCode(input: string) {
  const code = process.env.ACCESS_CODE;
  if (!code) return false;
  return safeEqual(input.trim(), code);
}

/** base64url(JSON{name, exp}).서명 형태의 토큰 */
export function createSessionToken(name: Member) {
  const session: Session = { name, exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return isMember(s.name) && s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}
