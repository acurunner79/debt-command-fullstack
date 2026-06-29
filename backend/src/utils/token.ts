import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret: Secret = JWT_SECRET;

export function signToken(userId: string) {
  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign({ userId }, secret, options);
}

export function verifyToken(token: string): { userId: string } {
  const payload = jwt.verify(token, secret);

  if (
    typeof payload === "object" &&
    payload !== null &&
    "userId" in payload &&
    typeof payload.userId === "string"
  ) {
    return { userId: payload.userId };
  }

  throw new Error("Invalid token payload");
}