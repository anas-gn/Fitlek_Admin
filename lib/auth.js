import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "fitlek_admin_session";

function getSecret() {
  return process.env.JWT_SECRET || "dev-only-insecure-secret";
}

export function signSession(payload) {
  const hours = Number(process.env.SESSION_HOURS || 12);
  return jwt.sign(payload, getSecret(), { expiresIn: `${hours}h` });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch (err) {
    return null;
  }
}

export function getSessionFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${SESSION_COOKIE}=`));
  if (!found) return null;
  const token = found.split("=")[1];
  return verifySession(token);
}

// Use inside API route handlers (Node runtime) to verify the caller is a
// logged-in admin. Returns the session payload, or null if not authorized.
export function requireAdmin(request) {
  const cookieHeader = request.headers.get("cookie");
  const session = getSessionFromCookieHeader(cookieHeader);
  if (!session || session.role !== "admin") return null;
  return session;
}
