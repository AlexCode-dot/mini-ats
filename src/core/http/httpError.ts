export async function getHttpErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        return data.error;
      }
    } else {
      const text = await response.text();
      if (text) {
        return text;
      }
    }
  } catch {
    // Ignore parsing errors and fall through.
  }

  return response.statusText || "Request failed";
}
