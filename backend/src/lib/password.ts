import crypto from "node:crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `pbkdf2_${ITERATIONS}_${salt}_${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterationsValue, salt, derivedKey] = storedHash.split("_");
  if (scheme !== "pbkdf2" || !iterationsValue || !salt || !derivedKey) {
    return false;
  }

  const iterations = Number(iterationsValue);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const calculated = crypto.pbkdf2Sync(password, salt, iterations, derivedKey.length / 2, DIGEST).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(calculated, "hex"), Buffer.from(derivedKey, "hex"));
}

