export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

function decodeDemoToken(idToken: string): GoogleProfile {
  const raw = idToken.replace(/^demo:/, "");
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<GoogleProfile>;
    return {
      googleId: parsed.googleId ?? "demo-google-id",
      email: parsed.email ?? "demo@zynara.app",
      name: parsed.name ?? "Zynara Demo",
      avatarUrl: parsed.avatarUrl ?? null
    };
  } catch {
    return {
      googleId: "demo-google-id",
      email: "demo@zynara.app",
      name: "Zynara Demo",
      avatarUrl: null
    };
  }
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (process.env.NODE_ENV !== "production" || idToken.startsWith("demo:") || idToken === "demo-google-token") {
    return decodeDemoToken(idToken);
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) {
    throw new Error("Unable to verify Google token");
  }

  const payload = await response.json() as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
    audience?: string;
  };

  if (process.env.GOOGLE_CLIENT_ID && payload.audience && payload.audience !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience mismatch");
  }

  return {
    googleId: payload.sub ?? "",
    email: payload.email ?? "",
    name: payload.name ?? payload.email ?? "Zynara User",
    avatarUrl: payload.picture ?? null
  };
}

