type UserFacingError = {
  userMessage: string;
};

export function toUserMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "userMessage" in error &&
    typeof (error as UserFacingError).userMessage === "string"
  ) {
    return (error as UserFacingError).userMessage;
  }
  return fallback;
}

export function userError(message: string): UserFacingError {
  return { userMessage: message };
}
