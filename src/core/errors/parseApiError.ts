import { ApiError } from "@/core/errors/ApiError";

export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        return new ApiError(data.error);
      }
    } else {
      const text = await response.text();
      if (text) {
        return new ApiError(text);
      }
    }
  } catch {
    // Ignore parsing errors.
  }

  return new ApiError(response.statusText || "Request failed");
}
