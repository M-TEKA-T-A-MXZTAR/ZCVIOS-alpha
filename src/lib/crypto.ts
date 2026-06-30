import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

const getKey = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for API key encryption");
  }
  return createHash("sha256").update(secret).digest();
};

export const encryptApiKey = (raw: string) => {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(raw, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptApiKey = (value: string) => {
  const [ivB64, tagB64, encryptedB64] = value.split(":");
  if (!ivB64 || !tagB64 || !encryptedB64) {
    throw new Error("Invalid encrypted token format");
  }
  const key = getKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

export const decryptApiKeyOrNull = (value?: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return decryptApiKey(value);
  } catch {
    return null;
  }
};
