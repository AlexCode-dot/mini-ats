import "server-only";

import { AdminApiError } from "@/core/auth/requireAdminApi";

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  const proto =
    forwardedProto ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const allowRefererFallback =
    process.env.ADMIN_ALLOW_REFERER_FALLBACK === "true" ||
    process.env.NODE_ENV !== "production";
  const allowedOrigins = new Set<string>([`${proto}://${host}`]);
  const extraOrigins = process.env.ADMIN_ALLOWED_ORIGINS?.split(",") ?? [];
  extraOrigins
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => allowedOrigins.add(value));

  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.add(`http://${host}`);
    allowedOrigins.add(`https://${host}`);
  }

  let requestOrigin = origin;
  if (!requestOrigin && allowRefererFallback && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      requestOrigin = null;
    }
  }

  if (!requestOrigin || !host) {
    throw new AdminApiError("Forbidden", 403);
  }

  if (!allowedOrigins.has(requestOrigin)) {
    throw new AdminApiError("Forbidden", 403);
  }
}
