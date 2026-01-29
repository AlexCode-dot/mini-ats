export function sanitizeRedirectPath(
  path: string | null,
  fallback: string
): string {
  if (!path) {
    return fallback;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  if (path.includes("\\") || path.includes("://") || /^https?:/i.test(path)) {
    return fallback;
  }

  if (path.startsWith("/api")) {
    return fallback;
  }

  const allowlist = ["/admin", "/candidates", "/jobs"];
  const isAllowed = allowlist.some(
    (base) => path === base || path.startsWith(`${base}/`)
  );

  return isAllowed ? path : fallback;
}
