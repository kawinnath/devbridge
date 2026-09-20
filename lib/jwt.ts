import crypto from "crypto";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-for-devBridge-auth";

function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function signToken(payload: Record<string, unknown>, expiresIn: number = 24 * 60 * 60): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const expPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(expPayload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signatureInput)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(signatureInput)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64urlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
