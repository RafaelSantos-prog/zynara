import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  lang: string;
};

const DEFAULT_EXPIRES_IN = "7d";

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET ?? "dev-secret", {
    expiresIn: DEFAULT_EXPIRES_IN
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret") as AuthTokenPayload;
}
