export function isHttpUrl(value: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export function normalizeJobLink(jobUrl: string | null) {
  return isHttpUrl(jobUrl) ? jobUrl : null;
}
