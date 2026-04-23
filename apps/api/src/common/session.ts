import crypto from "node:crypto";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  exp: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function signPart(unsignedToken: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(unsignedToken).digest("base64url");
}

export function createSessionToken(userId: string, secret: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };

  const headerPart = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadPart = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${headerPart}.${payloadPart}`;
  const signaturePart = signPart(unsignedToken, secret);

  return `${unsignedToken}.${signaturePart}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const unsignedToken = `${headerPart}.${payloadPart}`;
  const expectedSignature = signPart(unsignedToken, secret);

  if (signaturePart !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(payloadPart)) as SessionPayload;

  if (!payload.userId || !payload.exp) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }

  return payload;
}
